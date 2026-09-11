import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { adminAnalyticsRepository } from "../repositories/adminAnalyticsRepository";
import { logger } from "../utils/logger";

export class AdminAnalyticsController {
  public static async getSummary(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const summary = await adminAnalyticsRepository.getSummary();
      res.json({ success: true, data: summary });
    } catch (err: any) {
      logger.error(`[AdminAnalytics] Error getting platform summary: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
