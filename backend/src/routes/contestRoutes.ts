import { Router } from "express";
import { ContestController } from "../controllers/contestController";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, ContestController.listContests);
router.get("/:id", optionalAuth, ContestController.getContest);
router.post("/:id/register", requireAuth, ContestController.registerContest);
router.get("/:id/leaderboard", optionalAuth, ContestController.getLeaderboard);
router.post("/:id/submit", requireAuth, ContestController.submitSolution);

export default router;
