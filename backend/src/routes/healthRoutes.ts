import { Router } from "express";
import { HealthController } from "../controllers/healthController";

const router = Router();

router.get("/", HealthController.getServiceHealth);
router.get("/database", HealthController.getDatabaseHealth);

export default router;
