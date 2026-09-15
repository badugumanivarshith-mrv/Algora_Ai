import { AgentRepository } from "../../repositories/agentRepository";
import { defaultAIProvider } from "./geminiProvider";
import { RedisManager } from "../../redis/redisClient";

export class RecommendationOrchestratorService {
  public static async generateGlobalRecommendations(userId: string) {
    const profile = await AgentRepository.getProfile(userId);
    const goals = await AgentRepository.getGoals(userId);
    
    const prompt = `
      As the Algora AI OS, generate 3-5 high-priority recommendations for the user.
      Profile: ${JSON.stringify(profile)}
      Goals: ${JSON.stringify(goals)}
      
      Integrate Learning, Career, and Research opportunities.
      Format: JSON array of { category, title, content, actionUrl }
    `;

    try {
      const text = await defaultAIProvider.generateRawText(prompt);
      const recommendations = JSON.parse(text.replace(/```json|```/g, '').trim());
      
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
