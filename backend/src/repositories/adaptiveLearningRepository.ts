import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface SkillProfile {
  id: string;
  userId: string;
  overallSkillLevel: string;
  topicMastery: Record<string, number>;
  updatedAt: string;
}

export interface WeaknessLog {
  id: string;
  userId: string;
  topic: string;
  weaknessType: "wrong_answers" | "heavy_hint_usage" | "slow_solve_time" | "contest_weakness";
  severity: "Low" | "Medium" | "High";
  details: string;
  createdAt: string;
}

export interface DailyReviewItem {
  id: string;
  userId: string;
  topic: string;
  itemTitle: string;
  itemType: string;
  scheduledFor: string;
  retentionScore: number;
  status: "pending" | "reviewed" | "needs_revision";
  lastReviewedAt?: string;
}

export class AdaptiveLearningRepository {
  private static memoryProfiles: Map<string, SkillProfile> = new Map();
  private static memoryWeaknesses: Map<string, WeaknessLog[]> = new Map();
  private static memoryPaths: Map<string, any> = new Map();
  private static memoryDailyReviews: Map<string, DailyReviewItem[]> = new Map();
  private static memoryStudyPlans: Map<string, any> = new Map();

  public static async getSkillProfile(userId: string): Promise<SkillProfile> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM adaptive_skill_profiles WHERE user_id = $1 LIMIT 1;`,
          [userId]
        );
        if (rows.length > 0) {
          return {
            id: rows[0].id,
            userId: rows[0].user_id,
            overallSkillLevel: rows[0].overall_skill_level,
            topicMastery: typeof rows[0].topic_mastery === 'string' ? JSON.parse(rows[0].topic_mastery) : rows[0].topic_mastery,
            updatedAt: rows[0].updated_at,
          };
        }
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] getSkillProfile error: ${err.message}`);
      }
    }

    if (!this.memoryProfiles.has(userId)) {
      const defaultProfile: SkillProfile = {
        id: `prof-${userId}`,
        userId,
        overallSkillLevel: "Intermediate",
        topicMastery: {
          "Arrays": 88,
          "Strings": 75,
          "Linked Lists": 69,
          "Trees": 52,
          "Graphs": 34,
          "Dynamic Programming": 21,
        },
        updatedAt: new Date().toISOString(),
      };
      this.memoryProfiles.set(userId, defaultProfile);
    }
    return this.memoryProfiles.get(userId)!;
  }

  public static async saveSkillProfile(profile: SkillProfile): Promise<SkillProfile> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO adaptive_skill_profiles (id, user_id, overall_skill_level, topic_mastery, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET overall_skill_level = $3, topic_mastery = $4, updated_at = $5;`,
          [profile.id, profile.userId, profile.overallSkillLevel, JSON.stringify(profile.topicMastery), profile.updatedAt]
        );
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] saveSkillProfile error: ${err.message}`);
      }
    }
    this.memoryProfiles.set(profile.userId, profile);
    return profile;
  }

  public static async getWeaknesses(userId: string): Promise<WeaknessLog[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM adaptive_weakness_logs WHERE user_id = $1 ORDER BY created_at DESC;`,
          [userId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            weaknessType: r.weakness_type,
            severity: r.severity,
            details: r.details,
            createdAt: r.created_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] getWeaknesses error: ${err.message}`);
      }
    }

    if (!this.memoryWeaknesses.has(userId)) {
      const defaults: WeaknessLog[] = [
        {
          id: "wkn-1",
          userId,
          topic: "Dynamic Programming",
          weaknessType: "wrong_answers",
          severity: "High",
          details: "Failed 3 consecutive submissions on 2D DP state transitions",
          createdAt: new Date().toISOString(),
        },
        {
          id: "wkn-2",
          userId,
          topic: "Graphs",
          weaknessType: "heavy_hint_usage",
          severity: "Medium",
          details: "Requested 3+ hints on Dijkstra / Shortest Path problems",
          createdAt: new Date().toISOString(),
        },
        {
          id: "wkn-3",
          userId,
          topic: "Trees",
          weaknessType: "slow_solve_time",
          severity: "Medium",
          details: "Average solve duration exceeds 45 mins on Binary Search Tree balance logic",
          createdAt: new Date().toISOString(),
        },
      ];
      this.memoryWeaknesses.set(userId, defaults);
    }
    return this.memoryWeaknesses.get(userId)!;
  }

  public static async saveWeakness(weakness: WeaknessLog): Promise<WeaknessLog> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO adaptive_weakness_logs (id, user_id, topic, weakness_type, severity, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [weakness.id, weakness.userId, weakness.topic, weakness.weaknessType, weakness.severity, weakness.details, weakness.createdAt]
        );
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] saveWeakness error: ${err.message}`);
      }
    }
    const current = this.memoryWeaknesses.get(weakness.userId) || [];
    current.unshift(weakness);
    this.memoryWeaknesses.set(weakness.userId, current);
    return weakness;
  }

  public static async getDailyReviews(userId: string): Promise<DailyReviewItem[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM adaptive_daily_reviews WHERE user_id = $1 ORDER BY scheduled_for ASC;`,
          [userId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            itemTitle: r.item_title,
            itemType: r.item_type,
            scheduledFor: r.scheduled_for,
            retentionScore: r.retention_score,
            status: r.status,
            lastReviewedAt: r.last_reviewed_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] getDailyReviews error: ${err.message}`);
      }
    }

    if (!this.memoryDailyReviews.has(userId)) {
      const defaults: DailyReviewItem[] = [
        {
          id: "rev-1",
          userId,
          topic: "Arrays",
          itemTitle: "Binary Search & Two Pointers",
          itemType: "Concept",
          scheduledFor: new Date().toISOString(),
          retentionScore: 88,
          status: "pending",
        },
        {
          id: "rev-2",
          userId,
          topic: "Graphs",
          itemTitle: "Breadth-First Search (BFS) Traversal",
          itemType: "Problem",
          scheduledFor: new Date().toISOString(),
          retentionScore: 65,
          status: "pending",
        },
        {
          id: "rev-3",
          userId,
          topic: "Linked Lists",
          itemTitle: "Cycle Detection & Fast/Slow Pointer",
          itemType: "Concept",
          scheduledFor: new Date().toISOString(),
          retentionScore: 72,
          status: "pending",
        },
        {
          id: "rev-4",
          userId,
          topic: "Dynamic Programming",
          itemTitle: "0/1 Knapsack Bottom-up State Space",
          itemType: "Problem",
          scheduledFor: new Date().toISOString(),
          retentionScore: 28,
          status: "needs_revision",
        },
        {
          id: "rev-5",
          userId,
          topic: "Graphs",
          itemTitle: "Depth-First Search (DFS) & Island Counting",
          itemType: "Problem",
          scheduledFor: new Date().toISOString(),
          retentionScore: 34,
          status: "needs_revision",
        },
      ];
      this.memoryDailyReviews.set(userId, defaults);
    }
    return this.memoryDailyReviews.get(userId)!;
  }

  public static async updateDailyReviewStatus(userId: string, reviewId: string, status: "pending" | "reviewed" | "needs_revision", score?: number): Promise<DailyReviewItem | null> {
    const list = await this.getDailyReviews(userId);
    const item = list.find((i) => i.id === reviewId);
    if (!item) return null;

    item.status = status;
    if (score !== undefined) item.retentionScore = score;
    item.lastReviewedAt = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `UPDATE adaptive_daily_reviews SET status = $1, retention_score = $2, last_reviewed_at = $3 WHERE id = $4 AND user_id = $5;`,
          [status, item.retentionScore, item.lastReviewedAt, reviewId, userId]
        );
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] updateDailyReviewStatus error: ${err.message}`);
      }
    }
    return item;
  }

  public static async saveStudyPlan(userId: string, plan: any): Promise<any> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO adaptive_study_plans (id, user_id, placement_goal, available_hours_per_week, daily_plan, weekly_plan, monthly_plan, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [plan.id, userId, plan.placementGoal, plan.availableHoursPerWeek, JSON.stringify(plan.dailyPlan), JSON.stringify(plan.weeklyPlan), JSON.stringify(plan.monthlyPlan), plan.createdAt]
        );
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] saveStudyPlan error: ${err.message}`);
      }
    }
    this.memoryStudyPlans.set(userId, plan);
    return plan;
  }

  public static async getStudyPlan(userId: string): Promise<any | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM adaptive_study_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;`,
          [userId]
        );
        if (rows.length > 0) {
          return {
            id: rows[0].id,
            userId: rows[0].user_id,
            placementGoal: rows[0].placement_goal,
            availableHoursPerWeek: rows[0].available_hours_per_week,
            dailyPlan: typeof rows[0].daily_plan === 'string' ? JSON.parse(rows[0].daily_plan) : rows[0].daily_plan,
            weeklyPlan: typeof rows[0].weekly_plan === 'string' ? JSON.parse(rows[0].weekly_plan) : rows[0].weekly_plan,
            monthlyPlan: typeof rows[0].monthly_plan === 'string' ? JSON.parse(rows[0].monthly_plan) : rows[0].monthly_plan,
            createdAt: rows[0].created_at,
          };
        }
      } catch (err: any) {
        logger.error(`[AdaptiveLearningRepository] getStudyPlan error: ${err.message}`);
      }
    }
    return this.memoryStudyPlans.get(userId) || null;
  }
}
