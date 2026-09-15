import { AgentRepository } from "../../repositories/agentRepository";
import { AgentOperationsService } from "./agentOperationsService";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../utils/logger";

export class AgentOrchestratorService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async orchestrate(userId: string, intent: string) {
    const agents = await AgentRepository.getAgents(userId);
    const profile = await AgentRepository.getProfile(userId);
    
    // Start tracking orchestration as a system execution
    const execution = await AgentOperationsService.trackAgentStart(userId, 'orchestrator', { intent });

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemInstruction = `
      You are the Algora AI OS Orchestrator. 
      Available Agents: ${JSON.stringify(agents.map(a => ({ id: a.id, type: a.agent_type, name: a.name })))}
      User Profile: ${JSON.stringify(profile)}
      
      Your task is to analyze the user intent and delegate it to the most appropriate agent or sequence of agents.
      If the task requires multi-agent coordination, explain the plan.
      
      User Intent: "${intent}"
    `;

    try {
      const result = await model.generateContent(systemInstruction);
      const response = result.response.text();
      const tokens = result.response.usageMetadata?.totalTokenCount || 0;
      
      // Log decision
      await AgentRepository.saveMemory("orchestrator", userId, `intent_${Date.now()}`, intent, 5, { response });
      
      // End tracking
      await AgentOperationsService.trackAgentEnd(execution.id, 'orchestrator', 'Success', { response, usage: { total_tokens: tokens } });
      
      // Trigger background knowledge sync
      KnowledgeFabricService.syncUserKnowledge(userId).catch(e => logger.error(`Sync error: ${e}`));

      return response;
    } catch (e: any) {
      logger.error(`Orchestration failed: ${e.message}`);
      await AgentOperationsService.trackAgentEnd(execution.id, 'orchestrator', 'Failed', null, e.message);
      return "I'm having trouble coordinating my agents right now. Please try again.";
    }
  }

  public static async initializeDefaultAgents(userId: string) {
    const defaultTypes = ['Learning', 'Career', 'Research', 'Project', 'Contest', 'Startup'];
    const created = [];
    for (const type of defaultTypes) {
      const agent = await AgentRepository.createAgent(userId, {
        name: `${type} Agent`,
        agentType: type,
        config: { version: '1.0', level: 'Standard' }
      });
      created.push(agent);
    }
    return created;
  }
}
