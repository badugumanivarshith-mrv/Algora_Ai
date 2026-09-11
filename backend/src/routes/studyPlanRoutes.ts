import { Router } from "express";
import { StudyPlanController } from "../controllers/studyPlanController";
import { optionalAuthMiddleware, authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuthMiddleware, StudyPlanController.getStudyPlans);
router.get("/:planId", optionalAuthMiddleware, StudyPlanController.getStudyPlanById);
router.post("/", authMiddleware, StudyPlanController.createStudyPlan);

export default router;
