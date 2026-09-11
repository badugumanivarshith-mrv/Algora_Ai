import { Database } from "../db/connection";
import { db } from "../services/store";
import { ReadinessScoreEntity, SkillAssessmentEntity } from "../types";

export class ReadinessRepository {
  static async getContestReadiness(userId: string): Promise<ReadinessScoreEntity | null> {
    const scores = Array.from(db.readinessScores.values()).filter(
      (r) => r.userId === userId && r.assessmentType === "contest"
    );
    if (scores.length > 0) return scores[0];

    // Default fallback
    return {
      id: `rs-contest-${userId}`,
      userId,
      assessmentType: "contest",
      overallScore: 78,
      dsaCoveragePct: 82,
      speedScore: 74,
      accuracyScore: 84,
      difficultyHandling: 72,
      topicCoverage: 80,
      breakdown: {
        suggestedContestTier: "Div 2 / Weekly Rated Contest",
        averageSolveSpeedMinutes: 18.5,
        firstSubmissionAcceptancePct: 76,
        streakMultiplier: 1.15,
        strengthAreas: ["Two Pointers", "Binary Search", "Hash Maps", "Prefix Sums"],
        weakAreas: ["Dynamic Programming (Intervals)", "Bitwise Manipulation", "Shortest Path (Dijkstra)"],
        recommendedPracticeTopics: ["2D DP Optimization", "Kahn's Topological Sort", "Disjoint Set Union (DSU)"],
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  static async getInterviewReadiness(userId: string): Promise<ReadinessScoreEntity | null> {
    const scores = Array.from(db.readinessScores.values()).filter(
      (r) => r.userId === userId && r.assessmentType === "interview"
    );
    if (scores.length > 0) return scores[0];

    // Default fallback
    return {
      id: `rs-interview-${userId}`,
      userId,
      assessmentType: "interview",
      overallScore: 83,
      dsaCoveragePct: 86,
      speedScore: 80,
      accuracyScore: 88,
      difficultyHandling: 78,
      topicCoverage: 85,
      breakdown: {
        companyReadiness: {
          productBased: 88,
          serviceBased: 96,
          startup: 85,
          faangStyle: 76,
        },
        topicReadiness: [
          { topic: "Arrays & Hashing", readiness: 94 },
          { topic: "Strings & Two Pointers", readiness: 90 },
          { topic: "Trees & Binary Search", readiness: 82 },
          { topic: "Graph Traversals", readiness: 78 },
          { topic: "Dynamic Programming", readiness: 64 },
          { topic: "System Object Design", readiness: 72 },
        ],
        missingTopics: ["Segment Trees", "Advanced 2D Matrix DP", "Monotonic Queue Slopes"],
        recommendedQuestions: ["LRU Cache", "Course Schedule II", "Trapping Rain Water", "Lowest Common Ancestor"],
        preparationRoadmap: [
          "Consolidate 1D and 2D DP Recurrences (Target: 80% accuracy)",
          "Practice Verbalizing Thought Process & Big-O trade-offs",
          "Complete 3 Mock Timed 45-Minute Coding Screens",
        ],
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  static async getWeakTopics(userId: string): Promise<SkillAssessmentEntity[]> {
    const assessments = Array.from(db.skillAssessments.values()).filter(
      (a) => a.userId === userId
    );
    return assessments.sort((a, b) => a.masteryScore - b.masteryScore);
  }
}
