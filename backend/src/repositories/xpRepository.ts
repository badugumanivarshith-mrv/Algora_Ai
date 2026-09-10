import { Database } from "../db/connection";
import { db } from "../services/store";
import {
  XPTransactionEntity,
  XPSource,
  UserXPProfile,
  calculateLevelInfo,
} from "../types";

export class XPRepository {
  static async recordXP(
    userId: string,
    amount: number,
    source: XPSource | string,
    description: string
  ): Promise<{ transaction: XPTransactionEntity; totalXP: number; level: number; leveledUp: boolean }> {
    const id = `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO xp_transactions (id, user_id, amount, source, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [id, userId, amount, source, description, now]
      );

      await Database.query(
        `UPDATE profiles SET total_xp = total_xp + $1 WHERE user_id = $2;`,
        [amount, userId]
      );
    }

    const transaction: XPTransactionEntity = {
      id,
      userId,
      amount,
      source,
      description,
      createdAt: now,
    };
    db.xpTransactions.set(id, transaction);

    const profile = db.profiles.get(userId);
    const oldXP = profile?.totalXP || 0;
    const newXP = oldXP + amount;
    if (profile) {
      profile.totalXP = newXP;
    }

    const oldLevelInfo = calculateLevelInfo(oldXP);
    const newLevelInfo = calculateLevelInfo(newXP);
    const leveledUp = newLevelInfo.level > oldLevelInfo.level;

    return {
      transaction,
      totalXP: newXP,
      level: newLevelInfo.level,
      leveledUp,
    };
  }

  static async getXPHistory(userId: string): Promise<XPTransactionEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", amount, source, description, created_at as "createdAt"
         FROM xp_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC;`,
        [userId]
      );
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          amount: Number(r.amount),
          source: r.source,
          description: r.description,
          createdAt: new Date(r.createdAt).toISOString(),
        }));
      }
    }

    return Array.from(db.xpTransactions.values())
      .filter((x) => x.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getUserXPProfile(userId: string): Promise<UserXPProfile> {
    const history = await this.getXPHistory(userId);
    const profile = db.profiles.get(userId);
    const totalXP = profile?.totalXP || (history.length > 0 ? history.reduce((sum, h) => sum + h.amount, 0) : 0);

    const levelInfo = calculateLevelInfo(totalXP);

    // Calculate rank in XP
    const allProfiles = Array.from(db.profiles.values()).sort((a, b) => b.totalXP - a.totalXP);
    const rank = Math.max(1, allProfiles.findIndex((p) => p.userId === userId) + 1);

    return {
      totalXP,
      level: levelInfo.level,
      currentLevelXP: levelInfo.currentLevelXP,
      nextLevelXP: levelInfo.nextLevelXP,
      progressPercent: levelInfo.progressPercent,
      rank,
      history,
    };
  }
}
