import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notificationService";
import { AuthenticatedRequest } from "../middleware/auth";

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      const result = await NotificationService.getUserNotifications(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await NotificationService.markNotificationAsRead(id);
      res.status(200).json({ success: true, message: "Notification marked as read." });
    } catch (err) {
      next(err);
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-student-1";
      await NotificationService.markAllAsRead(userId);
      res.status(200).json({ success: true, message: "All notifications marked as read." });
    } catch (err) {
      next(err);
    }
  }

  static async broadcast(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, message, link } = req.body;
      if (!title || !message) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Title and message are required." } });
        return;
      }

      const notif = await NotificationService.broadcastAnnouncement({ title, message, link });
      res.status(201).json({ success: true, data: notif, message: "Announcement broadcasted successfully." });
    } catch (err) {
      next(err);
    }
  }

  static async listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await NotificationService.listAllAnnouncements();
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }
}
