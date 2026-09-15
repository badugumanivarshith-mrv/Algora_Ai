import { Request, Response } from "express";
import { AssessmentService } from "../services/ai/assessmentService";
import { CandidateRankingService } from "../services/ai/candidateRankingService";
import { HiringPredictionService } from "../services/ai/hiringPredictionService";
import { RecruiterSimulationService } from "../services/ai/recruiterSimulationService";
import { AssessmentAnalyticsService } from "../services/ai/assessmentAnalyticsService";
import { HiringPipelineService } from "../services/ai/hiringPipelineService";
import { BenchmarkService } from "../services/ai/benchmarkService";
import { logger } from "../utils/logger";

export class HiringController {
  public static async getAssessments(req: Request, res: Response) {
    try {
      const company = req.query.company as string | undefined;
      const assessments = await AssessmentService.getAssessments(company);
      res.json({ success: true, assessments });
    } catch (e: any) {
      logger.error(`[HiringController.getAssessments] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getAssessmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { assessment, questions } = await AssessmentService.getAssessmentById(id);
      res.json({ success: true, assessment, questions });
    } catch (e: any) {
      logger.error(`[HiringController.getAssessmentById] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async submitAttempt(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { assessmentId, score } = req.body;
      const attempt = await AssessmentService.submitAttempt({
        assessmentId,
        userId,
        score: score || 85,
      });
      res.json({ success: true, attempt });
    } catch (e: any) {
      logger.error(`[HiringController.submitAttempt] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async evaluateRecruiterSession(req: Request, res: Response) {
    try {
      const candidateId = (req as any).user?.id || "usr_demo";
      const { company, roundType, userResponses } = req.body;
      const evaluation = await RecruiterSimulationService.evaluateSession({
        candidateId,
        company: company || "Google",
        roundType: roundType || "Technical",
        userResponses: userResponses || ["I optimized the tree search using a memoized DFS."],
      });
      res.json({ success: true, evaluation });
    } catch (e: any) {
      logger.error(`[HiringController.evaluateRecruiterSession] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getCandidateRankings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const rankings = await CandidateRankingService.getCandidateRankings(userId);
      res.json({ success: true, rankings });
    } catch (e: any) {
      logger.error(`[HiringController.getCandidateRankings] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getHiringPredictions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const predictions = await HiringPredictionService.getPredictions(userId);
      res.json({ success: true, predictions });
    } catch (e: any) {
      logger.error(`[HiringController.getHiringPredictions] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getCandidateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const profile = await AssessmentService.getCandidateProfile(userId);
      res.json({ success: true, profile });
    } catch (e: any) {
      logger.error(`[HiringController.getCandidateProfile] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getBenchmark(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const benchmark = await BenchmarkService.getCandidateBenchmark(userId);
      res.json({ success: true, benchmark });
    } catch (e: any) {
      logger.error(`[HiringController.getBenchmark] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getPipeline(req: Request, res: Response) {
    try {
      const company = (req.query.company as string) || "Google";
      const pipelines = await HiringPipelineService.getCompanyPipelines(company);
      res.json({ success: true, company, pipelines });
    } catch (e: any) {
      logger.error(`[HiringController.getPipeline] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const analytics = await AssessmentAnalyticsService.getUserAnalytics(userId);
      res.json({ success: true, analytics });
    } catch (e: any) {
      logger.error(`[HiringController.getAnalytics] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
