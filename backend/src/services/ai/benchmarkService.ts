import { ContestAnalyticsService } from "./contestAnalyticsService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { HiringRepository } from "../../repositories/hiringRepository";

export interface BenchmarkComparison {
  userId: string;
  userScore: number;
  top1PercentThreshold: number;
  top5PercentThreshold: number;
  top10PercentThreshold: number;
  companyReadyThreshold: number;
  userTier: "Top 1%" | "Top 5%" | "Top 10%" | "Company Ready" | "Developing";
  comparisonMetrics: {
    contestElo: number;
    avgMastery: number;
    assessmentAvg: number;
  };
}

export class BenchmarkService {
  public static async getCandidateBenchmark(userId: string): Promise<BenchmarkComparison> {
    const contestAnalytics = await ContestAnalyticsService.getUserAnalytics(userId);
    const masteryScores = await MasteryTrackingService.getTopicMastery(userId);
    const attempts = await HiringRepository.getAttempts(userId);

    const contestElo = contestAnalytics?.rating || 1500;
    const avgMastery = masteryScores.length > 0
      ? Math.round(masteryScores.reduce((acc, m) => acc + Number(m.mastery_rating || 0), 0) / masteryScores.length)
      : 80;
    const assessmentAvg = attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length)
      : 85;

    const compositeScore = Math.round((contestElo / 2000) * 400 + avgMastery * 3 + assessmentAvg * 3);

    let userTier: "Top 1%" | "Top 5%" | "Top 10%" | "Company Ready" | "Developing";
    if (compositeScore >= 920) userTier = "Top 1%";
    else if (compositeScore >= 850) userTier = "Top 5%";
    else if (compositeScore >= 780) userTier = "Top 10%";
    else if (compositeScore >= 680) userTier = "Company Ready";
    else userTier = "Developing";

    return {
      userId,
      userScore: compositeScore,
      top1PercentThreshold: 920,
      top5PercentThreshold: 850,
      top10PercentThreshold: 780,
      companyReadyThreshold: 680,
      userTier,
      comparisonMetrics: {
        contestElo,
        avgMastery,
        assessmentAvg,
      },
    };
  }
}
