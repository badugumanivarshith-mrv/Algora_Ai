import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireAdmin, requirePermission } from "../middleware/adminAuth";
import { AdminAuthController } from "../controllers/adminAuthController";
import { AdminProblemController } from "../controllers/adminProblemController";
import { AdminTopicController } from "../controllers/adminTopicController";
import { AdminCurriculumController } from "../controllers/adminCurriculumController";
import { AdminContestController } from "../controllers/adminContestController";
import { AdminAchievementController } from "../controllers/adminAchievementController";
import { AdminAnalyticsController } from "../controllers/adminAnalyticsController";
import { AdminSettingsController } from "../controllers/adminSettingsController";

const router = Router();

// Apply base authentication and admin verification to all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

// ==========================================
// 1. Admin Auth, Roles & Audit
// ==========================================
router.get("/me", AdminAuthController.getProfile);
router.get("/admins", requirePermission("users:manage"), AdminAuthController.getAllAdmins);
router.get("/roles", AdminAuthController.getRolesAndPermissions);
router.get("/audit-logs", AdminAuthController.getAuditLogs);

// ==========================================
// 2. Problem Management (CMS)
// ==========================================
router.get("/problems", requirePermission("problems:read"), AdminProblemController.getProblems);
router.get("/problems/:id", requirePermission("problems:read"), AdminProblemController.getProblemById);
router.post("/problems", requirePermission("problems:write"), AdminProblemController.createProblem);
router.put("/problems/:id", requirePermission("problems:write"), AdminProblemController.updateProblem);
router.delete("/problems/:id", requirePermission("problems:delete"), AdminProblemController.deleteProblem);
router.post("/problems/:id/publish", requirePermission("problems:publish"), AdminProblemController.togglePublish);
router.get("/problems/:id/versions", requirePermission("problems:read"), AdminProblemController.getVersions);

// ==========================================
// 3. Topic Management (CMS)
// ==========================================
router.get("/topics", requirePermission("topics:read"), AdminTopicController.getTopics);
router.get("/topics/:id", requirePermission("topics:read"), AdminTopicController.getTopicById);
router.post("/topics", requirePermission("topics:write"), AdminTopicController.createTopic);
router.put("/topics/:id", requirePermission("topics:write"), AdminTopicController.updateTopic);
router.delete("/topics/:id", requirePermission("topics:write"), AdminTopicController.deleteTopic);
router.post("/topics/:id/publish", requirePermission("topics:write"), AdminTopicController.togglePublish);
router.post("/topics/reorder", requirePermission("topics:write"), AdminTopicController.reorderTopics);

// ==========================================
// 4. Curriculum & Learning Path Management (CMS)
// ==========================================
router.get("/curriculum", requirePermission("curriculum:read"), AdminCurriculumController.getPaths);
router.get("/curriculum/:id", requirePermission("curriculum:read"), AdminCurriculumController.getPathById);
router.post("/curriculum", requirePermission("curriculum:write"), AdminCurriculumController.createPath);
router.put("/curriculum/:id", requirePermission("curriculum:write"), AdminCurriculumController.updatePath);
router.delete("/curriculum/:id", requirePermission("curriculum:write"), AdminCurriculumController.deletePath);
router.post("/curriculum/:pathId/modules", requirePermission("curriculum:write"), AdminCurriculumController.addModule);
router.post("/curriculum/:pathId/modules/:moduleId/lessons", requirePermission("curriculum:write"), AdminCurriculumController.addLesson);

// ==========================================
// 5. Contest Management (CMS)
// ==========================================
router.get("/contests", requirePermission("contests:read"), AdminContestController.getContests);
router.get("/contests/:id", requirePermission("contests:read"), AdminContestController.getContestById);
router.post("/contests", requirePermission("contests:write"), AdminContestController.createContest);
router.put("/contests/:id", requirePermission("contests:write"), AdminContestController.updateContest);
router.delete("/contests/:id", requirePermission("contests:write"), AdminContestController.deleteContest);
router.post("/contests/:id/problems", requirePermission("contests:write"), AdminContestController.addProblem);
router.delete("/contests/:id/problems/:problemId", requirePermission("contests:write"), AdminContestController.removeProblem);

// ==========================================
// 6. Achievement Management (CMS)
// ==========================================
router.get("/achievements", requirePermission("achievements:read"), AdminAchievementController.getAchievements);
router.get("/achievements/:id", requirePermission("achievements:read"), AdminAchievementController.getAchievementById);
router.post("/achievements", requirePermission("achievements:write"), AdminAchievementController.createAchievement);
router.put("/achievements/:id", requirePermission("achievements:write"), AdminAchievementController.updateAchievement);
router.delete("/achievements/:id", requirePermission("achievements:write"), AdminAchievementController.deleteAchievement);
router.post("/achievements/:id/publish", requirePermission("achievements:write"), AdminAchievementController.togglePublish);

// ==========================================
// 7. Platform Analytics Dashboard
// ==========================================
router.get("/analytics", requirePermission("analytics:read"), AdminAnalyticsController.getSummary);

// ==========================================
// 8. System Settings
// ==========================================
router.get("/settings", requirePermission("settings:manage"), AdminSettingsController.getSettings);
router.put("/settings/:key", requirePermission("settings:manage"), AdminSettingsController.updateSetting);

export default router;
