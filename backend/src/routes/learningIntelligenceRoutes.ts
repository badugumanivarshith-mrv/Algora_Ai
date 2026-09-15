import { Router } from "express";
import { LearningIntelligenceController } from "../controllers/learningIntelligenceController";
import { requireAuth } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const intelligenceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { error: "Too many requests to learning intelligence. Please try again later." },
});

router.use(intelligenceLimiter);

router.get("/dashboard", requireAuth, LearningIntelligenceController.getDashboard);
router.get("/graph", requireAuth, LearningIntelligenceController.getGraph);
router.get("/mastery", requireAuth, LearningIntelligenceController.getMastery);
router.post("/mastery", requireAuth, LearningIntelligenceController.updateMastery);
router.get("/gaps", requireAuth, LearningIntelligenceController.getGaps);
router.get("/predictions", requireAuth, LearningIntelligenceController.getPredictions);
router.get("/recommendations", requireAuth, LearningIntelligenceController.getRecommendations);

export const learningIntelligenceRoutes = router;
