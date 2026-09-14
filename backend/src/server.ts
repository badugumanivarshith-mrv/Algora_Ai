import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { config } from "./config/env";
import { requestLogger } from "./utils/logger";
import { apiLimiter } from "./middleware/rateLimit";
import apiRoutes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error";
import { MonitoringService } from "./services/monitoringService";

import { enforceHttpsAndSecureHeaders } from "./middleware/networking";
import { sanitizeRequestPayload, preventInjectionAttacks, enforceSessionValidation } from "./middleware/security";

export function createExpressApp() {
  const app = express();

  // Ensure public/uploads folder exists
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch {
    // ignore
  }

  // Trust reverse proxies (Cloud Run / Nginx)
  app.set("trust proxy", 1);

  // Force HTTPS & secure transport headers in staging/production
  app.use(enforceHttpsAndSecureHeaders);

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Vite development & inline styles/fonts cleanly
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: config.clientUrl === "*" ? true : config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Cookie Parser
  app.use(cookieParser());

  // Response Compression
  app.use(compression());

  // Body Parsing
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Request Payload Sanitization & Injection Prevention Filters
  app.use(sanitizeRequestPayload);
  app.use(preventInjectionAttacks);
  app.use(enforceSessionValidation);

  // Static Assets for uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  // Request Telemetry & Monitoring Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const durationMs = Date.now() - start;
      if (req.originalUrl.startsWith("/api")) {
        MonitoringService.recordApiMetric({
          method: req.method,
          route: req.route?.path || req.path,
          statusCode: res.statusCode,
          durationMs,
          timestamp: Date.now(),
        });
      }
    });
    next();
  });

  // Request Logging
  app.use(requestLogger);

  // General API Rate Limiting for /api
  app.use("/api", apiLimiter);

  // Mount API Routes
  app.use("/api", apiRoutes);

  // Centralized Error Handling
  app.use("/api/*", notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { config };
