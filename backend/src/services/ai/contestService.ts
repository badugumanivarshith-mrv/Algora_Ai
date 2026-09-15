import {
  ContestRepository,
  ContestEntity,
  ContestSubmissionEntity,
} from "../../repositories/contestRepository";
import { ContestRatingService } from "./contestRatingService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { KnowledgeGapService } from "./knowledgeGapService";
import { LearningPredictionService } from "./learningPredictionService";
import { RecommendationEngineService } from "./recommendationEngineService";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class ContestService {
  public static async getContests(): Promise<ContestEntity[]> {
    let contests = await ContestRepository.getContests();
    if (contests.length === 0) {
      contests = await this.seedDefaultContests();
    }
    return contests;
  }

  public static async submitSolution(params: {
    contestId: string;
    userId: string;
    problemId: string;
    verdict: string;
    runtime?: number;
    memory?: number;
    topic?: string;
  }): Promise<ContestSubmissionEntity> {
    const submission = await ContestRepository.addSubmission(params);

    // Update cross-phase intelligence
    const isAccepted = params.verdict === "Accepted";
    const topic = params.topic || "Arrays";

    try {
      // 1. Update V3.4 Learning Intelligence Mastery
      await MasteryTrackingService.calculateAndSaveMastery({
        userId: params.userId,
        topic,
        subtopic: "Contest Problem " + params.problemId,
        correctSubmissions: isAccepted ? 1 : 0,
        totalAttempts: 1,
        difficultyLevel: "Medium",
      });

      // 2. If Wrong Answer, record in V3.4 Knowledge Gaps
      if (!isAccepted) {
        await KnowledgeGapService.detectKnowledgeGaps(params.userId);
      }

      // 3. Recalculate Rating and Update Redis Leaderboard
      const submissions = await ContestRepository.getSubmissions(params.contestId, params.userId);
      const score = submissions.filter((s) => s.verdict === "Accepted").length * 100;
      await ContestRatingService.calculateAndUpdateRating(params.contestId, params.userId, score, 3);

      // Update Redis Leaderboard Cache
      const redisKey = `contest:leaderboard:${params.contestId}`;
      await RedisManager.del(redisKey);
    } catch (e: any) {
      logger.error(`[ContestService.submitSolution] Cross-phase update error: ${e.message}`);
    }

    return submission;
  }

  public static async getLeaderboard(contestId: string): Promise<any[]> {
    const redisKey = `contest:leaderboard:${contestId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    const participants = await ContestRepository.getParticipants(contestId);
    const leaderboard = participants.map((p, idx) => ({
      rank: idx + 1,
      userId: p.user_id,
      score: p.score,
      ratingBefore: p.rating_before,
      ratingAfter: p.rating_after,
    }));

    await RedisManager.set(redisKey, JSON.stringify(leaderboard), 3600);
    return leaderboard;
  }

  private static async seedDefaultContests(): Promise<ContestEntity[]> {
    const defaultContests = [
      {
        title: "Algora Daily Challenge #142",
        description: "30-minute daily speed challenge focusing on Sliding Window and Two Pointers.",
        contestType: "Daily",
        durationMinutes: 30,
      },
      {
        title: "Algora Weekly Contest #42",
        description: "4 algorithmic problems (Easy to Hard) with Global Elo Rating changes.",
        contestType: "Weekly",
        durationMinutes: 90,
      },
      {
        title: "Amazon Placement Sprint 2026",
        description: "Simulated Amazon technical OA containing 2 coding questions & system design MCQ.",
        contestType: "Company",
        durationMinutes: 120,
      },
      {
        title: "Algora Team Hackathon #12",
        description: "Collaborative 3-member team competitive programming battle.",
        contestType: "Team",
        durationMinutes: 180,
      },
    ];

    const seeded: ContestEntity[] = [];
    for (const c of defaultContests) {
      const saved = await ContestRepository.createContest(c);
      // Add problem entries
      await ContestRepository.addContestProblem({ contestId: saved.id, problemId: "p_sw_1", points: 100, orderIndex: 1 });
      await ContestRepository.addContestProblem({ contestId: saved.id, problemId: "p_tree_2", points: 200, orderIndex: 2 });
      await ContestRepository.addContestProblem({ contestId: saved.id, problemId: "p_graph_3", points: 300, orderIndex: 3 });
      seeded.push(saved);
    }
    return seeded;
  }
}
