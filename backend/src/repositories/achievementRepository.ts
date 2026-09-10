import { Database } from "../db/connection";
import { AchievementEntity, UserAchievementEntity } from "../types";
import { DEFAULT_ACHIEVEMENTS } from "../db/seeds";

export class AchievementRepository {
  private static inMemoryUserAchievements: UserAchievementEntity[] = [
    {
      id: "uach-1",
      userId: "usr-arjun-patel",
      achievementId: "ach-first-blood",
      badgeCode: "FIRST_ACCEPTED",
      progressValue: 100,
      unlockedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "uach-2",
      userId: "usr-arjun-patel",
      achievementId: "ach-speed-demon",
      badgeCode: "SPEED_DEMON",
      progressValue: 100,
      unlockedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ];

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

    return DEFAULT_ACHIEVEMENTS;
  }

  static async findUserAchievements(userId: string): Promise<UserAchievementEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT ua.id, ua.user_id as "userId", ua.achievement_id as "achievementId",
                ua.badge_code as "badgeCode", ua.progress_value as "progressValue",
                ua.unlocked_at as "unlockedAt", a.badge_name as "badgeName",
                a.description, a.icon_name as "iconName", a.xp_reward as "xpReward"
         FROM user_achievements ua
         JOIN achievements a ON ua.achievement_id = a.id
         WHERE ua.user_id = $1
         ORDER BY ua.unlocked_at DESC;`,
        [userId]
      );

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
      }));
    }

    return this.inMemoryUserAchievements.filter((ua) => ua.userId === userId);
  }

  static async awardAchievement(
    userId: string,
    badgeCode: string,
    progressValue: number = 100
  ): Promise<UserAchievementEntity | null> {
    const all = await this.findAll();
    const target = all.find((a) => a.badgeCode === badgeCode);
    if (!target) return null;

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
    };

    const existingIdx = this.inMemoryUserAchievements.findIndex(
      (u) => u.userId === userId && u.badgeCode === badgeCode
    );
    if (existingIdx >= 0) {
      this.inMemoryUserAchievements[existingIdx] = item;
    } else {
      this.inMemoryUserAchievements.push(item);
    }

    return item;
  }
}
