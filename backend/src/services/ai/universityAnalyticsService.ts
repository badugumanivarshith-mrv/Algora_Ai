import { EnterpriseRepository, UniversityAnalyticsEntity } from "../../repositories/enterpriseRepository";
import { UniversityService } from "./universityService";
import { RedisManager } from "../../redis/redisClient";

export class UniversityAnalyticsService {
  public static async getAnalytics(universityId?: string): Promise<UniversityAnalyticsEntity> {
    const universities = await UniversityService.getUniversities();
    const targetId = universityId || universities[0]?.id || "univ_default";

    const redisKey = `university:analytics:${targetId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    let analytics = await EnterpriseRepository.getAnalytics(targetId);
    if (!analytics) {
      analytics = await EnterpriseRepository.upsertAnalytics(
        targetId,
        1450,
        94.8,
        ["Data Structures & Algorithms", "Gemini & LLM Engineering", "Cloud Systems", "System Design", "Distributed DB"]
      );
    }

    await RedisManager.set(redisKey, JSON.stringify(analytics), 3600);
    return analytics;
  }
}
