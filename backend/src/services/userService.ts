import { db } from "./store";
import { ProfileEntity } from "../types";
import { ApiError } from "../middleware/error";

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  institution?: string;
  githubHandle?: string;
  preferredLanguage?: string;
}

export class UserService {
  static async getProfile(userId: string): Promise<ProfileEntity> {
    const profile = db.profiles.get(userId);
    if (!profile) {
      throw new ApiError(404, "PROFILE_NOT_FOUND", "Profile not found for this user.");
    }
    return profile;
  }

  static async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileEntity> {
    let profile = db.profiles.get(userId);
    if (!profile) {
      const user = db.users.get(userId);
      if (!user) {
        throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
      }
      profile = {
        id: `prof-${userId}`,
        userId,
        fullName: input.fullName || user.username,
        avatarUrl: input.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
        bio: input.bio || "",
        institution: input.institution || "",
        githubHandle: input.githubHandle,
        preferredLanguage: input.preferredLanguage || "Python",
        rating: 1200,
        streakDays: 1,
        totalXP: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.profiles.set(userId, profile);
      return profile;
    }

    const updated: ProfileEntity = {
      ...profile,
      fullName: input.fullName !== undefined ? input.fullName.trim() : profile.fullName,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl.trim() : profile.avatarUrl,
      bio: input.bio !== undefined ? input.bio.trim() : profile.bio,
      institution: input.institution !== undefined ? input.institution.trim() : profile.institution,
      githubHandle: input.githubHandle !== undefined ? input.githubHandle.trim() : profile.githubHandle,
      preferredLanguage: input.preferredLanguage !== undefined ? input.preferredLanguage : profile.preferredLanguage,
      updatedAt: new Date().toISOString(),
    };

    db.profiles.set(userId, updated);
    return updated;
  }
}
