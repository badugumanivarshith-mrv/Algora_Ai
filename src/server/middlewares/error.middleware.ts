/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
    ? err.statusCode
    : 500;

  // Mask internal/database errors in production for 500 status codes
  let userMessage = err.message || 'Internal Server Error';
  if (isProd && statusCode === 500) {
    userMessage = 'An unexpected internal server error occurred. Please try again later.';
  }

  // Structured operational error log
  console.error(`[Algora Server Error] ${req.method} ${req.originalUrl} (${statusCode}):`, err.message || err);

  res.status(statusCode).json({
    success: false,
    error: userMessage,
    stack: !isProd ? err.stack : undefined,
  });
}
