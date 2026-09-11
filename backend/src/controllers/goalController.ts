import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { GoalRepository } from "../repositories/goalRepository";
import { logger } from "../utils/logger";

export class GoalController {
  static async getGoals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const goals = await GoalRepository.getUserGoals(userId);
      res.json({
        success: true,
        data: goals,
      });
    } catch (error: any) {
      logger.error(`[GoalController] Error fetching goals: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch user goals" });
    }
  }

  static async createGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const { title, goalType, targetMetric, targetValue, unit } = req.body;

      if (!title || !goalType || !targetMetric || targetValue === undefined) {
        res.status(400).json({
          success: false,
          error: "title, goalType, targetMetric, and targetValue are required",
        });
        return;
      }

      const newGoal = await GoalRepository.createGoal(userId, {
        title,
        goalType,
        targetMetric,
        targetValue: parseInt(targetValue, 10),
        unit,
      });

      res.status(201).json({
        success: true,
        data: newGoal,
        message: "Goal created successfully",
      });
    } catch (error: any) {
      logger.error(`[GoalController] Error creating goal: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to create goal" });
    }
  }

  static async recordProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const { goalId } = req.params;
      const { increment, notes } = req.body;

      const inc = increment !== undefined ? parseInt(increment, 10) : 1;
      const result = await GoalRepository.recordProgress(userId, goalId, inc, notes);

      res.json({
        success: true,
        data: result,
        message: "Goal progress recorded",
      });
    } catch (error: any) {
      logger.error(`[GoalController] Error recording goal progress: ${error.message}`);
      res.status(500).json({ success: false, error: error.message || "Failed to record goal progress" });
    }
  }
}
