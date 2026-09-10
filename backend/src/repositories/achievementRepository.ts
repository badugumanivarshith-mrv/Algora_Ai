import { Database } from "../db/connection";
import { db } from "../services/store";
import { AchievementEntity, UserAchievementEntity } from "../types";
import { DEFAULT_ACHIEVEMENTS } from "../db/seeds";
import { XPRepository } from "./xpRepository";

export class AchievementRepository {
  static async findAll(): Promise<AchievementEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, badge_code as "badgeCode", badge_name as "badgeName", description,
                icon_name as "iconName", xp_reward as "xpReward", category, created_at as "createdAt"
         FROM achievements ORDER BY created_at ASC;`
      );
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          badgeCode: r.badgeCode,
          badgeName: r.badgeName,
          description: r.description,
          iconName: r.iconName,
          xpReward: Number(r.xpReward),
          category: r.category,
          createdAt: new Date(r.createdAt).toISOString(),
        }));
      }
    }

    if (db.achievements.size > 0) {
      return Array.from(db.achievements.values());
    }

    return DEFAULT_ACHIEVEMENTS;
  }

  static async findUserAchievements(userId: string): Promise<UserAchievementEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT ua.id, ua.user_id as "userId", ua.achievement_id as "achievementId",
                ua.badge_code as "badgeCode", ua.progress_value as "progressValue",
                ua.unlocked_at as "unlockedAt", a.badge_name as "badgeName",
                a.description, a.icon_name as "iconName", a.xp_reward as "xpReward",
                a.category
         FROM user_achievements ua
         JOIN achievements a ON ua.achievement_id = a.id
         WHERE ua.user_id = $1
         ORDER BY ua.unlocked_at DESC;`,
        [userId]
      );

      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          achievementId: r.achievementId,
          badgeCode: r.badgeCode,
          progressValue: Number(r.progressValue),
          unlockedAt: new Date(r.unlockedAt).toISOString(),
          badgeName: r.badgeName,
          description: r.description,
          iconName: r.iconName,
          xpReward: Number(r.xpReward),
          category: r.category,
        }));
      }
    }

    return Array.from(db.userAchievements.values())
      .filter((ua) => ua.userId === userId)
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
  }

  static async awardAchievement(
    userId: string,
    badgeCode: string,
    progressValue: number = 100
  ): Promise<UserAchievementEntity | null> {
    const all = await this.findAll();
    const target = all.find((a) => a.badgeCode === badgeCode);
    if (!target) return null;

    // Check if already unlocked
    const existingList = await this.findUserAchievements(userId);
    const existing = existingList.find((a) => a.badgeCode === badgeCode);
    if (existing && existing.progressValue >= 100) {
      return existing;
    }

    const userAchId = `uach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO user_achievements (id, user_id, achievement_id, badge_code, progress_value, unlocked_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, badge_code) DO UPDATE SET
           progress_value = EXCLUDED.progress_value,
           unlocked_at = EXCLUDED.unlocked_at;`,
        [userAchId, userId, target.id, badgeCode, progressValue, now]
      );
    }

    const item: UserAchievementEntity = {
      id: userAchId,
      userId,
      achievementId: target.id,
      badgeCode,
      progressValue,
      unlockedAt: now,
      badgeName: target.badgeName,
      description: target.description,
      iconName: target.iconName,
      xpReward: target.xpReward,
      category: target.category,
    };

    db.userAchievements.set(userAchId, item);

    // Award XP reward for unlocking the badge
    if (target.xpReward > 0 && progressValue >= 100) {
      await XPRepository.recordXP(
        userId,
        target.xpReward,
        "Accepted Solution",
        `Unlocked Badge: ${target.badgeName}`
      );
    }

    return item;
  }

  /**
   * Unlock detection engine: evaluates user stats and awards pending achievements
   */
  static async evaluateAndUnlockAchievements(userId: string): Promise<UserAchievementEntity[]> {
    const unlocked: UserAchievementEntity[] = [];
    const userAchList = await this.findUserAchievements(userId);
    const unlockedCodes = new Set(userAchList.map((a) => a.badgeCode));

    const solvedCount = Array.from(db.solvedProblems.values()).filter((s) => s.userId === userId).length;
    const profile = db.profiles.get(userId);
    const streakDays = profile?.streakDays || 0;

    // Check First AC
    if (solvedCount >= 1 && !unlockedCodes.has("FIRST_ACCEPTED")) {
      const res = await this.awardAchievement(userId, "FIRST_ACCEPTED");
      if (res) unlocked.push(res);
    }

    // Check 50 Solved
    if (solvedCount >= 50 && !unlockedCodes.has("SOLVED_50")) {
      const res = await this.awardAchievement(userId, "SOLVED_50");
      if (res) unlocked.push(res);
    }

    // Check 100 Solved
    if (solvedCount >= 100 && !unlockedCodes.has("SOLVED_100")) {
      const res = await this.awardAchievement(userId, "SOLVED_100");
      if (res) unlocked.push(res);
    }

    // Check 7 Day Streak
    if (streakDays >= 7 && !unlockedCodes.has("STREAK_7_DAYS")) {
      const res = await this.awardAchievement(userId, "STREAK_7_DAYS");
      if (res) unlocked.push(res);
    }

    // Check 30 Day Streak
    if (streakDays >= 30 && !unlockedCodes.has("STREAK_30_DAYS")) {
      const res = await this.awardAchievement(userId, "STREAK_30_DAYS");
      if (res) unlocked.push(res);
    }

    return unlocked;
  }
}
