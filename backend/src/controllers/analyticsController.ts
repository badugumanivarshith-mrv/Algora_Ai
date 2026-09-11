import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { StudyPlanRepository } from "../repositories/studyPlanRepository";
import { GoalRepository } from "../repositories/goalRepository";
import { RecommendationRepository } from "../repositories/recommendationRepository";
import { ReadinessRepository } from "../repositories/readinessRepository";
import { logger } from "../utils/logger";

export class AnalyticsController {
  static async getPersonalizationOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";

      const [plans, goals, recommendations, contestReadiness, interviewReadiness, weakTopics] =
        await Promise.all([
          StudyPlanRepository.getUserStudyPlans(userId),
          GoalRepository.getUserGoals(userId),
          RecommendationRepository.getRecommendations(userId),
          ReadinessRepository.getContestReadiness(userId),
          ReadinessRepository.getInterviewReadiness(userId),
          ReadinessRepository.getWeakTopics(userId),
        ]);

      const activePlan = plans.find((p) => p.status === "active") || plans[0] || null;
      const todayGoals = goals.filter((g) => g.goalType === "daily");
      const weeklyGoals = goals.filter((g) => g.goalType === "weekly");

      res.json({
        success: true,
        data: {
          activePlan,
          totalPlans: plans.length,
          todayGoals,
          weeklyGoals,
          allGoals: goals,
          recommendations: recommendations.slice(0, 8),
          contestReadiness,
          interviewReadiness,
          weakTopics,
          todayFocus: {
            primaryTopic: "Dynamic Programming (1D & Knapsack)",
            subGoal: "Identify state recurrence definitions and practice space compression",
            recommendedProblemsCount: 3,
            estimatedTimeMinutes: 45,
            reviewUrgentCount: recommendations.filter((r) => r.category === "Review Again").length,
          },
        },
      });
    } catch (error: any) {
      logger.error(`[AnalyticsController] Error fetching personalization overview: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch personalization overview" });
    }
  }

  static async getMasteryTimeline(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Return 8-week mastery progression data across core topics
      const timeline = [
        { week: "W1", "Arrays & Hashing": 40, "Two Pointers": 35, "Trees & BST": 20, "Dynamic Programming": 10, "Graphs": 15 },
        { week: "W2", "Arrays & Hashing": 55, "Two Pointers": 50, "Trees & BST": 30, "Dynamic Programming": 18, "Graphs": 25 },
        { week: "W3", "Arrays & Hashing": 70, "Two Pointers": 65, "Trees & BST": 45, "Dynamic Programming": 28, "Graphs": 40 },
        { week: "W4", "Arrays & Hashing": 82, "Two Pointers": 75, "Trees & BST": 58, "Dynamic Programming": 38, "Graphs": 52 },
        { week: "W5", "Arrays & Hashing": 88, "Two Pointers": 82, "Trees & BST": 65, "Dynamic Programming": 45, "Graphs": 64 },
        { week: "W6", "Arrays & Hashing": 92, "Two Pointers": 88, "Trees & BST": 70, "Dynamic Programming": 52, "Graphs": 72 },
        { week: "W7", "Arrays & Hashing": 94, "Two Pointers": 88, "Trees & BST": 72, "Dynamic Programming": 58, "Graphs": 78 },
        { week: "Current", "Arrays & Hashing": 95, "Two Pointers": 88, "Trees & BST": 72, "Dynamic Programming": 58, "Graphs": 78 },
      ];

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error: any) {
      logger.error(`[AnalyticsController] Error fetching mastery timeline: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch mastery timeline" });
    }
  }

  static async getSkillGapAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const skills = [
        { topic: "Arrays & Two Pointers", current: 90, target: 95, gap: 5, status: "Mastered" },
        { topic: "Hash Tables & Prefix Sums", current: 92, target: 95, gap: 3, status: "Mastered" },
        { topic: "Trees & Binary Search", current: 74, target: 90, gap: 16, status: "Proficient" },
        { topic: "Graphs (BFS/DFS/Topological)", current: 78, target: 88, gap: 10, status: "Proficient" },
        { topic: "Dynamic Programming (1D/2D)", current: 58, target: 85, gap: 27, status: "Needs Improvement" },
        { topic: "Intervals & Sorting Invariants", current: 65, target: 90, gap: 25, status: "Needs Improvement" },
        { topic: "Heaps & Priority Queues", current: 70, target: 85, gap: 15, status: "Proficient" },
        { topic: "System Object Design", current: 72, target: 88, gap: 16, status: "Proficient" },
      ];

      res.json({
        success: true,
        data: skills,
      });
    } catch (error: any) {
      logger.error(`[AnalyticsController] Error fetching skill gap analysis: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch skill gap analysis" });
    }
  }
}
