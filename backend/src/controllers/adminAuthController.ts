import { Response } from "express";
import { AdminAuthenticatedRequest } from "../middleware/adminAuth";
import { adminRepository } from "../repositories/adminRepository";
import { logger } from "../utils/logger";

export class AdminAuthController {
  public static async getProfile(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      return;
    }

    try {
      const adminRecord = await adminRepository.getAdminByUserId(user.userId);
      const roles = await adminRepository.getAllRoles();
      const permissions = await adminRepository.getAllPermissions();

      res.json({
        success: true,
        data: {
          user: {
            id: user.userId,
            email: user.email,
            username: user.username,
            role: user.role,
          },
          admin: adminRecord || {
            id: `adm-${user.userId}`,
            userId: user.userId,
            isSuperAdmin: true,
            roleId: "role-super-admin",
            customPermissions: ["*"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          roles,
          permissions,
        },
      });
    } catch (err: any) {
      logger.error(`[AdminAuth] Error fetching admin profile: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getAllAdmins(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admins = await adminRepository.getAllAdmins();
      res.json({ success: true, data: admins });
    } catch (err: any) {
      logger.error(`[AdminAuth] Error fetching all admins: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getRolesAndPermissions(_req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const roles = await adminRepository.getAllRoles();
      const permissions = await adminRepository.getAllPermissions();
      res.json({ success: true, data: { roles, permissions } });
    } catch (err: any) {
      logger.error(`[AdminAuth] Error fetching roles: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }

  public static async getAuditLogs(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || "50", 10);
      const logs = await adminRepository.getAuditLogs(limit);
      res.json({ success: true, data: logs });
    } catch (err: any) {
      logger.error(`[AdminAuth] Error fetching audit logs: ${err.message}`);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
}
