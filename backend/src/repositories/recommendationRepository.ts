import { Database } from "../db/connection";
import { db } from "../services/store";
import { RecommendationEntity, RecommendationCategory } from "../types";

export class RecommendationRepository {
  static async getRecommendations(
    userId: string,
    category?: RecommendationCategory
  ): Promise<RecommendationEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        let query = `SELECT * FROM recommendation_history WHERE user_id = $1`;
        const params: any[] = [userId];
        if (category) {
          query += ` AND category = $2`;
          params.push(category);
        }
        query += ` ORDER BY score DESC;`;
        const { rows } = await Database.query<any>(query, params);
        return rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          problemId: r.problem_id,
          problemSlug: r.problem_slug,
          problemTitle: r.problem_title,
          difficulty: r.difficulty,
          topic: r.topic,
          category: r.category,
          reason: r.reason,
          score: parseFloat(r.score),
          actionTaken: r.action_taken,
          createdAt: r.created_at,
        }));
      } catch {
        // Fallback to in-memory
      }
    }

    let recs = Array.from(db.recommendationHistory.values()).filter((r) => r.userId === userId);
    if (category) {
      recs = recs.filter((r) => r.category === category);
    }
    return recs.sort((a, b) => b.score - a.score);
  }

  static async updateRecommendationStatus(
    userId: string,
    recId: string,
    action: "solved" | "dismissed"
  ): Promise<RecommendationEntity | null> {
    const rec = db.recommendationHistory.get(recId);
    if (!rec || rec.userId !== userId) return null;
    rec.actionTaken = action;
    return rec;
  }

  static async generateAdaptiveRecommendations(userId: string): Promise<RecommendationEntity[]> {
    // Return existing or newly seeded recommendations
    return this.getRecommendations(userId);
  }
}
