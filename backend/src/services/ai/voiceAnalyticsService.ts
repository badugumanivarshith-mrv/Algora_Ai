import { VoiceMentorRepository, VoiceAnalyticsEntity } from "../../repositories/voiceMentorRepository";
import { RedisManager } from "../../redis/redisClient";

export class VoiceAnalyticsService {
  public static async getUserAnalytics(userId: string): Promise<VoiceAnalyticsEntity> {
    const redisKey = `voice:analytics:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const analytics = await VoiceMentorRepository.getAnalytics(userId);
    await RedisManager.set(redisKey, JSON.stringify(analytics), 3600);
    return analytics;
  }

  public static async recordSessionActivity(
    userId: string,
    sessionType: string,
    durationMinutes: number
  ): Promise<VoiceAnalyticsEntity> {
    const analytics = await VoiceMentorRepository.getAnalytics(userId);

    analytics.totalSessions += 1;
    analytics.totalMinutes += durationMinutes;

    if (sessionType.toLowerCase().includes("interview")) {
      analytics.interviewSessions += 1;
    } else if (sessionType.toLowerCase().includes("review")) {
      analytics.reviewSessions += 1;
    } else {
      analytics.learningSessions += 1;
    }

    analytics.updatedAt = new Date().toISOString();

    await VoiceMentorRepository.saveAnalytics(analytics);

    const redisKey = `voice:analytics:${userId}`;
    await RedisManager.set(redisKey, JSON.stringify(analytics), 3600);

    return analytics;
  }
}
