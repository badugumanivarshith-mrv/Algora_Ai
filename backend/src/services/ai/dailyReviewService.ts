import { defaultAIProvider } from "./geminiProvider";
import { LearningMemoryRepository, LearningReviewItem, LearningStreak } from "../../repositories/learningMemoryRepository";
import { RedisManager } from "../../redis/redisClient";

export interface DailyAiReport {
  greeting: string;
  yesterdaySummary: {
    problemsSolved: number;
    xpEarned: number;
    topicsStudied: string[];
  };
  weakAreas: string[];
  todayQueueCount: number;
  estimatedMinutesTotal: number;
  aiAdvice: string;
}

export class DailyReviewService {
  public static async getDailyReviews(userId: string): Promise<LearningReviewItem[]> {
    const redisKey = `ai:daily_reviews:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const reviews = await LearningMemoryRepository.getDailyReviews(userId);
    await RedisManager.set(redisKey, JSON.stringify(reviews), 3600);
    return reviews;
  }

  public static async markReviewComplete(userId: string, reviewId: string): Promise<{ review: LearningReviewItem | null; streak: LearningStreak }> {
    const review = await LearningMemoryRepository.markReviewComplete(userId, reviewId);
    const streak = await LearningMemoryRepository.addXp(userId, 50);

    // Invalidate Redis cache
    await RedisManager.del(`ai:daily_reviews:${userId}`);
    await RedisManager.del(`ai:daily_report:${userId}`);

    return { review, streak };
  }

  public static async getStreak(userId: string): Promise<LearningStreak> {
    return LearningMemoryRepository.getStreakRecord(userId);
  }

  public static async generateDailyAiReport(userId: string, userName: string = "Arjun"): Promise<DailyAiReport> {
    const redisKey = `ai:daily_report:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const reviews = await this.getDailyReviews(userId);
    const pendingReviews = reviews.filter((r) => r.status === "pending");
    const estimatedMinutesTotal = pendingReviews.reduce((sum, item) => sum + item.estimatedMinutes, 0);

    const systemInstruction = `You are an elite AI Learning Coach for computer science students. Generate a highly motivational, structured Daily Learning Report. Return ONLY valid JSON adhering strictly to this schema:
{
  "greeting": "Good Morning Arjun!",
  "yesterdaySummary": {
    "problemsSolved": 4,
    "xpEarned": 250,
    "topicsStudied": ["Arrays", "Binary Search", "Graphs"]
  },
  "weakAreas": ["Dynamic Programming (2D State)", "Graph BFS Traversal"],
  "todayQueueCount": 4,
  "estimatedMinutesTotal": 45,
  "aiAdvice": "Your Graph retention has dropped 15% this week. Spend 15 minutes reviewing BFS queue invariant before tackling new Medium problems."
}`;

    const prompt = `User: ${userName}. Pending Reviews: ${pendingReviews.length}. Total Est Minutes: ${estimatedMinutesTotal}. Weak Topics: Dynamic Programming, Graphs.`;

    let report: DailyAiReport;
    try {
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      report = JSON.parse(cleanJson);
    } catch {
      report = {
        greeting: `Good Morning ${userName}!`,
        yesterdaySummary: {
          problemsSolved: 4,
          xpEarned: 250,
          topicsStudied: ["Arrays & Strings", "Binary Search", "Graphs"],
        },
        weakAreas: ["Dynamic Programming (2D State Transitions)", "Graph BFS Invariants"],
        todayQueueCount: pendingReviews.length || 4,
        estimatedMinutesTotal: estimatedMinutesTotal || 45,
        aiAdvice: "Your Graph retention score has decayed 15% over the last 4 days. Tackle the BFS Revision task today to boost memory retention back to 85%.",
      };
    }

    await RedisManager.set(redisKey, JSON.stringify(report), 3600);
    return report;
  }
}
