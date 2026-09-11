import { Router } from "express";
import { RecommendationController } from "../controllers/recommendationController";
import { optionalAuthMiddleware, authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuthMiddleware, RecommendationController.getRecommendations);
router.post("/refresh", authMiddleware, RecommendationController.refreshAdaptiveRecommendations);
router.post("/:recId/status", authMiddleware, RecommendationController.updateStatus);

export default router;
