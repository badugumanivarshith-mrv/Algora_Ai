import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface CollaborationRoomEntity {
  id: string;
  name: string;
  room_type: string;
  host_user_id: string;
  problem_id?: string;
  company?: string;
  language: string;
  current_code: string;
  driver_user_id?: string;
  navigator_user_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParticipantEntity {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  role: string;
  cursor_position: any;
  joined_at: string;
}

export interface MessageEntity {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: string;
  created_at: string;
}

export interface CollaborationAnalyticsEntity {
  id: string;
  user_id: string;
  sessions_participated: number;
  time_collaborating_minutes: number;
  pair_sessions: number;
  interview_sessions: number;
  problems_solved_together: number;
  ai_interactions: number;
  updated_at: string;
}

export class CollaborationRepository {
  public static async createRoom(room: {
    id: string;
    name: string;
    roomType: string;
    hostUserId: string;
    problemId?: string;
    company?: string;
    language?: string;
    initialCode?: string;
  }): Promise<CollaborationRoomEntity> {
    const res = await Database.query<CollaborationRoomEntity>(
      `INSERT INTO collaboration_rooms 
        (id, name, room_type, host_user_id, problem_id, company, language, current_code, driver_user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *;`,
      [
        room.id,
        room.name,
        room.roomType || "Practice",
        room.hostUserId,
        room.problemId || null,
        room.company || null,
        room.language || "typescript",
        room.initialCode || "// Start coding here...",
        room.hostUserId,
      ]
    );
    return res.rows[0];
  }

  public static async getRoom(roomId: string): Promise<CollaborationRoomEntity | null> {
    const res = await Database.query<CollaborationRoomEntity>(
      `SELECT * FROM collaboration_rooms WHERE id = $1 AND is_active = TRUE LIMIT 1;`,
      [roomId]
    );
    return res.rows[0] || null;
  }

  public static async listRooms(roomType?: string): Promise<CollaborationRoomEntity[]> {
    if (roomType) {
      const res = await Database.query<CollaborationRoomEntity>(
        `SELECT * FROM collaboration_rooms WHERE room_type = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 50;`,
        [roomType]
      );
      return res.rows;
    }
    const res = await Database.query<CollaborationRoomEntity>(
      `SELECT * FROM collaboration_rooms WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 50;`
    );
    return res.rows;
  }

  public static async updateRoomCode(roomId: string, code: string): Promise<void> {
    await Database.query(
      `UPDATE collaboration_rooms SET current_code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
      [code, roomId]
    );
  }

  public static async updateRoomRoles(roomId: string, driverUserId: string, navigatorUserId?: string): Promise<void> {
    await Database.query(
      `UPDATE collaboration_rooms SET driver_user_id = $1, navigator_user_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3;`,
      [driverUserId, navigatorUserId || null, roomId]
    );
  }

  public static async addParticipant(
    roomId: string,
    userId: string,
    userName: string,
    role: string = "Participant"
  ): Promise<ParticipantEntity> {
    const id = `part_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const res = await Database.query<ParticipantEntity>(
      `INSERT INTO collaboration_participants (id, room_id, user_id, user_name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING *;`,
      [id, roomId, userId, userName, role]
    );
    return res.rows[0];
  }

  public static async getParticipants(roomId: string): Promise<ParticipantEntity[]> {
    const res = await Database.query<ParticipantEntity>(
      `SELECT * FROM collaboration_participants WHERE room_id = $1 ORDER BY joined_at ASC;`,
      [roomId]
    );
    return res.rows;
  }

  public static async removeParticipant(roomId: string, userId: string): Promise<void> {
    await Database.query(
      `DELETE FROM collaboration_participants WHERE room_id = $1 AND user_id = $2;`,
      [roomId, userId]
    );
  }

  public static async saveMessage(
    roomId: string,
    userId: string,
    userName: string,
    message: string,
    messageType: string = "text"
  ): Promise<MessageEntity> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const res = await Database.query<MessageEntity>(
      `INSERT INTO collaboration_messages (id, room_id, user_id, user_name, message, message_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [id, roomId, userId, userName, message, messageType]
    );
    return res.rows[0];
  }

  public static async getMessages(roomId: string): Promise<MessageEntity[]> {
    const res = await Database.query<MessageEntity>(
      `SELECT * FROM collaboration_messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT 100;`,
      [roomId]
    );
    return res.rows;
  }

  public static async saveCodeHistory(roomId: string, userId: string, codeSnippet: string, actionType: string = "type"): Promise<void> {
    const id = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await Database.query(
      `INSERT INTO collaboration_code_history (id, room_id, user_id, code_snippet, action_type)
       VALUES ($1, $2, $3, $4, $5);`,
      [id, roomId, userId, codeSnippet, actionType]
    );
  }

  public static async updateWhiteboard(roomId: string, shapesJson: any): Promise<void> {
    const id = `wb_${roomId}`;
    await Database.query(
      `INSERT INTO collaboration_whiteboards (id, room_id, shapes_json, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET shapes_json = $3, updated_at = CURRENT_TIMESTAMP;`,
      [id, roomId, JSON.stringify(shapesJson)]
    );
  }

  public static async getWhiteboard(roomId: string): Promise<any> {
    const res = await Database.query<{ shapes_json: any }>(
      `SELECT shapes_json FROM collaboration_whiteboards WHERE room_id = $1 LIMIT 1;`,
      [roomId]
    );
    return res.rows[0]?.shapes_json || [];
  }

  public static async saveAnalytics(analytics: {
    userId: string;
    sessionsParticipated: number;
    timeCollaboratingMinutes: number;
    pairSessions: number;
    interviewSessions: number;
    problemsSolvedTogether: number;
    aiInteractions: number;
  }): Promise<void> {
    const id = `collab_an_${analytics.userId}`;
    await Database.query(
      `INSERT INTO collaboration_analytics
        (id, user_id, sessions_participated, time_collaborating_minutes, pair_sessions, interview_sessions, problems_solved_together, ai_interactions, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
        sessions_participated = collaboration_analytics.sessions_participated + EXCLUDED.sessions_participated,
        time_collaborating_minutes = collaboration_analytics.time_collaborating_minutes + EXCLUDED.time_collaborating_minutes,
        pair_sessions = collaboration_analytics.pair_sessions + EXCLUDED.pair_sessions,
        interview_sessions = collaboration_analytics.interview_sessions + EXCLUDED.interview_sessions,
        problems_solved_together = collaboration_analytics.problems_solved_together + EXCLUDED.problems_solved_together,
        ai_interactions = collaboration_analytics.ai_interactions + EXCLUDED.ai_interactions,
        updated_at = CURRENT_TIMESTAMP;`,
      [
        id,
        analytics.userId,
        analytics.sessionsParticipated,
        analytics.timeCollaboratingMinutes,
        analytics.pairSessions,
        analytics.interviewSessions,
        analytics.problemsSolvedTogether,
        analytics.aiInteractions,
      ]
    );
  }

  public static async getAnalytics(userId: string): Promise<CollaborationAnalyticsEntity | null> {
    const res = await Database.query<CollaborationAnalyticsEntity>(
      `SELECT * FROM collaboration_analytics WHERE user_id = $1 LIMIT 1;`,
      [userId]
    );
    return res.rows[0] || null;
  }
}
