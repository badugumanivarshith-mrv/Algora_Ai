import { AgentRepository } from "../../repositories/agentRepository";
import { AgentOperationsRepository } from "../../repositories/agentOperationsRepository";
import { AgentOperationsService } from "./agentOperationsService";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export interface WorkflowStep {
  id: string;
  type: 'Trigger' | 'Action' | 'Condition' | 'Decision' | 'Loop' | 'Memory' | 'Agent';
  config: any;
}

export class WorkflowEngineService {

  public static async executeWorkflow(userId: string, workflowId: string, initialInput: any = {}) {
    const workflows = await AgentRepository.getWorkflows(userId);
    const workflow = workflows.find(wf => wf.id === workflowId);
    
    if (!workflow) throw new Error("Workflow not found");

    logger.info(`[WorkflowEngine] Starting workflow: ${workflow.name} for user: ${userId}`);
    
    // Track Workflow Execution
    const execution = await AgentOperationsRepository.startExecution(userId, undefined, { workflowId, initialInput });
    await AgentOperationsService.emitEvent('workflow:start', { executionId: execution.id, workflowId, userId });
    
    let currentInput = initialInput;
    const executionLogs = [];

    try {
      for (const step of workflow.steps) {
        logger.info(`[WorkflowEngine] Executing step: ${step.type}`);
        
        // Track Step
        const stepExec = await AgentOperationsRepository.createExecutionStep(execution.id, `${step.type}_${step.id}`, currentInput);
        
        try {
          const result = await this.executeStep(userId, step, currentInput);
          await AgentOperationsRepository.endExecutionStep(stepExec.id, 'Success', result);
          
          executionLogs.push({ step: step.id, type: step.type, output: result });
          currentInput = result; // Sequential execution
        } catch (stepErr: any) {
          await AgentOperationsRepository.endExecutionStep(stepExec.id, 'Failed', null, stepErr.message);
          throw stepErr;
        }
      }

      await AgentRepository.logExecution(userId, { workflowId, success: true });
      await AgentOperationsRepository.endExecution(execution.id, 'Success', { finalOutput: currentInput });
      await AgentOperationsService.emitEvent('workflow:success', { executionId: execution.id, workflowId, userId });
      
      // Trigger background knowledge sync
      KnowledgeFabricService.syncUserKnowledge(userId).catch(e => logger.error(`Sync error: ${e}`));

      return { success: true, logs: executionLogs, finalOutput: currentInput };
    } catch (e: any) {
      logger.error(`[WorkflowEngine] Workflow failed: ${e.message}`);
      await AgentRepository.logExecution(userId, { workflowId, success: false });
      await AgentOperationsRepository.endExecution(execution.id, 'Failed', null, e.message);
      await AgentOperationsService.emitEvent('workflow:failed', { executionId: execution.id, workflowId, userId, error: e.message });
      
      return { success: false, error: e.message, partialLogs: executionLogs };
    }
  }

  private static async executeStep(userId: string, step: WorkflowStep, input: any) {
    switch (step.type) {
      case 'Agent':
        return await this.executeAgentStep(userId, step.config, input);
      case 'Memory':
        return await this.executeMemoryStep(userId, step.config, input);
      case 'Condition':
        return await this.executeConditionStep(step.config, input);
      default:
        return input;
    }
  }

  private static async executeAgentStep(userId: string, config: any, input: any) {
    const prompt = `
      Workflow Step: ${config.instruction || 'Process input'}
      Agent Role: ${config.role || 'Assistant'}
      Input Data: ${JSON.stringify(input)}
      
      Task: Perform the role-specific task on the input.
    `;
    const text = await defaultAIProvider.generateRawText(prompt);
    return { response: text, metadata: { role: config.role } };
  }

  private static async executeMemoryStep(userId: string, config: any, input: any) {
    if (config.action === 'save') {
      await AgentRepository.saveMemory(config.agentId || 'system', userId, config.key, JSON.stringify(input), config.importance || 1);
      return input;
    } else {
      const memory = await AgentRepository.getMemory(config.agentId || 'system');
      const found = memory.find(m => m.memory_key === config.key);
      return found ? JSON.parse(found.memory_value) : null;
    }
  }

  private static async executeConditionStep(config: any, input: any) {
    const prompt = `
      Condition: ${config.condition}
      Input: ${JSON.stringify(input)}
      Return "TRUE" or "FALSE" based on whether the input satisfies the condition.
    `;
    const text = await defaultAIProvider.generateRawText(prompt);
    return text.includes('TRUE');
  }

  public static async suggestWorkflow(userId: string, goal: string) {
    const prompt = `
      User Goal: "${goal}"
      As a Workflow Architect, suggest a multi-step agent workflow to achieve this goal.
      Return a JSON array of steps with types: Trigger, Action, Agent, Memory.
    `;
    return await defaultAIProvider.generateRawText(prompt);
  }
}
