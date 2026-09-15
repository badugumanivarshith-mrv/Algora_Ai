import { AgentRepository } from "../../repositories/agentRepository";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RedisManager } from "../../redis/redisClient";

export class RecommendationOrchestratorService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async generateGlobalRecommendations(userId: string) {
    const profile = await AgentRepository.getProfile(userId);
    const goals = await AgentRepository.getGoals(userId);
    
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As the Algora AI OS, generate 3-5 high-priority recommendations for the user.
      Profile: ${JSON.stringify(profile)}
      Goals: ${JSON.stringify(goals)}
      
      Integrate Learning, Career, and Research opportunities.
      Format: JSON array of { category, title, content, actionUrl }
    `;

    try {
      const result = await model.generateContent(prompt);
      const recommendations = JSON.parse(result.response.text().replace(/```json|```/g, ''));
      
      for (const rec of recommendations) {
        await AgentRepository.saveRecommendation(userId, rec);
      }

      await RedisManager.set(`aios:recommendations:${userId}`, JSON.stringify(recommendations), 3600);
      return recommendations;
    } catch (e) {
      return [];
    }
  }
}
