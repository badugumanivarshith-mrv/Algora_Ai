import { Request, Response, NextFunction } from "express";
import { VoiceMentorRepository } from "../repositories/voiceMentorRepository";
import { VoiceMentorService } from "../services/ai/voiceMentorService";
import { VoiceInterviewService } from "../services/ai/voiceInterviewService";
import { VoiceAnalyticsService } from "../services/ai/voiceAnalyticsService";
import { LearningMemoryRepository } from "../repositories/learningMemoryRepository";
import { CompanyPrepRepository } from "../repositories/companyPrepRepository";
import { TextToSpeechService } from "../services/ai/textToSpeechService";

export class VoiceMentorController {
  static async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { sessionType, language } = req.body;

      const session = await VoiceMentorRepository.createSession({
        id: `vsess-${Date.now()}`,
        userId,
        sessionType: sessionType || "Mentor",
        language: language || "English",
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  static async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, durationSeconds } = req.body;
      const session = await VoiceMentorRepository.endSession(sessionId, Number(durationSeconds) || 60);

      if (session) {
        await VoiceAnalyticsService.recordSessionActivity(session.userId, session.sessionType, Math.ceil((Number(durationSeconds) || 60) / 60));
      }

      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  static async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const session = await VoiceMentorRepository.getSession(id);
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  static async voiceChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, audioInput, language } = req.body;
      const result = await VoiceMentorService.processVoiceChat(
        sessionId || `vsess-${Date.now()}`,
        audioInput || "",
        language || "English"
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async learnTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, language } = req.body;
      const result = await VoiceMentorService.learnTopic(topic || "Breadth-First Search", language || "English");
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async codeHelp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codeSnippet, problemContext, language } = req.body;
      const result = await VoiceMentorService.getCodingHelp(codeSnippet || "", problemContext || "Arrays", language || "English");
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async companyPrep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, language } = req.body;
      const track = await CompanyPrepRepository.getCompanyTrack(companyId || "amazon");

      const text = `Preparing for ${track?.name || companyId}. Key recommended topics include ${track?.recommendedTopics.join(", ")}. Primary focus is on optimal space time guarantees and leadership principles.`;
      const tts = await TextToSpeechService.generateSpeech(text, language || "English");

      res.json({
        success: true,
        data: {
          company: track?.name || companyId,
          guidance: text,
          recommendedTopics: track?.recommendedTopics || [],
          audioUrl: tts.audioUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async startInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { company, roundType, language } = req.body;

      const question = await VoiceInterviewService.startInterview(
        userId,
        company || "Amazon",
        roundType || "DSA",
        language || "English"
      );
      res.status(201).json({ success: true, data: question });
    } catch (err) {
      next(err);
    }
  }

  static async answerInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId || "usr-arjun-patel";
      const { sessionId, company, roundType, spokenAnswer, language } = req.body;

      const evalResult = await VoiceInterviewService.evaluateAnswer(
        userId,
        sessionId,
        company || "Amazon",
        roundType || "DSA",
        spokenAnswer || "",
        language || "English"
      );
      res.json({ success: true, data: evalResult });
    } catch (err) {
      next(err);
    }
  }

  static async endInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;
      res.json({ success: true, message: `Voice interview session ${sessionId} closed successfully.` });
    } catch (err) {
      next(err);
    }
  }

  static async startQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, language } = req.body;
      const questionText = `Question 1 on ${topic || "Graphs"}: What is the time complexity of BFS on an adjacency list?`;
      const tts = await TextToSpeechService.generateSpeech(questionText, language || "English");

      res.json({
        success: true,
        data: {
          quizId: `vquiz-${Date.now()}`,
          question: questionText,
          options: ["O(V + E)", "O(V^2)", "O(E log V)", "O(1)"],
          correctOption: "O(V + E)",
          audioUrl: tts.audioUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async answerQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, selectedOption, correctOption, language } = req.body;
      const isCorrect = selectedOption === correctOption;
      const feedback = isCorrect
        ? "Correct! BFS visits all vertices and edges yielding linear time O(V + E)."
        : `Incorrect. The correct answer is ${correctOption}.`;

      const tts = await TextToSpeechService.generateSpeech(feedback, language || "English");

      res.json({
        success: true,
        data: {
          quizId,
          isCorrect,
          feedback,
          audioUrl: tts.audioUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const language = (req.query.language as string) || "English";

      const reviews = await LearningMemoryRepository.getDailyReviews(userId);
      const weakTopics = reviews.filter((r) => r.priorityScore > 70).map((r) => r.topic);

      const reviewText = `You have ${reviews.length} daily reviews scheduled. Priority retention focus needed for: ${
        weakTopics.length > 0 ? weakTopics.join(", ") : "Arrays, Sliding Window, and BFS"
      }.`;

      const tts = await TextToSpeechService.generateSpeech(reviewText, language);

      res.json({
        success: true,
        data: {
          reviewsCount: reviews.length,
          weakTopics,
          guidanceText: reviewText,
          audioUrl: tts.audioUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req.query.userId as string) || "usr-arjun-patel";
      const analytics = await VoiceAnalyticsService.getUserAnalytics(userId);
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
}
