import { Router } from "express";
import { LeaderboardController } from "../controllers/leaderboardController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, LeaderboardController.getLeaderboard);

export default router;
