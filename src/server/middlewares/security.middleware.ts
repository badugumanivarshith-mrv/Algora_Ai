/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Enterprise Security & Production Hardening Middlewares
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Standard Security Headers Middleware
 * Implements strict Content-Security-Policy (CSP) compatible with Monaco Editor,
 * React/Vite SPA bundles, Web Workers, Google Fonts, and Server-Sent Events.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Strip Express fingerprinting
  res.removeHeader('X-Powered-By');

  // Content-Security-Policy tailored for Monaco Web Workers, Vite HMR, and external fonts
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' ws: wss: http: https: https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * Configurable Production CORS Handler
 */
export function corsHandler(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const configured = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev || !origin || configured.includes('*') || configured.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', configured[0] || 'null');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Forwarded-For');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

/**
 * Request Correlation & Observability Middleware
 * Logs incoming HTTP requests and assigns unique request ID without sensitive credential logging.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  const reqId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('X-Request-Id', reqId);

  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(2);
    // Exclude noisy health checks from verbose logging in production
    const isHealthCheck = req.path.startsWith('/api/health');
    if (!isHealthCheck || process.env.DEBUG_LOGS === 'true') {
      const status = res.statusCode;
      const logLine = `[HTTP] ${req.method} ${req.originalUrl} ${status} - ${duration}ms [${reqId}]`;
      if (status >= 500) {
        console.error(logLine);
      } else if (status >= 400) {
        console.warn(logLine);
      } else if (process.env.NODE_ENV !== 'production') {
        // Keep development output readable
      }
    }
  });

  next();
}
