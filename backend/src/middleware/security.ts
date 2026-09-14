import { Request, Response, NextFunction } from "express";

/**
 * Defensive utility to recursively sanitize inputs and strip XSS, HTML script nodes,
 * and dangerous markup vectors from all user request fields (body, query, params).
 */
export function sanitizeXss(value: any): any {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> tags
      .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers onXXX="..."
      .replace(/javascript:[^"']*/gi, "") // Remove javascript: protocol refs
      .trim();
  }
  
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeXss(item));
  }
  
  if (typeof value === "object" && value !== null) {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitizedObj[key] = sanitizeXss(val);
    }
    return sanitizedObj;
  }
  
  return value;
}

/**
 * Request body, query, and parameter sanitization middleware
 */
export function sanitizeRequestPayload(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeXss(req.body);
  }
  if (req.query) {
    req.query = sanitizeXss(req.query);
  }
  if (req.params) {
    req.params = sanitizeXss(req.params);
  }
  next();
}

/**
 * Deep scanning pattern analyzer to intercept SQL, NoSQL, and Command injection attempts
 */
const INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi, // Standard SQL keywords
  /--/g, // SQL single line comment
  /\/\*/g, // SQL block comment
  /;.*(rm|system|sh|bash|exec|curl|wget)\b/gi, // Command injection indicators
  /\$where/gi, // NoSQL injections
  /db\..*\(.*\)/gi, // MongoDB script execution
];

/**
 * Anti-injection protective validation scanner
 */
export function preventInjectionAttacks(req: Request, res: Response, next: NextFunction): void {
  const serializeString = (obj: any): string => {
    if (typeof obj === "string") return obj;
    if (typeof obj === "object" && obj !== null) {
      return JSON.stringify(obj);
    }
    return "";
  };

  const bodyStr = serializeString(req.body);
  const queryStr = serializeString(req.query);
  const paramsStr = serializeString(req.params);

  const fullPayloadString = `${bodyStr} ${queryStr} ${paramsStr}`;

  for (const pattern of INJECTION_PATTERNS) {
    // Exclude legitimate occurrences in coding platforms, e.g. code source editor submissions.
    // If the path contains code execution/submissions, skip SQL check to avoid false positives.
    if (req.path.includes("/api/judge") || req.path.includes("/api/code") || req.path.includes("/api/workspace")) {
      break;
    }

    if (pattern.test(fullPayloadString)) {
      console.warn(`[SecurityAlert] Blocked suspected injection request payload targeting: ${req.method} ${req.path}`);
      res.status(400).json({
        success: false,
        error: {
          code: "SECURITY_VIOLATION",
          message: "The submitted request contains unsafe payload patterns and has been blocked.",
        },
      });
      return;
    }
  }

  next();
}

/**
 * Secure Session Validation to guard against session fixation and verify origin matching
 */
export function enforceSessionValidation(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization || req.cookies?.token;
  if (token) {
    // Require standard secure Origin or Referer header matching on write operations
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      const origin = req.headers.origin || req.headers.referer;
      const expectedHost = req.headers.host;

      if (origin && expectedHost) {
        const originUrl = new URL(typeof origin === "string" ? origin : String(origin));
        if (originUrl.host !== expectedHost) {
          console.warn(`[SecurityAlert] Blocked suspected CSRF cross-origin write: ${req.method} ${req.path}`);
          res.status(403).json({
            success: false,
            error: {
              code: "CSRF_BLOCK",
              message: "Cross-Origin operations are restricted for secure sessions.",
            },
          });
          return;
        }
      }
    }
  }
  next();
}
