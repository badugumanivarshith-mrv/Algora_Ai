import { Request, Response, NextFunction } from "express";

/**
 * Production-grade HTTPS redirection and reverse-proxy header enforcement
 */
export function enforceHttpsAndSecureHeaders(req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

  if (isProduction) {
    // 1. Force HTTP to HTTPS redirection using trusted reverse proxy headers
    const xForwardedProto = req.headers["x-forwarded-proto"];
    const isSecure = req.secure || xForwardedProto === "https";

    if (!isSecure) {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      console.log(`[Networking] Redirecting HTTP connection to secure URL: ${httpsUrl}`);
      return res.redirect(301, httpsUrl);
    }

    // 2. Add extra HTTP secure transport and reverse-proxy headers
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Match iframe/oauth flow requirements
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  next();
}
