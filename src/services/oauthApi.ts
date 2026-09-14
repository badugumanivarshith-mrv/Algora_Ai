export type OAuthProvider = "google" | "github";
export type OAuthAction = "login" | "link";

export interface LinkedOAuthAccount {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  linkedAt: string;
  lastLoginAt: string;
}

export interface OAuthProviderConfig {
  enabled: boolean;
  isConfigured: boolean;
  callbackUrl: string;
  scopes: string[];
}

export interface OAuthAuditLog {
  id: string;
  userId?: string;
  provider: OAuthProvider;
  eventType: string;
  providerUserId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface OAuthMetricsResponse {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  providerUsage: {
    google: number;
    github: number;
  };
  totalLinkedAccounts: number;
  accountsByProvider: {
    google: number;
    github: number;
  };
  activeOAuthSessions: number;
  recentAuditLogs: OAuthAuditLog[];
}

export class OAuthApi {
  private static getAuthToken(): string | null {
    return localStorage.getItem("algora_token") || localStorage.getItem("token");
  }

  /**
   * Fetch OAuth configuration status
   */
  static async getConfig(): Promise<{ google: OAuthProviderConfig; github: OAuthProviderConfig } | null> {
    try {
      const res = await fetch("/api/auth/oauth/config");
      if (res.ok) {
        const json = await res.json();
        return json.data?.providers || null;
      }
    } catch (err) {
      console.error("[OAuthApi] getConfig error:", err);
    }
    return null;
  }

  /**
   * Fetch linked OAuth identities for current authenticated user
   */
  static async getLinkedIdentities(): Promise<LinkedOAuthAccount[]> {
    const token = this.getAuthToken();
    try {
      const res = await fetch("/api/auth/oauth/identities", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.providers || [];
      }
    } catch (err) {
      console.error("[OAuthApi] getLinkedIdentities error:", err);
    }
    return [];
  }

  /**
   * Unlink an OAuth provider from current user profile
   */
  static async unlinkProvider(provider: OAuthProvider): Promise<{ success: boolean; message: string }> {
    const token = this.getAuthToken();
    const res = await fetch(`/api/auth/oauth/${provider}/unlink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || `Failed to unlink ${provider}`);
    }
    return json.data;
  }

  /**
   * Initiate OAuth flow via direct Popup window (compliant with iframe & cross-origin requirements)
   */
  static async initiateOAuthPopup(
    provider: OAuthProvider,
    action: OAuthAction = "login"
  ): Promise<{
    authResult?: any;
    linkedAccount?: LinkedOAuthAccount;
    action: OAuthAction;
  }> {
    const token = this.getAuthToken();

    // 1. Fetch the authorization URL from backend
    const urlRes = await fetch(
      `/api/auth/oauth/${provider}/url?action=${action}&redirectUrl=${encodeURIComponent(window.location.pathname)}`,
      {
        headers: {
          ...(token && action === "link" ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!urlRes.ok) {
      const errJson = await urlRes.json();
      throw new Error(errJson.error?.message || `Failed to initiate ${provider} sign-in`);
    }

    const { data } = await urlRes.json();
    const authUrl = data.url;

    // 2. Open popup centered on screen
    const width = 540;
    const height = 660;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      `algora_oauth_${provider}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      throw new Error("Popup blocked by browser. Please allow popups for this site and try again.");
    }

    popup.focus();

    // 3. Listen for postMessage from callback HTML
    return new Promise((resolve, reject) => {
      let resolved = false;

      const messageListener = (event: MessageEvent) => {
        // Accept messages from origin
        const data = event.data;
        if (data && typeof data === "object") {
          if (data.type === "OAUTH_AUTH_SUCCESS" && data.provider === provider) {
            resolved = true;
            window.removeEventListener("message", messageListener);
            clearInterval(pollTimer);

            // Store JWT tokens locally if login
            if (data.authResult?.token) {
              localStorage.setItem("algora_token", data.authResult.token);
              localStorage.setItem("token", data.authResult.token);
              if (data.authResult.user) {
                localStorage.setItem("algora_user", JSON.stringify(data.authResult.user));
              }
            }

            resolve({
              authResult: data.authResult,
              linkedAccount: data.linkedAccount,
              action: data.action || action,
            });
          } else if (data.type === "OAUTH_AUTH_ERROR") {
            resolved = true;
            window.removeEventListener("message", messageListener);
            clearInterval(pollTimer);
            reject(new Error(data.errorMessage || "OAuth authentication failed"));
          }
        }
      };

      window.addEventListener("message", messageListener);

      // 4. Poll for popup closure in case user closed the window manually
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", messageListener);
          if (!resolved) {
            reject(new Error("Sign-in popup was closed before completing authorization."));
          }
        }
      }, 500);

      // 5. Timeout after 5 minutes
      setTimeout(() => {
        if (!resolved) {
          clearInterval(pollTimer);
          window.removeEventListener("message", messageListener);
          if (!popup.closed) {
            try {
              popup.close();
            } catch (e) {}
          }
          reject(new Error("Authentication timed out. Please try again."));
        }
      }, 300000);
    });
  }

  /**
   * Fetch OAuth monitoring & audit telemetry for Admin dashboard
   */
  static async getMetrics(): Promise<OAuthMetricsResponse | null> {
    const token = this.getAuthToken();
    try {
      const res = await fetch("/api/monitoring/oauth", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (err) {
      console.error("[OAuthApi] getMetrics error:", err);
    }
    return null;
  }
}
