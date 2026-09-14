import { Database } from "../db/connection";
import { OAuthAuditLogEntity, OAuthAuditEventType, OAuthProvider } from "../types";
import { logger } from "../utils/logger";

export class OAuthAuditLogRepository {
  private static inMemoryLogs: OAuthAuditLogEntity[] = [];

  static async logEvent(entry: Omit<OAuthAuditLogEntity, "id" | "createdAt">): Promise<OAuthAuditLogEntity> {
    const id = `oaud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const fullEntry: OAuthAuditLogEntity = {
      ...entry,
      id,
      createdAt,
    };

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO oauth_audit_logs (id, user_id, provider, event_type, provider_user_id, email, ip_address, user_agent, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [
            fullEntry.id,
            fullEntry.userId || null,
            fullEntry.provider,
            fullEntry.eventType,
            fullEntry.providerUserId || null,
            fullEntry.email || null,
            fullEntry.ipAddress || null,
            fullEntry.userAgent || null,
            JSON.stringify(fullEntry.details || {}),
            new Date(fullEntry.createdAt),
          ]
        );
      } catch (err: any) {
        logger.error(`[OAuthAuditLogRepository] logEvent DB error: ${err.message}`);
      }
    }

    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > 500) {
      this.inMemoryLogs.pop();
    }

    return fullEntry;
  }

  static async getRecentLogs(limit = 50, provider?: OAuthProvider, eventType?: OAuthAuditEventType): Promise<OAuthAuditLogEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        let query = `SELECT 
          id, user_id as "userId", provider, event_type as "eventType",
          provider_user_id as "providerUserId", email, ip_address as "ipAddress",
          user_agent as "userAgent", details, created_at as "createdAt"
        FROM oauth_audit_logs`;
        const params: any[] = [];
        const conditions: string[] = [];

        if (provider) {
          params.push(provider);
          conditions.push(`provider = $${params.length}`);
        }
        if (eventType) {
          params.push(eventType);
          conditions.push(`event_type = $${params.length}`);
        }

        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1};`;
        params.push(limit);

        const { rows } = await Database.query<any>(query, params);
        return rows;
      } catch (err: any) {
        logger.error(`[OAuthAuditLogRepository] getRecentLogs DB error: ${err.message}`);
      }
    }

    return this.inMemoryLogs
      .filter((log) => (!provider || log.provider === provider) && (!eventType || log.eventType === eventType))
      .slice(0, limit);
  }

  static async getMetrics(): Promise<{
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    providerUsage: { google: number; github: number };
  }> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<{ event_type: string; provider: string; count: string }>(
          `SELECT event_type, provider, COUNT(*) as count 
           FROM oauth_audit_logs 
           GROUP BY event_type, provider;`
        );

        let successfulLogins = 0;
        let failedLogins = 0;
        let googleLogins = 0;
        let githubLogins = 0;

        for (const row of rows) {
          const count = Number(row.count);
          if (row.event_type === "login_success") {
            successfulLogins += count;
            if (row.provider === "google") googleLogins += count;
            if (row.provider === "github") githubLogins += count;
          } else if (row.event_type === "login_failed" || row.event_type === "invalid_state" || row.event_type === "invalid_callback") {
            failedLogins += count;
          }
        }

        return {
          totalLogins: successfulLogins + failedLogins,
          successfulLogins,
          failedLogins,
          providerUsage: {
            google: googleLogins,
            github: githubLogins,
          },
        };
      } catch (err: any) {
        logger.error(`[OAuthAuditLogRepository] getMetrics DB error: ${err.message}`);
      }
    }

    let successfulLogins = 0;
    let failedLogins = 0;
    let googleLogins = 0;
    let githubLogins = 0;

    for (const log of this.inMemoryLogs) {
      if (log.eventType === "login_success") {
        successfulLogins++;
        if (log.provider === "google") googleLogins++;
        if (log.provider === "github") githubLogins++;
      } else if (["login_failed", "invalid_state", "invalid_callback"].includes(log.eventType)) {
        failedLogins++;
      }
    }

    return {
      totalLogins: successfulLogins + failedLogins,
      successfulLogins,
      failedLogins,
      providerUsage: {
        google: googleLogins,
        github: githubLogins,
      },
    };
  }
}
