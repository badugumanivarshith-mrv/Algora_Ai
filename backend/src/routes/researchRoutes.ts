import { Router } from "express";
import { ResearchController } from "../controllers/researchController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

// Research
router.post("/projects", optionalAuth, ResearchController.createProject);
router.get("/projects", optionalAuth, ResearchController.listProjects);
router.get("/projects/:id", optionalAuth, ResearchController.getProject);
router.post("/papers", optionalAuth, ResearchController.savePaper);
router.post("/literature-review", optionalAuth, ResearchController.createLiteratureReview);
router.get("/analytics", optionalAuth, ResearchController.getAnalytics);

// Open Source
router.post("/opensource/project", optionalAuth, ResearchController.createOSSProject);
router.post("/opensource/contribution", optionalAuth, ResearchController.saveContribution);

// Innovation
router.post("/innovation/evaluate", optionalAuth, ResearchController.evaluateIdea);
router.post("/mvp", optionalAuth, ResearchController.createMvpRoadmap);

export default router;
