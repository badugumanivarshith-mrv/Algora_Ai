import crypto from "crypto";
import { RedisManager } from "./redisClient";
import { logger } from "../utils/logger";

export interface LockResult {
  acquired: boolean;
  lockId?: string;
  resource: string;
}

export class DistributedLockManager {
  private static readonly memoryLocks: Map<string, { lockId: string; expiresAt: number }> = new Map();

  // Lua script to safely release a lock only if value matches lockId
  private static readonly RELEASE_LUA_SCRIPT = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  /**
   * Acquire a distributed lock on a resource for a specified TTL (in milliseconds)
   */
  public static async acquireLock(
    resource: string,
    ttlMs: number = 10000,
    maxWaitMs: number = 0,
    retryIntervalMs: number = 100
  ): Promise<LockResult> {
    const lockKey = `lock:${resource}`;
    const lockId = crypto.randomUUID();
    const startTime = Date.now();

    while (true) {
      if (RedisManager.isReady()) {
        try {
          const client = RedisManager.getClient();
          // SET key value NX PX ttl
          const result = await client.set(lockKey, lockId, "PX", ttlMs, "NX");
          if (result === "OK") {
            return { acquired: true, lockId, resource };
          }
        } catch (err: any) {
          logger.debug(`[LockManager] Redis acquire lock error: ${err.message}`);
        }
      } else {
        // In-memory lock fallback
        const existing = this.memoryLocks.get(lockKey);
        const now = Date.now();
        if (!existing || existing.expiresAt <= now) {
          this.memoryLocks.set(lockKey, { lockId, expiresAt: now + ttlMs });
          return { acquired: true, lockId, resource };
        }
      }

      if (maxWaitMs <= 0 || Date.now() - startTime >= maxWaitMs) {
        return { acquired: false, resource };
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }
  }

  /**
   * Release a distributed lock safely using lockId
   */
  public static async releaseLock(resource: string, lockId?: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;

    if (!lockId) {
      if (RedisManager.isReady()) {
        try {
          await RedisManager.getClient().del(lockKey);
          return true;
        } catch {
          // ignore
        }
      }
      this.memoryLocks.delete(lockKey);
      return true;
    }

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const res = await client.eval(this.RELEASE_LUA_SCRIPT, 1, lockKey, lockId);
        return res === 1;
      } catch (err: any) {
        logger.debug(`[LockManager] Redis release lock error: ${err.message}`);
      }
    }

    const current = this.memoryLocks.get(lockKey);
    if (current && current.lockId === lockId) {
      this.memoryLocks.delete(lockKey);
      return true;
    }
    return false;
  }

  /**
   * Wrap an async task with automatic lock acquisition and release
   */
  public static async withLock<T>(
    resource: string,
    ttlMs: number,
    fn: () => Promise<T>,
    errorMessage: string = "Resource is currently locked. Please retry."
  ): Promise<T> {
    const lock = await this.acquireLock(resource, ttlMs, 2000, 100);
    if (!lock.acquired || !lock.lockId) {
      const err: any = new Error(errorMessage);
      err.code = "RESOURCE_LOCKED";
      err.statusCode = 409;
      throw err;
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(resource, lock.lockId);
    }
  }

  /**
   * Prevent duplicate contest submission
   */
  public static async lockContestSubmission<T>(
    contestId: string,
    userId: string,
    problemSlug: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const resource = `contest:sub:${contestId}:${userId}:${problemSlug}`;
    return this.withLock(
      resource,
      8000,
      fn,
      "Another submission is already being evaluated for this contest problem."
    );
  }

  /**
   * Prevent user rating calculation race conditions
   */
  public static async lockUserRating<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    const resource = `user:rating:${userId}`;
    return this.withLock(
      resource,
      6000,
      fn,
      "User rating is currently undergoing calculation. Please retry shortly."
    );
  }

  /**
   * Prevent contest leaderboard update conflicts
   */
  public static async lockContestLeaderboard<T>(contestId: string, fn: () => Promise<T>): Promise<T> {
    const resource = `contest:leaderboard:${contestId}`;
    return this.withLock(
      resource,
      5000,
      fn,
      "Contest leaderboard is being recomputed. Please try again."
    );
  }

  /**
   * Get active locks count
   */
  public static async getActiveLocksCount(): Promise<number> {
    if (RedisManager.isReady()) {
      try {
        const keys = await RedisManager.getClient().keys("lock:*");
        return keys.length;
      } catch {
        // ignore
      }
    }
    const now = Date.now();
    let count = 0;
    for (const [_, v] of this.memoryLocks.entries()) {
      if (v.expiresAt > now) count++;
    }
    return count;
  }
}
