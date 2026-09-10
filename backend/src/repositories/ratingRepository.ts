import { Database } from "../db/connection";
import { db } from "../services/store";
import { RatingHistoryEntity, RatingTier, getRatingTier } from "../types";

export class RatingRepository {
  static async getRatingHistory(userId: string): Promise<RatingHistoryEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT rh.id, rh.user_id as "userId", rh.contest_id as "contestId",
                c.title as "contestTitle", rh.old_rating as "oldRating",
                rh.new_rating as "newRating", rh.rating_change as "ratingChange",
                rh.reason, rh.recorded_at as "recordedAt"
         FROM ratings_history rh
         LEFT JOIN contests c ON rh.contest_id = c.id
         WHERE rh.user_id = $1
         ORDER BY rh.recorded_at DESC;`,
        [userId]
      );
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          contestId: r.contestId,
          contestTitle: r.contestTitle || "Ranked Contest",
          oldRating: Number(r.oldRating),
          newRating: Number(r.newRating),
          ratingChange: Number(r.ratingChange),
          reason: r.reason,
          recordedAt: new Date(r.recordedAt).toISOString(),
        }));
      }
    }

    return Array.from(db.ratingsHistory.values())
      .filter((rh) => rh.userId === userId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  static async recordRatingChange(
    userId: string,
    contestId: string | undefined,
    oldRating: number,
    newRating: number,
    reason: string
  ): Promise<RatingHistoryEntity> {
    const id = `rh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const ratingChange = newRating - oldRating;
    const now = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO ratings_history (id, user_id, contest_id, old_rating, new_rating, rating_change, reason, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [id, userId, contestId || null, oldRating, newRating, ratingChange, reason, now]
      );

      await Database.query(
        `UPDATE profiles SET rating = $1 WHERE user_id = $2;`,
        [newRating, userId]
      );
    }

    const historyEntry: RatingHistoryEntity = {
      id,
      userId,
      contestId,
      oldRating,
      newRating,
      ratingChange,
      reason,
      recordedAt: now,
    };
    db.ratingsHistory.set(id, historyEntry);

    const profile = db.profiles.get(userId);
    if (profile) {
      profile.rating = newRating;
    }

    return historyEntry;
  }

  static async getUserRatingSummary(userId: string): Promise<{
    currentRating: number;
    highestRating: number;
    ratingTier: RatingTier;
    history: RatingHistoryEntity[];
  }> {
    const history = await this.getRatingHistory(userId);
    const profile = db.profiles.get(userId);
    const currentRating = profile?.rating || 1200;

    const highestRating = history.length > 0
      ? Math.max(currentRating, ...history.map((h) => h.newRating))
      : currentRating;

    return {
      currentRating,
      highestRating,
      ratingTier: getRatingTier(currentRating),
      history,
    };
  }
}
