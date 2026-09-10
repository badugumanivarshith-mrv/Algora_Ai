import crypto from "crypto";
import { UserEntity, ProfileEntity, AuthTokenPayload } from "../types";
import { hashPassword, verifyPassword, generateToken } from "../utils/crypto";
import { ApiError } from "../middleware/error";
import { UserRepository, ProfileRepository, SessionRepository } from "../repositories";

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  institution?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  token: string;
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

    // Persist session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    await SessionRepository.createSession({
      id: `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: newUser.id,
      tokenHash,
      expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      createdAt: now,
    });

    return {
      token,
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
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email/username or password.");
    }

    const isValid = verifyPassword(input.password, targetUser.passwordHash);
    if (!isValid) {
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

    // Persist session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    await SessionRepository.createSession({
      id: `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: targetUser.id,
      tokenHash,
      expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      createdAt: new Date().toISOString(),
    });

    return {
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        username: targetUser.username,
        role: targetUser.role,
      },
      profile,
    };
  }

  static async logout(token?: string): Promise<void> {
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await SessionRepository.deleteSessionByTokenHash(tokenHash);
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
