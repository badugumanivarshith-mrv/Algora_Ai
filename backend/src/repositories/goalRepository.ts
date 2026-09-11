import { Database } from "../db/connection";
import { db } from "../services/store";
import {
  UserGoalEntity,
  UserGoalProgressEntity,
  UserGoalType,
  GoalMetric,
} from "../types";

export class GoalRepository {
  static async getUserGoals(userId: string): Promise<UserGoalEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM user_goals WHERE user_id = $1 ORDER BY created_at DESC;`,
          [userId]
        );
        return rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          goalType: r.goal_type,
          targetMetric: r.target_metric,
          targetValue: r.target_value,
          currentValue: r.current_value,
          unit: r.unit,
          status: r.status,
          periodStart: r.period_start,
          periodEnd: r.period_end,
          streakCount: r.streak_count,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      } catch {
        // Fallback to in-memory
      }
    }

    return Array.from(db.userGoals.values()).filter((g) => g.userId === userId);
  }

  static async createGoal(
    userId: string,
    params: {
      title: string;
      goalType: UserGoalType;
      targetMetric: GoalMetric;
      targetValue: number;
      unit?: string;
    }
  ): Promise<UserGoalEntity> {
    const id = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    let periodEnd: Date;

    if (params.goalType === "daily") {
      periodEnd = new Date(now);
      periodEnd.setHours(23, 59, 59, 999);
    } else if (params.goalType === "weekly") {
      periodEnd = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    } else {
      periodEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    }

    const defaultUnits: Record<GoalMetric, string> = {
      problems_solved: "problems",
      xp_earned: "XP",
      topics_completed: "topics",
      study_time: "mins",
      contest_count: "contests",
    };

    const newGoal: UserGoalEntity = {
      id,
      userId,
      title: params.title,
      goalType: params.goalType,
      targetMetric: params.targetMetric,
      targetValue: params.targetValue,
      currentValue: 0,
      unit: params.unit || defaultUnits[params.targetMetric] || "items",
      status: "in_progress",
      periodStart: now.toISOString(),
      periodEnd: periodEnd.toISOString(),
      streakCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.userGoals.set(id, newGoal);
    return newGoal;
  }

  static async recordProgress(
    userId: string,
    goalId: string,
    increment: number,
    notes?: string
  ): Promise<{ goal: UserGoalEntity; progress: UserGoalProgressEntity }> {
    const goal = db.userGoals.get(goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error("Goal not found");
    }

    const newCurrent = Math.min(goal.targetValue * 2, goal.currentValue + increment);
    const completed = newCurrent >= goal.targetValue;

    goal.currentValue = newCurrent;
    if (completed && goal.status !== "completed") {
      goal.status = "completed";
      goal.streakCount += 1;
    }
    goal.updatedAt = new Date().toISOString();

    const progressId = `ugp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const progress: UserGoalProgressEntity = {
      id: progressId,
      goalId,
      userId,
      recordedDate: new Date().toISOString().split("T")[0],
      incrementValue: increment,
      currentValue: newCurrent,
      notes,
      createdAt: new Date().toISOString(),
    };

    db.userGoalProgress.set(progressId, progress);
    return { goal, progress };
  }
}
