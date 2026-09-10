import { Database } from "../db/connection";
import { SolvedProblemEntity, LearningProgressEntity } from "../types";
import { db } from "../services/store";

export class ProgressRepository {
  private static inMemoryTopicProgress: LearningProgressEntity[] = [
    {
      id: "lp-1",
      userId: "usr-arjun-patel",
      topic: "Dynamic Programming",
      masteryScore: 88.5,
      solvedCount: 8,
      accuracyRate: 92.0,
      lastPracticedAt: new Date().toISOString(),
    },
    {
      id: "lp-2",
      userId: "usr-arjun-patel",
      topic: "Graph Algorithms",
      masteryScore: 74.0,
      solvedCount: 5,
      accuracyRate: 85.0,
      lastPracticedAt: new Date().toISOString(),
    },
    {
      id: "lp-3",
      userId: "usr-arjun-patel",
      topic: "Arrays & Hashing",
      masteryScore: 95.0,
      solvedCount: 12,
      accuracyRate: 98.0,
      lastPracticedAt: new Date().toISOString(),
    },
  ];

  static async findSolvedProblems(userId: string): Promise<SolvedProblemEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", problem_id as "problemId", problem_slug as "problemSlug",
                difficulty, topic, first_solved_at as "firstSolvedAt", best_runtime_ms as "bestRuntimeMs",
                best_memory_mb as "bestMemoryMb", created_at as "createdAt"
         FROM solved_problems
         WHERE user_id = $1
         ORDER BY first_solved_at DESC;`,
        [userId]
      );
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        problemId: Number(r.problemId),
        problemSlug: r.problemSlug,
        difficulty: r.difficulty,
        topic: r.topic,
        firstSolvedAt: new Date(r.firstSolvedAt).toISOString(),
        bestRuntimeMs: Number(r.bestRuntimeMs),
        bestMemoryMb: Number(r.bestMemoryMb),
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
      }));
    }

    return Array.from(db.solvedProblems.values()).filter((sp) => sp.userId === userId);
  }

  static async recordSolvedProblem(item: SolvedProblemEntity): Promise<SolvedProblemEntity> {
    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO solved_problems (id, user_id, problem_id, problem_slug, difficulty, topic, first_solved_at, best_runtime_ms, best_memory_mb, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (user_id, problem_slug) DO UPDATE SET
           best_runtime_ms = LEAST(solved_problems.best_runtime_ms, EXCLUDED.best_runtime_ms),
           best_memory_mb = LEAST(solved_problems.best_memory_mb, EXCLUDED.best_memory_mb);`,
        [
          item.id,
          item.userId,
          item.problemId,
          item.problemSlug,
          item.difficulty,
          item.topic,
          item.firstSolvedAt,
          item.bestRuntimeMs,
          item.bestMemoryMb,
          item.createdAt || new Date().toISOString(),
        ]
      );
    }

    db.solvedProblems.set(item.id, item);
    return item;
  }

  static async findTopicProgress(userId: string): Promise<LearningProgressEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", topic, mastery_score as "masteryScore",
                solved_count as "solvedCount", accuracy_rate as "accuracyRate",
                last_practiced_at as "lastPracticedAt"
         FROM learning_progress
         WHERE user_id = $1
         ORDER BY mastery_score DESC;`,
        [userId]
      );
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        topic: r.topic,
        masteryScore: Number(r.masteryScore),
        solvedCount: Number(r.solvedCount),
        accuracyRate: Number(r.accuracyRate),
        lastPracticedAt: new Date(r.lastPracticedAt).toISOString(),
      }));
    }

    return this.inMemoryTopicProgress.filter((p) => p.userId === userId);
  }

  static async updateTopicProgress(
    userId: string,
    topic: string,
    isSolved: boolean = true
  ): Promise<LearningProgressEntity> {
    const id = `lp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `INSERT INTO learning_progress (id, user_id, topic, mastery_score, solved_count, accuracy_rate, last_practiced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, topic) DO UPDATE SET
           solved_count = learning_progress.solved_count + (CASE WHEN $8 THEN 1 ELSE 0 END),
           mastery_score = LEAST(100.0, learning_progress.mastery_score + 5.0),
           last_practiced_at = NOW()
         RETURNING id, user_id as "userId", topic, mastery_score as "masteryScore",
                   solved_count as "solvedCount", accuracy_rate as "accuracyRate",
                   last_practiced_at as "lastPracticedAt";`,
        [id, userId, topic, isSolved ? 10.0 : 0.0, isSolved ? 1 : 0, 100.0, now, isSolved]
      );

      const r = rows[0];
      return {
        id: r.id,
        userId: r.userId,
        topic: r.topic,
        masteryScore: Number(r.masteryScore),
        solvedCount: Number(r.solvedCount),
        accuracyRate: Number(r.accuracyRate),
        lastPracticedAt: new Date(r.lastPracticedAt).toISOString(),
      };
    }

    let existing = this.inMemoryTopicProgress.find((p) => p.userId === userId && p.topic === topic);
    if (!existing) {
      existing = {
        id,
        userId,
        topic,
        masteryScore: 10.0,
        solvedCount: isSolved ? 1 : 0,
        accuracyRate: 100.0,
        lastPracticedAt: now,
      };
      this.inMemoryTopicProgress.push(existing);
    } else {
      if (isSolved) existing.solvedCount += 1;
      existing.masteryScore = Math.min(100, existing.masteryScore + 5.0);
      existing.lastPracticedAt = now;
    }
    return existing;
  }
}
