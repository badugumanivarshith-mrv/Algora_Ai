import { Request, Response } from "express";
import { ResearchRepository } from "../repositories/researchRepository";
import { ResearchAssistantService } from "../services/ai/researchAssistantService";
import { LiteratureReviewService } from "../services/ai/literatureReviewService";
import { ResearchRoadmapService } from "../services/ai/researchRoadmapService";
import { InnovationLabService } from "../services/ai/innovationLabService";
import { MasteryTrackingService } from "../services/ai/masteryTrackingService";
import { RedisManager } from "../redis/redisClient";

export class ResearchController {
  // Research
  public static async createProject(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'user_1';
    const project = await ResearchRepository.createResearchProject(userId, req.body);
    res.json({ success: true, data: project });
  }

  public static async listProjects(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'user_1';
    const projects = await ResearchRepository.listResearchProjects(userId);
    res.json({ success: true, data: projects });
  }

  public static async getProject(req: Request, res: Response) {
    const { id } = req.params;
    const cacheKey = `research:project:${id}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const project = await ResearchRepository.getResearchProject(id);
    if (project) await RedisManager.set(cacheKey, JSON.stringify(project), 3600);
    res.json({ success: true, data: project });
  }

  public static async savePaper(req: Request, res: Response) {
    const paper = await ResearchRepository.saveResearchPaper(req.body);
    res.json({ success: true, data: paper });
  }

  public static async createLiteratureReview(req: Request, res: Response) {
    const { topic, papers } = req.body;
    const userId = (req as any).user?.id || 'user_1';
    const reviewText = await LiteratureReviewService.generateReview(topic, papers);
    const review = await ResearchRepository.saveLiteratureReview(userId, {
      topic,
      summary: reviewText.substring(0, 500),
      full_review: reviewText
    });
    res.json({ success: true, data: review });
  }

  public static async getAnalytics(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'user_1';
    const cacheKey = `research:analytics:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const analytics = await ResearchRepository.getResearchAnalytics(userId);
    if (analytics) await RedisManager.set(cacheKey, JSON.stringify(analytics), 3600);
    res.json({ success: true, data: analytics });
  }

  // Open Source
  public static async createOSSProject(req: Request, res: Response) {
    const project = await ResearchRepository.createOSSProject(req.body);
    res.json({ success: true, data: project });
  }

  public static async saveContribution(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'user_1';
    const contribution = await ResearchRepository.saveContribution(userId, req.body);
    res.json({ success: true, data: contribution });
  }

  // Innovation
  public static async evaluateIdea(req: Request, res: Response) {
    const evaluation = await InnovationLabService.evaluateIdea(req.body);
    res.json({ success: true, data: evaluation });
  }

  public static async createMvpRoadmap(req: Request, res: Response) {
    const { idea } = req.body;
    const userId = (req as any).user?.id || 'user_1';
    const roadmapText = await InnovationLabService.generateMvpPlan(idea);
    const roadmap = await ResearchRepository.createMvpRoadmap(userId, {
      milestones: { text: roadmapText }
    });
    res.json({ success: true, data: roadmap });
  }
}
