import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "*",
  jwtSecret: process.env.JWT_SECRET || "algora-secure-jwt-secret-dev-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,
};
