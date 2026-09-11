import { Router } from "express";
import { AIController } from "../controllers/aiController";
import { optionalAuthMiddleware, authMiddleware } from "../middleware/auth";
import { aiLimiter } from "../middleware/rateLimit";

const router = Router();

// Mentor Chat & Conversation
router.post("/chat", aiLimiter, optionalAuthMiddleware, AIController.chat);
router.get("/conversations", optionalAuthMiddleware, AIController.getConversations);
router.get("/conversations/:conversationId/messages", optionalAuthMiddleware, AIController.getMessages);

// Real AI Assisted Tools
router.post("/hint", aiLimiter, AIController.hint);
router.post("/review", aiLimiter, AIController.reviewCode);
router.post("/complexity", aiLimiter, AIController.complexity);

// Performance Analytics & Adaptive Engine
router.get("/analyst-report", optionalAuthMiddleware, AIController.analystReport);
router.get("/recommendations", optionalAuthMiddleware, AIController.recommendations);
router.post("/recommendations/:recId/status", optionalAuthMiddleware, AIController.updateRecommendationStatus);

export default router;
