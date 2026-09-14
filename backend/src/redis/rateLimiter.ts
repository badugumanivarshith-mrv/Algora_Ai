import { Request, Response, NextFunction } from "express";
import { RedisManager } from "./redisClient";
import { logger } from "../utils/logger";

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  prefix: string;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  keyGenerator?: (req: Request) => string;
}

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
}

export class DistributedRateLimiter {
  private static readonly memoryBuckets: Map<string, { count: number; resetAt: number }> = new Map();

  // Sliding window increment script in Lua for atomic accuracy
  private static readonly SLIDING_WINDOW_LUA = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local max_limit = tonumber(ARGV[3])
    local clearBefore = now - window

    redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
    local current_requests = redis.call('ZCARD', key)

    if current_requests < max_limit then
      redis.call('ZADD', key, now, now .. '-' .. math.random(1, 100000))
      redis.call('PEXPIRE', key, window)
      return { 1, max_limit - current_requests - 1, now + window }
    else
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local reset = now + window
      if #oldest > 1 then
        reset = tonumber(oldest[2]) + window
      end
      return { 0, 0, reset }
    end
  `;

  /**
   * Evaluates if a request is within limit
   */
  public static async checkLimit(
    identifier: string,
    prefix: string,
    windowMs: number,
    maxLimit: number
  ): Promise<RateLimitStatus> {
    const key = `ratelimit:${prefix}:${identifier}`;
    const now = Date.now();

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const result = (await client.eval(
          this.SLIDING_WINDOW_LUA,
          1,
          key,
          now,
          windowMs,
          maxLimit
        )) as [number, number, number];

        return {
          allowed: result[0] === 1,
          limit: maxLimit,
          remaining: Math.max(0, result[1]),
          resetTimeMs: result[2],
        };
      } catch (err: any) {
        logger.debug(`[DistributedRateLimiter] Lua evaluation fallback: ${err.message}`);
      }
    }

    // In-memory fallback
    const bucket = this.memoryBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        limit: maxLimit,
        remaining: maxLimit - 1,
        resetTimeMs: now + windowMs,
      };
    }

    if (bucket.count < maxLimit) {
      bucket.count++;
      return {
        allowed: true,
        limit: maxLimit,
        remaining: maxLimit - bucket.count,
        resetTimeMs: bucket.resetAt,
      };
    }

    return {
      allowed: false,
      limit: maxLimit,
      remaining: 0,
      resetTimeMs: bucket.resetAt,
    };
  }

  /**
   * Express middleware builder
   */
  public static createMiddleware(options: RateLimiterOptions) {
    const {
      windowMs,
      max,
      prefix,
      statusCode = 429,
      errorCode = "RATE_LIMIT_EXCEEDED",
      errorMessage = "Too many requests. Please try again later.",
      keyGenerator = (req) => req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown-client",
    } = options;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const identifier = keyGenerator(req);
      const status = await DistributedRateLimiter.checkLimit(identifier, prefix, windowMs, max);

      const resetSeconds = Math.ceil((status.resetTimeMs - Date.now()) / 1000);
      res.setHeader("X-RateLimit-Limit", status.limit.toString());
      res.setHeader("X-RateLimit-Remaining", status.remaining.toString());
      res.setHeader("X-RateLimit-Reset", Math.max(0, resetSeconds).toString());

      if (!status.allowed) {
        res.setHeader("Retry-After", Math.max(1, resetSeconds).toString());
        res.status(statusCode).json({
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            retryAfterSeconds: Math.max(1, resetSeconds),
          },
        });
        return;
      }

      next();
    };
  }

  /**
   * Get active rate limit tracked keys count
   */
  public static async getActiveLimiterKeysCount(): Promise<number> {
    if (RedisManager.isReady()) {
      try {
        const keys = await RedisManager.getClient().keys("ratelimit:*");
        return keys.length;
      } catch {
        // ignore
      }
    }
    const now = Date.now();
    let count = 0;
    for (const [_, v] of this.memoryBuckets.entries()) {
      if (v.resetAt > now) count++;
    }
    return count;
  }
}
