import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { AuthenticatedRequest } from "../middleware/auth";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.register({
        ...req.body,
        ipAddress,
        userAgent,
      });

      // Set secure cookie if desired
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: (req.body.rememberMe ? 30 : 7) * 86400000,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Account created successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.login({
        ...req.body,
        ipAddress,
        userAgent,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: (req.body.rememberMe ? 30 : 7) * 86400000,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Login successful.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        res.status(400).json({
          success: false,
          error: { code: "MISSING_REFRESH_TOKEN", message: "Refresh token is required." },
        });
        return;
      }

      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.rotateRefreshToken(token, ipAddress, userAgent);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 86400000,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Token refreshed successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Email is required." } });
        return;
      }

      const result = await AuthService.forgotPassword(email);
      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Token and newPassword are required." } });
        return;
      }

      await AuthService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        message: "Password reset successfully. Please log in with your new password.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
        return;
      }

      const result = await AuthService.sendEmailVerification(req.user.userId);
      res.status(200).json({
        success: true,
        data: result,
        message: "Verification email sent.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Verification token is required." } });
        return;
      }

      const verified = await AuthService.verifyEmail(token);
      if (!verified) {
        res.status(400).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired verification token." } });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Email verified successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      await AuthService.logout(token);
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        });
        return;
      }

      const result = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
