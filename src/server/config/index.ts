/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Server Configuration & Environment Validator
 */

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'algora_super_secure_jwt_access_secret_2026_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'algora_super_secure_jwt_refresh_secret_2026_dev',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS || '*',
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates operational environment variables against production security criteria
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeEnv = process.env.NODE_ENV || config.nodeEnv;
  const isProd = nodeEnv === 'production';
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : config.port;

  // Port Validation
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT configuration: "${process.env.PORT}". Must be an integer between 1 and 65535.`);
  }

  // Database URL Validation
  if (!process.env.DATABASE_URL) {
    if (isProd) {
      errors.push('CRITICAL: DATABASE_URL is missing in production environment.');
    } else {
      warnings.push('DATABASE_URL not set in environment; running with local SQLite/file fallback.');
    }
  }

  // JWT Secret Validation
  const defaultDevSecret = 'algora_super_secure_jwt_access_secret_2026_dev';
  const currentSecret = process.env.JWT_SECRET || config.jwt.secret;
  if (currentSecret === defaultDevSecret) {
    if (isProd) {
      errors.push('CRITICAL SECURITY HAZARD: Default development JWT_SECRET is active in production environment!');
    } else {
      warnings.push('Using default development JWT_SECRET. Override with high-entropy secret for production.');
    }
  } else if (currentSecret.length < 32) {
    warnings.push(`JWT_SECRET is shorter than recommended 32 characters (length: ${currentSecret.length}).`);
  }

  // Gemini AI Key Warning
  if (!config.geminiApiKey) {
    warnings.push('GEMINI_API_KEY is not configured; AI mentor and voice features will operate in deterministic Socratic heuristic fallback mode.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Returns a sanitized audit representation of active server configuration without exposing raw secrets
 */
export function getEnvAudit() {
  const rawDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Mani%408239@localhost:5432/algora_db';
  return {
    nodeEnv: config.nodeEnv,
    port: config.port,
    databaseConfigured: !!(process.env.DATABASE_URL || rawDbUrl),
    databaseUrlMasked: rawDbUrl.replace(/:([^:@]+)@/, ':******@'),
    jwtSecretConfigured: !!process.env.JWT_SECRET,
    jwtSecretLength: config.jwt.secret.length,
    isUsingDefaultDevSecret: config.jwt.secret === 'algora_super_secure_jwt_access_secret_2026_dev',
    geminiApiKeyConfigured: !!config.geminiApiKey,
    corsOrigins: config.cors.origin,
    timestamp: new Date().toISOString(),
  };
}

