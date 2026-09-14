import { Router } from "express";
import { CompanyPrepController } from "../controllers/companyPrepController";
import rateLimit from "express-rate-limit";

const companyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { success: false, error: "Too many company preparation requests, please try again later." },
});

export const companyPrepRoutes = Router();

companyPrepRoutes.get("/tracks", companyLimiter, CompanyPrepController.getTracks);
companyPrepRoutes.get("/track/:companyId", companyLimiter, CompanyPrepController.getTrackDetails);
companyPrepRoutes.get("/problems", companyLimiter, CompanyPrepController.getProblems);
companyPrepRoutes.get("/readiness/:companyId", companyLimiter, CompanyPrepController.getReadiness);
companyPrepRoutes.post("/plan/generate", companyLimiter, CompanyPrepController.generatePrepPlan);
companyPrepRoutes.post("/mock/generate", companyLimiter, CompanyPrepController.generateMockInterview);
