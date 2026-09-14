import { Request, Response, NextFunction } from "express";
import { LearningMemoryService } from "../services/ai/learningMemoryService";
import { DailyReviewService } from "../services/ai/dailyReviewService";
import { RetentionService } from "../services/ai/retentionService";
import { FlashcardService } from "../services/ai/flashcardService";
import { RevisionNotesService } from "../services/ai/revisionNotesService";
import { QuizGenerationService } from "../services/ai/quizGenerationService";

export class LearningMemoryController {
  static async getMemoryOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const memory = await LearningMemoryService.getLearningMemory(userId);
      res.json({ success: true, data: memory });
    } catch (err) {
      next(err);
    }
  }

  static async getRetentionOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const retention = await RetentionService.getRetentionMetrics(userId);
      res.json({ success: true, data: retention });
    } catch (err) {
      next(err);
    }
  }

  static async getDailyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const reviews = await DailyReviewService.getDailyReviews(userId);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  static async completeReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { reviewId } = req.body;
      const result = await DailyReviewService.markReviewComplete(userId, reviewId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getDailyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const userName = (req.query.userName as string) || "Arjun";
      const report = await DailyReviewService.generateDailyAiReport(userId, userName);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  static async getStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const streak = await DailyReviewService.getStreak(userId);
      res.json({ success: true, data: streak });
    } catch (err) {
      next(err);
    }
  }

  static async generateFlashcards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { topic, count, difficulty } = req.body;
      const flashcards = await FlashcardService.generateFlashcards(
        userId,
        topic || "Graphs",
        Number(count) || 3,
        difficulty || "Medium"
      );
      res.status(201).json({ success: true, data: flashcards });
    } catch (err) {
      next(err);
    }
  }

  static async getFlashcards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const topic = req.query.topic as string | undefined;
      const flashcards = await FlashcardService.getFlashcards(userId, topic);
      res.json({ success: true, data: flashcards });
    } catch (err) {
      next(err);
    }
  }

  static async generateRevisionNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { topic, difficulty, learningLevel } = req.body;
      const notes = await RevisionNotesService.generateRevisionNotes(
        userId,
        topic || "Graphs & BFS/DFS",
        difficulty || "Medium",
        learningLevel || "Intermediate"
      );
      res.status(201).json({ success: true, data: notes });
    } catch (err) {
      next(err);
    }
  }

  static async getRevisionNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const topic = req.query.topic as string | undefined;
      const notes = await RevisionNotesService.getRevisionNotes(userId, topic);
      res.json({ success: true, data: notes });
    } catch (err) {
      next(err);
    }
  }

  static async generateQuickQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, difficulty } = req.body;
      const quiz = await QuizGenerationService.generateQuiz({
        topic: topic || "Graphs & BFS/DFS",
        difficulty: (difficulty as "Easy" | "Medium" | "Hard") || "Medium",
      });
      res.status(201).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }
}
