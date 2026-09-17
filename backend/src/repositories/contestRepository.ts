import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface ContestEntity {
  id: string;
  title: string;
  description: string;
  contest_type: string;
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  created_at: Date;
}

export interface ContestProblemEntity {
  id: string;
  contest_id: string;
  problem_id: string;
  points: number;
  order_index: number;
  created_at: Date;
}

export interface ContestParticipantEntity {
  id: string;
  contest_id: string;
  user_id: string;
  rating_before: number;
  rating_after: number;
  rank: number;
  score: number;
  created_at: Date;
}

export interface ContestSubmissionEntity {
  id: string;
  contest_id: string;
  user_id: string;
  problem_id: string;
  verdict: string;
  runtime: number;
  memory: number;
  created_at: Date;
}

export interface ContestTeamEntity {
  id: string;
  contest_id: string;
  team_name: string;
  captain_id: string;
  created_at: Date;
}

export interface ContestTeamMemberEntity {
  id: string;
  team_id: string;
  user_id: string;
  created_at: Date;
}

export interface ContestAnalyticsEntity {
  id: string;
  user_id: string;
  contests_joined: number;
  contests_won: number;
  average_rank: number;
  rating: number;
  updated_at: Date;
}

export interface ContestPredictionEntity {
  id: string;
  user_id: string;
  predicted_rank: number;
  predicted_rating: number;
  predicted_company_readiness: number;
  created_at: Date;
}

export class ContestRepository {
  private static fallbackContests: Map<string, ContestEntity> = new Map();
  private static fallbackProblems: Map<string, ContestProblemEntity[]> = new Map();
  private static fallbackParticipants: Map<string, ContestParticipantEntity[]> = new Map();
  private static fallbackSubmissions: Map<string, ContestSubmissionEntity[]> = new Map();
  private static fallbackTeams: Map<string, ContestTeamEntity[]> = new Map();
  private static fallbackAnalytics: Map<string, ContestAnalyticsEntity> = new Map();
  private static fallbackPredictions: Map<string, ContestPredictionEntity[]> = new Map();

  public static async createContest(contest: {
    title: string;
    description: string;
    contestType: string;
    startTime?: Date;
    endTime?: Date;
    durationMinutes?: number;
  }): Promise<ContestEntity> {
    const id = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `INSERT INTO contests (id, title, description, contest_type, start_time, end_time, duration_minutes)
         VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP), COALESCE($6, CURRENT_TIMESTAMP + INTERVAL '2 hours'), $7)
         RETURNING *;`,
        [
          id,
          contest.title,
          contest.description,
          contest.contestType,
          contest.startTime || null,
          contest.endTime || null,
          contest.durationMinutes || 120,
        ]
      );
      return res.rows[0];
    }

    const entity: ContestEntity = {
      id,
      title: contest.title,
      description: contest.description,
      contest_type: contest.contestType,
      start_time: contest.startTime || new Date(),
      end_time: contest.endTime || new Date(Date.now() + 7200000),
      duration_minutes: contest.durationMinutes || 120,
      created_at: new Date(),
    };
    this.fallbackContests.set(id, entity);
    return entity;
  }

  public static async getContests(): Promise<ContestEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(`SELECT * FROM contests ORDER BY start_time DESC;`);
      return res.rows;
    }
    return Array.from(this.fallbackContests.values()).sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  }

  public static async getContestById(id: string): Promise<ContestEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(`SELECT * FROM contests WHERE id = $1;`, [id]);
      return res.rows[0] || null;
    }
    return this.fallbackContests.get(id) || null;
  }

  public static async addContestProblem(problem: {
    contestId: string;
    problemId: string;
    points?: number;
    orderIndex?: number;
  }): Promise<ContestProblemEntity> {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `INSERT INTO contest_problems (id, contest_id, problem_id, points, order_index)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
        [id, problem.contestId, problem.problemId, problem.points || 100, problem.orderIndex || 0]
      );
      return res.rows[0];
    }

    const entity: ContestProblemEntity = {
      id,
      contest_id: problem.contestId,
      problem_id: problem.problemId,
      points: problem.points || 100,
      order_index: problem.orderIndex || 0,
      created_at: new Date(),
    };
    const current = this.fallbackProblems.get(problem.contestId) || [];
    current.push(entity);
    this.fallbackProblems.set(problem.contestId, current);
    return entity;
  }

  public static async getContestProblems(contestId: string): Promise<ContestProblemEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `SELECT * FROM contest_problems WHERE contest_id = $1 ORDER BY order_index ASC;`,
        [contestId]
      );
      return res.rows;
    }
    return this.fallbackProblems.get(contestId) || [];
  }

  public static async registerParticipant(participant: {
    contestId: string;
    userId: string;
    ratingBefore?: number;
  }): Promise<ContestParticipantEntity> {
    const id = `cp_${participant.contestId}_${participant.userId}`;
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `INSERT INTO contest_participants (id, contest_id, user_id, rating_before, rating_after)
         VALUES ($1, $2, $3, $4, $4)
         ON CONFLICT (contest_id, user_id) DO UPDATE SET
           rating_before = EXCLUDED.rating_before
         RETURNING *;`,
        [id, participant.contestId, participant.userId, participant.ratingBefore || 1500]
      );
      return res.rows[0];
    }

    const entity: ContestParticipantEntity = {
      id,
      contest_id: participant.contestId,
      user_id: participant.userId,
      rating_before: participant.ratingBefore || 1500,
      rating_after: participant.ratingBefore || 1500,
      rank: 1,
      score: 0,
      created_at: new Date(),
    };
    const current = this.fallbackParticipants.get(participant.contestId) || [];
    current.push(entity);
    this.fallbackParticipants.set(participant.contestId, current);
    return entity;
  }

  public static async getParticipants(contestId: string): Promise<ContestParticipantEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `SELECT * FROM contest_participants WHERE contest_id = $1 ORDER BY score DESC, rank ASC;`,
        [contestId]
      );
      return res.rows;
    }
    return this.fallbackParticipants.get(contestId) || [];
  }

  public static async updateParticipantResult(params: {
    contestId: string;
    userId: string;
    score: number;
    rank: number;
    ratingAfter: number;
  }): Promise<ContestParticipantEntity> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `UPDATE contest_participants
         SET score = $1, rank = $2, rating_after = $3
         WHERE contest_id = $4 AND user_id = $5
         RETURNING *;`,
        [params.score, params.rank, params.ratingAfter, params.contestId, params.userId]
      );
      return res.rows[0];
    }

    const current = this.fallbackParticipants.get(params.contestId) || [];
    const item = current.find((p) => p.user_id === params.userId);
    if (item) {
      item.score = params.score;
      item.rank = params.rank;
      item.rating_after = params.ratingAfter;
      return item;
    }
    const created: ContestParticipantEntity = {
      id: `cp_${params.contestId}_${params.userId}`,
      contest_id: params.contestId,
      user_id: params.userId,
      rating_before: 1500,
      rating_after: params.ratingAfter,
      rank: params.rank,
      score: params.score,
      created_at: new Date(),
    };
    current.push(created);
    this.fallbackParticipants.set(params.contestId, current);
    return created;
  }

  public static async addSubmission(sub: {
    contestId: string;
    userId: string;
    problemId: string;
    verdict: string;
    runtime?: number;
    memory?: number;
  }): Promise<ContestSubmissionEntity> {
    const id = `cs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query(
        `INSERT INTO contest_submissions (id, contest_id, user_id, problem_id, verdict, runtime, memory)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *;`,
        [id, sub.contestId, sub.userId, sub.problemId, sub.verdict, sub.runtime || 0, sub.memory || 0]
      );
      return res.rows[0];
    }

    const entity: ContestSubmissionEntity = {
      id,
      contest_id: sub.contestId,
      user_id: sub.userId,
      problem_id: sub.problemId,
      verdict: sub.verdict,
      runtime: sub.runtime || 0,
      memory: sub.memory || 0,
      created_at: new Date(),
    };
    const current = this.fallbackSubmissions.get(sub.contestId) || [];
    current.push(entity);
    this.fallbackSubmissions.set(sub.contestId, current);
    return entity;
  }

  public static async getSubmissions(contestId: string, userId?: string): Promise<ContestSubmissionEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      if (userId) {
        const res = await Database.query(
          `SELECT * FROM contest_submissions WHERE contest_id = $1 AND user_id = $2 ORDER BY created_at DESC;`,
          [contestId, userId]
        );
        return res.rows;
      }
      const res = await Database.query(
        `SELECT * FROM contest_submissions WHERE contest_id = $1 ORDER BY created_at DESC;`,
        [contestId]
      );
      return res.rows;
    }
    const current = this.fallbackSubmissions.get(contestId) || [];
    if (userId) {
      return current.filter((s) => s.user_id === userId);
    }
    return current;
  }

  public static async createTeam(team: {
    contestId: string;
    teamName: string;
    captainId: string;
  }): Promise<ContestTeamEntity> {
    const id = `ct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO contest_teams (id, contest_id, team_name, captain_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [id, team.contestId, team.teamName, team.captainId]
    );
    // Add captain as team member
    await Database.query(
      `INSERT INTO contest_team_members (id, team_id, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`,
      [`ctm_${id}_${team.captainId}`, id, team.captainId]
    );
    return res.rows[0];
  }

  public static async addTeamMember(teamId: string, userId: string): Promise<ContestTeamMemberEntity> {
    const id = `ctm_${teamId}_${userId}`;
    const res = await Database.query(
      `INSERT INTO contest_team_members (id, team_id, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (team_id, user_id) DO NOTHING
       RETURNING *;`,
      [id, teamId, userId]
    );
    return res.rows[0];
  }

  public static async getTeams(contestId: string): Promise<ContestTeamEntity[]> {
    const res = await Database.query(
      `SELECT * FROM contest_teams WHERE contest_id = $1 ORDER BY created_at DESC;`,
      [contestId]
    );
    return res.rows;
  }

  public static async upsertAnalytics(analytics: {
    userId: string;
    contestsJoined: number;
    contestsWon: number;
    averageRank: number;
    rating: number;
  }): Promise<ContestAnalyticsEntity> {
    const id = `ca_${analytics.userId}`;
    const res = await Database.query(
      `INSERT INTO contest_analytics (id, user_id, contests_joined, contests_won, average_rank, rating, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         contests_joined = EXCLUDED.contests_joined,
         contests_won = EXCLUDED.contests_won,
         average_rank = EXCLUDED.average_rank,
         rating = EXCLUDED.rating,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [id, analytics.userId, analytics.contestsJoined, analytics.contestsWon, analytics.averageRank, analytics.rating]
    );
    return res.rows[0];
  }

  public static async getAnalytics(userId: string): Promise<ContestAnalyticsEntity | null> {
    const res = await Database.query(`SELECT * FROM contest_analytics WHERE user_id = $1;`, [userId]);
    return res.rows[0] || null;
  }

  public static async savePrediction(pred: {
    userId: string;
    predictedRank: number;
    predictedRating: number;
    predictedCompanyReadiness: number;
  }): Promise<ContestPredictionEntity> {
    const id = `cpd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO contest_predictions (id, user_id, predicted_rank, predicted_rating, predicted_company_readiness)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [id, pred.userId, pred.predictedRank, pred.predictedRating, pred.predictedCompanyReadiness]
    );
    return res.rows[0];
  }

  public static async getPredictions(userId: string): Promise<ContestPredictionEntity[]> {
    const res = await Database.query(
      `SELECT * FROM contest_predictions WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }
}
