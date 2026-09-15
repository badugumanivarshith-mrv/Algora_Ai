import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentRepository } from "../../repositories/agentRepository";
import { logger } from "../../utils/logger";

export class PersonalAIAssistantService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async getAssistantResponse(userId: string, message: string) {
    const profile = await AgentRepository.getProfile(userId);
    const recentMemory = await AgentRepository.getRecommendations(userId); // Use as context for now
    
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are the user's Personal AI Assistant in the Algora AI Operating System.
      User Profile: ${JSON.stringify(profile)}
      Recent Context: ${JSON.stringify(recentMemory.slice(0, 5))}
      
      User Message: "${message}"
      
      Provide a helpful, concise, and proactive response. If the user wants to execute a complex task, suggest which agent you can trigger.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e: any) {
      logger.error(`Assistant error: ${e.message}`);
      return "I'm here to help, but I encountered a slight error. What can I do for you?";
    }
  }
}
