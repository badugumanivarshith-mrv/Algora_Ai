import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export class MultiAgentCoordinatorService {
  public static async coordinate(userId: string, task: string, agents: any[]) {
    const prompt = `
      Coordinate the following agents to solve a task for the user.
      Task: "${task}"
      Agents Involved: ${JSON.stringify(agents.map(a => a.agent_type))}
      
      Define the sequence of interactions and what data should be passed between them.
    `;

    try {
      return await defaultAIProvider.generateRawText(prompt);
    } catch (e: any) {
      logger.error(`Coordination error: ${e.message}`);
      return "Unable to coordinate agents at this time.";
    }
  }
}
