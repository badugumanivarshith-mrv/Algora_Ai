import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "*",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "algora-secure-jwt-secret-dev-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,
  dbPoolMax: Number(process.env.DB_POOL_MAX) || 20,
  dbIdleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
  dbConnectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT) || 5000,

  // Redis Configuration
  redisUrl: process.env.REDIS_URL || "",
  redisHost: process.env.REDIS_HOST || "127.0.0.1",
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  redisDb: Number(process.env.REDIS_DB) || 0,
  redisKeyPrefix: process.env.REDIS_KEY_PREFIX || "algora:",
  redisConnectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT) || 5000,
  redisMaxRetriesPerRequest: Number(process.env.REDIS_MAX_RETRIES) || 3,

  // App & OAuth Configuration
  appUrl: process.env.APP_URL || "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
};

