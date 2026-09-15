import { AgentRepository } from "../../repositories/agentRepository";
import { ProductivityRepository } from "../../repositories/productivityRepository";
import { AgentOperationsRepository } from "../../repositories/agentOperationsRepository";
import { AgentOperationsService } from "./agentOperationsService";
import { logger } from "../../utils/logger";
import { Database } from "../../db/connection";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RedisManager } from "../../redis/redisClient";

export class WorkflowAutomationService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async createWorkflow(userId: string, data: any) {
    return await ProductivityRepository.saveWorkflow(userId, data);
  }

  public static async executeAutomation(userId: string, workflowId: string, triggerPayload: any) {
    const workflows = await ProductivityRepository.getWorkflows(userId);
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (!workflow || !workflow.is_active) return;

    // Track Execution
    const execution = await AgentOperationsRepository.startExecution(userId, undefined, { workflowId, triggerPayload });
    await AgentOperationsService.emitEvent('automation:start', { executionId: execution.id, workflowId, userId });

    try {
      logger.info(`[WorkflowAutomation] Executing ${workflow.name} for ${userId}`);
      
      // AI-assisted condition checking if needed
      if (workflow.condition_config && workflow.condition_config.ai_check) {
        const passed = await this.checkAICondition(workflow.condition_config.prompt, triggerPayload);
        if (!passed) {
          await this.finishExecution(execution.id, 'Skipped', { reason: 'AI Condition not met' });
          await AgentOperationsRepository.endExecution(execution.id, 'Success', { status: 'Skipped', reason: 'AI Condition not met' });
          return;
        }
      }

      // Execute Action
      const result = await this.performAction(userId, workflow.action_config, triggerPayload);

      await this.finishExecution(execution.id, 'Completed', result);
      await AgentOperationsRepository.endExecution(execution.id, 'Success', result);
      await AgentOperationsService.emitEvent('automation:success', { executionId: execution.id, workflowId, userId });
      
      // Log Metrics
      await ProductivityRepository.logMetric(userId, { workflowsExecuted: 1, timeSavedSeconds: 300 }); 
      
      // Update Redis cache for quick status checks
      await RedisManager.set(`workflow:${workflowId}:last_status`, 'Completed', 3600);
      
      return result;
    } catch (e: any) {
      logger.error(`[WorkflowAutomation] Workflow ${workflowId} failed: ${e.message}`);
      await this.finishExecution(execution.id, 'Failed', null, e.message);
      await AgentOperationsRepository.endExecution(execution.id, 'Failed', null, e.message);
      await AgentOperationsService.emitEvent('automation:failed', { executionId: execution.id, workflowId, userId, error: e.message });
      throw e;
    }
  }

  private static async checkAICondition(prompt: string, payload: any): Promise<boolean> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`
      Check if the following condition is met based on the payload.
      Condition: ${prompt}
      Payload: ${JSON.stringify(payload)}
      Respond only with JSON: {"passed": true} or {"passed": false}
    `);
    const text = result.response.text();
    try {
      const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
      return json.passed === true;
    } catch {
      return false;
    }
  }

  private static async performAction(userId: string, config: any, payload: any) {
    switch (config.type) {
      case 'create_task':
        return await AgentRepository.createTask(config.agentId, userId, {
          title: config.title_template.replace('{title}', payload.title || 'Untitled'),
          description: config.desc_template.replace('{desc}', payload.description || ''),
          priority: config.priority || 1,
          dueAt: config.due_in_days ? new Date(Date.now() + config.due_in_days * 86400000) : null
        });
      case 'send_notification':
        // Integration with NotificationRepository will be here
        return { status: 'notified' };
      default:
        return { status: 'action_performed', config };
    }
  }

  private static async finishExecution(id: string, status: string, output: any, error?: string) {
    await Database.query(
      "UPDATE workflow_executions SET status = $1, output = $2, error = $3, completed_at = CURRENT_TIMESTAMP WHERE id = $4",
      [status, JSON.stringify(output || {}), error || null, id]
    );
  }
}
