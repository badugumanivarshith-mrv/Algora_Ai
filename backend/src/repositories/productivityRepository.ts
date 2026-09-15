import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export class ProductivityRepository {
  // Integration Operations
  public static async upsertIntegration(userId: string, serviceName: string, status: string, permissions: string[], metadata: any) {
    const id = `int_${uuidv4()}`;
    const query = `
      INSERT INTO external_integrations (id, user_id, service_name, status, permissions, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, service_name) DO UPDATE SET
        status = EXCLUDED.status,
        permissions = EXCLUDED.permissions,
        metadata = external_integrations.metadata || EXCLUDED.metadata,
        last_synced_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, serviceName, status, JSON.stringify(permissions), JSON.stringify(metadata)]);
    return rows[0];
  }

  public static async getIntegrations(userId: string) {
    const { rows } = await Database.query("SELECT * FROM external_integrations WHERE user_id = $1;", [userId]);
    return rows;
  }

  // Automation Workflow Operations
  public static async saveWorkflow(userId: string, data: any) {
    const id = `auto_wf_${uuidv4()}`;
    const query = `
      INSERT INTO automation_workflows (id, user_id, name, description, trigger_config, condition_config, action_config, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.name, data.description, 
      JSON.stringify(data.triggerConfig), JSON.stringify(data.conditionConfig || {}), 
      JSON.stringify(data.actionConfig), data.isActive !== undefined ? data.isActive : true
    ]);
    return rows[0];
  }

  public static async getWorkflows(userId: string) {
    const { rows } = await Database.query("SELECT * FROM automation_workflows WHERE user_id = $1 ORDER BY created_at DESC;", [userId]);
    return rows;
  }

  // Task Operations
  public static async getTasks(userId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_tasks WHERE user_id = $1 ORDER BY due_at ASC, created_at DESC;", [userId]);
    return rows;
  }

  // Productivity Metrics Operations
  public static async logMetric(userId: string, data: { tasksCompleted?: number, workflowsExecuted?: number, agentActions?: number, timeSavedSeconds?: number }) {
    const query = `
      INSERT INTO productivity_metrics (user_id, date, tasks_completed, workflows_executed, agent_actions, time_saved_seconds)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
      ON CONFLICT (user_id, date) DO UPDATE SET
        tasks_completed = productivity_metrics.tasks_completed + COALESCE(EXCLUDED.tasks_completed, 0),
        workflows_executed = productivity_metrics.workflows_executed + COALESCE(EXCLUDED.workflows_executed, 0),
        agent_actions = productivity_metrics.agent_actions + COALESCE(EXCLUDED.agent_actions, 0),
        time_saved_seconds = productivity_metrics.time_saved_seconds + COALESCE(EXCLUDED.time_saved_seconds, 0)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      userId, data.tasksCompleted || 0, data.workflowsExecuted || 0, 
      data.agentActions || 0, data.timeSavedSeconds || 0
    ]);
    return rows[0];
  }

  public static async getMetrics(userId: string, limit: number = 30) {
    const { rows } = await Database.query("SELECT * FROM productivity_metrics WHERE user_id = $1 ORDER BY date DESC LIMIT $2;", [userId, limit]);
    return rows;
  }

  // Notification Preference Operations
  public static async updateNotificationPreferences(userId: string, channels: any, categories: any) {
    const query = `
      INSERT INTO notification_preferences (user_id, channels, categories)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET
        channels = EXCLUDED.channels,
        categories = EXCLUDED.categories,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [userId, JSON.stringify(channels), JSON.stringify(categories)]);
    return rows[0];
  }

  public static async getNotificationPreferences(userId: string) {
    const { rows } = await Database.query("SELECT * FROM notification_preferences WHERE user_id = $1;", [userId]);
    return rows[0] || { channels: { in_app: true, email: true, push: false }, categories: { workflow: true, agent: true, career: true, research: true, project: true } };
  }
}
