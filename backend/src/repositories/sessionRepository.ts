import { Database } from "../db/connection";
import { UserSessionEntity } from "../types";

export class SessionRepository {
  private static inMemorySessions: UserSessionEntity[] = [];

  static async createSession(session: UserSessionEntity): Promise<UserSessionEntity> {
    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO user_sessions (id, user_id, token_hash, expires_at, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [
          session.id,
          session.userId,
          session.tokenHash,
          session.expiresAt,
          session.ipAddress || null,
          session.userAgent || null,
          session.createdAt,
        ]
      );
    }

    this.inMemorySessions.push(session);
    return session;
  }

  static async findSessionByTokenHash(tokenHash: string): Promise<UserSessionEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", token_hash as "tokenHash", expires_at as "expiresAt",
                ip_address as "ipAddress", user_agent as "userAgent", created_at as "createdAt"
         FROM user_sessions
         WHERE token_hash = $1 AND expires_at > NOW()
         LIMIT 1;`,
        [tokenHash]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.userId,
        tokenHash: r.tokenHash,
        expiresAt: new Date(r.expiresAt).toISOString(),
        ipAddress: r.ipAddress,
        userAgent: r.userAgent,
        createdAt: new Date(r.createdAt).toISOString(),
      };
    }

    const now = new Date().toISOString();
    return this.inMemorySessions.find((s) => s.tokenHash === tokenHash && s.expiresAt > now) || null;
  }

  static async deleteSessionByTokenHash(tokenHash: string): Promise<boolean> {
    const pool = Database.getPool();
    if (pool) {
      const { rowCount } = await Database.query(
        `DELETE FROM user_sessions WHERE token_hash = $1;`,
        [tokenHash]
      );
      return rowCount > 0;
    }

    const initialLen = this.inMemorySessions.length;
    this.inMemorySessions = this.inMemorySessions.filter((s) => s.tokenHash !== tokenHash);
    return this.inMemorySessions.length < initialLen;
  }

  static async deleteSessionsByUserId(userId: string): Promise<number> {
    const pool = Database.getPool();
    if (pool) {
      const { rowCount } = await Database.query(
        `DELETE FROM user_sessions WHERE user_id = $1;`,
        [userId]
      );
      return rowCount;
    }

    const initialLen = this.inMemorySessions.length;
    this.inMemorySessions = this.inMemorySessions.filter((s) => s.userId !== userId);
    return initialLen - this.inMemorySessions.length;
  }
}
