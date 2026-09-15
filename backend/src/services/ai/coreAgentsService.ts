import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentRepository } from "../../repositories/agentRepository";
import { MasteryTrackingService } from "./masteryTrackingService";
import { HiringPredictionService } from "./hiringPredictionService";
import { ResearchRepository } from "../../repositories/researchRepository";

export class CoreAgentsService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  // 1. Learning Agent
  public static async executeLearningAgent(userId: string) {
    const mastery = await MasteryTrackingService.getUserMastery(userId);
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As a Learning Agent, analyze the user's mastery: ${JSON.stringify(mastery)}
      Identify knowledge gaps and suggest 3 learning paths.
      Provide scheduled review recommendations.
    `;
    const result = await model.generateContent(prompt);
    return { type: 'Learning', insights: result.response.text() };
  }

  // 2. Career Agent
  public static async executeCareerAgent(userId: string) {
    const predictions = await HiringPredictionService.getPredictions(userId);
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As a Career Agent, analyze the hiring predictions: ${JSON.stringify(predictions)}
      Suggest 3 target companies and optimize their preparation plan.
    `;
    const result = await model.generateContent(prompt);
    return { type: 'Career', insights: result.response.text() };
  }

  // 3. Research Agent
  public static async executeResearchAgent(userId: string) {
    const analytics = await ResearchRepository.getResearchAnalytics(userId);
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As a Research Agent, analyze these research metrics: ${JSON.stringify(analytics)}
      Suggest 2 potential research papers to read and a publication roadmap.
    `;
    const result = await model.generateContent(prompt);
    return { type: 'Research', insights: result.response.text() };
  }

  // 4. Project Agent
  public static async executeProjectAgent(userId: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As a Project Agent, analyze the user's project history.
      Recommend 2 high-impact tasks to improve their portfolio.
    `;
    const result = await model.generateContent(prompt);
    return { type: 'Project', insights: result.response.text() };
  }

  // 5. Contest Agent
  public static async executeContestAgent(userId: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As a Contest Agent, analyze the user's contest rating history.
      Recommend 3 upcoming contests and a daily training plan.
    `;
    const result = await model.generateContent(prompt);
    return { type: 'Contest', insights: result.response.text() };
  }

  // 6. Startup Agent
  public static async executeStartupAgent(userId: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      As a Startup Agent, analyze the user's innovation projects.
      Provide a growth recommendation and MVP evaluation.
    `;
    const result = await model.generateContent(prompt);
    return { type: 'Startup', insights: result.response.text() };
  }
}
