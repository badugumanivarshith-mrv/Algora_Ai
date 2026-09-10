import { Request, Response, NextFunction } from "express";
import { Database } from "../db/connection";

export class HealthController {
  static async getServiceHealth(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        service: "Algora API Backend",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  }

  static async getDatabaseHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await Database.checkHealth();
      res.status(health.connected ? 200 : 503).json({
        success: health.connected,
        data: health,
      });
    } catch (err) {
      next(err);
    }
  }
}
