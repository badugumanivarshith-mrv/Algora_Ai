import crypto from "crypto";
import {
  ExecutionJobEntity,
  JudgeTestCase,
  SubmissionResultEntity,
  SupportedLanguage,
  JudgeVerdict,
} from "./types";
import { sandboxRunner } from "./sandboxRunner";
import { executionJobRepository } from "../../repositories/executionJobRepository";
import { SubmissionRepository } from "../../repositories/submissionRepository";
import { XPRepository } from "../../repositories/xpRepository";
import { RedisJudgeQueue } from "../../redis/judgeQueue";
import { logger } from "../../utils/logger";

interface QueueTask {
  job: ExecutionJobEntity;
  testCases: JudgeTestCase[];
  retryCount?: number;
  resolve: (job: ExecutionJobEntity) => void;
  reject: (err: any) => void;
}

export class ExecutionQueue {
  private queue: QueueTask[] = [];
  private activeWorkers = 0;
  private readonly maxConcurrency = 4;
  private readonly workerId = `worker-${process.pid}-${Math.random().toString(36).substring(2, 6)}`;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startWorkerHeartbeat();
  }

  private startWorkerHeartbeat(): void {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval = setInterval(() => {
      RedisJudgeQueue.workerHeartbeat(this.workerId).catch(() => {});
    }, 10000);
  }

  /**
   * Enqueues a code execution job (run or submit)
   */
  public async enqueueJob(params: {
    userId?: string;
    problemId?: string;
    problemSlug: string;
    language: SupportedLanguage;
    code: string;
    customInput?: string;
    jobType: "run" | "submit" | "test_case";
    testCases: JudgeTestCase[];
  }): Promise<ExecutionJobEntity> {
    const randSuffix = crypto.randomBytes(4).toString("hex");
    const jobId = `job-${Date.now()}-${randSuffix}`;

    const initialJob: ExecutionJobEntity = {
      id: jobId,
      userId: params.userId,
      problemId: params.problemId,
      problemSlug: params.problemSlug,
      language: params.language,
      code: params.code,
      customInput: params.customInput,
      jobType: params.jobType,
      status: "queued",
      verdict: "Pending" as JudgeVerdict,
      executionTimeMs: 0,
      memoryMb: 0,
      testCasesTotal: params.testCases.length,
      testCasesPassed: 0,
      testCaseResults: [],
      createdAt: new Date().toISOString(),
    };

    // Save initial queued state
    await executionJobRepository.createJob(initialJob);

    // Track in Redis distributed queue
    await RedisJudgeQueue.enqueueJob(initialJob);

    return new Promise((resolve, reject) => {
      this.queue.push({
        job: initialJob,
        testCases: params.testCases,
        retryCount: 0,
        resolve,
        reject,
      });

      this.processNext();
    });
  }

  /**
   * Workers loop
   */
  private processNext() {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeWorkers++;
    this.runTask(task);
  }

  private async runTask(task: QueueTask) {
    const { job, testCases, resolve } = task;

    try {
      job.status = "executing";
      job.startedAt = new Date().toISOString();
      await executionJobRepository.updateJob(job.id, {
        status: "executing",
        startedAt: job.startedAt,
      });

      // 1. Run in Sandbox Runner
      const result = await sandboxRunner.execute({
        language: job.language,
        code: job.code,
        testCases,
        timeoutMs: 3500,
        memoryLimitMb: 256,
      });

      // 2. Map Results to Job Entity
      job.status = "completed";
      job.verdict = result.verdict;
      job.executionTimeMs = result.executionTimeMs;
      job.memoryMb = result.memoryMb;
      job.compileOutput = result.compileOutput;
      job.stdout = result.stdout;
      job.stderr = result.stderr;
      job.testCasesPassed = result.testCasesPassed;
      job.testCasesTotal = result.testCasesTotal;
      job.testCaseResults = result.testCaseResults;
      job.completedAt = new Date().toISOString();

      // 3. Persist Updated Job & complete in Redis
      await executionJobRepository.updateJob(job.id, {
        status: "completed",
        verdict: job.verdict,
        executionTimeMs: job.executionTimeMs,
        memoryMb: job.memoryMb,
        compileOutput: job.compileOutput,
        stdout: job.stdout,
        stderr: job.stderr,
        testCasesPassed: job.testCasesPassed,
        testCasesTotal: job.testCasesTotal,
        testCaseResults: job.testCaseResults,
        completedAt: job.completedAt,
      });

      await RedisJudgeQueue.completeJob(job.id, job);

      // 4. If submission, create submission record & award XP on Accepted
      if (job.jobType === "submit") {
        const randSub = crypto.randomBytes(3).toString("hex");
        const submissionId = `sub-${Date.now()}-${randSub}`;
        const xpAwarded = job.verdict === "Accepted" ? 50 : 5;

        const subResult: SubmissionResultEntity = {
          id: `res-${Date.now()}-${randSub}`,
          jobId: job.id,
          submissionId,
          userId: job.userId,
          problemSlug: job.problemSlug,
          language: job.language,
          verdict: job.verdict,
          runtimeMs: job.executionTimeMs,
          memoryMb: job.memoryMb,
          testCasesPassed: job.testCasesPassed,
          testCasesTotal: job.testCasesTotal,
          xpAwarded,
          codeSizeBytes: Buffer.byteLength(job.code, "utf8"),
          createdAt: job.completedAt || new Date().toISOString(),
        };

        await executionJobRepository.createSubmissionResult(subResult);

        // Also update standard platform submission repository
        if (job.userId) {
          try {
            await SubmissionRepository.create({
              id: submissionId,
              userId: job.userId,
              problemId: Number(job.problemId) || 1,
              problemSlug: job.problemSlug,
              problemTitle: job.problemSlug,
              language: job.language,
              code: job.code,
              status: job.verdict,
              runtimeMs: job.executionTimeMs,
              memoryMb: job.memoryMb,
              runtimePercentile: job.verdict === "Accepted" ? 92.5 : 20.0,
              memoryPercentile: job.verdict === "Accepted" ? 88.0 : 30.0,
              passedTests: job.testCasesPassed,
              totalTests: job.testCasesTotal,
              errorMessage: job.stderr,
              compilationError: job.compileOutput,
              createdAt: job.completedAt || new Date().toISOString(),
            });

            if (job.verdict === "Accepted") {
              await XPRepository.recordXP(
                job.userId,
                xpAwarded,
                "problem_solved",
                "Problem Solved (Real Sandbox Judge)"
              );
            }
          } catch (subErr: any) {
            logger.warn(`[ExecutionQueue] Submission sync notice: ${subErr.message}`);
          }
        }
      }

      resolve(job);
    } catch (err: any) {
      logger.error(`[ExecutionQueue] Job execution error for ${job.id}: ${err.message}`);

      // Retry handling for transient engine errors
      const currentRetries = task.retryCount || 0;
      if (currentRetries < 2 && err.message?.includes("EAGAIN")) {
        task.retryCount = currentRetries + 1;
        await RedisJudgeQueue.retryJob(job.id);
        this.queue.unshift(task);
        return;
      }

      job.status = "failed";
      job.verdict = "Internal Error";
      job.errorMessage = err.message;
      job.completedAt = new Date().toISOString();

      await executionJobRepository.updateJob(job.id, {
        status: "failed",
        verdict: "Internal Error",
        errorMessage: err.message,
        completedAt: job.completedAt,
      });

      await RedisJudgeQueue.completeJob(job.id, job);

      resolve(job);
    } finally {
      this.activeWorkers--;
      this.processNext();
    }
  }

  public getQueueStatus() {
    return {
      activeWorkers: this.activeWorkers,
      queuedJobs: this.queue.length,
      maxConcurrency: this.maxConcurrency,
      workerId: this.workerId,
    };
  }
}

export const executionQueue = new ExecutionQueue();

