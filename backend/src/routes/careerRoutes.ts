import { Router } from "express";
import { CareerController } from "../controllers/careerController";
import { requireAuth } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const careerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { error: "Too many career platform requests. Please try again later." },
});

router.use(careerLimiter);

router.get("/profile", requireAuth, CareerController.getProfile);
router.post("/profile", requireAuth, CareerController.updateProfile);

router.get("/resume", requireAuth, CareerController.getResumes);
router.post("/resume", requireAuth, CareerController.generateResume);
router.post("/resume/review", requireAuth, CareerController.reviewResume);

router.get("/jobs", requireAuth, CareerController.getJobs);

router.get("/roadmap", requireAuth, CareerController.getRoadmap);
router.post("/roadmap", requireAuth, CareerController.generateRoadmap);

router.post("/recruiter", requireAuth, CareerController.simulateRecruiter);

router.post("/portfolio", requireAuth, CareerController.analyzePortfolio);

router.get("/analytics", requireAuth, CareerController.getAnalytics);

router.get("/interviews", requireAuth, CareerController.getInterviews);
router.post("/interviews", requireAuth, CareerController.recordInterview);

router.get("/predictions", requireAuth, CareerController.getPredictions);

router.post("/coach", requireAuth, CareerController.askCoach);

export const careerRoutes = router;
