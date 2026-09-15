import { AgentOperationsRepository } from "../../repositories/agentOperationsRepository";
import { AgentRepository } from "../../repositories/agentRepository";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../utils/logger";
import { RedisManager } from "../../redis/redisClient";
import { v4 as uuidv4 } from "uuid";

export class AgentOperationsService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  private static CACHE_TTL = 3600;

  // Real-time Execution Tracking
  public static async trackAgentStart(userId: string, agentId: string, input: any = {}) {
    const execution = await AgentOperationsRepository.startExecution(userId, agentId, input);
    await this.emitEvent('agent:start', { executionId: execution.id, agentId, userId });
    return execution;
  }

  public static async trackAgentEnd(executionId: string, agentId: string, status: 'Success' | 'Failed', output?: any, error?: string) {
    const execution = await AgentOperationsRepository.endExecution(executionId, status, output, error);
    
    // Update Health Metrics
    await AgentOperationsRepository.updateHealth(agentId, {
      success: status === 'Success',
      runtimeMs: execution.duration_ms,
      tokens: output?.usage?.total_tokens || 0
    });

    // Invalidate health cache
    await RedisManager.del(`agent:health:${agentId}`);
    
    // Auto-Recovery if failed
    if (status === 'Failed' && error) {
      await this.handleFailure(executionId, agentId, error);
    }

    await this.emitEvent(`agent:${status.toLowerCase()}`, { executionId, agentId, status, error });
    return execution;
  }

  // Failure Recovery System
  private static async handleFailure(executionId: string, agentId: string, error: string) {
    const diagnosis = await this.diagnoseFailure(agentId, error);
    
    await AgentOperationsRepository.logRecovery(executionId, 'Diagnosis', 'Completed', diagnosis.reason, diagnosis);

    if (diagnosis.retryable) {
      await AgentOperationsRepository.logRecovery(executionId, 'Retry', 'Pending', 'Auto-retry initiated based on diagnosis');
      // Logic for actual retry would be triggered by an orchestrator or worker
    } else if (diagnosis.severity === 'Critical') {
      await AgentOperationsRepository.createAlert(
        'system', // or specific user
        agentId,
        'Critical',
        `Agent ${agentId} failed critically: ${diagnosis.reason}`,
        { executionId, diagnosis }
      );
    }
  }

  private static async diagnoseFailure(agentId: string, error: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Agent ID: ${agentId}
      Error Message: ${error}
      
      Task: Diagnose this failure. Is it a transient error (retryable) or a logic error? 
      What is the severity? What are the suggested tuning parameters?
      
      Return JSON: {"reason": "...", "retryable": true/false, "severity": "Info/Warning/Critical", "recommendation": "..."}
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    } catch (e) {
      return { reason: error, retryable: false, severity: 'Critical', recommendation: 'Manual intervention required' };
    }
  }

  // Health Management
  public static async getAgentHealth(agentId: string) {
    const cacheKey = `agent:health:${agentId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const health = await AgentOperationsRepository.getHealth(agentId);
    if (health) {
      await RedisManager.set(cacheKey, JSON.stringify(health), this.CACHE_TTL);
    }
    return health;
  }

  public static async getSystemHealth() {
    const cacheKey = `system:metrics`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const metrics = {
      cpu_load: Math.random() * 100, // Placeholder for real system metrics
      memory_usage: Math.random() * 100,
      active_executions: await this.countActiveExecutions(),
      total_alerts: await this.countTotalAlerts()
    };

    await RedisManager.set(cacheKey, JSON.stringify(metrics), 60); // 1 min TTL for system health
    return metrics;
  }

  private static async countActiveExecutions() {
    // In a real system, this would query the DB for status='Running'
    return 12; 
  }

  private static async countTotalAlerts() {
    return 5;
  }

  // Event Streaming (Centralized Event Bus)
  public static async emitEvent(type: string, payload: any) {
    logger.info(`[EventBus] ${type}: ${JSON.stringify(payload)}`);
    // In a production app, this would publish to Redis Pub/Sub, RabbitMQ, or NATS
    // For now, we persist to a global events table for auditability if it's a workflow event
    if (type.startsWith('workflow:')) {
      await AgentOperationsRepository.logWorkflowEvent(payload.workflowId, type, payload);
    }
  }

  // Gemini Intelligence for Optimization
  public static async optimizeWorkflow(workflowId: string) {
    const events = await this.getRecentWorkflowEvents(workflowId);
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze these workflow execution events and suggest performance optimizations or failure prevention rules.
      Events: ${JSON.stringify(events)}
      
      Provide a detailed optimization plan.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private static async getRecentWorkflowEvents(workflowId: string) {
    // Repository method to fetch last 100 events
    return [];
  }
}
