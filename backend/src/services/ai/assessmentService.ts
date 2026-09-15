import { HiringRepository, AssessmentEntity, AssessmentAttemptEntity } from "../../repositories/hiringRepository";
import { ContestAnalyticsService } from "./contestAnalyticsService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class AssessmentService {
  public static async getAssessments(company?: string): Promise<AssessmentEntity[]> {
    let assessments = await HiringRepository.getAssessments(company);
    if (assessments.length === 0) {
      assessments = await this.seedDefaultAssessments();
    }
    return assessments;
  }

  public static async submitAttempt(params: {
    assessmentId: string;
    userId: string;
    score: number;
  }): Promise<AssessmentAttemptEntity> {
    const attempt = await HiringRepository.recordAttempt(params);

    // Update candidate profile readiness score based on assessment score, contest rating, and mastery
    try {
      const contestAnalytics = await ContestAnalyticsService.getUserAnalytics(params.userId);
      const masteryScores = await MasteryTrackingService.getTopicMastery(params.userId);

      const avgMastery = masteryScores.length > 0
        ? masteryScores.reduce((acc, m) => acc + Number(m.mastery_rating || 0), 0) / masteryScores.length
        : 75;

      const contestRating = contestAnalytics?.rating || 1500;
      const normalizedContest = Math.min(100, Math.max(0, ((contestRating - 1000) / 1000) * 100));

      const readinessScore = Math.round(
        params.score * 0.4 + avgMastery * 0.3 + normalizedContest * 0.3
      );

      await HiringRepository.upsertCandidateProfile({
        userId: params.userId,
        readinessScore,
        overallRating: contestRating,
      });

      // Cache profile in Redis
      const redisKey = `hiring:profile:${params.userId}`;
      await RedisManager.set(redisKey, JSON.stringify({ userId: params.userId, readinessScore, overallRating: contestRating, updatedAt: new Date() }), 3600);

      // Cache assessment analytics
      const analyticsKey = `assessment:analytics:${params.userId}`;
      await RedisManager.set(analyticsKey, JSON.stringify({ userId: params.userId, lastScore: params.score, readinessScore, updatedAt: new Date() }), 3600);
    } catch (e: any) {
      logger.error(`[AssessmentService.submitAttempt] Integration update error: ${e.message}`);
    }

    return attempt;
  }

  private static async seedDefaultAssessments(): Promise<AssessmentEntity[]> {
    const defaults = [
      {
        title: "Google Software Engineer Online Assessment 2026",
        description: "Official 60-minute Google OA simulation: 2 algorithmic coding problems on Graphs & Dynamic Programming.",
        assessmentType: "Coding",
        company: "Google",
        durationMinutes: 60,
        difficulty: "Hard",
      },
      {
        title: "Amazon SDE Technical & Leadership Principles Round",
        description: "Amazon SDE OA: 2 coding questions on Sliding Window/Trees + 14 Leadership Principles scenarios.",
        assessmentType: "AI Interview",
        company: "Amazon",
        durationMinutes: 75,
        difficulty: "Medium",
      },
      {
        title: "Microsoft Software Engineer System Design & Coding Assessment",
        description: "Microsoft OA: High level system design scenarios and data structure optimization.",
        assessmentType: "System Design",
        company: "Microsoft",
        durationMinutes: 90,
        difficulty: "Medium",
      },
      {
        title: "Meta Production Engineering & Algorithm Assessment",
        description: "Meta Speed Coding Round: 2 algorithmic challenges requiring linear time solutions.",
        assessmentType: "Coding",
        company: "Meta",
        durationMinutes: 45,
        difficulty: "Hard",
      },
    ];

    const seeded: AssessmentEntity[] = [];
    for (const d of defaults) {
      const created = await HiringRepository.createAssessment(d);
      await HiringRepository.addQuestion({
        assessmentId: created.id,
        questionType: "Coding",
        questionContent: { title: "Binary Tree Maximum Path Sum", constraint: "O(N) time complexity" },
        points: 100,
      });
      seeded.push(created);
    }
    return seeded;
  }
}
