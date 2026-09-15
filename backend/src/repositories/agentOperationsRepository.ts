import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export class AgentOperationsRepository {
  // Execution Tracking
  public static async startExecution(userId: string, agentId?: string, input: any = {}) {
    const id = `exec_${uuidv4()}`;
    const query = `
      INSERT INTO agent_executions (id, agent_id, user_id, status, input)
      VALUES ($1, $2, $3, 'Running', $4)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, agentId, userId, input]);
    return rows[0];
  }

  public static async endExecution(id: string, status: 'Success' | 'Failed', output?: any, error?: string) {
    const query = `
      UPDATE agent_executions
      SET status = $1,
          output = $2,
          error = $3,
          completed_at = CURRENT_TIMESTAMP,
          duration_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [status, output, error, id]);
    return rows[0];
  }

  public static async createExecutionStep(executionId: string, name: string, input: any = {}) {
    const id = `step_${uuidv4()}`;
    const query = `
      INSERT INTO agent_execution_steps (id, execution_id, step_name, status, input)
      VALUES ($1, $2, $3, 'Running', $4)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, executionId, name, input]);
    return rows[0];
  }

  public static async endExecutionStep(id: string, status: 'Success' | 'Failed', output?: any, error?: string) {
    const query = `
      UPDATE agent_execution_steps
      SET status = $1,
          output = $2,
          error = $3,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [status, output, error, id]);
    return rows[0];
  }

  // Workflow Events
  public static async logWorkflowEvent(workflowId: string, eventType: string, payload: any = {}) {
    const query = `
      INSERT INTO workflow_events (workflow_id, event_type, payload)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [workflowId, eventType, payload]);
    return rows[0];
  }

  // Health Management
  public static async updateHealth(agentId: string, metrics: { 
    success?: boolean; 
    runtimeMs?: number; 
    tokens?: number;
  }) {
    const query = `
      INSERT INTO agent_health (agent_id, total_executions, success_rate, failure_rate, avg_runtime_ms, total_token_usage, last_success_at, last_failure_at)
      VALUES ($1, 1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (agent_id) DO UPDATE SET
        total_executions = agent_health.total_executions + 1,
        success_rate = (agent_health.total_executions * agent_health.success_rate + EXCLUDED.success_rate) / (agent_health.total_executions + 1),
        failure_rate = (agent_health.total_executions * agent_health.failure_rate + EXCLUDED.failure_rate) / (agent_health.total_executions + 1),
        avg_runtime_ms = (agent_health.total_executions * agent_health.avg_runtime_ms + EXCLUDED.avg_runtime_ms) / (agent_health.total_executions + 1),
        total_token_usage = agent_health.total_token_usage + EXCLUDED.total_token_usage,
        last_success_at = COALESCE(EXCLUDED.last_success_at, agent_health.last_success_at),
        last_failure_at = COALESCE(EXCLUDED.last_failure_at, agent_health.last_failure_at),
        updated_at = CURRENT_TIMESTAMP,
        health_score = CASE 
          WHEN (agent_health.total_executions + 1) > 0 THEN 
            ( (agent_health.total_executions * agent_health.success_rate + EXCLUDED.success_rate) / (agent_health.total_executions + 1) ) * 100
          ELSE 100 
        END
      RETURNING *;
    `;
    const success = metrics.success ? 1 : 0;
    const failure = metrics.success ? 0 : 1;
    const runtime = metrics.runtimeMs || 0;
    const tokens = metrics.tokens || 0;
    const lastSuccess = metrics.success ? new Date() : null;
    const lastFailure = metrics.success ? null : new Date();

    const { rows } = await Database.query(query, [agentId, success, failure, runtime, tokens, lastSuccess, lastFailure]);
    return rows[0];
  }

  public static async getHealth(agentId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_health WHERE agent_id = $1;", [agentId]);
    return rows[0];
  }

  // Alerts
  public static async createAlert(userId: string, agentId: string, severity: string, message: string, metadata: any = {}) {
    const id = `alert_${uuidv4()}`;
    const query = `
      INSERT INTO agent_alerts (id, user_id, agent_id, severity, message, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, agentId, severity, message, metadata]);
    return rows[0];
  }

  public static async resolveAlert(id: string) {
    const query = `
      UPDATE agent_alerts
      SET is_resolved = TRUE,
          resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id]);
    return rows[0];
  }

  public static async getActiveAlerts(userId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_alerts WHERE user_id = $1 AND is_resolved = FALSE ORDER BY created_at DESC;", [userId]);
    return rows;
  }

  // Recovery
  public static async logRecovery(executionId: string, type: string, status: string, details: string, result: any = {}) {
    const id = `recov_${uuidv4()}`;
    const query = `
      INSERT INTO agent_recovery_logs (id, execution_id, recovery_type, status, details, result)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, executionId, type, status, details, result]);
    return rows[0];
  }

  // Metrics
  public static async logSystemMetric(name: string, value: number, labels: any = {}) {
    const query = `
      INSERT INTO system_metrics (metric_name, metric_value, labels)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [name, value, labels]);
    return rows[0];
  }

  public static async getSystemMetrics(name: string, limit: number = 24) {
    const { rows } = await Database.query("SELECT * FROM system_metrics WHERE metric_name = $1 ORDER BY timestamp DESC LIMIT $2;", [name, limit]);
    return rows;
  }

  // Analytics
  public static async getExecutionTimeline(userId: string, limit: number = 50) {
    const query = `
      SELECT e.*, a.name as agent_name, a.agent_type
      FROM agent_executions e
      LEFT JOIN ai_agents a ON e.agent_id = a.id
      WHERE e.user_id = $1
      ORDER BY e.started_at DESC
      LIMIT $2;
    `;
    const { rows } = await Database.query(query, [userId, limit]);
    return rows;
  }

  public static async getExecutionSteps(executionId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_execution_steps WHERE execution_id = $1 ORDER BY started_at ASC;", [executionId]);
    return rows;
  }
}
