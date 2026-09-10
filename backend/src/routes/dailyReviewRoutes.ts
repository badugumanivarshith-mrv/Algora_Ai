import { Router } from "express";
import { DailyReviewController } from "../controllers/dailyReviewController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/queue", optionalAuth, DailyReviewController.getReviewQueue);
router.post("/complete", optionalAuth, DailyReviewController.completeReview);

export default router;
