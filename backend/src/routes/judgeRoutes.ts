import { Router } from "express";
import { judgeController } from "../controllers/judgeController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

// Run Code in Real Sandbox (open or authenticated)
router.post("/run", optionalAuth, (req, res, next) => {
  judgeController.runCode(req, res).catch(next);
});

// Submit Code for Official Judge Evaluation
router.post("/submit", optionalAuth, (req, res, next) => {
  judgeController.submitCode(req, res).catch(next);
});

// Query Job Status
router.get("/jobs/:id", (req, res, next) => {
  judgeController.getJob(req, res).catch(next);
});

// Query Scored Submission
router.get("/submissions/:id", (req, res, next) => {
  judgeController.getSubmission(req, res).catch(next);
});

// Admin Judge Monitoring Stats
router.get("/stats", (req, res, next) => {
  judgeController.getStats(req, res).catch(next);
});

export default router;
