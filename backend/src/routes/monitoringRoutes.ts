import { Router } from "express";
import { MonitoringController } from "../controllers/monitoringController";

const router = Router();

router.get("/metrics", MonitoringController.getApiMetrics);
router.get("/ai-usage", MonitoringController.getAIUsage);
router.get("/judge-stats", MonitoringController.getJudgeStats);
router.get("/errors", MonitoringController.getRecentErrors);
router.get("/health-deep", MonitoringController.healthDeep);

export default router;
