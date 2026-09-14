import { Request, Response, NextFunction } from "express";
import { CompanyPrepService } from "../services/ai/companyPrepService";
import { CompanyReadinessService } from "../services/ai/companyReadinessService";
import { CompanyPlannerService } from "../services/ai/companyPlannerService";

export class CompanyPrepController {
  static async getTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracks = await CompanyPrepService.getTracks();
      res.json({ success: true, data: tracks });
    } catch (err) {
      next(err);
    }
  }

  static async getTrackDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.params.companyId || "amazon";
      const details = await CompanyPrepService.getTrackDetails(companyId);
      res.json({ success: true, data: details });
    } catch (err) {
      next(err);
    }
  }

  static async getProblems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, topic, difficulty } = req.query;
      const problems = await CompanyPrepService.getProblems(
        companyId as string | undefined,
        topic as string | undefined,
        difficulty as string | undefined
      );
      res.json({ success: true, data: problems });
    } catch (err) {
      next(err);
    }
  }

  static async getReadiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const companyId = req.params.companyId || "amazon";
      const readiness = await CompanyReadinessService.calculateReadiness(userId, companyId);
      res.json({ success: true, data: readiness });
    } catch (err) {
      next(err);
    }
  }

  static async generatePrepPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { companyId, targetDate, availableHoursPerWeek } = req.body;
      const plan = await CompanyPlannerService.generatePreparationPlan(
        userId,
        companyId || "amazon",
        targetDate || "30 Days",
        Number(availableHoursPerWeek) || 15
      );
      res.status(201).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  static async generateMockInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, roundType, difficulty } = req.body;
      const questions = await CompanyPlannerService.generateMockInterview(
        companyId || "amazon",
        roundType || "Coding",
        difficulty || "Medium"
      );
      res.status(201).json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  }
}
