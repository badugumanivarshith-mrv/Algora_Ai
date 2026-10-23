/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Security: High-Performance In-Memory Sliding-Window Rate Limiter
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private windowMs: number;
  private max: number;
  private message: string;
  private keyGenerator: (req: Request) => string;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.message = options.message || 'Too many requests. Please slow down and try again later.';
    this.keyGenerator = options.keyGenerator || ((req: Request) => {
      // Key by authenticated user ID if present, otherwise by IP / x-forwarded-for
      const user = (req as any).user;
      if (user && user.id) return `user_${user.id}`;
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
      return req.ip || req.socket.remoteAddress || 'unknown_ip';
    });

    // Cleanup stale entries every 2 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        record.timestamps = record.timestamps.filter((t) => now - t < this.windowMs);
        if (record.timestamps.length === 0) {
          this.store.delete(key);
        }
      }
    }, 120000).unref();
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.keyGenerator(req);
      const now = Date.now();

      let record = this.store.get(key);
      if (!record) {
        record = { timestamps: [] };
        this.store.set(key, record);
      }

      // Filter timestamps within current sliding window
      record.timestamps = record.timestamps.filter((t) => now - t < this.windowMs);

      const remaining = Math.max(0, this.max - record.timestamps.length);
      const resetTime = record.timestamps.length > 0 ? Math.ceil((record.timestamps[0] + this.windowMs - now) / 1000) : Math.ceil(this.windowMs / 1000);

      res.setHeader('RateLimit-Limit', this.max.toString());
      res.setHeader('RateLimit-Remaining', remaining.toString());
      res.setHeader('RateLimit-Reset', resetTime.toString());

      if (record.timestamps.length >= this.max) {
        res.setHeader('Retry-After', resetTime.toString());
        res.status(429).json({
          success: false,
          error: this.message,
          retryAfter: resetTime,
        });
        return;
      }

      record.timestamps.push(now);
      next();
    };
  }

  public resetKey(key: string): void {
    this.store.delete(key);
  }

  public resetAll(): void {
    this.store.clear();
  }
}

// 1. Authentication rate limiter: 30 requests per minute
export const authLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please wait 1 minute before retrying.',
});

// 2. AI Mentor & Intelligence limiter: 25 requests per minute
export const aiLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  message: 'AI reasoning quota exceeded. Please wait a moment before sending more queries.',
});

// 3. Code Judge sandbox limiter: 20 requests per minute
export const judgeLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Code execution rate limit reached. Please wait before executing more code.',
});

// 4. General API limiter: 120 requests per minute
export const generalLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many requests across API endpoints. Please throttle your client.',
});
