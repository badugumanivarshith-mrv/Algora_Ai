import { Router } from "express";
import { HiringController } from "../controllers/hiringController";
import { requireAuth } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const hiringLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { error: "Too many hiring requests. Please try again later." },
});

router.use(hiringLimiter);

router.get("/assessments", requireAuth, HiringController.getAssessments);
router.get("/assessment/:id", requireAuth, HiringController.getAssessmentById);
router.post("/attempt", requireAuth, HiringController.submitAttempt);
router.post("/recruiter/evaluate", requireAuth, HiringController.evaluateRecruiterSession);
router.get("/rankings", requireAuth, HiringController.getCandidateRankings);
router.get("/predictions", requireAuth, HiringController.getHiringPredictions);
router.get("/profile", requireAuth, HiringController.getCandidateProfile);
router.get("/benchmark", requireAuth, HiringController.getBenchmark);
router.get("/pipeline", requireAuth, HiringController.getPipeline);
router.get("/analytics", requireAuth, HiringController.getAnalytics);

export const hiringRoutes = router;
export default router;
