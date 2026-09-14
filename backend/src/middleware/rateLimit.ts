import { config } from "../config/env";
import { DistributedRateLimiter } from "../redis/rateLimiter";

export const apiLimiter = DistributedRateLimiter.createMiddleware({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  prefix: "api",
  errorCode: "RATE_LIMIT_EXCEEDED",
  errorMessage: "Too many requests from this IP, please try again after 15 minutes.",
});

export const authLimiter = DistributedRateLimiter.createMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 requests per 15 minutes for auth endpoints
  prefix: "auth",
  errorCode: "AUTH_RATE_LIMIT_EXCEEDED",
  errorMessage: "Too many authentication attempts, please try again later.",
});

export const aiLimiter = DistributedRateLimiter.createMiddleware({
  windowMs: 60 * 1000,
  max: 40, // 40 AI requests per minute
  prefix: "ai",
  errorCode: "AI_RATE_LIMIT_EXCEEDED",
  errorMessage: "AI rate limit reached. Please wait a moment before sending another prompt.",
});

export const uploadLimiter = DistributedRateLimiter.createMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 60, // 60 uploads per 15 minutes
  prefix: "upload",
  errorCode: "UPLOAD_RATE_LIMIT_EXCEEDED",
  errorMessage: "Upload rate limit exceeded. Please try again in a few minutes.",
});

