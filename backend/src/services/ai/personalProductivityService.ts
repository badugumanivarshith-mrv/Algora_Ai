import { ProductivityRepository } from "../../repositories/productivityRepository";
import { logger } from "../../utils/logger";
import { RedisManager } from "../../redis/redisClient";
import { defaultAIProvider } from "./geminiProvider";

export class PersonalProductivityService {
  public static async getAnalytics(userId: string) {
    const cacheKey = `productivity:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const metrics = await ProductivityRepository.getMetrics(userId);
    const integrations = await ProductivityRepository.getIntegrations(userId);
    const workflows = await ProductivityRepository.getWorkflows(userId);

    const analytics = {
      metrics,
      integrations: {
        total: integrations.length,
        active: integrations.filter(i => i.status === 'Connected').length
      },
      workflows: {
        total: workflows.length,
        active: workflows.filter(w => w.is_active).length
      },
      summary: this.calculateSummary(metrics)
    };

    await RedisManager.set(cacheKey, JSON.stringify(analytics), 3600);
    return analytics;
  }

  private static calculateSummary(metrics: any[]) {
    return metrics.reduce((acc, curr) => ({
      tasksCompleted: acc.tasksCompleted + curr.tasks_completed,
      workflowsExecuted: acc.workflowsExecuted + curr.workflows_executed,
      timeSavedMinutes: acc.timeSavedMinutes + Math.floor(curr.time_saved_seconds / 60)
    }), { tasksCompleted: 0, workflowsExecuted: 0, timeSavedMinutes: 0 });
  }

  public static async getAIAssistantSuggestions(userId: string) {
    const analytics = await this.getAnalytics(userId);

    const prompt = `
      Analyze the user's productivity data and suggest optimizations.
      Data: ${JSON.stringify(analytics)}
      Provide suggestions for:
      1. New automation workflows
      2. Missing integrations
      3. Bottlenecks in current task execution
      Respond with a JSON array of suggestions: [{"type": "workflow", "title": "...", "description": "..."}]
    `;

    const text = await defaultAIProvider.generateRawText(prompt);
    try {
      return JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1));
    } catch {
      return [];
    }
  }
}
