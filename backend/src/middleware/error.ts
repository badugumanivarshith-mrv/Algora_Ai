import { Request, Response, NextFunction } from "express";
import { MonitoringService } from "../services/monitoringService";
import { config } from "../config/env";
import * as Sentry from "@sentry/node";

// Graceful Sentry Initialization for Production Error Tracking
let isSentryInitialized = false;
if (config.sentryDsn) {
  try {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.nodeEnv,
      tracesSampleRate: 1.0,
    });
    isSentryInitialized = true;
    console.log("[Sentry] Production Error Tracking initialized successfully.");
  } catch (err: any) {
    console.error(`[Sentry] Failed to initialize: ${err.message}`);
  }
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist`,
    },
  });
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Capture to Sentry if initialized
  if (isSentryInitialized) {
    Sentry.withScope((scope) => {
      scope.setSDKProcessingMetadata({ request: req });
      if (err instanceof ApiError) {
        scope.setExtra("code", err.code);
        scope.setExtra("details", err.details);
      }
      Sentry.captureException(err);
    });
  }

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      MonitoringService.recordError({
        message: err.message,
        stack: err.stack,
        route: req.originalUrl,
        statusCode: err.statusCode,
      });
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  console.error("Unhandled Internal Server Error:", err);

  MonitoringService.recordError({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    statusCode: 500,
  });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" ? "An internal server error occurred" : err.message,
    },
  });
}

