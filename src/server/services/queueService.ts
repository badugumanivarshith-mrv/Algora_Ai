/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA BullMQ & Redis Submission Queue Service (Safe Fault-Tolerant Instance)
 */

import { Queue, Worker, Job, QueueEvents } from "bullmq";
import Redis from "ioredis";
import { codeJudge, JudgeExecutionRequest, JudgeExecutionResult } from "./judgeService";

let queue: Queue<JudgeExecutionRequest, JudgeExecutionResult> | null = null;
let worker: Worker<JudgeExecutionRequest, JudgeExecutionResult> | null = null;
let queueEvents: QueueEvents | null = null;

// Only initialize BullMQ Redis queue if REDIS_URL is explicitly configured or ENABLE_REDIS_QUEUE is set
if (process.env.ENABLE_REDIS_QUEUE === "true" && process.env.REDIS_URL) {
  try {
    const connection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: () => null
    });

    connection.on("error", () => {
      // Suppress connection error logs
    });

    queue = new Queue<JudgeExecutionRequest, JudgeExecutionResult>("algora-judge-queue", {
      connection
    });
    queue.on("error", () => {});

    queueEvents = new QueueEvents("algora-judge-queue", { connection });
    queueEvents.on("error", () => {});

    worker = new Worker<JudgeExecutionRequest, JudgeExecutionResult>(
      "algora-judge-queue",
      async (job: Job<JudgeExecutionRequest>) => {
        return await codeJudge.executeSubmission(job.data);
      },
      { connection }
    );
    worker.on("error", () => {});
  } catch {
    queue = null;
    worker = null;
    queueEvents = null;
  }
}

export async function submitToJudgeQueue(req: JudgeExecutionRequest): Promise<JudgeExecutionResult> {
  if (queue && worker && queueEvents) {
    try {
      const job = await queue.add(`submission_${req.submissionId}`, req);
      const result = await job.waitUntilFinished(queueEvents, req.timeLimitMs || 3000);
      return result;
    } catch {
      return await codeJudge.executeSubmission(req);
    }
  }

  // Direct sandboxed execution in Production Code Judge
  return await codeJudge.executeSubmission(req);
}
