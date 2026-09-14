import { Database } from "../db/connection";
import { OAuthAccountEntity, OAuthProvider } from "../types";
import { logger } from "../utils/logger";

export class OAuthAccountRepository {
  private static inMemoryAccounts: Map<string, OAuthAccountEntity> = new Map();

  static async findByProviderAndProviderUserId(
    provider: OAuthProvider,
    providerUserId: string
  ): Promise<OAuthAccountEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT 
            id, user_id as "userId", provider, provider_user_id as "providerUserId",
            email, display_name as "displayName", avatar_url as "avatarUrl",
            access_token as "accessToken", refresh_token as "refreshToken",
            token_expires_at as "tokenExpiresAt", raw_profile as "rawProfile",
            linked_at as "linkedAt", last_login_at as "lastLoginAt",
            created_at as "createdAt", updated_at as "updatedAt"
          FROM oauth_accounts
          WHERE provider = $1 AND provider_user_id = $2
          LIMIT 1;`,
          [provider, providerUserId]
        );
        return rows[0] || null;
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] findByProviderAndProviderUserId DB error: ${err.message}`);
      }
    }

    // In-memory fallback
    for (const acc of this.inMemoryAccounts.values()) {
      if (acc.provider === provider && acc.providerUserId === providerUserId) {
        return acc;
      }
    }
    return null;
  }

  static async findByUserIdAndProvider(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthAccountEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT 
            id, user_id as "userId", provider, provider_user_id as "providerUserId",
            email, display_name as "displayName", avatar_url as "avatarUrl",
            access_token as "accessToken", refresh_token as "refreshToken",
            token_expires_at as "tokenExpiresAt", raw_profile as "rawProfile",
            linked_at as "linkedAt", last_login_at as "lastLoginAt",
            created_at as "createdAt", updated_at as "updatedAt"
          FROM oauth_accounts
          WHERE user_id = $1 AND provider = $2
          LIMIT 1;`,
          [userId, provider]
        );
        return rows[0] || null;
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] findByUserIdAndProvider DB error: ${err.message}`);
      }
    }

    for (const acc of this.inMemoryAccounts.values()) {
      if (acc.userId === userId && acc.provider === provider) {
        return acc;
      }
    }
    return null;
  }

  static async findByUserId(userId: string): Promise<OAuthAccountEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT 
            id, user_id as "userId", provider, provider_user_id as "providerUserId",
            email, display_name as "displayName", avatar_url as "avatarUrl",
            access_token as "accessToken", refresh_token as "refreshToken",
            token_expires_at as "tokenExpiresAt", raw_profile as "rawProfile",
            linked_at as "linkedAt", last_login_at as "lastLoginAt",
            created_at as "createdAt", updated_at as "updatedAt"
          FROM oauth_accounts
          WHERE user_id = $1
          ORDER BY linked_at ASC;`,
          [userId]
        );
        return rows;
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] findByUserId DB error: ${err.message}`);
      }
    }

    return Array.from(this.inMemoryAccounts.values()).filter((acc) => acc.userId === userId);
  }

  static async create(account: OAuthAccountEntity): Promise<OAuthAccountEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `INSERT INTO oauth_accounts (
            id, user_id, provider, provider_user_id, email, display_name, avatar_url,
            access_token, refresh_token, token_expires_at, raw_profile, linked_at,
            last_login_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING 
            id, user_id as "userId", provider, provider_user_id as "providerUserId",
            email, display_name as "displayName", avatar_url as "avatarUrl",
            access_token as "accessToken", refresh_token as "refreshToken",
            token_expires_at as "tokenExpiresAt", raw_profile as "rawProfile",
            linked_at as "linkedAt", last_login_at as "lastLoginAt",
            created_at as "createdAt", updated_at as "updatedAt";`,
          [
            account.id,
            account.userId,
            account.provider,
            account.providerUserId,
            account.email,
            account.displayName || null,
            account.avatarUrl || null,
            account.accessToken || null,
            account.refreshToken || null,
            account.tokenExpiresAt ? new Date(account.tokenExpiresAt) : null,
            JSON.stringify(account.rawProfile || {}),
            account.linkedAt ? new Date(account.linkedAt) : new Date(),
            account.lastLoginAt ? new Date(account.lastLoginAt) : new Date(),
            account.createdAt ? new Date(account.createdAt) : new Date(),
            account.updatedAt ? new Date(account.updatedAt) : new Date(),
          ]
        );
        this.inMemoryAccounts.set(account.id, rows[0]);
        return rows[0];
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] create DB error: ${err.message}`);
      }
    }

    this.inMemoryAccounts.set(account.id, account);
    return account;
  }

  static async updateLastLogin(id: string, tokenUpdates?: { accessToken?: string; refreshToken?: string; tokenExpiresAt?: string }): Promise<void> {
    const now = new Date().toISOString();
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `UPDATE oauth_accounts
           SET last_login_at = NOW(),
               updated_at = NOW(),
               access_token = COALESCE($2, access_token),
               refresh_token = COALESCE($3, refresh_token),
               token_expires_at = COALESCE($4, token_expires_at)
           WHERE id = $1;`,
          [
            id,
            tokenUpdates?.accessToken || null,
            tokenUpdates?.refreshToken || null,
            tokenUpdates?.tokenExpiresAt ? new Date(tokenUpdates.tokenExpiresAt) : null,
          ]
        );
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] updateLastLogin DB error: ${err.message}`);
      }
    }

    const cached = this.inMemoryAccounts.get(id);
    if (cached) {
      cached.lastLoginAt = now;
      cached.updatedAt = now;
      if (tokenUpdates?.accessToken) cached.accessToken = tokenUpdates.accessToken;
      if (tokenUpdates?.refreshToken) cached.refreshToken = tokenUpdates.refreshToken;
      if (tokenUpdates?.tokenExpiresAt) cached.tokenExpiresAt = tokenUpdates.tokenExpiresAt;
    }
  }

  static async deleteByUserIdAndProvider(userId: string, provider: OAuthProvider): Promise<boolean> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await Database.query(
          `DELETE FROM oauth_accounts WHERE user_id = $1 AND provider = $2;`,
          [userId, provider]
        );
        for (const [id, acc] of this.inMemoryAccounts.entries()) {
          if (acc.userId === userId && acc.provider === provider) {
            this.inMemoryAccounts.delete(id);
          }
        }
        return (res.rowCount ?? 0) > 0;
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] deleteByUserIdAndProvider DB error: ${err.message}`);
      }
    }

    let deleted = false;
    for (const [id, acc] of this.inMemoryAccounts.entries()) {
      if (acc.userId === userId && acc.provider === provider) {
        this.inMemoryAccounts.delete(id);
        deleted = true;
      }
    }
    return deleted;
  }

  static async countAccounts(): Promise<{ total: number; google: number; github: number }> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<{ provider: string; count: string }>(
          `SELECT provider, COUNT(*) as count FROM oauth_accounts GROUP BY provider;`
        );
        let google = 0;
        let github = 0;
        for (const r of rows) {
          if (r.provider === "google") google = Number(r.count);
          if (r.provider === "github") github = Number(r.count);
        }
        return { total: google + github, google, github };
      } catch (err: any) {
        logger.error(`[OAuthAccountRepository] countAccounts DB error: ${err.message}`);
      }
    }

    let google = 0;
    let github = 0;
    for (const acc of this.inMemoryAccounts.values()) {
      if (acc.provider === "google") google++;
      if (acc.provider === "github") github++;
    }
    return { total: google + github, google, github };
  }
}
