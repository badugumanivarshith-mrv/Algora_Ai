import { Router } from "express";
import { ResearchController } from "../controllers/researchController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Research
router.post("/projects", requireAuth, ResearchController.createProject);
router.get("/projects", requireAuth, ResearchController.listProjects);
router.get("/projects/:id", requireAuth, ResearchController.getProject);
router.post("/papers", requireAuth, ResearchController.savePaper);
router.post("/literature-review", requireAuth, ResearchController.createLiteratureReview);
router.get("/analytics", requireAuth, ResearchController.getAnalytics);

// Open Source
router.post("/opensource/project", requireAuth, ResearchController.createOSSProject);
router.post("/opensource/contribution", requireAuth, ResearchController.saveContribution);

// Innovation
router.post("/innovation/evaluate", requireAuth, ResearchController.evaluateIdea);
router.post("/mvp", requireAuth, ResearchController.createMvpRoadmap);

export default router;
