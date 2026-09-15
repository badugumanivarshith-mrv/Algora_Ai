import { Request, Response, NextFunction } from "express";
import { ProductionObservabilityService } from "../services/productionObservabilityService";
import { MonitoringService } from "../services/monitoringService";

export class ProductionObservabilityController {
  static async getHealthDetailed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deployChecks = await ProductionObservabilityService.runDeploymentHealthChecks();
      const apiSummary = MonitoringService.getApiMetricsSummary();
      const aiSummary = MonitoringService.getAIUsageSummary();

      res.status(deployChecks.success ? 200 : 503).json({
        success: deployChecks.success,
        data: {
          status: deployChecks.success ? "healthy" : "degraded",
          version: "v5.1.0-production",
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.floor(process.uptime()),
          deploymentChecks: deployChecks.checks,
          apiMetrics: apiSummary,
          aiMetrics: {
            totalRequests: aiSummary.totalRequests,
            totalCostUsd: aiSummary.totalCostUsd,
            avgLatencyMs: aiSummary.avgLatencyMs,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const limit = Number(req.query.limit) || 100;
      const logs = ProductionObservabilityService.getAuditLogs(category, limit);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  static async logAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, actorId, actorEmail, action, target, details, status, correlationId } = req.body;
      const record = ProductionObservabilityService.logAudit({
        category: category || "admin_action",
        actorId,
        actorEmail,
        action: action || "CUSTOM_ACTION",
        target,
        details: details || {},
        status: status || "success",
        correlationId: correlationId || `corr-${Math.random().toString(36).substring(2, 8)}`,
      });
      res.status(201).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  static async getDatabaseObservability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = ProductionObservabilityService.getDatabaseObservabilityStats();
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  static async getJobObservability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = ProductionObservabilityService.getJobObservabilityStats();
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  static async getIncidents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incidents = ProductionObservabilityService.getIncidents();
      res.status(200).json({ success: true, data: incidents });
    } catch (err) {
      next(err);
    }
  }

  static async createIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, severity, service, escalationTarget } = req.body;
      if (!title || !service) {
        res.status(400).json({ success: false, error: "Title and service are required" });
        return;
      }
      const inc = ProductionObservabilityService.createIncident({
        title,
        severity: severity || "SEV-3 (Moderate)",
        status: "investigating",
        service,
        escalationTarget,
      });
      res.status(201).json({ success: true, data: inc });
    } catch (err) {
      next(err);
    }
  }

  static async resolveIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { postmortem } = req.body;
      const inc = ProductionObservabilityService.resolveIncident(id, postmortem || "Resolved by operations team.");
      if (!inc) {
        res.status(404).json({ success: false, error: "Incident not found" });
        return;
      }
      res.status(200).json({ success: true, data: inc });
    } catch (err) {
      next(err);
    }
  }

  static async getReleaseRegistry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registry = ProductionObservabilityService.getReleaseRegistry();
      res.status(200).json({ success: true, data: registry });
    } catch (err) {
      next(err);
    }
  }
}
