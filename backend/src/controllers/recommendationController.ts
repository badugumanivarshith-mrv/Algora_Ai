import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { RecommendationRepository } from "../repositories/recommendationRepository";
import { RecommendationCategory } from "../types";
import { logger } from "../utils/logger";

export class RecommendationController {
  static async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const category = req.query.category as RecommendationCategory | undefined;

      const recs = await RecommendationRepository.getRecommendations(userId, category);
      res.json({
        success: true,
        data: recs,
      });
    } catch (error: any) {
      logger.error(`[RecommendationController] Error fetching recommendations: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch recommendations" });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const { recId } = req.params;
      const { action } = req.body;

      if (!action || !["solved", "dismissed"].includes(action)) {
        res.status(400).json({ success: false, error: "action must be 'solved' or 'dismissed'" });
        return;
      }

      const updated = await RecommendationRepository.updateRecommendationStatus(userId, recId, action);
      if (!updated) {
        res.status(404).json({ success: false, error: "Recommendation not found" });
        return;
      }

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      logger.error(`[RecommendationController] Error updating recommendation: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to update recommendation" });
    }
  }

  static async refreshAdaptiveRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const recs = await RecommendationRepository.generateAdaptiveRecommendations(userId);
      res.json({
        success: true,
        data: recs,
        message: "Recommendations refreshed with adaptive model",
      });
    } catch (error: any) {
      logger.error(`[RecommendationController] Error refreshing recommendations: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to refresh recommendations" });
    }
  }
}
