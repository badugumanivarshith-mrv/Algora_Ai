import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/env";
import { requestLogger } from "./utils/logger";
import { apiLimiter } from "./middleware/rateLimit";
import apiRoutes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error";

export function createExpressApp() {
  const app = express();

  // Trust reverse proxies (Cloud Run / Nginx)
  app.set("trust proxy", 1);

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

  // Response Compression
  app.use(compression());

  // Body Parsing
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

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
