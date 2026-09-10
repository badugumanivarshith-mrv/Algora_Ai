import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { XPRepository } from "../repositories/xpRepository";
import { RatingRepository } from "../repositories/ratingRepository";
import { AchievementRepository } from "../repositories/achievementRepository";
import { ProfileRepository } from "../repositories/profileRepository";
import { logger } from "../utils/logger";

export class GamificationController {
  static async getGamificationProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";

      const [xpProfile, ratingSummary, userAchievements, allAchievements] = await Promise.all([
        XPRepository.getUserXPProfile(userId),
        RatingRepository.getUserRatingSummary(userId),
        AchievementRepository.findUserAchievements(userId),
        AchievementRepository.findAll(),
      ]);

      const profile = await ProfileRepository.findByUserId(userId);

      // Merge all achievements with unlocked status
      const achievementsWithStatus = allAchievements.map((ach) => {
        const userAch = userAchievements.find((u) => u.badgeCode === ach.badgeCode);
        return {
          ...ach,
          unlocked: !!userAch,
          unlockedAt: userAch?.unlockedAt,
          progressValue: userAch ? userAch.progressValue : 0,
        };
      });

      res.json({
        success: true,
        data: {
          rating: ratingSummary.currentRating,
          highestRating: ratingSummary.highestRating,
          ratingTier: ratingSummary.ratingTier,
          streakDays: profile?.streakDays || 0,
          totalXP: xpProfile.totalXP,
          level: xpProfile.level,
          currentLevelXP: xpProfile.currentLevelXP,
          nextLevelXP: xpProfile.nextLevelXP,
          progressPercent: xpProfile.progressPercent,
          rank: xpProfile.rank,
          achievements: achievementsWithStatus,
          recentXpHistory: xpProfile.history.slice(0, 10),
          recentRatingHistory: ratingSummary.history.slice(0, 10),
        },
      });
    } catch (error: any) {
      logger.error(`[GamificationController] Error fetching gamification profile: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch gamification profile" });
    }
  }

  static async getRatingHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const history = await RatingRepository.getRatingHistory(userId);
      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      logger.error(`[GamificationController] Error fetching rating history: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch rating history" });
    }
  }

  static async getXPHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const history = await XPRepository.getXPHistory(userId);
      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      logger.error(`[GamificationController] Error fetching XP history: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch XP history" });
    }
  }

  static async getAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const [all, userUnlocked] = await Promise.all([
        AchievementRepository.findAll(),
        AchievementRepository.findUserAchievements(userId),
      ]);

      const catalog = all.map((ach) => {
        const match = userUnlocked.find((u) => u.badgeCode === ach.badgeCode);
        return {
          ...ach,
          unlocked: !!match,
          unlockedAt: match?.unlockedAt,
          progressValue: match ? match.progressValue : 0,
        };
      });

      res.json({
        success: true,
        data: catalog,
      });
    } catch (error: any) {
      logger.error(`[GamificationController] Error fetching achievements: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch achievements" });
    }
  }

  static async awardXP(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const { amount, source, description } = req.body;

      if (!amount || !source) {
        res.status(400).json({ success: false, error: "Amount and source are required" });
        return;
      }

      const result = await XPRepository.recordXP(
        userId,
        Number(amount),
        source,
        description || `Earned ${amount} XP from ${source}`
      );

      // Check for any newly triggered achievements
      const newlyUnlocked = await AchievementRepository.evaluateAndUnlockAchievements(userId);

      res.json({
        success: true,
        data: {
          ...result,
          newlyUnlocked,
        },
      });
    } catch (error: any) {
      logger.error(`[GamificationController] Error awarding XP: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to award XP" });
    }
  }

  static async checkAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const newlyUnlocked = await AchievementRepository.evaluateAndUnlockAchievements(userId);
      res.json({
        success: true,
        data: newlyUnlocked,
      });
    } catch (error: any) {
      logger.error(`[GamificationController] Error checking achievements: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to evaluate achievements" });
    }
  }
}
