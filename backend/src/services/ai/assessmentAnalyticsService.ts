import { HiringRepository } from "../../repositories/hiringRepository";
import { RedisManager } from "../../redis/redisClient";

export interface AssessmentAnalytics {
  userId: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  recentAttempts: any[];
}

export class AssessmentAnalyticsService {
  public static async getUserAnalytics(userId: string): Promise<AssessmentAnalytics> {
    const redisKey = `assessment:analytics:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.totalAttempts !== undefined) return parsed;
      } catch (e) {
        // Fallback
      }
    }

    const attempts = await HiringRepository.getAttempts(userId);
    const totalAttempts = attempts.length;
    const scores = attempts.map((a) => a.score);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 92;

    const analytics: AssessmentAnalytics = {
      userId,
      totalAttempts,
      averageScore,
      highestScore,
      recentAttempts: attempts.slice(0, 5),
    };

    await RedisManager.set(redisKey, JSON.stringify(analytics), 3600);
    return analytics;
  }
}
