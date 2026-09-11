import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/crypto";
import { AuthTokenPayload } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token required. Provide header 'Authorization: Bearer <token>'",
      },
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired authentication token.",
      },
    });
    return;
  }

  req.user = payload;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export const authMiddleware = requireAuth;
export const optionalAuthMiddleware = optionalAuth;
