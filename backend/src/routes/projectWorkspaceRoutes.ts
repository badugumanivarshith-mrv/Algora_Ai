import { Router } from "express";
import { ProjectWorkspaceController } from "../controllers/projectWorkspaceController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Workspaces
router.post("/workspaces", requireAuth, ProjectWorkspaceController.createWorkspace);
router.get("/workspaces", requireAuth, ProjectWorkspaceController.getWorkspaces);
router.get("/workspaces/:id", requireAuth, ProjectWorkspaceController.getWorkspace);

// Tasks
router.post("/tasks", requireAuth, ProjectWorkspaceController.createTask);
router.put("/tasks/:id", requireAuth, ProjectWorkspaceController.updateTask);

// Milestones
router.post("/milestones", requireAuth, ProjectWorkspaceController.createMilestone);
router.get("/milestones/:workspaceId", requireAuth, ProjectWorkspaceController.getMilestones);

// AI Features
router.post("/review", requireAuth, ProjectWorkspaceController.reviewProject);
router.post("/recommendations", requireAuth, ProjectWorkspaceController.getRecommendations);
router.get("/analytics", requireAuth, ProjectWorkspaceController.getAnalytics);

// Internships
router.post("/internships", requireAuth, ProjectWorkspaceController.createInternship);
router.post("/internships/apply", requireAuth, ProjectWorkspaceController.applyInternship);
router.get("/internships", requireAuth, ProjectWorkspaceController.getInternships);

// Skills
router.get("/skills", requireAuth, ProjectWorkspaceController.getSkills);

export default router;
