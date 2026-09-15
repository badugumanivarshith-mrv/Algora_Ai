import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export class AgentRepository {
  // Agent Operations
  public static async createAgent(userId: string, data: any) {
    const id = `agent_${uuidv4()}`;
    const query = `
      INSERT INTO ai_agents (id, user_id, name, agent_type, status, config)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.name, data.agentType, data.status || 'Active', data.config || {}]);
    return rows[0];
  }

  public static async updateAgent(id: string, data: any) {
    const query = `
      UPDATE ai_agents
      SET name = COALESCE($1, name),
          status = COALESCE($2, status),
          config = config || $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [data.name, data.status, data.config || {}, id]);
    return rows[0];
  }

  public static async getAgents(userId: string) {
    const query = `SELECT * FROM ai_agents WHERE user_id = $1 ORDER BY created_at DESC;`;
    const { rows } = await Database.query(query, [userId]);
    return rows;
  }

  // Task Operations
  public static async createTask(agentId: string, userId: string, data: any) {
    const id = `task_${uuidv4()}`;
    const query = `
      INSERT INTO agent_tasks (id, agent_id, user_id, title, description, status, priority, metadata, due_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, agentId, userId, data.title, data.description, data.status || 'Pending', data.priority || 1, data.metadata || {}, data.dueAt]);
    return rows[0];
  }

  // Memory Operations
  public static async saveMemory(agentId: string, userId: string, key: string, value: string, importance: number = 0, metadata: any = {}) {
    const id = `mem_${uuidv4()}`;
    const query = `
      INSERT INTO agent_memory (id, agent_id, user_id, memory_key, memory_value, importance_score, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (agent_id, memory_key) DO UPDATE SET
        memory_value = EXCLUDED.memory_value,
        importance_score = EXCLUDED.importance_score,
        metadata = agent_memory.metadata || EXCLUDED.metadata,
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, agentId, userId, key, value, importance, metadata]);
    return rows[0];
  }

  public static async getMemory(agentId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_memory WHERE agent_id = $1 ORDER BY importance_score DESC, created_at DESC;", [agentId]);
    return rows;
  }

  // Workflow Operations
  public static async saveWorkflow(userId: string, data: any) {
    const id = `wf_${uuidv4()}`;
    const query = `
      INSERT INTO agent_workflows (id, user_id, name, steps, trigger_config, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.name, data.steps, data.triggerConfig || {}, data.status || 'Active']);
    return rows[0];
  }

  public static async getWorkflows(userId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_workflows WHERE user_id = $1 ORDER BY created_at DESC;", [userId]);
    return rows;
  }

  // Goal Operations
  public static async createGoal(userId: string, data: any) {
    const id = `goal_${uuidv4()}`;
    const query = `
      INSERT INTO user_goals (id, user_id, title, description, category, target_date, status, progress)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.title, data.description, data.category, data.targetDate, data.status || 'Active', data.progress || 0]);
    return rows[0];
  }

  public static async updateGoalProgress(id: string, progress: number, status?: string) {
    const query = `
      UPDATE user_goals
      SET progress = $1,
          status = COALESCE($2, status)
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [progress, status, id]);
    return rows[0];
  }

  public static async getGoals(userId: string) {
    const { rows } = await Database.query("SELECT * FROM user_goals WHERE user_id = $1 ORDER BY created_at DESC;", [userId]);
    return rows;
  }

  // Automation Operations
  public static async saveAutomation(userId: string, data: any) {
    const id = `auto_${uuidv4()}`;
    const query = `
      INSERT INTO automations (id, user_id, name, description, trigger_type, action_config, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.name, data.description, data.triggerType, data.actionConfig, data.isActive !== undefined ? data.isActive : true]);
    return rows[0];
  }

  // Recommendation Operations
  public static async saveRecommendation(userId: string, data: any) {
    const id = `rec_${uuidv4()}`;
    const query = `
      INSERT INTO ai_recommendations (id, user_id, category, title, content, action_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.category, data.title, data.content, data.actionUrl]);
    return rows[0];
  }

  public static async getRecommendations(userId: string) {
    const { rows } = await Database.query("SELECT * FROM ai_recommendations WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC;", [userId]);
    return rows;
  }

  // Profile Operations
  public static async upsertProfile(userId: string, data: any) {
    const id = `prof_${uuidv4()}`;
    const query = `
      INSERT INTO personal_ai_profiles (id, user_id, preferences, learning_style, career_focus, research_interests)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        preferences = personal_ai_profiles.preferences || EXCLUDED.preferences,
        learning_style = COALESCE(EXCLUDED.learning_style, personal_ai_profiles.learning_style),
        career_focus = COALESCE(EXCLUDED.career_focus, personal_ai_profiles.career_focus),
        research_interests = COALESCE(EXCLUDED.research_interests, personal_ai_profiles.research_interests),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.preferences || {}, data.learningStyle, data.careerFocus, data.researchInterests]);
    return rows[0];
  }

  public static async getProfile(userId: string) {
    const { rows } = await Database.query("SELECT * FROM personal_ai_profiles WHERE user_id = $1;", [userId]);
    return rows[0];
  }

  // Marketplace & Builder Operations
  public static async createTemplate(data: any) {
    const id = `tpl_${uuidv4()}`;
    const query = `
      INSERT INTO agent_templates (id, name, description, agent_type, instructions, personality, tools, memory_mode, workflow_rules)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, data.name, data.description, data.agentType, data.instructions, 
      data.personality || {}, data.tools || [], data.memoryMode || 'standard', data.workflowRules || {}
    ]);
    return rows[0];
  }

  public static async getTemplates() {
    const { rows } = await Database.query("SELECT * FROM agent_templates ORDER BY created_at DESC;");
    return rows;
  }

  public static async publishToMarketplace(userId: string, data: any) {
    const id = `mkt_${uuidv4()}`;
    const query = `
      INSERT INTO agent_marketplace (id, agent_id, template_id, author_id, name, description, category, tags, price_credits, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, data.agentId, data.templateId, userId, data.name, data.description, 
      data.category, data.tags || [], data.priceCredits || 0, data.isPublic !== undefined ? data.isPublic : true
    ]);
    return rows[0];
  }

  public static async getMarketplaceAgents(filters: any = {}) {
    let query = "SELECT * FROM agent_marketplace WHERE is_public = TRUE";
    const params = [];
    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }
    query += " ORDER BY install_count DESC, created_at DESC;";
    const { rows } = await Database.query(query, params);
    return rows;
  }

  public static async installAgent(userId: string, marketplaceId: string, configOverrides: any = {}) {
    const id = `inst_${uuidv4()}`;
    const query = `
      INSERT INTO agent_installs (id, marketplace_id, user_id, config_overrides)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (marketplace_id, user_id) DO UPDATE SET
        config_overrides = EXCLUDED.config_overrides,
        installed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, marketplaceId, userId, configOverrides]);
    
    // Increment install count
    await Database.query("UPDATE agent_marketplace SET install_count = install_count + 1 WHERE id = $1", [marketplaceId]);
    
    return rows[0];
  }

  public static async rateAgent(userId: string, marketplaceId: string, rating: number, review?: string) {
    const id = `rat_${uuidv4()}`;
    const query = `
      INSERT INTO agent_ratings (id, marketplace_id, user_id, rating, review)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (marketplace_id, user_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        review = EXCLUDED.review,
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, marketplaceId, userId, rating, review]);
    
    // Update marketplace average
    await Database.query(`
      UPDATE agent_marketplace 
      SET rating_avg = (SELECT AVG(rating) FROM agent_ratings WHERE marketplace_id = $1),
          rating_count = (SELECT COUNT(*) FROM agent_ratings WHERE marketplace_id = $1)
      WHERE id = $1
    `, [marketplaceId]);
    
    return rows[0];
  }

  // Team Operations
  public static async createTeam(userId: string, data: any) {
    const id = `team_${uuidv4()}`;
    const query = `
      INSERT INTO agent_teams (id, user_id, name, description, shared_memory_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.name, data.description, data.sharedMemoryId]);
    return rows[0];
  }

  public static async addTeamMember(teamId: string, agentId: string, role?: string) {
    const id = `tm_${uuidv4()}`;
    const query = `
      INSERT INTO agent_team_members (id, team_id, agent_id, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (team_id, agent_id) DO UPDATE SET role = EXCLUDED.role
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, teamId, agentId, role]);
    return rows[0];
  }

  public static async getTeams(userId: string) {
    const query = `
      SELECT t.*, 
             json_agg(json_build_object('id', a.id, 'name', a.name, 'type', a.agent_type, 'role', tm.role)) as members
      FROM agent_teams t
      LEFT JOIN agent_team_members tm ON t.id = tm.team_id
      LEFT JOIN ai_agents a ON tm.agent_id = a.id
      WHERE t.user_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC;
    `;
    const { rows } = await Database.query(query, [userId]);
    return rows;
  }

  // Analytics Operations
  public static async logExecution(userId: string, data: any) {
    const id = `log_${uuidv4()}`;
    const query = `
      INSERT INTO agent_usage_analytics (id, user_id, agent_id, workflow_id, team_id, execution_count, success_count, failure_count, tokens_consumed, last_executed_at)
      VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, agent_id, workflow_id, team_id) DO UPDATE SET
        execution_count = agent_usage_analytics.execution_count + 1,
        success_count = agent_usage_analytics.success_count + EXCLUDED.success_count,
        failure_count = agent_usage_analytics.failure_count + EXCLUDED.failure_count,
        tokens_consumed = agent_usage_analytics.tokens_consumed + EXCLUDED.tokens_consumed,
        last_executed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.agentId, data.workflowId, data.teamId, 
      data.success ? 1 : 0, data.success ? 0 : 1, data.tokens || 0
    ]);
    return rows[0];
  }

  public static async getAnalytics(userId: string) {
    const { rows } = await Database.query("SELECT * FROM agent_usage_analytics WHERE user_id = $1;", [userId]);
    return rows;
  }
}
