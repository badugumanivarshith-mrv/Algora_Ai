import { GoogleGenerativeAI } from "@google/generative-ai";
import { MasteryTrackingService } from "./masteryTrackingService";
import { KnowledgeGapService } from "./knowledgeGapService";
import { CareerProfileService } from "./careerProfileService";
import { AgentRepository } from "../../repositories/agentRepository";
import { logger } from "../../utils/logger";

export class ProjectRecommendationService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  public static async recommendProjects(userId: string) {
    try {
      const mastery = await MasteryTrackingService.getTopicMastery(userId);
      const gaps = await KnowledgeGapService.detectKnowledgeGaps(userId);
      const career = await CareerProfileService.getProfile(userId);

      // V4.0 AI OS Integration: Log to Project Agent memory
      await AgentRepository.saveMemory("project-agent", userId, `recommendations_${Date.now()}`, `Generated new project recommendations based on ${gaps.length} gaps.`, 5);

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Based on user profile:
        Mastery Scores: ${JSON.stringify(mastery)}
        Knowledge Gaps: ${JSON.stringify(gaps)}
        Career Goals: ${career?.career_goal || "Fullstack Developer"}
        
        Recommend 5 projects (mix of 3 Software Projects, 1 Research Project, and 1 Startup/Innovation Idea) the user should build to improve readiness.
        For each project include:
        - title
        - description
        - type: Software / Research / Innovation
        - targetSkills: List of skills it covers
        - difficulty: Beginner/Intermediate/Advanced
        - reason: Why it's recommended based on their gaps
        
        Return JSON list of objects.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      logger.error(`recommendProjects error: ${e.message}`);
      return [];
    }
  }
}
