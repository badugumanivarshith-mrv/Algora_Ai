import { RedisManager } from "./redisClient";
import { ExecutionJobEntity } from "../services/execution/types";
import { logger } from "../utils/logger";


export interface RedisQueueStats {
  activeJobs: number;
  pendingJobs: number;
  completedJobsTotal: number;
  failedJobsTotal: number;
  activeWorkers: number;
}

export class RedisJudgeQueue {
  private static readonly QUEUE_PENDING_KEY = "judge:queue:pending";
  private static readonly JOBS_ACTIVE_KEY = "judge:jobs:active";
  private static readonly JOBS_META_PREFIX = "judge:job:";
  private static readonly WORKERS_SET_KEY = "judge:workers:active";

  /**
   * Enqueue execution job into Redis distributed list
   */
  public static async enqueueJob(job: ExecutionJobEntity): Promise<void> {
    const jobKey = `${this.JOBS_META_PREFIX}${job.id}`;
    const payload = JSON.stringify(job);

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const multi = client.multi();
        multi.set(jobKey, payload, "EX", 86400); // 24 hours retention
        multi.rpush(this.QUEUE_PENDING_KEY, job.id);
        await multi.exec();
        return;
      } catch (err: any) {
        logger.debug(`[RedisJudgeQueue] enqueueJob Redis fallback: ${err.message}`);
      }
    }
  }

  /**
   * Atomically dequeue a job for processing
   */
  public static async dequeueJob(workerId: string): Promise<string | null> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        // Atomically pop from pending queue
        const jobId = await client.lpop(this.QUEUE_PENDING_KEY);
        if (jobId) {
          // Record as active job handled by worker
          await client.hset(this.JOBS_ACTIVE_KEY, jobId, JSON.stringify({ workerId, startedAt: Date.now() }));
          return jobId;
        }
      } catch (err: any) {
        logger.debug(`[RedisJudgeQueue] dequeueJob Redis fallback: ${err.message}`);
      }
    }
    return null;
  }

  /**
   * Mark a job completed and remove from active hash
   */
  public static async completeJob(jobId: string, updatedJob?: ExecutionJobEntity): Promise<void> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const multi = client.multi();
        multi.hdel(this.JOBS_ACTIVE_KEY, jobId);
        if (updatedJob) {
          multi.set(`${this.JOBS_META_PREFIX}${jobId}`, JSON.stringify(updatedJob), "EX", 86400);
        }
        multi.incr("judge:stats:completed");
        await multi.exec();
      } catch (err: any) {
        logger.debug(`[RedisJudgeQueue] completeJob Redis fallback: ${err.message}`);
      }
    }
  }

  /**
   * Handle job retry on transient worker timeout or error
   */
  public static async retryJob(jobId: string, maxRetries: number = 3): Promise<boolean> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const retryCount = await client.hincrby("judge:jobs:retries", jobId, 1);
        await client.hdel(this.JOBS_ACTIVE_KEY, jobId);

        if (retryCount <= maxRetries) {
          // Re-push to the head of the queue
          await client.lpush(this.QUEUE_PENDING_KEY, jobId);
          logger.info(`[RedisJudgeQueue] Job ${jobId} re-queued for retry #${retryCount}`);
          return true;
        } else {
          logger.warn(`[RedisJudgeQueue] Job ${jobId} exceeded max retries (${maxRetries}).`);
          await client.incr("judge:stats:failed");
          return false;
        }
      } catch (err: any) {
        logger.debug(`[RedisJudgeQueue] retryJob Redis fallback: ${err.message}`);
      }
    }
    return false;
  }

  /**
   * Register worker heartbeat in Redis
   */
  public static async workerHeartbeat(workerId: string): Promise<void> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        await client.zadd(this.WORKERS_SET_KEY, Date.now(), workerId);
        // Clear workers dead for > 30s
        const cutoff = Date.now() - 30000;
        await client.zremrangebyscore(this.WORKERS_SET_KEY, 0, cutoff);
      } catch (err: any) {
        logger.debug(`[RedisJudgeQueue] workerHeartbeat fallback: ${err.message}`);
      }
    }
  }

  /**
   * Unregister worker
   */
  public static async removeWorker(workerId: string): Promise<void> {
    if (RedisManager.isReady()) {
      try {
        await RedisManager.getClient().zrem(this.WORKERS_SET_KEY, workerId);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Get queue statistics and depth
   */
  public static async getQueueStats(): Promise<RedisQueueStats> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const [pendingLen, activeCount, completed, failed, activeWorkers] = await Promise.all([
          client.llen(this.QUEUE_PENDING_KEY),
          client.hlen(this.JOBS_ACTIVE_KEY),
          client.get("judge:stats:completed"),
          client.get("judge:stats:failed"),
          client.zcount(this.WORKERS_SET_KEY, Date.now() - 30000, "+inf"),
        ]);

        return {
          pendingJobs: pendingLen || 0,
          activeJobs: activeCount || 0,
          completedJobsTotal: Number(completed) || 0,
          failedJobsTotal: Number(failed) || 0,
          activeWorkers: activeWorkers || 0,
        };
      } catch (err: any) {
        logger.debug(`[RedisJudgeQueue] getQueueStats fallback: ${err.message}`);
      }
    }

    return {
      activeJobs: 0,
      pendingJobs: 0,
      completedJobsTotal: 0,
      failedJobsTotal: 0,
      activeWorkers: 0,
    };
  }
}
