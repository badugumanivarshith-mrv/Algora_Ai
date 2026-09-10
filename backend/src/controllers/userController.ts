import { Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { AuthenticatedRequest } from "../middleware/auth";

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const profile = await UserService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const updated = await UserService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        data: updated,
        message: "Profile updated successfully.",
      });
    } catch (err) {
      next(err);
    }
  }
}
