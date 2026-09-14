import { Request, Response, NextFunction } from "express";
import { AdaptiveLearningService } from "../services/ai/adaptiveLearningService";

export class AdaptiveLearningController {
  static async getSkillProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.query.userId || "usr-arjun-patel";
      const profile = await AdaptiveLearningService.getSkillProfile(userId as string);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  static async getWeaknesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.query.userId || "usr-arjun-patel";
      const weaknesses = await AdaptiveLearningService.getWeaknesses(userId as string);
      res.json({ success: true, data: weaknesses });
    } catch (err) {
      next(err);
    }
  }

  static async getDailyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.query.userId || "usr-arjun-patel";
      const reviews = await AdaptiveLearningService.getDailyReviews(userId as string);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  static async submitDailyReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { reviewId, score } = req.body;
      const result = await AdaptiveLearningService.submitDailyReview(userId as string, reviewId, score);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getLearningPath(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.query.userId || "usr-arjun-patel";
      const targetGoal = (req.query.targetGoal as string) || "Google";
      const path = await AdaptiveLearningService.getPersonalizedLearningPath(userId as string, targetGoal);
      res.json({ success: true, data: path });
    } catch (err) {
      next(err);
    }
  }

  static async generateStudyPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { placementGoal, availableHours } = req.body;
      const plan = await AdaptiveLearningService.generateStudyPlan(
        userId as string,
        placementGoal || "FAANG Product Engineer",
        Number(availableHours) || 12
      );
      res.status(201).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  static async getAdaptiveRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.query.userId || "usr-arjun-patel";
      const recs = await AdaptiveLearningService.getAdaptiveRecommendations(userId as string);
      res.json({ success: true, data: recs });
    } catch (err) {
      next(err);
    }
  }
}
