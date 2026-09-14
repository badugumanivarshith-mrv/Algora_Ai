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

  // Production Storage (S3 / R2 / GCS) Configuration
  storageProvider: process.env.STORAGE_PROVIDER || "local", // "local" | "s3"
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  awsRegion: process.env.AWS_REGION || "us-east-1",
  s3BucketName: process.env.S3_BUCKET_NAME || "",
  s3Endpoint: process.env.S3_ENDPOINT || "", // For MinIO or Cloudflare R2

  // Production Email Configuration
  emailProvider: process.env.EMAIL_PROVIDER || "console", // "console" | "resend" | "sendgrid"
  resendApiKey: process.env.RESEND_API_KEY || "",
  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Algora AI <noreply@algora.edu>",

  // Monitoring (Sentry) Configuration
  sentryDsn: process.env.SENTRY_DSN || "",
  openTelemetryServiceName: process.env.OTEL_SERVICE_NAME || "algora-ai-production",
};

export function updateConfigFromEnv() {
  config.port = Number(process.env.PORT) || config.port;
  config.nodeEnv = process.env.NODE_ENV || config.nodeEnv;
  config.clientUrl = process.env.CLIENT_URL || config.clientUrl;
  config.databaseUrl = process.env.DATABASE_URL || config.databaseUrl;
  config.jwtSecret = process.env.JWT_SECRET || config.jwtSecret;
  config.jwtExpiresIn = process.env.JWT_EXPIRES_IN || config.jwtExpiresIn;
  config.rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || config.rateLimitMax;
  config.dbPoolMax = Number(process.env.DB_POOL_MAX) || config.dbPoolMax;
  config.dbIdleTimeoutMillis = Number(process.env.DB_IDLE_TIMEOUT) || config.dbIdleTimeoutMillis;
  config.dbConnectionTimeoutMillis = Number(process.env.DB_CONNECT_TIMEOUT) || config.dbConnectionTimeoutMillis;

  config.redisUrl = process.env.REDIS_URL || config.redisUrl;
  config.redisHost = process.env.REDIS_HOST || config.redisHost;
  config.redisPort = Number(process.env.REDIS_PORT) || config.redisPort;
  config.redisPassword = process.env.REDIS_PASSWORD || config.redisPassword;
  config.redisDb = Number(process.env.REDIS_DB) || config.redisDb;
  config.redisKeyPrefix = process.env.REDIS_KEY_PREFIX || config.redisKeyPrefix;

  config.appUrl = process.env.APP_URL || config.appUrl;
  config.googleClientId = process.env.GOOGLE_CLIENT_ID || config.googleClientId;
  config.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || config.googleClientSecret;
  config.githubClientId = process.env.GITHUB_CLIENT_ID || config.githubClientId;
  config.githubClientSecret = process.env.GITHUB_CLIENT_SECRET || config.githubClientSecret;

  config.storageProvider = process.env.STORAGE_PROVIDER || config.storageProvider;
  config.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || config.awsAccessKeyId;
  config.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || config.awsSecretAccessKey;
  config.awsRegion = process.env.AWS_REGION || config.awsRegion;
  config.s3BucketName = process.env.S3_BUCKET_NAME || config.s3BucketName;
  config.s3Endpoint = process.env.S3_ENDPOINT || config.s3Endpoint;

  config.emailProvider = process.env.EMAIL_PROVIDER || config.emailProvider;
  config.resendApiKey = process.env.RESEND_API_KEY || config.resendApiKey;
  config.sendgridApiKey = process.env.SENDGRID_API_KEY || config.sendgridApiKey;
  config.emailFrom = process.env.EMAIL_FROM || config.emailFrom;

  config.sentryDsn = process.env.SENTRY_DSN || config.sentryDsn;
  config.openTelemetryServiceName = process.env.OTEL_SERVICE_NAME || config.openTelemetryServiceName;
}

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = config.nodeEnv === "production";
  const isStaging = config.nodeEnv === "staging";

  // Safe production and staging boot checks
  if (isProduction || isStaging) {
    if (config.jwtSecret === "algora-secure-jwt-secret-dev-2026") {
      errors.push("CRITICAL SECURITY RISK: Use of default JWT_SECRET is strictly forbidden in production/staging environments.");
    }
    if (!config.databaseUrl) {
      errors.push("DATABASE_URL is missing. Production and staging environments require a real PostgreSQL database server.");
    }
    if (!config.redisUrl && !config.redisHost) {
      warnings.push("Redis host/URL is not configured. Distributed components will fall back to single-instance memory modes.");
    }
  }

  // Missing secrets & Configuration checks
  if (!config.googleClientId || !config.googleClientSecret) {
    warnings.push("OAuth Google client credentials are not defined. Google authentication will be unavailable.");
  }
  if (!config.githubClientId || !config.githubClientSecret) {
    warnings.push("OAuth GitHub client credentials are not defined. GitHub authentication will be unavailable.");
  }

  // S3 Storage validation
  if (config.storageProvider === "s3") {
    if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
      errors.push("STORAGE_PROVIDER set to 's3' but AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing.");
    }
    if (!config.s3BucketName) {
      errors.push("STORAGE_PROVIDER set to 's3' but S3_BUCKET_NAME is not configured.");
    }
  }

  // Email service validation
  if (config.emailProvider === "resend" && !config.resendApiKey) {
    errors.push("EMAIL_PROVIDER is set to 'resend' but RESEND_API_KEY is not defined.");
  }
  if (config.emailProvider === "sendgrid" && !config.sendgridApiKey) {
    errors.push("EMAIL_PROVIDER is set to 'sendgrid' but SENDGRID_API_KEY is not defined.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}


