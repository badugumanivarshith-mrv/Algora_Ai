import { Request, Response, NextFunction } from "express";
import { MonitoringService } from "../services/monitoringService";
import { Database } from "../db/connection";
import { defaultAIProvider } from "../services/ai/geminiProvider";

export class MonitoringController {
  static async getApiMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = MonitoringService.getApiMetricsSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async getAIUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = MonitoringService.getAIUsageSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async getJudgeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = MonitoringService.getJudgeMetrics();
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  static async getRecentErrors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = MonitoringService.getRecentErrors();
      res.status(200).json({ success: true, data: errors });
    } catch (err) {
      next(err);
    }
  }

  static async healthDeep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dbStart = Date.now();
      let dbStatus = "healthy";
      let dbLatencyMs = 0;

      if (Database.isReady()) {
        try {
          await Database.query("SELECT 1;");
          dbLatencyMs = Date.now() - dbStart;
        } catch (err) {
          dbStatus = "degraded";
          dbLatencyMs = Date.now() - dbStart;
        }
      } else {
        dbStatus = "in_memory_fallback_healthy";
      }

      const aiAvailable = defaultAIProvider.isAvailable();
      const judgeStats = MonitoringService.getJudgeMetrics();
      const apiSummary = MonitoringService.getApiMetricsSummary();

      const isHealthy = dbStatus !== "unhealthy";

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        data: {
          status: isHealthy ? "operational" : "degraded",
          version: "1.9.0-prod",
          uptimeSeconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
          components: {
            database: {
              status: dbStatus,
              latencyMs: dbLatencyMs,
            },
            aiEngine: {
              provider: defaultAIProvider.name,
              status: aiAvailable ? "connected" : "fallback_ready",
            },
            judgeEngine: judgeStats,
            apiGateway: {
              requestsPerMinute: apiSummary.requestsPerMinute,
              avgLatencyMs: apiSummary.avgLatencyMs,
              errorRatePercent: apiSummary.errorRatePercent,
            },
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
