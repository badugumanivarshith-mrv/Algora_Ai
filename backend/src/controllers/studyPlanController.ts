import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { StudyPlanRepository } from "../repositories/studyPlanRepository";
import { logger } from "../utils/logger";

export class StudyPlanController {
  static async getStudyPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const plans = await StudyPlanRepository.getUserStudyPlans(userId);
      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      logger.error(`[StudyPlanController] Error fetching study plans: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch study plans" });
    }
  }

  static async getStudyPlanById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const plan = await StudyPlanRepository.getStudyPlanById(planId);
      if (!plan) {
        res.status(404).json({ success: false, error: "Study plan not found" });
        return;
      }
      res.json({
        success: true,
        data: plan,
      });
    } catch (error: any) {
      logger.error(`[StudyPlanController] Error fetching study plan: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch study plan" });
    }
  }

  static async createStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const { planType, title, description, targetRoleCompany, difficulty, durationWeeks, dailyMinutesTarget } = req.body;

      if (!planType) {
        res.status(400).json({ success: false, error: "planType is required" });
        return;
      }

      const newPlan = await StudyPlanRepository.createStudyPlan(userId, {
        planType,
        title,
        description,
        targetRoleCompany,
        difficulty,
        durationWeeks: durationWeeks ? parseInt(durationWeeks) : undefined,
        dailyMinutesTarget: dailyMinutesTarget ? parseInt(dailyMinutesTarget) : undefined,
      });

      res.status(201).json({
        success: true,
        data: newPlan,
        message: "Study plan created successfully",
      });
    } catch (error: any) {
      logger.error(`[StudyPlanController] Error creating study plan: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to create study plan" });
    }
  }
}
