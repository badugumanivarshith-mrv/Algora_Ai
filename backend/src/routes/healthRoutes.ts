import { Router } from "express";
import { HealthController } from "../controllers/healthController";
import { ProductionObservabilityController } from "../controllers/productionObservabilityController";

const router = Router();

router.get("/", HealthController.getServiceHealth);
router.get("/database", HealthController.getDatabaseHealth);
router.get("/detailed", ProductionObservabilityController.getHealthDetailed);

export default router;
