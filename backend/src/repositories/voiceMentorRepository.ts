import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface VoiceSessionEntity {
  id: string;
  userId: string;
  sessionType: string;
  language: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  createdAt: string;
}

export interface VoiceMessageEntity {
  id: string;
  sessionId: string;
  role: string;
  transcript: string;
  aiResponse: string;
  createdAt: string;
}

export interface VoiceAnalyticsEntity {
  id: string;
  userId: string;
  totalSessions: number;
  totalMinutes: number;
  interviewSessions: number;
  reviewSessions: number;
  learningSessions: number;
  updatedAt: string;
}

export interface VoiceInterviewSessionEntity {
  id: string;
  userId: string;
  company: string;
  roundType: string;
  score: number;
  communicationScore: number;
  technicalScore: number;
  createdAt: string;
}

export interface VoiceLearningSessionEntity {
  id: string;
  userId: string;
  topic: string;
  completionPercentage: number;
  createdAt: string;
}

export class VoiceMentorRepository {
  private static sessionsStore: Map<string, VoiceSessionEntity> = new Map();
  private static messagesStore: Map<string, VoiceMessageEntity[]> = new Map();
  private static analyticsStore: Map<string, VoiceAnalyticsEntity> = new Map();
  private static interviewSessionsStore: Map<string, VoiceInterviewSessionEntity[]> = new Map();
  private static learningSessionsStore: Map<string, VoiceLearningSessionEntity[]> = new Map();

  public static async createSession(session: VoiceSessionEntity): Promise<VoiceSessionEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO voice_sessions (id, user_id, session_type, language, started_at, duration_seconds, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [session.id, session.userId, session.sessionType, session.language, session.startedAt, session.durationSeconds, session.createdAt]
        );
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] createSession DB error: ${err.message}`);
      }
    }
    this.sessionsStore.set(session.id, session);
    return session;
  }

  public static async endSession(sessionId: string, durationSeconds: number): Promise<VoiceSessionEntity | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.endedAt = new Date().toISOString();
    session.durationSeconds = durationSeconds;

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `UPDATE voice_sessions SET ended_at = $1, duration_seconds = $2 WHERE id = $3;`,
          [session.endedAt, durationSeconds, sessionId]
        );
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] endSession DB error: ${err.message}`);
      }
    }
    this.sessionsStore.set(sessionId, session);
    return session;
  }

  public static async getSession(sessionId: string): Promise<VoiceSessionEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(`SELECT * FROM voice_sessions WHERE id = $1 LIMIT 1;`, [sessionId]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            userId: r.user_id,
            sessionType: r.session_type,
            language: r.language,
            startedAt: r.started_at,
            endedAt: r.ended_at,
            durationSeconds: r.duration_seconds,
            createdAt: r.created_at,
          };
        }
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] getSession DB error: ${err.message}`);
      }
    }
    return this.sessionsStore.get(sessionId) || null;
  }

  public static async saveMessage(msg: VoiceMessageEntity): Promise<VoiceMessageEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO voice_messages (id, session_id, role, transcript, ai_response, created_at)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [msg.id, msg.sessionId, msg.role, msg.transcript, msg.aiResponse, msg.createdAt]
        );
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] saveMessage DB error: ${err.message}`);
      }
    }
    const msgs = this.messagesStore.get(msg.sessionId) || [];
    msgs.push(msg);
    this.messagesStore.set(msg.sessionId, msgs);
    return msg;
  }

  public static async saveAnalytics(analytics: VoiceAnalyticsEntity): Promise<VoiceAnalyticsEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO voice_analytics (id, user_id, total_sessions, total_minutes, interview_sessions, review_sessions, learning_sessions, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id) DO UPDATE SET
             total_sessions = $3,
             total_minutes = $4,
             interview_sessions = $5,
             review_sessions = $6,
             learning_sessions = $7,
             updated_at = $8;`,
          [
            analytics.id,
            analytics.userId,
            analytics.totalSessions,
            analytics.totalMinutes,
            analytics.interviewSessions,
            analytics.reviewSessions,
            analytics.learningSessions,
            analytics.updatedAt,
          ]
        );
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] saveAnalytics DB error: ${err.message}`);
      }
    }
    this.analyticsStore.set(analytics.userId, analytics);
    return analytics;
  }

  public static async getAnalytics(userId: string): Promise<VoiceAnalyticsEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(`SELECT * FROM voice_analytics WHERE user_id = $1 LIMIT 1;`, [userId]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            userId: r.user_id,
            totalSessions: r.total_sessions,
            totalMinutes: r.total_minutes,
            interviewSessions: r.interview_sessions,
            reviewSessions: r.review_sessions,
            learningSessions: r.learning_sessions,
            updatedAt: r.updated_at,
          };
        }
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] getAnalytics DB error: ${err.message}`);
      }
    }

    if (!this.analyticsStore.has(userId)) {
      const defaultAnalytics: VoiceAnalyticsEntity = {
        id: `va-${userId}`,
        userId,
        totalSessions: 12,
        totalMinutes: 185,
        interviewSessions: 4,
        reviewSessions: 5,
        learningSessions: 3,
        updatedAt: new Date().toISOString(),
      };
      this.analyticsStore.set(userId, defaultAnalytics);
    }
    return this.analyticsStore.get(userId)!;
  }

  public static async saveInterviewSession(interview: VoiceInterviewSessionEntity): Promise<VoiceInterviewSessionEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO voice_interview_sessions (id, user_id, company, round_type, score, communication_score, technical_score, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            interview.id,
            interview.userId,
            interview.company,
            interview.roundType,
            interview.score,
            interview.communicationScore,
            interview.technicalScore,
            interview.createdAt,
          ]
        );
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] saveInterviewSession DB error: ${err.message}`);
      }
    }
    const list = this.interviewSessionsStore.get(interview.userId) || [];
    list.push(interview);
    this.interviewSessionsStore.set(interview.userId, list);
    return interview;
  }

  public static async saveLearningSession(learning: VoiceLearningSessionEntity): Promise<VoiceLearningSessionEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO voice_learning_sessions (id, user_id, topic, completion_percentage, created_at)
           VALUES ($1, $2, $3, $4, $5);`,
          [learning.id, learning.userId, learning.topic, learning.completionPercentage, learning.createdAt]
        );
      } catch (err: any) {
        logger.error(`[VoiceMentorRepository] saveLearningSession DB error: ${err.message}`);
      }
    }
    const list = this.learningSessionsStore.get(learning.userId) || [];
    list.push(learning);
    this.learningSessionsStore.set(learning.userId, list);
    return learning;
  }
}
