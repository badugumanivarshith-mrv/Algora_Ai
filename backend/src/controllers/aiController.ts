import { Request, Response, NextFunction } from "express";
import { AIMentorService } from "../services/ai/aiMentorService";
import { AIAnalystService } from "../services/ai/aiAnalystService";
import { AuthenticatedRequest } from "../middleware/auth";

export class AIController {
  static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      const { message, conversationId, topic, problemSlug, userCode, language, isContestMode } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Message is required" } });
        return;
      }

      const result = await AIMentorService.sendMessage({
        userId,
        conversationId,
        topic,
        problemSlug,
        userCode,
        language,
        message,
        isContestMode,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      const convs = await AIMentorService.getUserConversations(userId);
      res.status(200).json({ success: true, data: convs });
    } catch (err) {
      next(err);
    }
  }

  static async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversationId } = req.params;
      const messages = await AIMentorService.getConversationMessages(conversationId);
      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }

  static async hint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { problemSlug, hintLevel, userCode, language, isContestMode } = req.body;
      if (!problemSlug) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "problemSlug is required" } });
        return;
      }

      const result = await AIMentorService.getProgressiveHint({
        problemSlug,
        hintLevel: hintLevel || 1,
        userCode,
        language,
        isContestMode,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async reviewCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, language, problemTitle, verdict } = req.body;
      if (!code || !language) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Code and language are required" } });
        return;
      }

      const result = await AIMentorService.reviewCode({
        code,
        language,
        problemTitle,
        verdict,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async complexity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, language, context } = req.body;
      if (!code || !language) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Code and language are required" } });
        return;
      }

      const result = await AIMentorService.analyzeComplexity(code, language, context);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async analystReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      const timeRange = (req.query.timeRange as "7d" | "30d" | "all") || "30d";
      const report = await AIAnalystService.generateAnalystReport(userId, timeRange);

      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  static async recommendations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      const recs = await AIAnalystService.getAdaptiveRecommendations(userId);
      res.status(200).json({ success: true, data: recs });
    } catch (err) {
      next(err);
    }
  }

  static async updateRecommendationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      const { recId } = req.params;
      const { status } = req.body;
      await AIAnalystService.updateRecommendationStatus(userId, recId, status);
      res.status(200).json({ success: true, message: "Recommendation updated" });
    } catch (err) {
      next(err);
    }
  }
}
