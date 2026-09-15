import { Router } from "express";
import { ProductionObservabilityController } from "../controllers/productionObservabilityController";

const router = Router();

router.get("/health/detailed", ProductionObservabilityController.getHealthDetailed);
router.get("/audit-logs", ProductionObservabilityController.getAuditLogs);
router.post("/audit-logs", ProductionObservabilityController.logAudit);
router.get("/database", ProductionObservabilityController.getDatabaseObservability);
router.get("/jobs", ProductionObservabilityController.getJobObservability);
router.get("/incidents", ProductionObservabilityController.getIncidents);
router.post("/incidents", ProductionObservabilityController.createIncident);
router.post("/incidents/:id/resolve", ProductionObservabilityController.resolveIncident);
router.get("/releases", ProductionObservabilityController.getReleaseRegistry);

export default router;
