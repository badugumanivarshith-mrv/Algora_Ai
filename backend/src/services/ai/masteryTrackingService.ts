import {
  LearningIntelligenceRepository,
  MasteryScoreEntity,
} from "../../repositories/learningIntelligenceRepository";
import { RedisManager } from "../../redis/redisClient";
import { AgentRepository } from "../../repositories/agentRepository";

export class MasteryTrackingService {
  public static async getUserMastery(userId: string) {
    return await this.getMasteryScores(userId);
  }

  public static async calculateAndSaveMastery(params: {
    userId: string;
    topic: string;
    subtopic: string;
    correctSubmissions: number;
    totalAttempts: number;
    difficultyLevel?: string;
    daysSinceLastPractice?: number;
  }): Promise<MasteryScoreEntity> {
    const accuracy = params.totalAttempts > 0 ? (params.correctSubmissions / params.totalAttempts) * 100 : 50;

    // Difficulty score multiplier
    const diffMult = params.difficultyLevel === "Hard" ? 1.25 : params.difficultyLevel === "Medium" ? 1.0 : 0.8;

    // Retention score decay over time
    const days = params.daysSinceLastPractice || 1;
    const retentionScore = Math.max(20, Math.min(100, Math.round(accuracy * Math.exp(-0.03 * days))));

    // Revision score
    const revisionScore = Math.min(100, params.correctSubmissions * 12);

    // Difficulty score
    const difficultyScore = Math.min(100, Math.round(accuracy * diffMult));

    // Overall 0-100 mastery rating
    const masteryRating = Math.round(accuracy * 0.4 + retentionScore * 0.3 + revisionScore * 0.2 + difficultyScore * 0.1);

    // V4.0 AI OS Integration: Log to Learning Agent memory
    if (masteryRating > 80) {
      await AgentRepository.saveMemory("learning-agent", params.userId, `mastery_${params.subtopic}`, `High mastery achieved in ${params.subtopic}: ${masteryRating}%`, 7);
    }

    const score = await LearningIntelligenceRepository.upsertMasteryScore({
      userId: params.userId,
      topic: params.topic,
      subtopic: params.subtopic,
      masteryRating,
      retentionScore,
      revisionScore,
      difficultyScore,
    });

    const redisKey = `mastery:scores:${params.userId}`;
    await RedisManager.del(redisKey);

    return score;
  }

  public static async getMasteryScores(userId: string): Promise<MasteryScoreEntity[]> {
    const redisKey = `mastery:scores:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to DB
      }
    }

    let scores = await LearningIntelligenceRepository.getMasteryScores(userId);
    if (scores.length === 0) {
      scores = await this.seedInitialMasteryScores(userId);
    }

    await RedisManager.set(redisKey, JSON.stringify(scores), 3600);
    return scores;
  }

  public static async getTopicMastery(userId: string): Promise<MasteryScoreEntity[]> {
    return this.getMasteryScores(userId);
  }

  public static async boostMasteryFromProject(userId: string, skills: string[]): Promise<void> {
    const existing = await this.getMasteryScores(userId);
    for (const skill of skills) {
      const match = existing.find(s => s.topic.toLowerCase() === skill.toLowerCase() || s.subtopic.toLowerCase() === skill.toLowerCase());
      if (match) {
        await LearningIntelligenceRepository.upsertMasteryScore({
          userId,
          topic: match.topic,
          subtopic: match.subtopic,
          masteryRating: Math.min(100, Math.round(Number(match.mastery_rating || 0) + 5)),
          retentionScore: Math.min(100, Math.round(Number(match.retention_score || 0) + 5)),
          revisionScore: Number(match.revision_score || 0),
          difficultyScore: Number(match.difficulty_score || 0)
        });
      }
    }
    await RedisManager.del(`mastery:scores:${userId}`);
  }

  public static async boostMasteryFromResearch(userId: string, topics: string[]): Promise<void> {
    const existing = await this.getMasteryScores(userId);
    for (const topic of topics) {
      const match = existing.find(s => s.topic.toLowerCase() === topic.toLowerCase());
      if (match) {
        await LearningIntelligenceRepository.upsertMasteryScore({
          userId,
          topic: match.topic,
          subtopic: match.subtopic,
          masteryRating: Math.min(100, Math.round(Number(match.mastery_rating || 0) + 10)),
          retentionScore: Math.min(100, Math.round(Number(match.retention_score || 0) + 10)),
          revisionScore: Number(match.revision_score || 0),
          difficultyScore: Number(match.difficulty_score || 0)
        });
      }
    }
    await RedisManager.del(`mastery:scores:${userId}`);
  }

  private static async seedInitialMasteryScores(userId: string): Promise<MasteryScoreEntity[]> {
    const defaultScores = [
      { topic: "Arrays", subtopic: "Two Pointers", masteryRating: 88, retentionScore: 85, revisionScore: 90, difficultyScore: 85 },
      { topic: "Arrays", subtopic: "Sliding Window", masteryRating: 78, retentionScore: 75, revisionScore: 80, difficultyScore: 78 },
      { topic: "Trees", subtopic: "Binary Search Tree", masteryRating: 82, retentionScore: 80, revisionScore: 85, difficultyScore: 82 },
      { topic: "Trees", subtopic: "Segment Tree", masteryRating: 54, retentionScore: 50, revisionScore: 55, difficultyScore: 60 },
      { topic: "Graphs", subtopic: "BFS Traversal", masteryRating: 86, retentionScore: 84, revisionScore: 88, difficultyScore: 85 },
      { topic: "Graphs", subtopic: "Dijkstra Algorithm", masteryRating: 48, retentionScore: 42, revisionScore: 50, difficultyScore: 52 },
      { topic: "Graphs", subtopic: "Minimum Spanning Tree", masteryRating: 45, retentionScore: 40, revisionScore: 48, difficultyScore: 50 },
    ];

    const seeded: MasteryScoreEntity[] = [];
    for (const s of defaultScores) {
      const saved = await LearningIntelligenceRepository.upsertMasteryScore({
        userId,
        ...s,
      });
      seeded.push(saved);
    }
    return seeded;
  }
}
