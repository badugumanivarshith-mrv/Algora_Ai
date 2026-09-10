import { Database } from "../db/connection";
import { db } from "../services/store";
import {
  ContestEntity,
  ContestProblemEntity,
  ContestParticipantEntity,
  ContestLeaderboardEntry,
} from "../types";

export class ContestRepository {
  static async findAll(): Promise<ContestEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, title, description, contest_type as "contestType",
                start_time as "startTime", end_time as "endTime",
                duration_minutes as "durationMinutes", difficulty,
                participant_count as "participantCount", status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM contests
         ORDER BY start_time DESC;`
      );
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          contestType: r.contestType,
          startTime: new Date(r.startTime).toISOString(),
          endTime: new Date(r.endTime).toISOString(),
          durationMinutes: Number(r.durationMinutes),
          difficulty: r.difficulty,
          participantCount: Number(r.participantCount),
          status: r.status,
          createdAt: new Date(r.createdAt).toISOString(),
          updatedAt: new Date(r.updatedAt).toISOString(),
        }));
      }
    }

    return Array.from(db.contests.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  static async findById(contestId: string): Promise<ContestEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, title, description, contest_type as "contestType",
                start_time as "startTime", end_time as "endTime",
                duration_minutes as "durationMinutes", difficulty,
                participant_count as "participantCount", status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM contests
         WHERE id = $1;`,
        [contestId]
      );
      if (rows.length > 0) {
        const c = rows[0];
        const problems = await this.findProblemsByContestId(contestId);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          contestType: c.contestType,
          startTime: new Date(c.startTime).toISOString(),
          endTime: new Date(c.endTime).toISOString(),
          durationMinutes: Number(c.durationMinutes),
          difficulty: c.difficulty,
          participantCount: Number(c.participantCount),
          status: c.status,
          problems,
          createdAt: new Date(c.createdAt).toISOString(),
          updatedAt: new Date(c.updatedAt).toISOString(),
        };
      }
    }

    const memoryContest = db.contests.get(contestId);
    if (!memoryContest) return null;

    const problems = await this.findProblemsByContestId(contestId);
    return {
      ...memoryContest,
      problems,
    };
  }

  static async findProblemsByContestId(contestId: string): Promise<ContestProblemEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, contest_id as "contestId", problem_id as "problemId",
                problem_slug as "problemSlug", problem_title as "problemTitle",
                order_index as "orderIndex", score_points as "scorePoints"
         FROM contest_problems
         WHERE contest_id = $1
         ORDER BY order_index ASC;`,
        [contestId]
      );
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          contestId: r.contestId,
          problemId: Number(r.problemId),
          problemSlug: r.problemSlug,
          problemTitle: r.problemTitle,
          orderIndex: Number(r.orderIndex),
          scorePoints: Number(r.scorePoints),
        }));
      }
    }

    return Array.from(db.contestProblems.values())
      .filter((cp) => cp.contestId === contestId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  static async registerUser(
    contestId: string,
    userId: string,
    username: string
  ): Promise<{ registered: boolean; participant: ContestParticipantEntity }> {
    const pool = Database.getPool();
    const id = `cpart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    if (pool) {
      await Database.query(
        `INSERT INTO contest_participants (id, contest_id, user_id, username, score, penalty_seconds, registered_at)
         VALUES ($1, $2, $3, $4, 0, 0, $5)
         ON CONFLICT (contest_id, user_id) DO NOTHING;`,
        [id, contestId, userId, username, now]
      );

      await Database.query(
        `UPDATE contests SET participant_count = participant_count + 1 WHERE id = $1;`,
        [contestId]
      );
    }

    // In-memory update
    const existing = Array.from(db.contestParticipants.values()).find(
      (p) => p.contestId === contestId && p.userId === userId
    );

    if (existing) {
      return { registered: true, participant: existing };
    }

    const participant: ContestParticipantEntity = {
      id,
      contestId,
      userId,
      username,
      score: 0,
      penaltySeconds: 0,
      registeredAt: now,
    };
    db.contestParticipants.set(id, participant);

    const contest = db.contests.get(contestId);
    if (contest) {
      contest.participantCount += 1;
      contest.registered = true;
    }

    return { registered: true, participant };
  }

  static async isUserRegistered(contestId: string, userId: string): Promise<boolean> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query(
        `SELECT id FROM contest_participants WHERE contest_id = $1 AND user_id = $2;`,
        [contestId, userId]
      );
      return rows.length > 0;
    }

    return Array.from(db.contestParticipants.values()).some(
      (p) => p.contestId === contestId && p.userId === userId
    );
  }

  static async getContestLeaderboard(
    contestId: string,
    currentUserId?: string
  ): Promise<ContestLeaderboardEntry[]> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT cp.user_id as "userId", cp.username, p.full_name as "fullName",
                p.avatar_url as "avatarUrl", p.institution,
                cp.score, cp.penalty_seconds as "penaltySeconds",
                cp.registered_at as "registeredAt"
         FROM contest_participants cp
         LEFT JOIN profiles p ON cp.user_id = p.user_id
         WHERE cp.contest_id = $1
         ORDER BY cp.score DESC, cp.penalty_seconds ASC;`,
        [contestId]
      );

      if (rows.length > 0) {
        return rows.map((r, index) => ({
          rank: index + 1,
          userId: r.userId,
          username: r.username,
          fullName: r.fullName || r.username,
          avatarUrl: r.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${r.username}`,
          institution: r.institution || "Algora Academy",
          score: Number(r.score),
          penaltySeconds: Number(r.penaltySeconds),
          problemsSolved: Math.min(4, Math.floor(Number(r.score) / 200)),
          totalProblems: 4,
          submissionTime: new Date(r.registeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCurrentUser: currentUserId === r.userId,
        }));
      }
    }

    const participants = Array.from(db.contestParticipants.values())
      .filter((p) => p.contestId === contestId)
      .sort((a, b) => b.score - a.score || a.penaltySeconds - b.penaltySeconds);

    return participants.map((p, index) => {
      const profile = db.profiles.get(p.userId);
      return {
        rank: index + 1,
        userId: p.userId,
        username: p.username,
        fullName: profile?.fullName || p.username,
        avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.username}`,
        institution: profile?.institution || "Algora Academy",
        score: p.score,
        penaltySeconds: p.penaltySeconds,
        problemsSolved: Math.min(4, Math.floor(p.score / 200)),
        totalProblems: 4,
        submissionTime: new Date(p.registeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isCurrentUser: currentUserId === p.userId,
      };
    });
  }
}
