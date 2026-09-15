import { Request, Response } from "express";
import { LearningIntelligenceService } from "../services/ai/learningIntelligenceService";
import { KnowledgeGraphService } from "../services/ai/knowledgeGraphService";
import { MasteryTrackingService } from "../services/ai/masteryTrackingService";
import { KnowledgeGapService } from "../services/ai/knowledgeGapService";
import { LearningPredictionService } from "../services/ai/learningPredictionService";
import { RecommendationEngineService } from "../services/ai/recommendationEngineService";
import { logger } from "../utils/logger";

export class LearningIntelligenceController {
  public static async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const data = await LearningIntelligenceService.getIntelligenceDashboard(userId);
      res.json({ success: true, ...data });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.getDashboard] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getGraph(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const graph = await KnowledgeGraphService.getGraph(userId);
      res.json({ success: true, graph });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.getGraph] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getMastery(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const masteryScores = await MasteryTrackingService.getMasteryScores(userId);
      res.json({ success: true, masteryScores });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.getMastery] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async updateMastery(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { topic, subtopic, correctSubmissions, totalAttempts, difficultyLevel, daysSinceLastPractice } = req.body;
      const score = await MasteryTrackingService.calculateAndSaveMastery({
        userId,
        topic: topic || "Arrays",
        subtopic: subtopic || "Sliding Window",
        correctSubmissions: correctSubmissions || 1,
        totalAttempts: totalAttempts || 1,
        difficultyLevel,
        daysSinceLastPractice,
      });
      res.json({ success: true, score });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.updateMastery] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getGaps(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const gaps = await KnowledgeGapService.detectKnowledgeGaps(userId);
      res.json({ success: true, gaps });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.getGaps] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getPredictions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const predictions = await LearningPredictionService.getPredictions(userId);
      res.json({ success: true, predictions });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.getPredictions] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const recommendations = await RecommendationEngineService.getRecommendations(userId);
      res.json({ success: true, recommendations });
    } catch (e: any) {
      logger.error(`[LearningIntelligenceController.getRecommendations] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
