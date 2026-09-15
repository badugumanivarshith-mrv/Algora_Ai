import { Request, Response } from "express";
import { ProjectWorkspaceService } from "../services/ai/projectWorkspaceService";
import { TaskPlanningService } from "../services/ai/taskPlanningService";
import { ProjectReviewService } from "../services/ai/projectReviewService";
import { ProjectAnalyticsService } from "../services/ai/projectAnalyticsService";
import { ProjectRecommendationService } from "../services/ai/projectRecommendationService";
import { InternshipMentorService } from "../services/ai/internshipMentorService";
import { ProjectSkillTrackingService } from "../services/ai/projectSkillTrackingService";
import { ProjectWorkspaceRepository } from "../repositories/projectWorkspaceRepository";
import { logger } from "../utils/logger";

export class ProjectWorkspaceController {
  // Workspaces
  public static async createWorkspace(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const workspace = await ProjectWorkspaceService.createWorkspace(userId, req.body);
      return res.json({ success: true, data: workspace });
    } catch (e: any) {
      logger.error(`createWorkspace error: ${e.message}`);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getWorkspaces(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const workspaces = await ProjectWorkspaceService.listWorkspaces(userId);
      return res.json({ success: true, data: workspaces });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getWorkspace(req: Request, res: Response) {
    try {
      const workspace = await ProjectWorkspaceService.getWorkspace(req.params.id);
      return res.json({ success: true, data: workspace });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Tasks
  public static async createTask(req: Request, res: Response) {
    try {
      const task = await ProjectWorkspaceRepository.createTask(req.body);
      return res.json({ success: true, data: task });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async updateTask(req: Request, res: Response) {
    try {
      const task = await ProjectWorkspaceRepository.updateTask(req.params.id, req.body);
      if (req.body.status === 'Completed') {
        const userId = (req as any).user?.id || "usr_demo";
        await ProjectSkillTrackingService.trackSkillGrowth(task.workspace_id, userId, 'TaskCompletion', { tags: [task.title] });
      }
      return res.json({ success: true, data: task });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Milestones
  public static async createMilestone(req: Request, res: Response) {
    try {
      const milestone = await ProjectWorkspaceRepository.createMilestone(req.body);
      return res.json({ success: true, data: milestone });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getMilestones(req: Request, res: Response) {
    try {
      const milestones = await ProjectWorkspaceRepository.getMilestones(req.params.workspaceId);
      return res.json({ success: true, data: milestones });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // AI Features
  public static async reviewProject(req: Request, res: Response) {
    try {
      const { workspaceId, submissionUrl } = req.body;
      const workspace = await ProjectWorkspaceService.getWorkspace(workspaceId);
      if (!workspace) return res.status(404).json({ success: false, error: "Workspace not found" });

      const review = await ProjectReviewService.reviewProject(workspace.name, workspace.description || "", submissionUrl);
      return res.json({ success: true, data: review });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const recommendations = await ProjectRecommendationService.recommendProjects(userId);
      return res.json({ success: true, data: recommendations });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const userId = (req as any).user?.id || "usr_demo";
      if (workspaceId) {
        const analytics = await ProjectAnalyticsService.computeWorkspaceAnalytics(workspaceId);
        return res.json({ success: true, data: analytics });
      } else {
        const summary = await ProjectAnalyticsService.getUserProjectSummary(userId);
        return res.json({ success: true, data: summary });
      }
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Internships
  public static async createInternship(req: Request, res: Response) {
    try {
      const internship = await ProjectWorkspaceRepository.createInternship(req.body);
      return res.json({ success: true, data: internship });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getInternships(req: Request, res: Response) {
    try {
      const internships = await ProjectWorkspaceRepository.listInternships();
      return res.json({ success: true, data: internships });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async applyInternship(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const application = await ProjectWorkspaceRepository.applyInternship(req.body.internshipId, userId);
      return res.json({ success: true, data: application });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Skills
  public static async getSkills(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const skills = await ProjectSkillTrackingService.getUserSkillMetrics(userId);
      return res.json({ success: true, data: skills });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
}
