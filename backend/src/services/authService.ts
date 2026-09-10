import { db } from "./store";
import { UserEntity, ProfileEntity, AuthTokenPayload } from "../types";
import { hashPassword, verifyPassword, generateToken } from "../utils/crypto";
import { ApiError } from "../middleware/error";

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  institution?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
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
    for (const user of db.users.values()) {
      if (user.email.toLowerCase() === emailNorm) {
        throw new ApiError(409, "USER_EXISTS", "A user with this email address already exists.");
      }
      if (user.username.toLowerCase() === usernameNorm.toLowerCase()) {
        throw new ApiError(409, "USERNAME_TAKEN", "This username is already taken.");
      }
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

    db.users.set(newUser.id, newUser);
    db.profiles.set(newProfile.userId, newProfile);

    const tokenPayload: Omit<AuthTokenPayload, "iat" | "exp"> = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    const token = generateToken(tokenPayload);

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

    let targetUser: UserEntity | null = null;
    for (const user of db.users.values()) {
      if (user.email.toLowerCase() === query || user.username.toLowerCase() === query) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email/username or password.");
    }

    const isValid = verifyPassword(input.password, targetUser.passwordHash);
    if (!isValid) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email/username or password.");
    }

    let profile = db.profiles.get(targetUser.id);
    if (!profile) {
      profile = {
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
      };
      db.profiles.set(targetUser.id, profile);
    }

    const tokenPayload: Omit<AuthTokenPayload, "iat" | "exp"> = {
      userId: targetUser.id,
      email: targetUser.email,
      username: targetUser.username,
      role: targetUser.role,
    };

    const token = generateToken(tokenPayload);

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

  static async getCurrentUser(userId: string): Promise<{ user: Omit<UserEntity, "passwordHash">; profile: ProfileEntity }> {
    const user = db.users.get(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User account does not exist.");
    }

    let profile = db.profiles.get(userId);
    if (!profile) {
      profile = {
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
      };
      db.profiles.set(userId, profile);
    }

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      profile,
    };
  }
}
