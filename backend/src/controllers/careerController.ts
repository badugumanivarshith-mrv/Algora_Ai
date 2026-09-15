import { Request, Response } from "express";
import { CareerProfileService } from "../services/ai/careerProfileService";
import { ResumeBuilderService } from "../services/ai/resumeBuilderService";
import { ResumeReviewerService } from "../services/ai/resumeReviewerService";
import { JobMatchService } from "../services/ai/jobMatchService";
import { CareerRoadmapService } from "../services/ai/careerRoadmapService";
import { RecruiterSimulatorService } from "../services/ai/recruiterSimulatorService";
import { PortfolioAnalyzerService } from "../services/ai/portfolioAnalyzerService";
import { CareerAnalyticsService } from "../services/ai/careerAnalyticsService";
import { InterviewHistoryService } from "../services/ai/interviewHistoryService";
import { CompanyReadinessPredictor } from "../services/ai/companyReadinessPredictor";
import { AICareerCoachService } from "../services/ai/aiCareerCoachService";
import { logger } from "../utils/logger";

export class CareerController {
  public static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const profile = await CareerProfileService.getProfile(userId);
      res.json({ success: true, profile });
    } catch (e: any) {
      logger.error(`[CareerController.getProfile] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const profile = await CareerProfileService.updateProfile(userId, req.body);
      res.json({ success: true, profile });
    } catch (e: any) {
      logger.error(`[CareerController.updateProfile] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async generateResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { title, targetRole, experienceLevel, existingSkills, projects } = req.body;
      const resume = await ResumeBuilderService.generateResume({
        userId,
        title: title || `${targetRole || "Software Engineer"} Resume`,
        targetRole: targetRole || "Software Engineer",
        experienceLevel,
        existingSkills,
        projects,
      });
      res.status(201).json({ success: true, resume });
    } catch (e: any) {
      logger.error(`[CareerController.generateResume] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getResumes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const resumes = await ResumeBuilderService.getResumes(userId);
      res.json({ success: true, resumes });
    } catch (e: any) {
      logger.error(`[CareerController.getResumes] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async reviewResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { resumeId, resumeText, targetRole } = req.body;
      const review = await ResumeReviewerService.reviewResume({
        resumeId: resumeId || `res_${Date.now()}`,
        userId,
        resumeText: resumeText || "Experienced Software Engineer with TypeScript and React background.",
        targetRole,
      });
      res.json({ success: true, review });
    } catch (e: any) {
      logger.error(`[CareerController.reviewResume] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getJobs(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { targetRole, skills } = req.query;
      let matches = await JobMatchService.getJobMatches(userId);
      if (matches.length === 0) {
        matches = await JobMatchService.matchJobs({
          userId,
          targetRole: (targetRole as string) || "Backend Engineer",
          skills: skills ? (skills as string).split(",") : ["TypeScript", "Node.js", "PostgreSQL"],
        });
      }
      res.json({ success: true, matches });
    } catch (e: any) {
      logger.error(`[CareerController.getJobs] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async generateRoadmap(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { targetCompany, targetRole, interviewDate, availableHoursPerDay } = req.body;
      const roadmap = await CareerRoadmapService.generateRoadmap({
        userId,
        targetCompany: targetCompany || "Amazon",
        targetRole: targetRole || "Software Engineer",
        interviewDate,
        availableHoursPerDay,
      });
      res.status(201).json({ success: true, roadmap });
    } catch (e: any) {
      logger.error(`[CareerController.generateRoadmap] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getRoadmap(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      let roadmap = await CareerRoadmapService.getRoadmap(userId);
      if (!roadmap) {
        roadmap = await CareerRoadmapService.generateRoadmap({
          userId,
          targetCompany: "Amazon",
          targetRole: "Software Engineer",
        });
      }
      res.json({ success: true, roadmap });
    } catch (e: any) {
      logger.error(`[CareerController.getRoadmap] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async simulateRecruiter(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { company, interviewType, candidateAnswer, transcript } = req.body;
      const result = await RecruiterSimulatorService.simulateRecruiterSession({
        userId,
        company: company || "Amazon",
        interviewType: interviewType || "Technical",
        candidateAnswer,
        transcript,
      });
      res.json({ success: true, ...result });
    } catch (e: any) {
      logger.error(`[CareerController.simulateRecruiter] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async analyzePortfolio(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { githubUsername, projectDescriptions } = req.body;
      const analysis = await PortfolioAnalyzerService.analyzePortfolio({
        userId,
        githubUsername,
        projectDescriptions,
      });
      res.json({ success: true, analysis });
    } catch (e: any) {
      logger.error(`[CareerController.analyzePortfolio] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const analytics = await CareerAnalyticsService.getAnalytics(userId);
      res.json({ success: true, analytics });
    } catch (e: any) {
      logger.error(`[CareerController.getAnalytics] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getInterviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const interviews = await InterviewHistoryService.getHistory(userId);
      res.json({ success: true, interviews });
    } catch (e: any) {
      logger.error(`[CareerController.getInterviews] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async recordInterview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const history = await InterviewHistoryService.recordInterviewHistory({
        userId,
        ...req.body,
      });
      res.status(201).json({ success: true, history });
    } catch (e: any) {
      logger.error(`[CareerController.recordInterview] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async getPredictions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const prediction = await CompanyReadinessPredictor.predictReadiness(userId);
      res.json({ success: true, prediction });
    } catch (e: any) {
      logger.error(`[CareerController.getPredictions] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public static async askCoach(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || "usr_demo";
      const { userQuery, topic, targetCompany, targetRole } = req.body;
      const advice = await AICareerCoachService.getCoachAdvice({
        userId,
        userQuery: userQuery || "How should I negotiate my Amazon L5 offer?",
        topic,
        targetCompany,
        targetRole,
      });
      res.json({ success: true, ...advice });
    } catch (e: any) {
      logger.error(`[CareerController.askCoach] Error: ${e.message}`);
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
