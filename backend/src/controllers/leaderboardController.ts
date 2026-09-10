import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { ProfileRepository } from "../repositories/profileRepository";
import { logger } from "../utils/logger";

export class LeaderboardController {
  static async getLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || "";
      const sortBy = ((req.query.sortBy as string) || "rating") as "rating" | "totalXP" | "streakDays";
      const currentUserId = req.user?.userId || "usr-arjun-patel";

      const leaderboard = await ProfileRepository.getLeaderboard({
        page,
        limit,
        search,
        sortBy,
        currentUserId,
      });

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error: any) {
      logger.error(`[LeaderboardController] Error fetching leaderboard: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
    }
  }
}
