import { Request, Response } from "express";
import { executionQueue } from "../services/execution/executionQueue";
import { executionJobRepository } from "../repositories/executionJobRepository";
import { getProblemTestCases } from "../services/execution/problemTestCases";
import { SupportedLanguage } from "../services/execution/types";
import { ApiError } from "../middleware/error";

export class JudgeController {
  /**
   * POST /api/judge/run
   * Executes code in isolated sandbox against visible test cases or custom input
   */
  async runCode(req: Request, res: Response) {
    const { problemSlug = "two-sum", language = "python", code, customInput } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Source code is required");
    }

    const testCases = customInput
      ? [
          {
            id: "tc-custom-1",
            input: customInput,
            expectedOutput: "",
            timeLimitMs: 3000,
            memoryLimitMb: 256,
          },
        ]
      : getProblemTestCases(problemSlug, false);

    const job = await executionQueue.enqueueJob({
      userId: (req as any).user?.id,
      problemSlug,
      language: language as SupportedLanguage,
      code,
      customInput,
      jobType: "run",
      testCases,
    });

    return res.status(200).json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        verdict: job.verdict,
        executionTimeMs: job.executionTimeMs,
        memoryMb: job.memoryMb,
        compileOutput: job.compileOutput,
        stdout: job.stdout,
        stderr: job.stderr,
        testCasesTotal: job.testCasesTotal,
        testCasesPassed: job.testCasesPassed,
        testCaseResults: job.testCaseResults,
      },
    });
  }

  /**
   * POST /api/judge/submit
   * Evaluates code in sandbox against full test suite (including hidden cases) & records official verdict
   */
  async submitCode(req: Request, res: Response) {
    const { problemSlug = "two-sum", language = "python", code } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Source code is required");
    }

    const testCases = getProblemTestCases(problemSlug, true);

    const job = await executionQueue.enqueueJob({
      userId: (req as any).user?.id,
      problemSlug,
      language: language as SupportedLanguage,
      code,
      jobType: "submit",
      testCases,
    });

    return res.status(200).json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        verdict: job.verdict,
        executionTimeMs: job.executionTimeMs,
        memoryMb: job.memoryMb,
        compileOutput: job.compileOutput,
        stdout: job.stdout,
        stderr: job.stderr,
        testCasesTotal: job.testCasesTotal,
        testCasesPassed: job.testCasesPassed,
        testCaseResults: job.testCaseResults,
        submittedAt: job.completedAt || job.createdAt,
      },
    });
  }

  /**
   * GET /api/judge/jobs/:id
   */
  async getJob(req: Request, res: Response) {
    const { id } = req.params;
    const job = await executionJobRepository.getJobById(id);

    if (!job) {
      throw new ApiError(404, "NOT_FOUND", `Execution job not found: ${id}`);
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  }

  /**
   * GET /api/judge/submissions/:id
   */
  async getSubmission(req: Request, res: Response) {
    const { id } = req.params;
    const result = await executionJobRepository.getSubmissionResult(id);

    if (!result) {
      throw new ApiError(404, "NOT_FOUND", `Submission result not found: ${id}`);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * GET /api/judge/stats
   * Admin monitoring statistics
   */
  async getStats(req: Request, res: Response) {
    const metrics = await executionJobRepository.getMetrics();
    const queueStatus = executionQueue.getQueueStatus();

    return res.status(200).json({
      success: true,
      data: {
        ...metrics,
        ...queueStatus,
      },
    });
  }
}

export const judgeController = new JudgeController();
