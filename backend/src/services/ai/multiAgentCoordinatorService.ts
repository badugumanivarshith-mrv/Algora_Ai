import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../utils/logger";

export class MultiAgentCoordinatorService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async coordinate(userId: string, task: string, agents: any[]) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Coordinate the following agents to solve a task for the user.
      Task: "${task}"
      Agents Involved: ${JSON.stringify(agents.map(a => a.agent_type))}
      
      Define the sequence of interactions and what data should be passed between them.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e: any) {
      logger.error(`Coordination error: ${e.message}`);
      return "Unable to coordinate agents at this time.";
    }
  }
}
