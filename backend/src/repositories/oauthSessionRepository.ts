import { Database } from "../db/connection";
import { OAuthSessionEntity, OAuthProvider, OAuthAction } from "../types";
import { logger } from "../utils/logger";
import { RedisManager } from "../redis/redisClient";

export class OAuthSessionRepository {
  private static inMemorySessions: Map<string, OAuthSessionEntity> = new Map();

  static async createSession(session: OAuthSessionEntity): Promise<OAuthSessionEntity> {
    const ttlSeconds = Math.max(1, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));

    // Cache in Redis if available for fast atomic retrieval and expiry
    if (RedisManager.isReady()) {
      try {
        await RedisManager.getClient().set(
          `oauth:session:${session.state}`,
          JSON.stringify(session),
          "EX",
          ttlSeconds
        );
      } catch (err: any) {
        logger.debug(`[OAuthSessionRepository] Redis save error: ${err.message}`);
      }
    }

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO oauth_sessions (id, state, nonce, provider, action, user_id, redirect_url, code_verifier, expires_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (state) DO UPDATE 
           SET nonce = EXCLUDED.nonce, expires_at = EXCLUDED.expires_at, action = EXCLUDED.action;`,
          [
            session.id,
            session.state,
            session.nonce || null,
            session.provider,
            session.action,
            session.userId || null,
            session.redirectUrl || null,
            session.codeVerifier || null,
            new Date(session.expiresAt),
            session.createdAt ? new Date(session.createdAt) : new Date(),
          ]
        );
      } catch (err: any) {
        logger.error(`[OAuthSessionRepository] createSession DB error: ${err.message}`);
      }
    }

    this.inMemorySessions.set(session.state, session);
    return session;
  }

  static async getAndConsumeSession(state: string): Promise<OAuthSessionEntity | null> {
    logger.info(`[OAuthSessionRepository] Attempting to consume OAuth state: ${state}`);

    // Check memory first for single-instance or fast re-check
    const memorySession = this.inMemorySessions.get(state);
    if (memorySession) {
      this.inMemorySessions.delete(state);
      if (new Date(memorySession.expiresAt).getTime() > Date.now()) {
        logger.info(`[OAuthSessionRepository] Found state in memory map.`);
        return memorySession;
      }
    }

    // Check Redis
    if (RedisManager.isReady()) {
      try {
        const raw = await RedisManager.getClient().get(`oauth:session:${state}`);
        if (raw) {
          await RedisManager.getClient().del(`oauth:session:${state}`);
          const parsed = JSON.parse(raw);
          logger.info(`[OAuthSessionRepository] Found state in Redis cache.`);
          Database.query(`DELETE FROM oauth_sessions WHERE state = $1;`, [state]).catch(() => {});
          this.inMemorySessions.delete(state);
          return parsed;
        }
      } catch (err: any) {
        logger.debug(`[OAuthSessionRepository] Redis getAndConsume error: ${err.message}`);
      }
    }

    // Check PostgreSQL database
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `DELETE FROM oauth_sessions
           WHERE state = $1 AND expires_at > NOW()
           RETURNING id, state, nonce, provider, action, user_id as "userId",
                     redirect_url as "redirectUrl", code_verifier as "codeVerifier",
                     expires_at as "expiresAt", created_at as "createdAt";`,
          [state]
        );
        if (rows.length > 0) {
          logger.info(`[OAuthSessionRepository] Found state in PostgreSQL database.`);
          this.inMemorySessions.delete(state);
          return rows[0];
        }

        // Fallback: check if row exists even if expired by a few seconds or clock skew, or select without strict delete first for debugging
        const { rows: fallbackRows } = await Database.query<any>(
          `SELECT id, state, nonce, provider, action, user_id as "userId",
                  redirect_url as "redirectUrl", code_verifier as "codeVerifier",
                  expires_at as "expiresAt", created_at as "createdAt"
           FROM oauth_sessions WHERE state = $1;`,
          [state]
        );
        if (fallbackRows.length > 0) {
          logger.warn(`[OAuthSessionRepository] Found state in DB but expired or clock skew. Consuming anyway for resilience.`);
          await Database.query(`DELETE FROM oauth_sessions WHERE state = $1;`, [state]);
          return fallbackRows[0];
        }
      } catch (err: any) {
        logger.error(`[OAuthSessionRepository] getAndConsumeSession DB error: ${err.message}`);
      }
    }

    logger.warn(`[OAuthSessionRepository] OAuth state NOT FOUND in memory, Redis, or DB: ${state}`);
    return null;
  }

  static async countActiveSessions(): Promise<number> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM oauth_sessions WHERE expires_at > NOW();`
        );
        return Number(rows[0]?.count || 0);
      } catch (err: any) {
        logger.error(`[OAuthSessionRepository] countActiveSessions DB error: ${err.message}`);
      }
    }

    const now = Date.now();
    let count = 0;
    for (const session of this.inMemorySessions.values()) {
      if (new Date(session.expiresAt).getTime() > now) {
        count++;
      }
    }
    return count;
  }
}
