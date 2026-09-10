import { ProfileEntity } from "../types";
import { ApiError } from "../middleware/error";
import { UserRepository, ProfileRepository } from "../repositories";

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
    let profile = await ProfileRepository.findByUserId(userId);
    if (!profile) {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new ApiError(404, "PROFILE_NOT_FOUND", "Profile not found for this user.");
      }
      profile = await ProfileRepository.create({
        id: `prof-${userId}`,
        userId,
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
    return profile;
  }

  static async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileEntity> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
    }

    const updated = await ProfileRepository.update(userId, {
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
      bio: input.bio,
      institution: input.institution,
      githubHandle: input.githubHandle,
      preferredLanguage: input.preferredLanguage,
    });

    return updated;
  }
}
