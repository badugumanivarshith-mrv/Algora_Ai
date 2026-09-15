import { CareerRepository, CareerAnalyticsEntity } from "../../repositories/careerRepository";
import { RedisManager } from "../../redis/redisClient";

export class CareerAnalyticsService {
  public static async getAnalytics(userId: string): Promise<CareerAnalyticsEntity> {
    const redisKey = `career:analytics:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    let analytics = await CareerRepository.getAnalytics(userId);
    if (!analytics) {
      analytics = await CareerRepository.upsertAnalytics({
        userId,
        readinessTrends: [
          { month: "Jan", score: 65 },
          { month: "Feb", score: 72 },
          { month: "Mar", score: 81 },
          { month: "Apr", score: 88 },
        ],
        learningVelocity: 1.35,
        interviewPerformance: {
          totalInterviews: 12,
          passedInterviews: 10,
          avgTechnicalScore: 87,
          avgCommunicationScore: 84,
        },
        contestPerformance: {
          contestsEntered: 8,
          currentRating: 1720,
          highestRating: 1780,
          globalRank: "Top 8%",
        },
        skillGrowth: {
          algorithms: 88,
          systemDesign: 82,
          dataStructures: 92,
          databases: 85,
        },
        companyReadiness: {
          Amazon: 90,
          Google: 82,
          Microsoft: 92,
          Meta: 84,
        },
        placementProbability: 89,
      });
    }

    await RedisManager.set(redisKey, JSON.stringify(analytics), 3600);
    return analytics;
  }
}
