/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA BullMQ & Redis Submission Queue Service
 */

import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { codeJudge, JudgeExecutionRequest, JudgeExecutionResult } from "./judgeService";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false
});

connection.on("error", (err) => {
  // Silent fallback when Redis is offline in preview environment
});

export const judgeQueue = new Queue<JudgeExecutionRequest, JudgeExecutionResult>("algora-judge-queue", {
  connection
});

export const judgeWorker = new Worker<JudgeExecutionRequest, JudgeExecutionResult>(
  "algora-judge-queue",
  async (job: Job<JudgeExecutionRequest>) => {
    return await codeJudge.executeSubmission(job.data);
  },
  { connection }
);

judgeWorker.on("completed", (job) => {
  console.log(`✅ Judge Job #${job.id} completed with verdict: ${job.returnvalue.verdict}`);
});

judgeWorker.on("failed", (job, err) => {
  console.error(`❌ Judge Job #${job?.id} failed with error:`, err);
});

export async function submitToJudgeQueue(req: JudgeExecutionRequest): Promise<JudgeExecutionResult> {
  try {
    const job = await judgeQueue.add(`submission_${req.submissionId}`, req);
    const result = await job.waitUntilFinished(judgeWorker, req.timeLimitMs || 3000);
    return result;
  } catch (err) {
    // If Redis queue is offline, execute synchronously with sandboxed judge
    return await codeJudge.executeSubmission(req);
  }
}
