import { HiringRepository, CandidateRankingEntity } from "../../repositories/hiringRepository";
import { ContestAnalyticsService } from "./contestAnalyticsService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { RedisManager } from "../../redis/redisClient";

export class CandidateRankingService {
  public static async getCandidateRankings(userId: string): Promise<CandidateRankingEntity[]> {
    const redisKey = `hiring:ranking:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    let rankings = await HiringRepository.getCandidateRankings(userId);
    if (rankings.length === 0) {
      rankings = await this.computeAndSaveRankings(userId);
    }

    await RedisManager.set(redisKey, JSON.stringify(rankings), 3600);
    return rankings;
  }

  public static async computeAndSaveRankings(userId: string): Promise<CandidateRankingEntity[]> {
    const contestAnalytics = await ContestAnalyticsService.getUserAnalytics(userId);
    const masteryScores = await MasteryTrackingService.getTopicMastery(userId);

    const contestRating = contestAnalytics?.rating || 1500;
    const avgMastery = masteryScores.length > 0
      ? masteryScores.reduce((acc, m) => acc + Number(m.mastery_rating || 0), 0) / masteryScores.length
      : 80;

    const companies = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"];
    const computed: CandidateRankingEntity[] = [];

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const factor = 1 - i * 0.04;
      const rankingScore = Math.round((contestRating * 0.5 + avgMastery * 10 * 0.5) * factor);
      const percentile = Math.min(99.9, Math.round((rankingScore / 1850) * 95 * 10) / 10);

      const r = await HiringRepository.upsertCandidateRanking({
        userId,
        company,
        rankingScore,
        percentile,
      });
      computed.push(r);
    }

    return computed;
  }
}
