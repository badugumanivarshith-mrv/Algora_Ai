import { Router } from "express";
import { ReadinessController } from "../controllers/readinessController";
import { optionalAuthMiddleware } from "../middleware/auth";

const router = Router();

router.get("/contest", optionalAuthMiddleware, ReadinessController.getContestReadiness);
router.get("/interview", optionalAuthMiddleware, ReadinessController.getInterviewReadiness);
router.get("/weak-topics", optionalAuthMiddleware, ReadinessController.getWeakTopics);

export default router;
