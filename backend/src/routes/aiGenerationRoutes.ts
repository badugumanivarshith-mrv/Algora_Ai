import { Router } from "express";
import { AIGenerationController } from "../controllers/aiGenerationController";
import { aiLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/generate/problem", aiLimiter, AIGenerationController.generateProblem);
router.post("/generate/quiz", aiLimiter, AIGenerationController.generateQuiz);
router.post("/generate/assignment", aiLimiter, AIGenerationController.generateAssignment);
router.post("/generate/interview", aiLimiter, AIGenerationController.generateInterview);
router.post("/generate/contest", aiLimiter, AIGenerationController.generateContest);

export default router;
