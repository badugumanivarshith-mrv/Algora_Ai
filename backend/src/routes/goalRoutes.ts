import { Router } from "express";
import { GoalController } from "../controllers/goalController";
import { optionalAuthMiddleware, authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuthMiddleware, GoalController.getGoals);
router.post("/", authMiddleware, GoalController.createGoal);
router.post("/:goalId/progress", authMiddleware, GoalController.recordProgress);

export default router;
