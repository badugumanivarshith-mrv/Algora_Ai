import { Request, Response, NextFunction } from "express";
import { ProblemGenerationService } from "../services/ai/problemGenerationService";
import { QuizGenerationService } from "../services/ai/quizGenerationService";
import { AssignmentGenerationService } from "../services/ai/assignmentGenerationService";
import { InterviewGenerationService } from "../services/ai/interviewGenerationService";
import { ContestGenerationService } from "../services/ai/contestGenerationService";

export class AIGenerationController {
  static async generateProblem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { language, topic, difficulty, learningLevel } = req.body;
      const userId = (req as any).user?.id || req.body.userId;
      const result = await ProblemGenerationService.generateProblem({
        userId,
        language: language || "Python",
        topic: topic || "Arrays",
        difficulty: difficulty || "Medium",
        learningLevel: learningLevel || "Intermediate",
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, difficulty } = req.body;
      const userId = (req as any).user?.id || req.body.userId;
      const result = await QuizGenerationService.generateQuiz({
        userId,
        topic: topic || "Dynamic Programming",
        difficulty: difficulty || "Medium",
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, difficulty } = req.body;
      const userId = (req as any).user?.id || req.body.userId;
      const result = await AssignmentGenerationService.generateAssignment({
        userId,
        topic: topic || "Trees",
        difficulty: difficulty || "Medium",
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roundType, difficulty } = req.body;
      const userId = (req as any).user?.id || req.body.userId;
      const result = await InterviewGenerationService.generateInterview({
        userId,
        roundType: roundType || "Coding",
        difficulty: difficulty || "Medium",
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contestLevel } = req.body;
      const userId = (req as any).user?.id || req.body.userId;
      const result = await ContestGenerationService.generateContest({
        userId,
        contestLevel: contestLevel || "Intermediate",
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
