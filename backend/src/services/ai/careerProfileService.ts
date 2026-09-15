import { CareerRepository, CareerProfileEntity } from "../../repositories/careerRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class CareerProfileService {
  public static async getProfile(userId: string): Promise<CareerProfileEntity> {
    const redisKey = `career:profile:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to DB
      }
    }

    let profile = await CareerRepository.getProfile(userId);
    if (!profile) {
      profile = await CareerRepository.upsertProfile({
        userId,
        careerGoal: "Become a Staff Software Engineer",
        targetCompanies: ["Amazon", "Google", "Microsoft", "Meta"],
        targetRole: "Full Stack Engineer",
        experienceLevel: "Senior",
        preferredTechStack: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis"],
        strengthAreas: ["Data Structures & Algorithms", "System Design"],
        weakAreas: ["Distributed Systems", "Dynamic Programming"],
        learningVelocity: 1.25,
        careerProgression: { currentLevel: "L4", targetLevel: "L5", monthsToTarget: 6 },
      });
    }

    await RedisManager.set(redisKey, JSON.stringify(profile), 3600);
    return profile;
  }

  public static async updateProfile(userId: string, data: any): Promise<CareerProfileEntity> {
    const profile = await CareerRepository.upsertProfile({
      userId,
      ...data,
    });
    const redisKey = `career:profile:${userId}`;
    await RedisManager.set(redisKey, JSON.stringify(profile), 3600);
    return profile;
  }
}
