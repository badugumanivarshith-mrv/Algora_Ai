import { Request, Response } from "express";
import { ContestService } from "../services/ai/contestService";
import { ContestAnalyticsService } from "../services/ai/contestAnalyticsService";
import { ContestPredictionService } from "../services/ai/contestPredictionService";
import { AIContestCoachService } from "../services/ai/aiContestCoachService";
import { ContestReplayService } from "../services/ai/contestReplayService";
import { ContestRepository } from "../repositories/contestRepository";
import { logger } from "../utils/logger";

export class ContestController {
  public static async getContests(req: Request, res: Response) {
    try {
      const contests = await ContestService.getContests();
      res.json({ success: true, contests });
    } catch (e: any) {
      logger.error(`[ContestController.getContests] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getContestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contest = await ContestRepository.getContestById(id);
      const problems = await ContestRepository.getContestProblems(id);
      const leaderboard = await ContestService.getLeaderboard(id);
      res.json({ success: true, contest, problems, leaderboard });
    } catch (e: any) {
      logger.error(`[ContestController.getContestById] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async registerParticipant(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { contestId } = req.body;
      const participant = await ContestRepository.registerParticipant({ contestId, userId });
      res.json({ success: true, participant });
    } catch (e: any) {
      logger.error(`[ContestController.registerParticipant] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async submitSolution(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { contestId, problemId, verdict, runtime, memory, topic } = req.body;
      const submission = await ContestService.submitSolution({
        contestId,
        userId,
        problemId: problemId || "p_sw_1",
        verdict: verdict || "Accepted",
        runtime: runtime || 45,
        memory: memory || 14200,
        topic: topic || "Arrays",
      });
      res.json({ success: true, submission });
    } catch (e: any) {
      logger.error(`[ContestController.submitSolution] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async createTeam(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { contestId, teamName } = req.body;
      const team = await ContestRepository.createTeam({ contestId, teamName, captainId: userId });
      res.json({ success: true, team });
    } catch (e: any) {
      logger.error(`[ContestController.createTeam] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const analytics = await ContestAnalyticsService.getUserAnalytics(userId);
      const predictions = await ContestPredictionService.getPredictions(userId);
      res.json({ success: true, analytics, predictions });
    } catch (e: any) {
      logger.error(`[ContestController.getAnalytics] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getCoachAdvice(req: Request, res: Response) {
    try {
      const { contestId, problemTitle, userCode, errorLog, timeRemainingMinutes, requestType } = req.body;
      const advice = await AIContestCoachService.getCoachAdvice({
        contestId,
        problemTitle,
        userCode,
        errorLog,
        timeRemainingMinutes,
        requestType: requestType || "hint",
      });
      res.json({ success: true, advice });
    } catch (e: any) {
      logger.error(`[ContestController.getCoachAdvice] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getReplay(req: Request, res: Response) {
    try {
      const { contestId } = req.params;
      const replay = await ContestReplayService.getContestReplay(contestId);
      res.json({ success: true, replay });
    } catch (e: any) {
      logger.error(`[ContestController.getReplay] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
