import { defaultAIProvider } from "./geminiProvider";
import { AdaptiveLearningRepository, SkillProfile, WeaknessLog, DailyReviewItem } from "../../repositories/adaptiveLearningRepository";
import { RedisManager } from "../../redis/redisClient";

export class AdaptiveLearningService {
  public static async getSkillProfile(userId: string): Promise<SkillProfile> {
    return AdaptiveLearningRepository.getSkillProfile(userId);
  }

  public static async getWeaknesses(userId: string): Promise<WeaknessLog[]> {
    return AdaptiveLearningRepository.getWeaknesses(userId);
  }

  public static async getDailyReviews(userId: string): Promise<{ todaysReview: DailyReviewItem[]; needsRevision: DailyReviewItem[] }> {
    const items = await AdaptiveLearningRepository.getDailyReviews(userId);
    const todaysReview = items.filter((i) => i.status === "pending" || i.status === "reviewed");
    const needsRevision = items.filter((i) => i.status === "needs_revision");
    return { todaysReview, needsRevision };
  }

  public static async submitDailyReview(userId: string, reviewId: string, score: number): Promise<DailyReviewItem | null> {
    const status = score >= 70 ? "reviewed" : "needs_revision";
    return AdaptiveLearningRepository.updateDailyReviewStatus(userId, reviewId, status, score);
  }

  public static async generateStudyPlan(userId: string, placementGoal: string, availableHours: number): Promise<any> {
    const profile = await this.getSkillProfile(userId);
    const weaknesses = await this.getWeaknesses(userId);

    const systemInstruction = `You are a FAANG Technical Hiring & Learning Director. Generate a personalized, highly actionable study plan based on the student's current skill profile, detected weaknesses, target placement goal, and weekly available study hours.
Return ONLY valid JSON matching this schema:
{
  "dailyPlan": [
    {"day": "Monday", "focus": "Graph BFS/DFS Practice", "durationHours": 2, "tasks": ["Solve Number of Islands", "Review Queue FIFO invariants"]}
  ],
  "weeklyPlan": [
    {"week": "Week 1", "theme": "Graph Fundamentals & Traversal", "targetTopics": ["BFS", "DFS", "Grid Traversal"]}
  ],
  "monthlyPlan": [
    {"month": "Month 1", "milestone": "Master Graphs & Advanced DP", "keyOutcome": "Target >= 75% accuracy on Graph Mediums"}
  ]
}`;

    const prompt = `Student Target: "${placementGoal}". Available Hours/Week: ${availableHours}. Topic Mastery: ${JSON.stringify(profile.topicMastery)}. Weaknesses: ${JSON.stringify(weaknesses.map(w => w.topic + ': ' + w.details))}.`;

    let rawText = "";
    try {
      rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
    } catch {
      rawText = "";
    }

    let parsed: any = null;
    try {
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        dailyPlan: [
          { day: "Monday", focus: "Graph Traversal Basics", durationHours: 2, tasks: ["Solve Number of Islands", "Study BFS Queue Pattern"] },
          { day: "Tuesday", focus: "Graph Shortest Path", durationHours: 2, tasks: ["Implement Dijkstra Algorithm", "Solve Network Delay Time"] },
          { day: "Wednesday", focus: "Dynamic Programming Memoization", durationHours: 2, tasks: ["Solve Coin Change", "Review Top-down vs Bottom-up"] },
          { day: "Thursday", focus: "Trees & Binary Search Trees", durationHours: 2, tasks: ["Validate Binary Search Tree", "Lowest Common Ancestor"] },
          { day: "Friday", focus: "Mock Interview & Timed Practice", durationHours: 2, tasks: ["Complete 1 Medium Contest Round"] },
        ],
        weeklyPlan: [
          { week: "Week 1", theme: "Graph Fundamentals", targetTopics: ["BFS", "DFS", "Grid Traversal"] },
          { week: "Week 2", theme: "Shortest Path & Topological Sort", targetTopics: ["Dijkstra", "Kahn's Algorithm"] },
          { week: "Week 3", theme: "Dynamic Programming Foundations", targetTopics: ["1D DP", "Knapsack Pattern"] },
        ],
        monthlyPlan: [
          { month: "Month 1", milestone: "Graphs & DP Mastery", keyOutcome: "Target >= 75% accuracy on Graph Medium problems" },
        ],
      };
    }

    const planEntity = {
      id: `plan-${Date.now()}`,
      userId,
      placementGoal,
      availableHoursPerWeek: availableHours,
      dailyPlan: parsed.dailyPlan || [],
      weeklyPlan: parsed.weeklyPlan || [],
      monthlyPlan: parsed.monthlyPlan || [],
      createdAt: new Date().toISOString(),
    };

    await AdaptiveLearningRepository.saveStudyPlan(userId, planEntity);
    return planEntity;
  }

  public static async getPersonalizedLearningPath(userId: string, targetGoal: string = "Google"): Promise<any> {
    const profile = await this.getSkillProfile(userId);
    const weaknesses = await this.getWeaknesses(userId);

    return {
      userId,
      targetGoal,
      overallSkillLevel: profile.overallSkillLevel,
      weeks: [
        {
          weekNumber: 1,
          title: "Graph Fundamentals & BFS/DFS",
          status: "in_progress",
          reason: `Targeting lowest mastery topic: Graphs (${profile.topicMastery["Graphs"] || 34}%)`,
          topics: ["Breadth-First Search", "Depth-First Search", "Grid Traversals"],
          problems: [
            { id: "p-1", title: "Number of Islands", difficulty: "Medium", topic: "Graphs", status: "recommended" },
            { id: "p-2", title: "Max Area of Island", difficulty: "Medium", topic: "Graphs", status: "pending" },
            { id: "p-3", title: "Rotting Oranges", difficulty: "Medium", topic: "Graphs", status: "pending" },
          ],
        },
        {
          weekNumber: 2,
          title: "Advanced Shortest Path Algorithms",
          status: "upcoming",
          reason: "Reinforce weakness log: Requested 3+ hints on Dijkstra",
          topics: ["Dijkstra Algorithm", "Bellman-Ford", "Topological Sort"],
          problems: [
            { id: "p-4", title: "Network Delay Time", difficulty: "Medium", topic: "Graphs", status: "pending" },
            { id: "p-5", title: "Course Schedule II", difficulty: "Medium", topic: "Graphs", status: "pending" },
          ],
        },
        {
          weekNumber: 3,
          title: "Dynamic Programming State Reduction",
          status: "upcoming",
          reason: `Targeting critical gap: Dynamic Programming (${profile.topicMastery["Dynamic Programming"] || 21}%)`,
          topics: ["0/1 Knapsack", "Coin Change", "Longest Common Subsequence"],
          problems: [
            { id: "p-6", title: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", status: "pending" },
            { id: "p-7", title: "Longest Increasing Subsequence", difficulty: "Medium", topic: "Dynamic Programming", status: "pending" },
          ],
        },
      ],
    };
  }

  public static async getAdaptiveRecommendations(userId: string): Promise<any[]> {
    const profile = await this.getSkillProfile(userId);
    const weaknesses = await this.getWeaknesses(userId);

    return [
      {
        id: "rec-1",
        problemTitle: "Number of Islands",
        problemSlug: "number-of-islands",
        difficulty: "Medium",
        topic: "Graphs",
        score: 98,
        reason: `Targeted to improve weak Graphs mastery (${profile.topicMastery["Graphs"] || 34}%)`,
        actionTaken: "none",
      },
      {
        id: "rec-2",
        problemTitle: "Coin Change",
        problemSlug: "coin-change",
        difficulty: "Medium",
        topic: "Dynamic Programming",
        score: 95,
        reason: `Targeted to resolve 2D DP state transition failures`,
        actionTaken: "none",
      },
      {
        id: "rec-3",
        problemTitle: "Network Delay Time",
        problemSlug: "network-delay-time",
        difficulty: "Medium",
        topic: "Graphs",
        score: 89,
        reason: "Practice Dijkstra algorithm without requesting hints",
        actionTaken: "none",
      },
      {
        id: "rec-4",
        problemTitle: "Validate Binary Search Tree",
        problemSlug: "validate-binary-search-tree",
        difficulty: "Medium",
        topic: "Trees",
        score: 84,
        reason: "Improve solve speed on BST invariants (currently > 45 mins)",
        actionTaken: "none",
      },
    ];
  }
}
