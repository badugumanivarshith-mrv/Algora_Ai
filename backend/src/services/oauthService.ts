import crypto from "crypto";
import { config } from "../config/env";
import {
  OAuthProvider,
  OAuthAction,
  OAuthSessionEntity,
  OAuthAccountEntity,
  OAuthUserProfile,
  OAuthMetrics,
  AuthTokenPayload,
  UserEntity,
  ProfileEntity,
} from "../types";
import { ApiError } from "../middleware/error";
import {
  UserRepository,
  ProfileRepository,
  OAuthAccountRepository,
  OAuthSessionRepository,
  OAuthAuditLogRepository,
} from "../repositories";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { generateToken } from "../utils/crypto";
import { logger } from "../utils/logger";

export interface GenerateOAuthUrlOptions {
  provider: OAuthProvider;
  action?: OAuthAction;
  userId?: string;
  redirectUrl?: string;
  origin?: string;
}

export interface HandleOAuthCallbackOptions {
  provider: OAuthProvider;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
  ipAddress?: string;
  userAgent?: string;
  origin?: string;
}

export class OAuthService {
  /**
   * Helper to derive effective redirect URI based on origin or configured appUrl
   */
  public static getCallbackUrl(provider: OAuthProvider, customOrigin?: string): string {
    const base = (customOrigin || config.appUrl || "http://localhost:3000").replace(/\/$/, "");
    return `${base}/api/auth/oauth/${provider}/callback`;
  }

  /**
   * Check if a given provider is fully configured with client ID and secret
   */
  public static isProviderConfigured(provider: OAuthProvider): boolean {
    if (provider === "google") {
      return Boolean(config.googleClientId && config.googleClientSecret);
    }
    if (provider === "github") {
      return Boolean(config.githubClientId && config.githubClientSecret);
    }
    return false;
  }

  /**
   * Generate state, nonce, PKCE, save session, and build provider authorization URL
   */
  public static async generateAuthUrl(options: GenerateOAuthUrlOptions): Promise<{ url: string; state: string; isConfigured: boolean }> {
    const { provider, action = "login", userId, redirectUrl, origin } = options;
    const isConfigured = this.isProviderConfigured(provider);

    // Generate cryptographic state & nonce
    const state = crypto.randomBytes(24).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");

    // PKCE code_verifier and code_challenge (S256)
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    // Store in OAuth sessions (15-minute TTL)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await OAuthSessionRepository.createSession({
      id: `osess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      state,
      nonce,
      provider,
      action,
      userId,
      redirectUrl: redirectUrl || "/",
      codeVerifier,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    const callbackUrl = this.getCallbackUrl(provider, origin);

    // If provider is not yet configured with real Client ID, provide sandbox demo flow
    if (!isConfigured) {
      const demoParams = new URLSearchParams({
        demo_oauth: "true",
        provider,
        state,
        action,
        callback_url: callbackUrl,
      });
      // The sandbox endpoint simulates the provider's consent screen
      const url = `/api/auth/oauth/${provider}/sandbox?${demoParams.toString()}`;
      return { url, state, isConfigured: false };
    }

    if (provider === "google") {
      const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: "openid email profile",
        state,
        nonce,
        access_type: "offline",
        prompt: "select_account",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });
      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        state,
        isConfigured: true,
      };
    }

    if (provider === "github") {
      const params = new URLSearchParams({
        client_id: config.githubClientId,
        redirect_uri: callbackUrl,
        scope: "read:user user:email",
        state,
        allow_signup: "true",
      });
      return {
        url: `https://github.com/login/oauth/authorize?${params.toString()}`,
        state,
        isConfigured: true,
      };
    }

    throw new ApiError(400, "INVALID_PROVIDER", `Unsupported OAuth provider: ${provider}`);
  }

  /**
   * Handle OAuth provider callback with state validation, code exchange, profile retrieval, and identity resolution
   */
  public static async handleCallback(options: HandleOAuthCallbackOptions): Promise<{
    authResult?: {
      token: string;
      refreshToken: string;
      user: { id: string; email: string; username: string; role: string };
      profile: ProfileEntity;
    };
    linkedAccount?: OAuthAccountEntity;
    action: OAuthAction;
    redirectUrl: string;
  }> {
    const { provider, code, state, error, errorDescription, ipAddress, userAgent, origin } = options;

    if (error) {
      await OAuthAuditLogRepository.logEvent({
        provider,
        eventType: "login_failed",
        details: { error, errorDescription, phase: "provider_error" },
        ipAddress,
        userAgent,
      });
      throw new ApiError(400, "OAUTH_PROVIDER_ERROR", errorDescription || error || "OAuth authorization was denied or failed.");
    }

    if (!state) {
      await OAuthAuditLogRepository.logEvent({
        provider,
        eventType: "invalid_state",
        details: { message: "Missing state parameter in callback" },
        ipAddress,
        userAgent,
      });
      throw new ApiError(400, "MISSING_OAUTH_STATE", "Missing state parameter in OAuth callback.");
    }

    // Atomic consumption of OAuth state (CSRF & Replay attack defense)
    const session = await OAuthSessionRepository.getAndConsumeSession(state);
    if (!session) {
      await OAuthAuditLogRepository.logEvent({
        provider,
        eventType: "invalid_state",
        details: { state, message: "State is invalid, expired, or already used." },
        ipAddress,
        userAgent,
      });
      throw new ApiError(400, "INVALID_OAUTH_STATE", "OAuth state is invalid or has expired. Please try logging in again.");
    }

    if (!code) {
      await OAuthAuditLogRepository.logEvent({
        provider,
        eventType: "invalid_callback",
        details: { message: "Missing authorization code" },
        ipAddress,
        userAgent,
      });
      throw new ApiError(400, "MISSING_AUTH_CODE", "Missing authorization code from OAuth provider.");
    }

    const callbackUrl = this.getCallbackUrl(provider, origin);
    const isConfigured = this.isProviderConfigured(provider);

    let userProfile: OAuthUserProfile;
    let tokens: { accessToken?: string; refreshToken?: string; tokenExpiresAt?: string } = {};

    if (!isConfigured || code.startsWith("demo_code_")) {
      // Demo/Sandbox fallback exchange
      userProfile = this.getDemoProfile(provider, code);
      tokens = {
        accessToken: `demo_access_token_${provider}_${Date.now()}`,
        tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
    } else {
      // Real HTTPS code exchange with OAuth provider
      try {
        if (provider === "google") {
          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code,
              client_id: config.googleClientId,
              client_secret: config.googleClientSecret,
              redirect_uri: callbackUrl,
              grant_type: "authorization_code",
              code_verifier: session.codeVerifier || "",
            }),
          });
          const tokenData = await tokenRes.json();
          if (!tokenRes.ok || !tokenData.access_token) {
            throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange code with Google");
          }

          tokens = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
              : undefined,
          };

          // Fetch Google User Profile
          const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const googleUser = await profileRes.json();
          if (!profileRes.ok || !googleUser.sub) {
            throw new Error("Failed to retrieve user profile from Google");
          }

          userProfile = {
            provider: "google",
            providerUserId: googleUser.sub,
            email: (googleUser.email || "").toLowerCase().trim(),
            emailVerified: Boolean(googleUser.email_verified),
            name: googleUser.name || googleUser.given_name || "Google User",
            avatarUrl: googleUser.picture,
            rawProfile: googleUser,
          };
        } else if (provider === "github") {
          const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: config.githubClientId,
              client_secret: config.githubClientSecret,
              code,
              redirect_uri: callbackUrl,
            }),
          });
          const tokenData = await tokenRes.json();
          if (!tokenRes.ok || !tokenData.access_token) {
            throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange code with GitHub");
          }

          tokens = {
            accessToken: tokenData.access_token,
            tokenExpiresAt: tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
              : undefined,
          };

          // Fetch GitHub User Profile
          const profileRes = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "User-Agent": "Algora-Platform",
            },
          });
          const githubUser = await profileRes.json();
          if (!profileRes.ok || !githubUser.id) {
            throw new Error("Failed to retrieve user profile from GitHub");
          }

          // Fetch Primary Verified Email if not public
          let email = githubUser.email;
          let emailVerified = false;
          if (!email) {
            const emailsRes = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                "User-Agent": "Algora-Platform",
              },
            });
            if (emailsRes.ok) {
              const emailsData = await emailsRes.json();
              const primaryEmail = emailsData.find((e: any) => e.primary) || emailsData[0];
              if (primaryEmail) {
                email = primaryEmail.email;
                emailVerified = Boolean(primaryEmail.verified);
              }
            }
          } else {
            emailVerified = true;
          }

          userProfile = {
            provider: "github",
            providerUserId: String(githubUser.id),
            email: (email || `${githubUser.login}@users.noreply.github.com`).toLowerCase().trim(),
            emailVerified,
            name: githubUser.name || githubUser.login || "GitHub User",
            username: githubUser.login,
            avatarUrl: githubUser.avatar_url,
            rawProfile: githubUser,
          };
        } else {
          throw new Error("Unsupported provider");
        }
      } catch (err: any) {
        logger.error(`[OAuthService] Code exchange error for ${provider}: ${err.message}`);
        await OAuthAuditLogRepository.logEvent({
          provider,
          eventType: "login_failed",
          details: { error: err.message, phase: "token_exchange" },
          ipAddress,
          userAgent,
        });
        throw new ApiError(502, "OAUTH_EXCHANGE_FAILED", `Failed to complete OAuth with ${provider}: ${err.message}`);
      }
    }

    // Now resolve identity & execute either LINK or LOGIN action
    if (session.action === "link") {
      if (!session.userId) {
        throw new ApiError(401, "UNAUTHORIZED", "User session expired during account linking.");
      }

      // Check if this provider account is already linked to ANOTHER user
      const existingLink = await OAuthAccountRepository.findByProviderAndProviderUserId(
        provider,
        userProfile.providerUserId
      );

      if (existingLink && existingLink.userId !== session.userId) {
        await OAuthAuditLogRepository.logEvent({
          userId: session.userId,
          provider,
          eventType: "login_failed",
          providerUserId: userProfile.providerUserId,
          email: userProfile.email,
          details: { error: "Account already linked to a different Algora user" },
          ipAddress,
          userAgent,
        });
        throw new ApiError(
          409,
          "OAUTH_ACCOUNT_ALREADY_LINKED",
          `This ${provider === "google" ? "Google" : "GitHub"} account is already linked to another Algora profile.`
        );
      }

      let linkedAccount: OAuthAccountEntity;
      if (existingLink && existingLink.userId === session.userId) {
        await OAuthAccountRepository.updateLastLogin(existingLink.id, tokens);
        linkedAccount = existingLink;
      } else {
        linkedAccount = await OAuthAccountRepository.create({
          id: `oacc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: session.userId,
          provider,
          providerUserId: userProfile.providerUserId,
          email: userProfile.email,
          displayName: userProfile.name,
          avatarUrl: userProfile.avatarUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.tokenExpiresAt,
          rawProfile: userProfile.rawProfile,
          linkedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await OAuthAuditLogRepository.logEvent({
        userId: session.userId,
        provider,
        eventType: "account_linked",
        providerUserId: userProfile.providerUserId,
        email: userProfile.email,
        details: { displayName: userProfile.name },
        ipAddress,
        userAgent,
      });

      return {
        linkedAccount,
        action: "link",
        redirectUrl: session.redirectUrl || "/app/profile",
      };
    }

    // ACTION: LOGIN / REGISTER
    // 1. Check if OAuth account is already registered
    let oauthAccount = await OAuthAccountRepository.findByProviderAndProviderUserId(
      provider,
      userProfile.providerUserId
    );

    let user: UserEntity | null = null;
    let profile: ProfileEntity | null = null;

    if (oauthAccount) {
      user = await UserRepository.findById(oauthAccount.userId);
      if (user) {
        profile = await ProfileRepository.findByUserId(user.id);
        await OAuthAccountRepository.updateLastLogin(oauthAccount.id, tokens);
      }
    }

    // 2. If not found by OAuth ID, check if email matches existing Algora user
    if (!user) {
      const existingUserByEmail = await UserRepository.findByEmail(userProfile.email);
      if (existingUserByEmail) {
        user = existingUserByEmail;
        profile = await ProfileRepository.findByUserId(user.id);

        // Seamlessly link identity to existing account
        oauthAccount = await OAuthAccountRepository.create({
          id: `oacc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: user.id,
          provider,
          providerUserId: userProfile.providerUserId,
          email: userProfile.email,
          displayName: userProfile.name,
          avatarUrl: userProfile.avatarUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.tokenExpiresAt,
          rawProfile: userProfile.rawProfile,
          linkedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await OAuthAuditLogRepository.logEvent({
          userId: user.id,
          provider,
          eventType: "account_linked",
          providerUserId: userProfile.providerUserId,
          email: userProfile.email,
          details: { autoLinkedOnLogin: true },
          ipAddress,
          userAgent,
        });
      }
    }

    // 3. Brand new user creation via OAuth
    if (!user) {
      const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      // Generate clean unique username
      let baseUsername = userProfile.username || userProfile.email.split("@")[0] || "coder";
      baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().substring(0, 20);
      if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;

      let finalUsername = baseUsername;
      let counter = 1;
      while (await UserRepository.findByUsername(finalUsername)) {
        finalUsername = `${baseUsername}${counter++}`;
      }

      // Secure random hash for password field
      const randomPasswordHash = crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");

      const newUser: UserEntity = {
        id: newUserId,
        email: userProfile.email,
        username: finalUsername,
        passwordHash: `$oauth$${randomPasswordHash}`,
        role: "student",
        createdAt: now,
        updatedAt: now,
      };

      const newProfile: ProfileEntity = {
        id: `prof-${newUserId}`,
        userId: newUserId,
        fullName: userProfile.name || finalUsername,
        avatarUrl:
          userProfile.avatarUrl ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalUsername)}`,
        bio: `Member of Algora via ${provider === "google" ? "Google" : "GitHub"} OAuth.`,
        institution: "Independent Learner",
        githubHandle: provider === "github" ? userProfile.username : undefined,
        preferredLanguage: "Python",
        rating: 1200,
        streakDays: 1,
        totalXP: 100,
        createdAt: now,
        updatedAt: now,
      };

      user = await UserRepository.create(newUser);
      profile = await ProfileRepository.create(newProfile);

      oauthAccount = await OAuthAccountRepository.create({
        id: `oacc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: newUserId,
        provider,
        providerUserId: userProfile.providerUserId,
        email: userProfile.email,
        displayName: userProfile.name,
        avatarUrl: userProfile.avatarUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        rawProfile: userProfile.rawProfile,
        linkedAt: now,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      });

      await OAuthAuditLogRepository.logEvent({
        userId: user.id,
        provider,
        eventType: "account_linked",
        providerUserId: userProfile.providerUserId,
        email: userProfile.email,
        details: { isNewUser: true, initialUsername: finalUsername },
        ipAddress,
        userAgent,
      });
    }

    if (!profile) {
      profile = (await ProfileRepository.findByUserId(user.id)) || {
        id: `prof-${user.id}`,
        userId: user.id,
        fullName: user.username,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
        bio: "",
        institution: "",
        preferredLanguage: "Python",
        rating: 1200,
        streakDays: 1,
        totalXP: 100,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    // Issue standard Algora JWT token
    const tokenPayload: Omit<AuthTokenPayload, "iat" | "exp"> = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    // Create rotating refresh token
    const refreshTokenRaw = crypto.randomBytes(40).toString("hex");
    await RefreshTokenRepository.createRefreshToken({
      userId: user.id,
      token: refreshTokenRaw,
      expiresInDays: 14,
      ipAddress,
      userAgent,
    });

    await OAuthAuditLogRepository.logEvent({
      userId: user.id,
      provider,
      eventType: "login_success",
      providerUserId: userProfile.providerUserId,
      email: userProfile.email,
      details: { username: user.username, role: user.role },
      ipAddress,
      userAgent,
    });

    return {
      authResult: {
        token,
        refreshToken: refreshTokenRaw,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        profile,
      },
      action: "login",
      redirectUrl: session.redirectUrl || "/app/dashboard",
    };
  }

  /**
   * Unlink an OAuth provider from a user's account with safety guard
   */
  public static async unlinkProvider(userId: string, provider: OAuthProvider, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; message: string }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
    }

    const linkedAccounts = await OAuthAccountRepository.findByUserId(userId);
    const targetAccount = linkedAccounts.find((acc) => acc.provider === provider);

    if (!targetAccount) {
      throw new ApiError(404, "PROVIDER_NOT_LINKED", `No ${provider} account is linked to your profile.`);
    }

    // Safety guard: ensure user doesn't lock themselves out
    const hasPassword = user.passwordHash && !user.passwordHash.startsWith("$oauth$");
    const otherLinkedProviders = linkedAccounts.filter((acc) => acc.provider !== provider);

    if (!hasPassword && otherLinkedProviders.length === 0) {
      throw new ApiError(
        400,
        "CANNOT_UNLINK_ONLY_AUTH_METHOD",
        "Cannot unlink this account. It is your only login method. Please link another provider or set a password first."
      );
    }

    const deleted = await OAuthAccountRepository.deleteByUserIdAndProvider(userId, provider);
    if (!deleted) {
      throw new ApiError(500, "UNLINK_FAILED", "Failed to unlink provider.");
    }

    await OAuthAuditLogRepository.logEvent({
      userId,
      provider,
      eventType: "account_unlinked",
      providerUserId: targetAccount.providerUserId,
      email: targetAccount.email,
      details: { unlinkedProvider: provider },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: `Successfully unlinked your ${provider === "google" ? "Google" : "GitHub"} account.`,
    };
  }

  /**
   * Return linked accounts for a user
   */
  public static async getLinkedIdentities(userId: string): Promise<{
    providers: {
      provider: OAuthProvider;
      providerUserId: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      linkedAt: string;
      lastLoginAt: string;
    }[];
  }> {
    const accounts = await OAuthAccountRepository.findByUserId(userId);
    return {
      providers: accounts.map((acc) => ({
        provider: acc.provider,
        providerUserId: acc.providerUserId,
        email: acc.email,
        displayName: acc.displayName,
        avatarUrl: acc.avatarUrl,
        linkedAt: acc.linkedAt,
        lastLoginAt: acc.lastLoginAt,
      })),
    };
  }

  /**
   * Return platform-wide OAuth metrics & audit telemetry
   */
  public static async getMetrics(): Promise<OAuthMetrics> {
    const auditMetrics = await OAuthAuditLogRepository.getMetrics();
    const accountCounts = await OAuthAccountRepository.countAccounts();
    const activeSessions = await OAuthSessionRepository.countActiveSessions();
    const recentLogs = await OAuthAuditLogRepository.getRecentLogs(25);

    return {
      totalLogins: auditMetrics.totalLogins,
      successfulLogins: auditMetrics.successfulLogins,
      failedLogins: auditMetrics.failedLogins,
      providerUsage: auditMetrics.providerUsage,
      totalLinkedAccounts: accountCounts.total,
      accountsByProvider: {
        google: accountCounts.google,
        github: accountCounts.github,
      },
      activeOAuthSessions: activeSessions,
      recentAuditLogs: recentLogs,
    };
  }

  /**
   * Generate demo profile for sandbox testing when live credentials are not yet set
   */
  private static getDemoProfile(provider: OAuthProvider, code: string): OAuthUserProfile {
    if (provider === "google") {
      const email = `developer.google@example.com`;
      return {
        provider: "google",
        providerUserId: `google-demo-${code.slice(0, 8)}`,
        email,
        emailVerified: true,
        name: "Google Developer",
        avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocISandboxUser",
        rawProfile: { sub: `google-demo-${code.slice(0, 8)}`, email, name: "Google Developer" },
      };
    }

    const username = `github-coder-${code.slice(0, 6)}`;
    return {
      provider: "github",
      providerUserId: `github-demo-${code.slice(0, 8)}`,
      email: `${username}@users.noreply.github.com`,
      emailVerified: true,
      name: "GitHub Octocat",
      username,
      avatarUrl: "https://avatars.githubusercontent.com/u/583231",
      rawProfile: { id: `github-demo-${code.slice(0, 8)}`, login: username, name: "GitHub Octocat" },
    };
  }
}
