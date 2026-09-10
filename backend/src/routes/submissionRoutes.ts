import { Router } from "express";
import { SubmissionController } from "../controllers/submissionController";
import { optionalAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

router.get("/", optionalAuth, SubmissionController.getSubmissions);

router.post(
  "/",
  optionalAuth,
  validateBody([
    { field: "problemSlug", required: true, type: "string" },
    { field: "language", required: true, type: "string" },
    { field: "code", required: true, type: "string", minLength: 1 },
    { field: "status", required: true, type: "string" },
  ]),
  SubmissionController.createSubmission
);

export default router;
