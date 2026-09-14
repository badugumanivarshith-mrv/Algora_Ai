import { Database } from "../db/connection";
import { UserSessionEntity } from "../types";
import { DistributedSessionStore } from "../redis/sessionStore";

export class SessionRepository {
  static async createSession(session: UserSessionEntity): Promise<UserSessionEntity> {
    // 1. Store in Redis distributed session store
    await DistributedSessionStore.saveSession(session);

    // 2. Persist to Postgres if available
    const pool = Database.getPool();
    if (pool) {
      try {
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
      } catch (err) {
        // Log & continue
      }
    }

    return session;
  }

  static async findSessionByTokenHash(tokenHash: string): Promise<UserSessionEntity | null> {
    // 1. Check Redis first (fast distributed lookup)
    const redisSession = await DistributedSessionStore.getSession(tokenHash);
    if (redisSession) {
      return redisSession;
    }

    // 2. Fallback to Postgres
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT id, user_id as "userId", token_hash as "tokenHash", expires_at as "expiresAt",
                  ip_address as "ipAddress", user_agent as "userAgent", created_at as "createdAt"
           FROM user_sessions
           WHERE token_hash = $1 AND expires_at > NOW()
           LIMIT 1;`,
          [tokenHash]
        );
        if (rows.length > 0) {
          const r = rows[0];
          const session: UserSessionEntity = {
            id: r.id,
            userId: r.userId,
            tokenHash: r.tokenHash,
            expiresAt: new Date(r.expiresAt).toISOString(),
            ipAddress: r.ipAddress,
            userAgent: r.userAgent,
            createdAt: new Date(r.createdAt).toISOString(),
          };
          // Write back into Redis cache
          await DistributedSessionStore.saveSession(session);
          return session;
        }
      } catch (err) {
        // Fallback
      }
    }

    return null;
  }

  static async deleteSessionByTokenHash(tokenHash: string): Promise<boolean> {
    await DistributedSessionStore.deleteSession(tokenHash);

    const pool = Database.getPool();
    if (pool) {
      try {
        const { rowCount } = await Database.query(
          `DELETE FROM user_sessions WHERE token_hash = $1;`,
          [tokenHash]
        );
        return rowCount > 0;
      } catch {
        return true;
      }
    }

    return true;
  }

  static async deleteSessionsByUserId(userId: string): Promise<number> {
    const count = await DistributedSessionStore.deleteSessionsByUserId(userId);

    const pool = Database.getPool();
    if (pool) {
      try {
        const { rowCount } = await Database.query(
          `DELETE FROM user_sessions WHERE user_id = $1;`,
          [userId]
        );
        return rowCount;
      } catch {
        return count;
      }
    }

    return count;
  }

  static async getActiveSessionsByUserId(userId: string): Promise<UserSessionEntity[]> {
    return DistributedSessionStore.getUserActiveSessions(userId);
  }
}

