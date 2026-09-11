import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { optionalAuthMiddleware, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuthMiddleware, NotificationController.getNotifications);
router.patch("/:id/read", NotificationController.markRead);
router.post("/mark-all-read", optionalAuthMiddleware, NotificationController.markAllRead);
router.get("/announcements", NotificationController.listAnnouncements);
router.post("/broadcast", requireAuth, NotificationController.broadcast);

export default router;
