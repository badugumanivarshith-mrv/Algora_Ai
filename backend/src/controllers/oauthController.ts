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
   * GET /api/auth/oauth/:provider/sandbox
   * Interactive Sandbox consent flow for development/preview testing without live secrets
   */
  static async handleSandboxConsent(req: Request, res: Response): Promise<void> {
    const provider = req.params.provider as OAuthProvider;
    const state = req.query.state as string;
    const action = req.query.action as string || "login";
    const callbackUrl = req.query.callback_url as string || `/api/auth/oauth/${provider}/callback`;

    const isGoogle = provider === "google";
    const providerTitle = isGoogle ? "Google" : "GitHub";
    const brandColor = isGoogle ? "#4285f4" : "#24292f";

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${providerTitle} OAuth Sign In</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #0b0f19;
              color: #e2e8f0;
            }
            .card {
              background: #182234;
              border: 1px solid #2d3b55;
              border-radius: 20px;
              padding: 36px;
              max-width: 440px;
              width: 90%;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
              text-align: center;
            }
            .badge {
              display: inline-block;
              background: rgba(99, 102, 241, 0.15);
              color: #818cf8;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 999px;
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .logo {
              width: 56px;
              height: 56px;
              border-radius: 16px;
              background: ${brandColor};
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
              color: white;
              font-weight: 800;
              font-size: 24px;
            }
            h1 { font-size: 20px; margin: 0 0 8px; color: #ffffff; }
            p { font-size: 13.5px; color: #94a3b8; margin: 0 0 24px; line-height: 1.5; }
            .user-preview {
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 12px;
              padding: 14px;
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 24px;
              text-align: left;
            }
            .avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #6366f1;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
            }
            .btn {
              display: block;
              width: 100%;
              padding: 12px;
              border-radius: 10px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              border: none;
              text-decoration: none;
              box-sizing: border-box;
              margin-bottom: 10px;
              transition: all 0.15s;
            }
            .btn-primary {
              background: ${brandColor};
              color: white;
            }
            .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
            .btn-secondary {
              background: transparent;
              color: #94a3b8;
              border: 1px solid #334155;
            }
            .btn-secondary:hover { background: #1e293b; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Algora OAuth 2.0</span>
            <div class="logo">${isGoogle ? "G" : "GH"}</div>
            <h1>Continue with ${providerTitle}</h1>
            <p>Authorize <strong>Algora Platform</strong> to access your ${providerTitle} public profile and email address.</p>
            
            <div class="user-preview">
              <div class="avatar">${isGoogle ? "GD" : "GH"}</div>
              <div>
                <div style="font-weight:600; font-size:14px; color:#f8fafc;">${isGoogle ? "Google Developer" : "GitHub Octocat"}</div>
                <div style="font-size:12px; color:#64748b;">${isGoogle ? "developer.google@example.com" : "octocat@github.com"}</div>
              </div>
            </div>

            <button class="btn btn-primary" onclick="proceed()">Authorize Algora</button>
            <button class="btn btn-secondary" onclick="window.close()">Cancel</button>
          </div>

          <script>
            function proceed() {
              const code = "demo_code_" + Math.random().toString(36).substring(2, 12);
              const callback = "${callbackUrl}?code=" + code + "&state=${state}";
              window.location.href = callback;
            }
          </script>
        </body>
      </html>
    `);
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
