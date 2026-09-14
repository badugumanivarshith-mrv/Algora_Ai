import { Router } from "express";
import { AdaptiveLearningController } from "../controllers/adaptiveLearningController";
import rateLimit from "express-rate-limit";

const adaptiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many adaptive AI requests, please try again later." },
});

export const adaptiveLearningRoutes = Router();

adaptiveLearningRoutes.get("/profile", adaptiveLimiter, AdaptiveLearningController.getSkillProfile);
adaptiveLearningRoutes.get("/weaknesses", adaptiveLimiter, AdaptiveLearningController.getWeaknesses);
adaptiveLearningRoutes.get("/daily-review", adaptiveLimiter, AdaptiveLearningController.getDailyReviews);
adaptiveLearningRoutes.post("/daily-review/submit", adaptiveLimiter, AdaptiveLearningController.submitDailyReview);
adaptiveLearningRoutes.get("/learning-path", adaptiveLimiter, AdaptiveLearningController.getLearningPath);
adaptiveLearningRoutes.post("/study-plan/generate", adaptiveLimiter, AdaptiveLearningController.generateStudyPlan);
adaptiveLearningRoutes.get("/recommendations", adaptiveLimiter, AdaptiveLearningController.getAdaptiveRecommendations);
