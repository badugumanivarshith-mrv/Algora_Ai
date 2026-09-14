import { Router } from "express";
import { CollaborationController } from "../controllers/collaborationController";
import { requireAuth } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const collabLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { error: "Too many collaboration requests. Please try again later." },
});

router.use(collabLimiter);

router.post("/rooms", requireAuth, CollaborationController.createRoom);
router.get("/rooms", requireAuth, CollaborationController.listRooms);
router.get("/rooms/:id", requireAuth, CollaborationController.getRoom);
router.post("/rooms/:id/join", requireAuth, CollaborationController.joinRoom);
router.post("/rooms/:id/leave", requireAuth, CollaborationController.leaveRoom);
router.post("/rooms/:id/code", requireAuth, CollaborationController.syncCode);
router.post("/rooms/:id/roles", requireAuth, CollaborationController.switchRoles);
router.post("/rooms/:id/interview-eval", requireAuth, CollaborationController.evaluateInterview);
router.post("/rooms/:id/messages", requireAuth, CollaborationController.sendChatMessage);
router.post("/rooms/:id/whiteboard", requireAuth, CollaborationController.syncWhiteboard);
router.get("/analytics", requireAuth, CollaborationController.getAnalytics);

export const collaborationRoutes = router;
