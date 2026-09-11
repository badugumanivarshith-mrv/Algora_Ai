import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { ReadinessRepository } from "../repositories/readinessRepository";
import { logger } from "../utils/logger";

export class ReadinessController {
  static async getContestReadiness(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const score = await ReadinessRepository.getContestReadiness(userId);
      res.json({
        success: true,
        data: score,
      });
    } catch (error: any) {
      logger.error(`[ReadinessController] Error fetching contest readiness: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch contest readiness" });
    }
  }

  static async getInterviewReadiness(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const score = await ReadinessRepository.getInterviewReadiness(userId);
      res.json({
        success: true,
        data: score,
      });
    } catch (error: any) {
      logger.error(`[ReadinessController] Error fetching interview readiness: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch interview readiness" });
    }
  }

  static async getWeakTopics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const weakTopics = await ReadinessRepository.getWeakTopics(userId);
      res.json({
        success: true,
        data: weakTopics,
      });
    } catch (error: any) {
      logger.error(`[ReadinessController] Error fetching weak topics: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch weak topics" });
    }
  }
}
