import { Router } from "express";
import { AnalyticsController } from "../controllers/analyticsController";
import { optionalAuthMiddleware } from "../middleware/auth";

const router = Router();

router.get("/personalization-overview", optionalAuthMiddleware, AnalyticsController.getPersonalizationOverview);
router.get("/mastery-timeline", optionalAuthMiddleware, AnalyticsController.getMasteryTimeline);
router.get("/skill-gap-analysis", optionalAuthMiddleware, AnalyticsController.getSkillGapAnalysis);

export default router;
