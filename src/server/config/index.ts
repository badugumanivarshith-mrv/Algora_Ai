/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Server Configuration
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
    origin: '*',
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
