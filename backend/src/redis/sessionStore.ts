import { RedisManager } from "./redisClient";
import { UserSessionEntity } from "../types";
import { RefreshTokenEntity } from "../repositories/refreshTokenRepository";
import { logger } from "../utils/logger";

export class DistributedSessionStore {
  private static readonly memorySessions: Map<string, UserSessionEntity> = new Map();
  private static readonly memoryRefreshTokens: Map<string, RefreshTokenEntity> = new Map();
  private static readonly memoryUserSessionSets: Map<string, Set<string>> = new Map();

  /**
   * Save active user JWT session to Redis with automatic TTL
   */
  public static async saveSession(session: UserSessionEntity): Promise<void> {
    const key = `session:${session.tokenHash}`;
    const userIndexKey = `user_sessions:${session.userId}`;
    const ttlSeconds = Math.max(
      60,
      Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
    );

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const multi = client.multi();
        multi.set(key, JSON.stringify(session), "EX", ttlSeconds);
        multi.sadd(userIndexKey, session.tokenHash);
        multi.expire(userIndexKey, ttlSeconds);
        await multi.exec();
        return;
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] saveSession Redis fallback: ${err.message}`);
      }
    }

    this.memorySessions.set(session.tokenHash, session);
    if (!this.memoryUserSessionSets.has(session.userId)) {
      this.memoryUserSessionSets.set(session.userId, new Set());
    }
    this.memoryUserSessionSets.get(session.userId)!.add(session.tokenHash);
  }

  /**
   * Retrieve active session by token hash
   */
  public static async getSession(tokenHash: string): Promise<UserSessionEntity | null> {
    const key = `session:${tokenHash}`;

    if (RedisManager.isReady()) {
      try {
        const raw = await RedisManager.getClient().get(key);
        if (raw) {
          const parsed: UserSessionEntity = JSON.parse(raw);
          if (new Date(parsed.expiresAt).getTime() > Date.now()) {
            return parsed;
          }
          await this.deleteSession(tokenHash);
          return null;
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] getSession Redis fallback: ${err.message}`);
      }
    }

    const session = this.memorySessions.get(tokenHash);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.memorySessions.delete(tokenHash);
      return null;
    }
    return session;
  }

  /**
   * Delete session by token hash
   */
  public static async deleteSession(tokenHash: string): Promise<boolean> {
    const key = `session:${tokenHash}`;
    let deleted = false;

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const raw = await client.get(key);
        if (raw) {
          const parsed: UserSessionEntity = JSON.parse(raw);
          const multi = client.multi();
          multi.del(key);
          multi.srem(`user_sessions:${parsed.userId}`, tokenHash);
          await multi.exec();
          deleted = true;
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] deleteSession Redis fallback: ${err.message}`);
      }
    }

    const session = this.memorySessions.get(tokenHash);
    if (session) {
      this.memorySessions.delete(tokenHash);
      const set = this.memoryUserSessionSets.get(session.userId);
      if (set) {
        set.delete(tokenHash);
      }
      deleted = true;
    }

    return deleted;
  }

  /**
   * Revoke all sessions for a user (e.g. password change, security logout)
   */
  public static async deleteSessionsByUserId(userId: string): Promise<number> {
    let count = 0;
    const userIndexKey = `user_sessions:${userId}`;

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const tokenHashes = await client.smembers(userIndexKey);
        if (tokenHashes.length > 0) {
          const keys = tokenHashes.map((h) => `session:${h}`);
          const multi = client.multi();
          multi.del(...keys);
          multi.del(userIndexKey);
          await multi.exec();
          count += tokenHashes.length;
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] deleteSessionsByUserId Redis fallback: ${err.message}`);
      }
    }

    const set = this.memoryUserSessionSets.get(userId);
    if (set) {
      for (const h of set) {
        this.memorySessions.delete(h);
        count++;
      }
      this.memoryUserSessionSets.delete(userId);
    }

    return count;
  }

  /**
   * Get all active session metadata for a user
   */
  public static async getUserActiveSessions(userId: string): Promise<UserSessionEntity[]> {
    const userIndexKey = `user_sessions:${userId}`;
    const sessions: UserSessionEntity[] = [];

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const tokenHashes = await client.smembers(userIndexKey);
        if (tokenHashes.length > 0) {
          const keys = tokenHashes.map((h) => `session:${h}`);
          const rawItems = await client.mget(...keys);
          for (const raw of rawItems) {
            if (raw) {
              const s: UserSessionEntity = JSON.parse(raw);
              if (new Date(s.expiresAt).getTime() > Date.now()) {
                sessions.push(s);
              }
            }
          }
          return sessions;
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] getUserActiveSessions Redis fallback: ${err.message}`);
      }
    }

    const set = this.memoryUserSessionSets.get(userId);
    if (set) {
      const now = Date.now();
      for (const h of set) {
        const s = this.memorySessions.get(h);
        if (s && new Date(s.expiresAt).getTime() > now) {
          sessions.push(s);
        }
      }
    }

    return sessions;
  }

  // --- Refresh Token Storage in Redis ---

  /**
   * Store refresh token entity in Redis
   */
  public static async saveRefreshToken(entity: RefreshTokenEntity): Promise<void> {
    const key = `refresh_token:${entity.tokenHash}`;
    const userTokensKey = `user_refresh_tokens:${entity.userId}`;
    const ttlSeconds = Math.max(
      60,
      Math.floor((new Date(entity.expiresAt).getTime() - Date.now()) / 1000)
    );

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const multi = client.multi();
        multi.set(key, JSON.stringify(entity), "EX", ttlSeconds);
        multi.sadd(userTokensKey, entity.tokenHash);
        multi.expire(userTokensKey, ttlSeconds);
        await multi.exec();
        return;
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] saveRefreshToken Redis fallback: ${err.message}`);
      }
    }

    this.memoryRefreshTokens.set(entity.tokenHash, entity);
  }

  /**
   * Retrieve refresh token entity from Redis
   */
  public static async getRefreshToken(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const key = `refresh_token:${tokenHash}`;

    if (RedisManager.isReady()) {
      try {
        const raw = await RedisManager.getClient().get(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] getRefreshToken Redis fallback: ${err.message}`);
      }
    }

    return this.memoryRefreshTokens.get(tokenHash) || null;
  }

  /**
   * Revoke a refresh token in Redis
   */
  public static async revokeRefreshToken(tokenHash: string, replacedByTokenId?: string): Promise<void> {
    const key = `refresh_token:${tokenHash}`;

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const raw = await client.get(key);
        if (raw) {
          const entity: RefreshTokenEntity = JSON.parse(raw);
          entity.revoked = true;
          entity.replacedByToken = replacedByTokenId;
          entity.updatedAt = new Date().toISOString();
          const ttl = await client.ttl(key);
          if (ttl > 0) {
            await client.set(key, JSON.stringify(entity), "EX", ttl);
          } else {
            await client.set(key, JSON.stringify(entity), "EX", 86400);
          }
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] revokeRefreshToken Redis fallback: ${err.message}`);
      }
    }

    const item = this.memoryRefreshTokens.get(tokenHash);
    if (item) {
      item.revoked = true;
      item.replacedByToken = replacedByTokenId;
      item.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  public static async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const userTokensKey = `user_refresh_tokens:${userId}`;

    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const hashes = await client.smembers(userTokensKey);
        for (const h of hashes) {
          await this.revokeRefreshToken(h);
        }
      } catch (err: any) {
        logger.debug(`[DistributedSessionStore] revokeAllUserRefreshTokens Redis fallback: ${err.message}`);
      }
    }

    for (const [_, token] of this.memoryRefreshTokens.entries()) {
      if (token.userId === userId) {
        token.revoked = true;
        token.updatedAt = new Date().toISOString();
      }
    }
  }

  /**
   * Get total active sessions count across cluster
   */
  public static async getActiveSessionsCount(): Promise<number> {
    if (RedisManager.isReady()) {
      try {
        const keys = await RedisManager.getClient().keys("session:*");
        return keys.length;
      } catch {
        // ignore
      }
    }
    return this.memorySessions.size;
  }
}
