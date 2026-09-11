import { Router } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import submissionRoutes from "./submissionRoutes";
import contestRoutes from "./contestRoutes";
import leaderboardRoutes from "./leaderboardRoutes";
import gamificationRoutes from "./gamificationRoutes";
import dailyReviewRoutes from "./dailyReviewRoutes";
import studyPlanRoutes from "./studyPlanRoutes";
import goalRoutes from "./goalRoutes";
import recommendationRoutes from "./recommendationRoutes";
import readinessRoutes from "./readinessRoutes";
import analyticsRoutes from "./analyticsRoutes";
import adminRoutes from "./adminRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/submissions", submissionRoutes);
router.use("/contests", contestRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/gamification", gamificationRoutes);
router.use("/daily-review", dailyReviewRoutes);
router.use("/study-plans", studyPlanRoutes);
router.use("/goals", goalRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/readiness", readinessRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);

export default router;

