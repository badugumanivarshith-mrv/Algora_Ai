import { AgentRepository } from "../../repositories/agentRepository";
import { AgentOperationsService } from "./agentOperationsService";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export class AgentOrchestratorService {
  public static async orchestrate(userId: string, intent: string) {
    const agents = await AgentRepository.getAgents(userId);
    const profile = await AgentRepository.getProfile(userId);
    
    // Start tracking orchestration as a system execution
    const execution = await AgentOperationsService.trackAgentStart(userId, 'orchestrator', { intent });

    const systemInstruction = `
      You are the Algora AI OS Orchestrator. 
      Available Agents: ${JSON.stringify(agents.map(a => ({ id: a.id, type: a.agent_type, name: a.name })))}
      User Profile: ${JSON.stringify(profile)}
      
      Your task is to analyze the user intent and delegate it to the most appropriate agent or sequence of agents.
      If the task requires multi-agent coordination, explain the plan.
      
      User Intent: "${intent}"
    `;

    try {
      const response = await defaultAIProvider.generateRawText(systemInstruction);
      
      // Log decision
      await AgentRepository.saveMemory("orchestrator", userId, `intent_${Date.now()}`, intent, 5, { response });
      
      // End tracking
      await AgentOperationsService.trackAgentEnd(execution.id, 'orchestrator', 'Success', { response, usage: { total_tokens: 100 } });
      
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
