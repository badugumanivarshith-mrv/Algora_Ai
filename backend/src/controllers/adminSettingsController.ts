import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { systemSettingRepository } from "../repositories/systemSettingRepository";
import { adminRepository } from "../repositories/adminRepository";
import { logger } from "../utils/logger";

export class AdminSettingsController {
  public static async getSettings(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const settings = await systemSettingRepository.getAll();
      res.json({ success: true, data: settings });
    } catch (err: any) {
      logger.error(`[AdminSettings] Error getting settings: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async updateSetting(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key;
      const { value, description, category, isPublic } = req.body;
      const user = req.user;

      const updated = await systemSettingRepository.setSetting(
        key,
        value,
        description,
        category,
        isPublic,
        user?.userId
      );

      if (user) {
        await adminRepository.recordAuditLog({
          adminId: user.userId,
          adminName: user.username,
          action: "UPDATE_SYSTEM_SETTING",
          entityType: "setting",
          entityId: key,
          details: { key, value },
          ipAddress: req.ip,
        });
      }

      res.json({ success: true, data: updated, message: `Setting '${key}' updated successfully.` });
    } catch (err: any) {
      logger.error(`[AdminSettings] Error updating setting: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
