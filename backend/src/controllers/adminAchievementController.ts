import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { achievementCmsRepository } from "../repositories/achievementCmsRepository";
import { adminRepository } from "../repositories/adminRepository";
import { logger } from "../utils/logger";

export class AdminAchievementController {
  public static async getAchievements(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const achievements = await achievementCmsRepository.getAll();
      res.json({ success: true, data: achievements, meta: { total: achievements.length } });
    } catch (err: any) {
      logger.error(`[AdminAchievements] Error getting achievements: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getAchievementById(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const ach = await achievementCmsRepository.getById(id);
      if (!ach) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Achievement not found" } });
        return;
      }
      res.json({ success: true, data: ach });
    } catch (err: any) {
      logger.error(`[AdminAchievements] Error getting achievement: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async createAchievement(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const body = req.body;

      if (!body.badgeCode || !body.badgeName) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "badgeCode and badgeName are required." },
        });
        return;
      }

      const created = await achievementCmsRepository.create({
        badgeCode: body.badgeCode,
        badgeName: body.badgeName,
        description: body.description || "",
        iconName: body.iconName || "Award",
        xpReward: body.xpReward || 100,
        category: body.category || "problem_solving",
        unlockCondition: body.unlockCondition || "",
        isPublished: body.isPublished ?? true,
      });

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "CREATE_ACHIEVEMENT",
          entityType: "achievement",
          entityId: created.id,
          details: { badgeName: created.badgeName, badgeCode: created.badgeCode },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({ success: true, data: created, message: "Achievement created successfully." });
    } catch (err: any) {
      logger.error(`[AdminAchievements] Error creating achievement: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async updateAchievement(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const updates = req.body;

      const updated = await achievementCmsRepository.update(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Achievement not found" } });
        return;
      }

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "UPDATE_ACHIEVEMENT",
          entityType: "achievement",
          entityId: id,
          details: { badgeName: updated.badgeName },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, data: updated, message: "Achievement updated successfully." });
    } catch (err: any) {
      logger.error(`[AdminAchievements] Error updating achievement: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async deleteAchievement(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = req.user;
      const existing = await achievementCmsRepository.getById(id);

      if (!existing) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Achievement not found" } });
        return;
      }

      await achievementCmsRepository.delete(id);

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "DELETE_ACHIEVEMENT",
          entityType: "achievement",
          entityId: id,
          details: { badgeName: existing.badgeName },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, message: `Achievement '${existing.badgeName}' deleted successfully.` });
    } catch (err: any) {
      logger.error(`[AdminAchievements] Error deleting achievement: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async togglePublish(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const ach = await achievementCmsRepository.togglePublish(id);
      if (!ach) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Achievement not found" } });
        return;
      }
      res.json({ success: true, data: ach, message: `Achievement is now ${ach.isPublished ? "published" : "hidden"}.` });
    } catch (err: any) {
      logger.error(`[AdminAchievements] Error toggling achievement: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
