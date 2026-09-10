import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { ContestRepository } from "../repositories/contestRepository";
import { XPRepository } from "../repositories/xpRepository";
import { AchievementRepository } from "../repositories/achievementRepository";
import { logger } from "../utils/logger";
import { db } from "../services/store";

export class ContestController {
  static async listContests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const contests = await ContestRepository.findAll();

      const enriched = await Promise.all(
        contests.map(async (c) => {
          const isRegistered = currentUserId
            ? await ContestRepository.isUserRegistered(c.id, currentUserId)
            : false;
          return {
            ...c,
            registered: isRegistered,
          };
        })
      );

      res.json({
        success: true,
        data: enriched,
      });
    } catch (error: any) {
      logger.error(`[ContestController] Error listing contests: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch contests" });
    }
  }

  static async getContest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;

      const contest = await ContestRepository.findById(id);
      if (!contest) {
        res.status(404).json({ success: false, error: "Contest not found" });
        return;
      }

      const isRegistered = currentUserId
        ? await ContestRepository.isUserRegistered(id, currentUserId)
        : false;

      const leaderboard = await ContestRepository.getContestLeaderboard(id, currentUserId);

      res.json({
        success: true,
        data: {
          ...contest,
          registered: isRegistered,
          leaderboard,
        },
      });
    } catch (error: any) {
      logger.error(`[ContestController] Error getting contest: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch contest details" });
    }
  }

  static async registerContest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, error: "Authentication required to register" });
        return;
      }

      const contest = await ContestRepository.findById(id);
      if (!contest) {
        res.status(404).json({ success: false, error: "Contest not found" });
        return;
      }

      const result = await ContestRepository.registerUser(id, user.userId, user.username);

      // Award "First Contest" achievement if applicable
      await AchievementRepository.awardAchievement(user.userId, "FIRST_CONTEST");

      // Award XP for registration/participation
      await XPRepository.recordXP(
        user.userId,
        50,
        "Contest Participation",
        `Registered for ${contest.title}`
      );

      res.json({
        success: true,
        message: "Successfully registered for contest",
        data: result,
      });
    } catch (error: any) {
      logger.error(`[ContestController] Error registering contest: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to register for contest" });
    }
  }

  static async getLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;

      const leaderboard = await ContestRepository.getContestLeaderboard(id, currentUserId);
      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error: any) {
      logger.error(`[ContestController] Error fetching contest leaderboard: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
    }
  }

  static async submitSolution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { problemSlug, points = 100 } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, error: "Authentication required" });
        return;
      }

      // Record contest submission points
      const participant = Array.from(db.contestParticipants.values()).find(
        (p) => p.contestId === id && p.userId === user.userId
      );

      if (participant) {
        participant.score += Number(points);
        participant.penaltySeconds += Math.floor(Math.random() * 300) + 60;
      }

      // Award XP
      const xpResult = await XPRepository.recordXP(
        user.userId,
        points,
        "Accepted Solution",
        `Contest solve: ${problemSlug}`
      );

      // Check for unlockable badges
      const newBadges = await AchievementRepository.evaluateAndUnlockAchievements(user.userId);

      res.json({
        success: true,
        message: "Contest submission scored successfully",
        data: {
          scoreAwarded: points,
          xpGained: points,
          newBadges,
          totalXP: xpResult.totalXP,
          level: xpResult.level,
        },
      });
    } catch (error: any) {
      logger.error(`[ContestController] Error submitting contest problem: ${error.message}`);
      res.status(500).json({ success: false, error: "Contest submission failed" });
    }
  }
}
