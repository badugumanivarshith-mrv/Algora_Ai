import { Request, Response, NextFunction } from "express";
import { MonitoringService } from "../services/monitoringService";

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
