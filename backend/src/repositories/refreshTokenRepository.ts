import crypto from "crypto";
import { Database } from "../db/connection";

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revoked: boolean;
  replacedByToken?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface EmailVerificationEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  verified: boolean;
  createdAt: string;
}

export interface AuditEventEntity {
  id: string;
  userId?: string;
  actorEmail?: string;
  eventType: string;
  targetResource?: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const refreshTokensStore = new Map<string, RefreshTokenEntity>();
const passwordResetsStore = new Map<string, PasswordResetEntity>();
const emailVerificationsStore = new Map<string, EmailVerificationEntity>();
const auditEventsStore: AuditEventEntity[] = [];

export class RefreshTokenRepository {
  static async createRefreshToken(data: {
    userId: string;
    token: string;
    expiresInDays: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshTokenEntity> {
    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
    const expiresAt = new Date(Date.now() + data.expiresInDays * 86400000).toISOString();
    const now = new Date().toISOString();

    const entity: RefreshTokenEntity = {
      id: `rft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      tokenHash,
      expiresAt,
      revoked: false,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: now,
      updatedAt: now,
    };

    refreshTokensStore.set(tokenHash, entity);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked, ip_address, user_agent, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [entity.id, entity.userId, entity.tokenHash, entity.expiresAt, false, entity.ipAddress || null, entity.userAgent || null, entity.createdAt, entity.updatedAt]
        );
      } catch (err) {
        console.warn("[RefreshTokenRepository] DB insert fallback:", err);
      }
    }

    return entity;
  }

  static async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (Database.isReady()) {
      try {
        const res = await Database.query<RefreshTokenEntity>(
          `SELECT id, user_id as "userId", token_hash as "tokenHash", expires_at as "expiresAt", revoked, replaced_by_token as "replacedByToken",
                  ip_address as "ipAddress", user_agent as "userAgent", created_at as "createdAt", updated_at as "updatedAt"
           FROM refresh_tokens WHERE token_hash = $1`,
          [tokenHash]
        );
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn("[RefreshTokenRepository] DB find fallback:", err);
      }
    }

    return refreshTokensStore.get(tokenHash) || null;
  }

  static async revokeToken(tokenHash: string, replacedByTokenId?: string): Promise<void> {
    const target = refreshTokensStore.get(tokenHash);
    if (target) {
      target.revoked = true;
      target.replacedByToken = replacedByTokenId;
      target.updatedAt = new Date().toISOString();
    }

    if (Database.isReady()) {
      try {
        await Database.query(
          `UPDATE refresh_tokens SET revoked = TRUE, replaced_by_token = $2, updated_at = NOW() WHERE token_hash = $1`,
          [tokenHash, replacedByTokenId || null]
        );
      } catch (err) {
        console.warn("[RefreshTokenRepository] DB revoke fallback:", err);
      }
    }
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    for (const [hash, token] of refreshTokensStore.entries()) {
      if (token.userId === userId) {
        token.revoked = true;
        token.updatedAt = new Date().toISOString();
      }
    }

    if (Database.isReady()) {
      try {
        await Database.query(`UPDATE refresh_tokens SET revoked = TRUE, updated_at = NOW() WHERE user_id = $1`, [userId]);
      } catch (err) {
        console.warn("[RefreshTokenRepository] DB revoke all fallback:", err);
      }
    }
  }

  // Password Resets
  static async createPasswordReset(userId: string, token: string): Promise<PasswordResetEntity> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    const entity: PasswordResetEntity = {
      id: `rst-${Date.now()}`,
      userId,
      tokenHash,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };
    passwordResetsStore.set(tokenHash, entity);
    return entity;
  }

  static async verifyPasswordReset(token: string): Promise<PasswordResetEntity | null> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const found = passwordResetsStore.get(tokenHash);
    if (!found || found.used || new Date(found.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return found;
  }

  static async markPasswordResetUsed(tokenHash: string): Promise<void> {
    const found = passwordResetsStore.get(tokenHash);
    if (found) {
      found.used = true;
    }
  }

  // Email Verifications
  static async createEmailVerification(userId: string, token: string): Promise<EmailVerificationEntity> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 86400000 * 2).toISOString(); // 48 hours
    const entity: EmailVerificationEntity = {
      id: `ver-${Date.now()}`,
      userId,
      tokenHash,
      expiresAt,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    emailVerificationsStore.set(tokenHash, entity);
    return entity;
  }

  static async confirmEmailVerification(token: string): Promise<EmailVerificationEntity | null> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const found = emailVerificationsStore.get(tokenHash);
    if (!found || found.verified || new Date(found.expiresAt).getTime() < Date.now()) {
      return null;
    }
    found.verified = true;
    return found;
  }

  // Audit Events
  static async logAuditEvent(event: Omit<AuditEventEntity, "id" | "createdAt">): Promise<void> {
    const record: AuditEventEntity = {
      ...event,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    auditEventsStore.unshift(record);
    if (auditEventsStore.length > 1000) auditEventsStore.pop();
  }

  static async getRecentAuditEvents(limit = 100): Promise<AuditEventEntity[]> {
    return auditEventsStore.slice(0, limit);
  }
}
