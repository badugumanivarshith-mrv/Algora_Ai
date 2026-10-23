/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Server Entry Point
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes/api.routes';
import { errorHandler } from './src/server/middlewares/error.middleware';
import { securityHeaders, corsHandler, requestLogger } from './src/server/middlewares/security.middleware';
import { validateEnv } from './src/server/config/index';
import { seedDatabase } from './src/server/db/seed';
import { realtimeBroadcaster } from './src/server/services/realtimeService';
import { closePostgresPool } from './src/server/db/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Pre-flight environment validation
  const envValidation = validateEnv();
  if (envValidation.warnings.length > 0) {
    envValidation.warnings.forEach((w) => console.warn(`[CONFIG WARNING]: ${w}`));
  }
  if (!envValidation.isValid) {
    envValidation.errors.forEach((e) => console.error(`[CONFIG ERROR]: ${e}`));
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal Configuration Error: Server refusing to start under insecure production configuration.');
      process.exit(1);
    }
  }

  // Initialize Database Seeder asynchronously without blocking server listening
  seedDatabase().catch((e) => console.log('Database seeding skipped or already seeded:', e.message));

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Security Middlewares & Headers
  app.use(securityHeaders);
  app.use(corsHandler);
  app.use(requestLogger);

  // Body Parsing Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mount API Endpoints
  app.use('/api', apiRouter);

  // Frontend Integration: Vite Dev Middleware vs. Production Static Servicing
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [ALGORA Server] Running on http://localhost:${PORT} (${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})`);
    console.log(`⚡ [ALGORA API] Available at http://localhost:${PORT}/api/health`);
    console.log(`🩺 [Probes] Liveness: /api/health/live | Readiness: /api/health/ready`);
  });

  // Graceful Shutdown Protocol
  let isShuttingDown = false;

  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n🛑 [ALGORA Server] Received ${signal}. Initiating graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      console.log('✅ [ALGORA Server] HTTP listener closed.');

      // Drain realtime SSE connections
      try {
        realtimeBroadcaster.closeAll();
        console.log('✅ [ALGORA Server] Realtime SSE connections terminated cleanly.');
      } catch (err: any) {
        console.error('Error closing SSE connections:', err.message);
      }

      // Drain PostgreSQL connection pool
      try {
        await closePostgresPool();
        console.log('✅ [ALGORA Server] PostgreSQL connection pool drained.');
      } catch (err: any) {
        console.error('Error closing PostgreSQL pool:', err.message);
      }

      console.log('🏁 [ALGORA Server] Graceful shutdown complete. Process terminating.');
      process.exit(0);
    });

    // Forced exit timeout if connections refuse to terminate
    setTimeout(() => {
      console.error('⚠️ [ALGORA Server] Forced termination after shutdown timeout.');
      process.exit(1);
    }, 8000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
