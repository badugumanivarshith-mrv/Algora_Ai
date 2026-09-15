import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface FeedbackEntity {
  id: string;
  userId?: string;
  userEmail?: string;
  category: "bug" | "feature_request" | "ux_issue" | "performance_issue" | "ai_quality";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  route: string;
  browser?: string;
  device?: string;
  metadata?: any;
  status: "open" | "investigating" | "resolved";
  createdAt: string;
}

export class FeedbackRepository {
  private static inMemoryFeedback: FeedbackEntity[] = [];

  static async create(data: Omit<FeedbackEntity, "id" | "createdAt" | "status">): Promise<FeedbackEntity> {
    const record: FeedbackEntity = {
      ...data,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    this.inMemoryFeedback.unshift(record);

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `CREATE TABLE IF NOT EXISTS user_feedback (
             id VARCHAR(64) PRIMARY KEY,
             user_id VARCHAR(64),
             user_email VARCHAR(255),
             category VARCHAR(64),
             severity VARCHAR(32),
             message TEXT,
             route VARCHAR(255),
             browser VARCHAR(255),
             device VARCHAR(255),
             metadata JSONB,
             status VARCHAR(32) DEFAULT 'open',
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           );`,
          []
        );

        await Database.query(
          `INSERT INTO user_feedback (id, user_id, user_email, category, severity, message, route, browser, device, metadata, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
          [
            record.id,
            record.userId || null,
            record.userEmail || null,
            record.category,
            record.severity,
            record.message,
            record.route,
            record.browser || null,
            record.device || null,
            JSON.stringify(record.metadata || {}),
            record.status,
            record.createdAt,
          ]
        );
      } catch (err: any) {
        logger.error(`[FeedbackRepository] DB insert error: ${err.message}`);
      }
    }

    logger.info(`[FeedbackRepository] New feedback recorded: [${record.category}] ${record.severity} on ${record.route}`);
    return record;
  }

  static async getAll(limit: number = 100): Promise<FeedbackEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT id, user_id as "userId", user_email as "userEmail", category, severity, message, route, browser, device, metadata, status, created_at as "createdAt"
           FROM user_feedback ORDER BY created_at DESC LIMIT $1;`,
          [limit]
        );
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.error(`[FeedbackRepository] DB fetch error: ${err.message}`);
      }
    }
    return this.inMemoryFeedback.slice(0, limit);
  }
}
