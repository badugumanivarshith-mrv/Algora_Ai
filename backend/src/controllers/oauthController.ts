import { Request, Response, NextFunction } from "express";
import { OAuthService } from "../services/oauthService";
import { OAuthProvider, OAuthAction } from "../types";
import { AuthenticatedRequest } from "../middleware/auth";
import { config } from "../config/env";

export class OAuthController {
  /**
   * GET /api/auth/oauth/:provider/url
   * Generates authorization URL, state, nonce, and stores OAuth session
   */
  static async getAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as OAuthProvider;
      if (provider !== "google" && provider !== "github") {
        res.status(400).json({
          success: false,
          error: { code: "INVALID_PROVIDER", message: "Provider must be 'google' or 'github'." },
        });
        return;
      }

      const action = (req.query.action as OAuthAction) || "login";
      const redirectUrl = (req.query.redirectUrl as string) || "/app/dashboard";
      const origin = (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);

      // If linking, extract authenticated user ID
      let userId: string | undefined;
      if (action === "link") {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          // Verify user
          const authReq = req as AuthenticatedRequest;
          if (authReq.user) {
            userId = authReq.user.userId;
          }
        }
      }

      const result = await OAuthService.generateAuthUrl({
        provider,
        action,
        userId,
        redirectUrl,
        origin,
      });

      res.status(200).json({
        success: true,
        data: {
          url: result.url,
          state: result.state,
          provider,
          isConfigured: result.isConfigured,
          callbackUrl: OAuthService.getCallbackUrl(provider, origin),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/oauth/:provider/callback
   * Handles OAuth provider redirect, exchanges code, and communicates with parent window via postMessage
   */
  static async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as OAuthProvider;
      const code = req.query.code as string | undefined;
      const state = req.query.state as string | undefined;
      const error = req.query.error as string | undefined;
      const errorDescription = req.query.error_description as string | undefined;

      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const origin = (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);

      try {
        const result = await OAuthService.handleCallback({
          provider,
          code,
          state,
          error,
          errorDescription,
          ipAddress,
          userAgent,
          origin,
        });

        // Set refresh token cookie if login
        if (result.authResult?.refreshToken) {
          res.cookie("refreshToken", result.authResult.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 14 * 86400000,
          });
        }

        const payload = {
          type: "OAUTH_AUTH_SUCCESS",
          provider,
          action: result.action,
          authResult: result.authResult,
          linkedAccount: result.linkedAccount,
          redirectUrl: result.redirectUrl,
        };

        // Render cross-origin postMessage handler snippet for popup flow
        res.setHeader("Content-Type", "text/html");
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Algora Authentication</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #0f172a;
                  color: #e2e8f0;
                  text-align: center;
                }
                .card {
                  padding: 32px;
                  background: #1e293b;
                  border: 1px solid #334155;
                  border-radius: 16px;
                  max-width: 400px;
                }
                .spinner {
                  width: 36px;
                  height: 36px;
                  border: 3px solid rgba(99, 102, 241, 0.2);
                  border-top-color: #6366f1;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin: 0 auto 16px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                h2 { margin: 0 0 8px; font-size: 18px; color: #f8fafc; }
                p { margin: 0; font-size: 13px; color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="spinner"></div>
                <h2>Authentication Successful</h2>
                <p>Returning to Algora workspace...</p>
              </div>
              <script>
                const payload = ${JSON.stringify(payload)};
                if (window.opener) {
                  try {
                    window.opener.postMessage(payload, "*");
                  } catch (e) {
                    console.error("postMessage error:", e);
                  }
                  setTimeout(() => window.close(), 600);
                } else {
                  // Fallback redirect if user navigated directly
                  window.location.href = "${result.redirectUrl}";
                }
              </script>
            </body>
          </html>
        `);
      } catch (err: any) {
        const errorPayload = {
          type: "OAUTH_AUTH_ERROR",
          provider,
          errorCode: err.code || "OAUTH_FAILED",
          errorMessage: err.message || "OAuth authentication failed",
        };

        res.setHeader("Content-Type", "text/html");
        res.status(err.status || 400).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Authentication Error</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #0f172a;
                  color: #e2e8f0;
                  text-align: center;
                }
                .card {
                  padding: 32px;
                  background: #1e293b;
                  border: 1px solid #ef4444;
                  border-radius: 16px;
                  max-width: 420px;
                }
                h2 { margin: 0 0 8px; font-size: 18px; color: #f87171; }
                p { margin: 0 0 16px; font-size: 13px; color: #94a3b8; }
                button {
                  padding: 8px 16px;
                  background: #334155;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Authentication Failed</h2>
                <p>${err.message || "An unexpected error occurred during authentication."}</p>
                <button onclick="window.close()">Close Window</button>
              </div>
              <script>
                const errorPayload = ${JSON.stringify(errorPayload)};
                if (window.opener) {
                  try {
                    window.opener.postMessage(errorPayload, "*");
                  } catch (e) {}
                  setTimeout(() => window.close(), 3000);
                }
              </script>
            </body>
          </html>
        `);
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/oauth/:provider/unlink
   * Unlinks an OAuth provider
   */
  static async unlink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } });
        return;
      }

      const provider = req.params.provider as OAuthProvider;
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await OAuthService.unlinkProvider(authReq.user.userId, provider, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/oauth/identities
   * Returns list of linked OAuth accounts for current authenticated user
   */
  static async getIdentities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } });
        return;
      }

      const result = await OAuthService.getLinkedIdentities(authReq.user.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/oauth/config
   * Returns OAuth providers status and callback URIs
   */
  static async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const origin = (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);

      res.status(200).json({
        success: true,
        data: {
          providers: {
            google: {
              enabled: true,
              isConfigured: OAuthService.isProviderConfigured("google"),
              callbackUrl: OAuthService.getCallbackUrl("google", origin),
              scopes: ["openid", "email", "profile"],
            },
            github: {
              enabled: true,
              isConfigured: OAuthService.isProviderConfigured("github"),
              callbackUrl: OAuthService.getCallbackUrl("github", origin),
              scopes: ["read:user", "user:email"],
            },
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/monitoring/oauth & GET /api/admin/oauth/overview
   * Returns OAuth metrics, usage breakdown, active sessions, and audit logs
   */
  static async getMonitoringMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await OAuthService.getMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }
}
