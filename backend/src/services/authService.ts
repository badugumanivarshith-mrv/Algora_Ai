import crypto from "crypto";
import { UserEntity, ProfileEntity, AuthTokenPayload } from "../types";
import { hashPassword, verifyPassword, generateToken } from "../utils/crypto";
import { ApiError } from "../middleware/error";
import { UserRepository, ProfileRepository, SessionRepository } from "../repositories";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  institution?: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  profile: ProfileEntity;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const emailNorm = input.email.trim().toLowerCase();
    const usernameNorm = input.username.trim();

    // Check if user already exists
    const existingEmail = await UserRepository.findByEmail(emailNorm);
    if (existingEmail) {
      throw new ApiError(409, "USER_EXISTS", "A user with this email address already exists.");
    }

    const existingUsername = await UserRepository.findByUsername(usernameNorm);
    if (existingUsername) {
      throw new ApiError(409, "USERNAME_TAKEN", "This username is already taken.");
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: UserEntity = {
      id: userId,
      email: emailNorm,
      username: usernameNorm,
      passwordHash: hashPassword(input.password),
      role: "student",
      createdAt: now,
      updatedAt: now,
    };

    const newProfile: ProfileEntity = {
      id: `prof-${userId}`,
      userId: userId,
      fullName: input.fullName?.trim() || usernameNorm,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameNorm}`,
      bio: "Algorithm student on Algora.",
      institution: input.institution?.trim() || "Independent Learner",
      preferredLanguage: "Python",
      rating: 1200,
      streakDays: 1,
      totalXP: 100,
      createdAt: now,
      updatedAt: now,
    };

    await UserRepository.create(newUser);
    await ProfileRepository.create(newProfile);

    const tokenPayload: Omit<AuthTokenPayload, "iat" | "exp"> = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    const token = generateToken(tokenPayload);

    // Create rotating refresh token
    const refreshTokenRaw = crypto.randomBytes(40).toString("hex");
    const refreshDays = input.rememberMe ? 30 : 7;
    await RefreshTokenRepository.createRefreshToken({
      userId: newUser.id,
      token: refreshTokenRaw,
      expiresInDays: refreshDays,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    // Audit log
    await RefreshTokenRepository.logAuditEvent({
      userId: newUser.id,
      actorEmail: newUser.email,
      eventType: "REGISTER_SUCCESS",
      targetResource: "users",
      action: "REGISTER",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      details: { role: newUser.role },
    });

    return {
      token,
      refreshToken: refreshTokenRaw,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      profile: newProfile,
    };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const query = input.emailOrUsername.trim().toLowerCase();
    const targetUser = await UserRepository.findByEmailOrUsername(query);

    if (!targetUser) {
      await RefreshTokenRepository.logAuditEvent({
        actorEmail: query,
        eventType: "LOGIN_FAILED",
        targetResource: "auth",
        action: "LOGIN",
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        details: { reason: "User not found" },
      });
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email/username or password.");
    }

    const isValid = verifyPassword(input.password, targetUser.passwordHash);
    if (!isValid) {
      await RefreshTokenRepository.logAuditEvent({
        userId: targetUser.id,
        actorEmail: targetUser.email,
        eventType: "LOGIN_FAILED",
        targetResource: "auth",
        action: "LOGIN",
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        details: { reason: "Bad password" },
      });
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email/username or password.");
    }

    let profile = await ProfileRepository.findByUserId(targetUser.id);
    if (!profile) {
      profile = await ProfileRepository.create({
        id: `prof-${targetUser.id}`,
        userId: targetUser.id,
        fullName: targetUser.username,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.username}`,
        bio: "Algorithm enthusiast.",
        institution: "Independent Learner",
        preferredLanguage: "Python",
        rating: 1200,
        streakDays: 1,
        totalXP: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const tokenPayload: Omit<AuthTokenPayload, "iat" | "exp"> = {
      userId: targetUser.id,
      email: targetUser.email,
      username: targetUser.username,
      role: targetUser.role,
    };

    const token = generateToken(tokenPayload);

    // Create rotating refresh token
    const refreshTokenRaw = crypto.randomBytes(40).toString("hex");
    const refreshDays = input.rememberMe ? 30 : 7;
    await RefreshTokenRepository.createRefreshToken({
      userId: targetUser.id,
      token: refreshTokenRaw,
      expiresInDays: refreshDays,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    // Audit log
    await RefreshTokenRepository.logAuditEvent({
      userId: targetUser.id,
      actorEmail: targetUser.email,
      eventType: "LOGIN_SUCCESS",
      targetResource: "auth",
      action: "LOGIN",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      details: { role: targetUser.role, rememberMe: Boolean(input.rememberMe) },
    });

    return {
      token,
      refreshToken: refreshTokenRaw,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        username: targetUser.username,
        role: targetUser.role,
      },
      profile,
    };
  }

  static async rotateRefreshToken(oldRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<{ token: string; refreshToken: string }> {
    const existing = await RefreshTokenRepository.findByToken(oldRefreshToken);
    if (!existing) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token not found or invalid.");
    }

    if (existing.revoked) {
      // Possible token replay attack! Revoke all tokens for this user for safety
      await RefreshTokenRepository.revokeAllUserTokens(existing.userId);
      await RefreshTokenRepository.logAuditEvent({
        userId: existing.userId,
        eventType: "SECURITY_ALERT_TOKEN_REPLAY",
        targetResource: "auth",
        action: "TOKEN_REVOCATION",
        details: { revokedTokenId: existing.id },
      });
      throw new ApiError(401, "TOKEN_COMPROMISED", "Token reuse detected. All sessions revoked for security.");
    }

    if (new Date(existing.expiresAt).getTime() < Date.now()) {
      throw new ApiError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token expired. Please log in again.");
    }

    const user = await UserRepository.findById(existing.userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User no longer exists.");
    }

    // Generate new Access Token & new Refresh Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const newRefreshTokenRaw = crypto.randomBytes(40).toString("hex");
    const newEntity = await RefreshTokenRepository.createRefreshToken({
      userId: user.id,
      token: newRefreshTokenRaw,
      expiresInDays: 7,
      ipAddress,
      userAgent,
    });

    // Revoke old token and link to replacement
    await RefreshTokenRepository.revokeToken(existing.tokenHash, newEntity.id);

    return {
      token,
      refreshToken: newRefreshTokenRaw,
    };
  }

  static async forgotPassword(email: string): Promise<{ resetToken: string; message: string }> {
    const emailNorm = email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(emailNorm);
    if (!user) {
      // Return success message to avoid email enumeration
      return { resetToken: "", message: "If an account exists with this email, password reset instructions have been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await RefreshTokenRepository.createPasswordReset(user.id, resetToken);

    await RefreshTokenRepository.logAuditEvent({
      userId: user.id,
      actorEmail: user.email,
      eventType: "PASSWORD_RESET_REQUESTED",
      targetResource: "auth",
      action: "FORGOT_PASSWORD",
    });

    return {
      resetToken,
      message: "If an account exists with this email, password reset instructions have been sent.",
    };
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await RefreshTokenRepository.verifyPasswordReset(token);
    if (!reset) {
      throw new ApiError(400, "INVALID_OR_EXPIRED_TOKEN", "Password reset token is invalid or has expired.");
    }

    const user = await UserRepository.findById(reset.userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
    }

    const newHash = hashPassword(newPassword);
    user.passwordHash = newHash;
    user.updatedAt = new Date().toISOString();
    await UserRepository.update(user.id, { passwordHash: newHash });

    await RefreshTokenRepository.markPasswordResetUsed(reset.tokenHash);
    await RefreshTokenRepository.revokeAllUserTokens(user.id);

    await RefreshTokenRepository.logAuditEvent({
      userId: user.id,
      actorEmail: user.email,
      eventType: "PASSWORD_RESET_SUCCESS",
      targetResource: "users",
      action: "RESET_PASSWORD",
    });
  }

  static async sendEmailVerification(userId: string): Promise<{ verificationToken: string }> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found.");

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await RefreshTokenRepository.createEmailVerification(user.id, verificationToken);
    return { verificationToken };
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const record = await RefreshTokenRepository.confirmEmailVerification(token);
    return Boolean(record);
  }

  static async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await RefreshTokenRepository.revokeToken(tokenHash);
    }
  }

  static async getCurrentUser(userId: string): Promise<{ user: Omit<UserEntity, "passwordHash">; profile: ProfileEntity }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User account does not exist.");
    }

    let profile = await ProfileRepository.findByUserId(userId);
    if (!profile) {
      profile = await ProfileRepository.create({
        id: `prof-${userId}`,
        userId: userId,
        fullName: user.username,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
        bio: "",
        institution: "",
        preferredLanguage: "Python",
        rating: 1200,
        streakDays: 0,
        totalXP: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      profile,
    };
  }
}
