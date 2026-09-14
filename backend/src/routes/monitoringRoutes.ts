import { Router } from "express";
import { MonitoringController } from "../controllers/monitoringController";
import { OAuthController } from "../controllers/oauthController";

const router = Router();

router.get("/metrics", MonitoringController.getApiMetrics);
router.get("/ai-usage", MonitoringController.getAIUsage);
router.get("/judge-stats", MonitoringController.getJudgeStats);
router.get("/errors", MonitoringController.getRecentErrors);
router.get("/health-deep", MonitoringController.healthDeep);
router.get("/redis", MonitoringController.getRedisStats);
router.get("/cache", MonitoringController.getCacheStats);
router.get("/oauth", OAuthController.getMonitoringMetrics);

export default router;


