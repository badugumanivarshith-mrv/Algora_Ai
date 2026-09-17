import { Router } from "express";
import { ContestController } from "../controllers/contestController";
import { requireAuth } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const contestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { error: "Too many contest requests. Please try again later." },
});

router.use(contestLimiter);

router.get("/", ContestController.getContests);
router.get("/list", requireAuth, ContestController.getContests);
router.get("/:id/leaderboard", ContestController.getLeaderboardByContestId);
router.get("/detail/:id", requireAuth, ContestController.getContestById);
router.get("/:id", ContestController.getContestById);
router.post("/register", requireAuth, ContestController.registerParticipant);
router.post("/submit", requireAuth, ContestController.submitSolution);
router.post("/team", requireAuth, ContestController.createTeam);
router.get("/analytics", requireAuth, ContestController.getAnalytics);
router.post("/coach", requireAuth, ContestController.getCoachAdvice);
router.get("/replay/:contestId", requireAuth, ContestController.getReplay);

export const contestRoutes = router;
export default router;
