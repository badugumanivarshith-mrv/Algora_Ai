import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface ExecutiveAgentEntity {
  id: string;
  agentType: string;
  name: string;
  role: string;
  avatarUrl?: string;
  description: string;
  mandate: string;
  coreMetrics: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface AgentCouncilRecord {
  id: string;
  userId: string;
  sessionName: string;
  status: string;
  summary: string;
  consensusScore: number;
  dominantTheme: string;
  prioritizedActions: any[];
  conflictResolutions: any[];
  createdAt: string;
}

export interface AgentRecommendationRecord {
  id: string;
  councilId: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentType: string;
  title: string;
  proposal: string;
  priorityScore: number;
  urgency: string;
  estimatedRoi: number;
  effortHours: number;
  status: string;
  createdAt: string;
}

export interface ExecutiveDebateRecord {
  id: string;
  userId: string;
  topic: string;
  challengerAgent: string;
  defenderAgent: string;
  transcript: Array<{ speaker: string; text: string; argumentType: string }>;
  winnerAgent: string;
  justification: string;
  opportunityCostAnalysis: string;
  expectedRoi: number;
  resourceAllocation: Record<string, any>;
  createdAt: string;
}

export interface ExecutiveMemoryRecord {
  id: string;
  userId: string;
  memoryType: string;
  title: string;
  context: string;
  rationale: string;
  impactScore: number;
  associatedAgents: string[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface LifePlanRecord {
  id: string;
  userId: string;
  horizon: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual";
  title: string;
  pillars: {
    learning?: { focus: string; hours: number; targets: string[] };
    career?: { focus: string; targetCompanies: string[]; targets: string[] };
    research?: { focus: string; deliverables: string[] };
    projects?: { focus: string; repoGoals: string[] };
    contests?: { targetRating: number; events: string[] };
    innovation?: { focus: string; mvpGoals: string[] };
  };
  status: string;
  completionRate: number;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicCampaignRecord {
  id: string;
  userId: string;
  campaignType: string;
  title: string;
  description: string;
  status: string;
  targetCompany?: string;
  successProbability: number;
  weeklyObjectives: Array<{ week: number; objective: string; status: string }>;
  criticalBlockers: Array<{ title: string; severity: string; mitigation: string }>;
  recoveryPlans: Array<{ triggerCondition: string; action: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMilestoneRecord {
  id: string;
  campaignId: string;
  userId: string;
  milestoneIndex: number;
  title: string;
  description: string;
  dueWeek: number;
  status: string;
  deliverables: string[];
  createdAt: string;
}

export interface OpportunityRankingRecord {
  id: string;
  userId: string;
  opportunityId: string;
  category: "Hiring" | "Competitive" | "Research" | "Open_Source" | "Startup";
  subCategory?: string;
  title: string;
  organization: string;
  matchScore: number;
  roiScore: number;
  timeCost: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Elite";
  successProbability: number;
  recommendedAction: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ExecutiveDecisionRecord {
  id: string;
  userId: string;
  title: string;
  decisionType: string;
  leadAgent: string;
  summary: string;
  tradeoffs: string;
  expectedRoi: number;
  confidenceScore: number;
  actionItems: string[];
  status: string;
  createdAt: string;
}

// In-Memory Storage for non-Postgres environments
const inMemoryAgents: Map<string, ExecutiveAgentEntity> = new Map();
const inMemoryCouncils: AgentCouncilRecord[] = [];
const inMemoryRecs: AgentRecommendationRecord[] = [];
const inMemoryDebates: ExecutiveDebateRecord[] = [];
const inMemoryMemories: ExecutiveMemoryRecord[] = [];
const inMemoryLifePlans: LifePlanRecord[] = [];
const inMemoryCampaigns: StrategicCampaignRecord[] = [];
const inMemoryMilestones: CampaignMilestoneRecord[] = [];
const inMemoryRankings: OpportunityRankingRecord[] = [];
const inMemoryDecisions: ExecutiveDecisionRecord[] = [];

export class ExecutiveCouncilRepository {
  public static async getExecutiveAgents(): Promise<ExecutiveAgentEntity[]> {
    const pool = Database.getPool();
    if (!pool) return Array.from(inMemoryAgents.values());

    try {
      const { rows } = await pool.query(
        `SELECT id, agent_type as "agentType", name, role, avatar_url as "avatarUrl", description, mandate, core_metrics as "coreMetrics", is_active as "isActive", created_at as "createdAt"
         FROM executive_agents WHERE is_active = TRUE ORDER BY name ASC;`
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to fetch agents: ${e.message}`);
      return Array.from(inMemoryAgents.values());
    }
  }

  public static async upsertExecutiveAgent(agent: ExecutiveAgentEntity): Promise<void> {
    inMemoryAgents.set(agent.id, agent);
    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO executive_agents (id, agent_type, name, role, avatar_url, description, mandate, core_metrics, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (agent_type) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           avatar_url = EXCLUDED.avatar_url,
           description = EXCLUDED.description,
           mandate = EXCLUDED.mandate,
           core_metrics = EXCLUDED.core_metrics,
           is_active = EXCLUDED.is_active;`,
        [
          agent.id,
          agent.agentType,
          agent.name,
          agent.role,
          agent.avatarUrl || null,
          agent.description,
          agent.mandate,
          JSON.stringify(agent.coreMetrics || []),
          agent.isActive !== false
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to upsert agent: ${e.message}`);
    }
  }

  public static async saveCouncil(council: AgentCouncilRecord): Promise<void> {
    inMemoryCouncils.unshift(council);
    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO agent_councils (id, user_id, session_name, status, summary, consensus_score, dominant_theme, prioritized_actions, conflict_resolutions, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           summary = EXCLUDED.summary,
           consensus_score = EXCLUDED.consensus_score,
           dominant_theme = EXCLUDED.dominant_theme,
           prioritized_actions = EXCLUDED.prioritized_actions,
           conflict_resolutions = EXCLUDED.conflict_resolutions;`,
        [
          council.id,
          council.userId,
          council.sessionName,
          council.status,
          council.summary,
          council.consensusScore,
          council.dominantTheme,
          JSON.stringify(council.prioritizedActions),
          JSON.stringify(council.conflictResolutions),
          council.createdAt
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save council: ${e.message}`);
    }
  }

  public static async getLatestCouncil(userId: string): Promise<AgentCouncilRecord | null> {
    const pool = Database.getPool();
    if (!pool) {
      return inMemoryCouncils.find(c => c.userId === userId) || null;
    }

    try {
      const { rows } = await pool.query(
        `SELECT id, user_id as "userId", session_name as "sessionName", status, summary, consensus_score as "consensusScore", dominant_theme as "dominantTheme", prioritized_actions as "prioritizedActions", conflict_resolutions as "conflictResolutions", created_at as "createdAt"
         FROM agent_councils WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;`,
        [userId]
      );
      return rows[0] || null;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get latest council: ${e.message}`);
      return inMemoryCouncils.find(c => c.userId === userId) || null;
    }
  }

  public static async saveRecommendations(recs: AgentRecommendationRecord[]): Promise<void> {
    for (const r of recs) inMemoryRecs.unshift(r);
    const pool = Database.getPool();
    if (!pool || recs.length === 0) return;

    try {
      for (const r of recs) {
        await pool.query(
          `INSERT INTO agent_recommendations (id, council_id, user_id, agent_id, agent_name, agent_type, title, proposal, priority_score, urgency, estimated_roi, effort_hours, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING;`,
          [
            r.id,
            r.councilId,
            r.userId,
            r.agentId,
            r.agentName,
            r.agentType,
            r.title,
            r.proposal,
            r.priorityScore,
            r.urgency,
            r.estimatedRoi,
            r.effortHours,
            r.status,
            r.createdAt
          ]
        );
      }
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save recommendations: ${e.message}`);
    }
  }

  public static async getRecommendationsByCouncilId(councilId: string): Promise<AgentRecommendationRecord[]> {
    const pool = Database.getPool();
    if (!pool) return inMemoryRecs.filter(r => r.councilId === councilId);

    try {
      const { rows } = await pool.query(
        `SELECT id, council_id as "councilId", user_id as "userId", agent_id as "agentId", agent_name as "agentName", agent_type as "agentType", title, proposal, priority_score as "priorityScore", urgency, estimated_roi as "estimatedRoi", effort_hours as "effortHours", status, created_at as "createdAt"
         FROM agent_recommendations WHERE council_id = $1 ORDER BY priority_score DESC;`,
        [councilId]
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get recs: ${e.message}`);
      return inMemoryRecs.filter(r => r.councilId === councilId);
    }
  }

  public static async saveDebate(debate: ExecutiveDebateRecord): Promise<void> {
    inMemoryDebates.unshift(debate);
    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO executive_debates (id, user_id, topic, challenger_agent, defender_agent, transcript, winner_agent, justification, opportunity_cost_analysis, expected_roi, resource_allocation, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING;`,
        [
          debate.id,
          debate.userId,
          debate.topic,
          debate.challengerAgent,
          debate.defenderAgent,
          JSON.stringify(debate.transcript),
          debate.winnerAgent,
          debate.justification,
          debate.opportunityCostAnalysis,
          debate.expectedRoi,
          JSON.stringify(debate.resourceAllocation),
          debate.createdAt
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save debate: ${e.message}`);
    }
  }

  public static async getDebates(userId: string): Promise<ExecutiveDebateRecord[]> {
    const pool = Database.getPool();
    if (!pool) return inMemoryDebates.filter(d => d.userId === userId);

    try {
      const { rows } = await pool.query(
        `SELECT id, user_id as "userId", topic, challenger_agent as "challengerAgent", defender_agent as "defenderAgent", transcript, winner_agent as "winnerAgent", justification, opportunity_cost_analysis as "opportunityCostAnalysis", expected_roi as "expectedRoi", resource_allocation as "resourceAllocation", created_at as "createdAt"
         FROM executive_debates WHERE user_id = $1 ORDER BY created_at DESC;`,
        [userId]
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get debates: ${e.message}`);
      return inMemoryDebates.filter(d => d.userId === userId);
    }
  }

  public static async saveMemory(memory: ExecutiveMemoryRecord): Promise<void> {
    inMemoryMemories.unshift(memory);
    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO executive_memories (id, user_id, memory_type, title, context, rationale, impact_score, associated_agents, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [
          memory.id,
          memory.userId,
          memory.memoryType,
          memory.title,
          memory.context,
          memory.rationale,
          memory.impactScore,
          JSON.stringify(memory.associatedAgents),
          JSON.stringify(memory.metadata),
          memory.createdAt
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save memory: ${e.message}`);
    }
  }

  public static async getMemories(userId: string, limit = 50): Promise<ExecutiveMemoryRecord[]> {
    const pool = Database.getPool();
    if (!pool) return inMemoryMemories.filter(m => m.userId === userId).slice(0, limit);

    try {
      const { rows } = await pool.query(
        `SELECT id, user_id as "userId", memory_type as "memoryType", title, context, rationale, impact_score as "impactScore", associated_agents as "associatedAgents", metadata, created_at as "createdAt"
         FROM executive_memories WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2;`,
        [userId, limit]
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get memories: ${e.message}`);
      return inMemoryMemories.filter(m => m.userId === userId).slice(0, limit);
    }
  }

  public static async saveLifePlan(plan: LifePlanRecord): Promise<void> {
    const idx = inMemoryLifePlans.findIndex(p => p.id === plan.id || (p.userId === plan.userId && p.horizon === plan.horizon));
    if (idx >= 0) inMemoryLifePlans[idx] = plan;
    else inMemoryLifePlans.unshift(plan);

    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO life_plans (id, user_id, horizon, title, pillars, status, completion_rate, target_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           pillars = EXCLUDED.pillars,
           status = EXCLUDED.status,
           completion_rate = EXCLUDED.completion_rate,
           target_date = EXCLUDED.target_date,
           updated_at = NOW();`,
        [
          plan.id,
          plan.userId,
          plan.horizon,
          plan.title,
          JSON.stringify(plan.pillars),
          plan.status,
          plan.completionRate,
          plan.targetDate || null,
          plan.createdAt
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save life plan: ${e.message}`);
    }
  }

  public static async getLifePlans(userId: string): Promise<LifePlanRecord[]> {
    const pool = Database.getPool();
    if (!pool) return inMemoryLifePlans.filter(p => p.userId === userId);

    try {
      const { rows } = await pool.query(
        `SELECT id, user_id as "userId", horizon, title, pillars, status, completion_rate as "completionRate", target_date as "targetDate", created_at as "createdAt", updated_at as "updatedAt"
         FROM life_plans WHERE user_id = $1 ORDER BY created_at DESC;`,
        [userId]
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get life plans: ${e.message}`);
      return inMemoryLifePlans.filter(p => p.userId === userId);
    }
  }

  public static async saveCampaign(campaign: StrategicCampaignRecord): Promise<void> {
    const idx = inMemoryCampaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) inMemoryCampaigns[idx] = campaign;
    else inMemoryCampaigns.unshift(campaign);

    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO strategic_campaigns (id, user_id, campaign_type, title, description, status, target_company, success_probability, weekly_objectives, critical_blockers, recovery_plans, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           target_company = EXCLUDED.target_company,
           success_probability = EXCLUDED.success_probability,
           weekly_objectives = EXCLUDED.weekly_objectives,
           critical_blockers = EXCLUDED.critical_blockers,
           recovery_plans = EXCLUDED.recovery_plans,
           updated_at = NOW();`,
        [
          campaign.id,
          campaign.userId,
          campaign.campaignType,
          campaign.title,
          campaign.description,
          campaign.status,
          campaign.targetCompany || null,
          campaign.successProbability,
          JSON.stringify(campaign.weeklyObjectives),
          JSON.stringify(campaign.criticalBlockers),
          JSON.stringify(campaign.recoveryPlans),
          campaign.createdAt
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save campaign: ${e.message}`);
    }
  }

  public static async getCampaigns(userId: string): Promise<StrategicCampaignRecord[]> {
    const pool = Database.getPool();
    if (!pool) return inMemoryCampaigns.filter(c => c.userId === userId);

    try {
      const { rows } = await pool.query(
        `SELECT id, user_id as "userId", campaign_type as "campaignType", title, description, status, target_company as "targetCompany", success_probability as "successProbability", weekly_objectives as "weeklyObjectives", critical_blockers as "criticalBlockers", recovery_plans as "recoveryPlans", created_at as "createdAt", updated_at as "updatedAt"
         FROM strategic_campaigns WHERE user_id = $1 ORDER BY created_at DESC;`,
        [userId]
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get campaigns: ${e.message}`);
      return inMemoryCampaigns.filter(c => c.userId === userId);
    }
  }

  public static async saveOpportunityRankings(rankings: OpportunityRankingRecord[]): Promise<void> {
    for (const r of rankings) inMemoryRankings.unshift(r);
    const pool = Database.getPool();
    if (!pool || rankings.length === 0) return;

    try {
      for (const r of rankings) {
        await pool.query(
          `INSERT INTO opportunity_rankings (id, user_id, opportunity_id, category, sub_category, title, organization, match_score, roi_score, time_cost, difficulty, success_probability, recommended_action, status, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING;`,
          [
            r.id,
            r.userId,
            r.opportunityId,
            r.category,
            r.subCategory || null,
            r.title,
            r.organization,
            r.matchScore,
            r.roiScore,
            r.timeCost,
            r.difficulty,
            r.successProbability,
            r.recommendedAction,
            r.status,
            JSON.stringify(r.metadata || {}),
            r.createdAt
          ]
        );
      }
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save opportunity rankings: ${e.message}`);
    }
  }

  public static async getOpportunityRankings(userId: string, category?: string): Promise<OpportunityRankingRecord[]> {
    const pool = Database.getPool();
    if (!pool) {
      return inMemoryRankings.filter(r => r.userId === userId && (!category || r.category === category));
    }

    try {
      let query = `SELECT id, user_id as "userId", opportunity_id as "opportunityId", category, sub_category as "subCategory", title, organization, match_score as "matchScore", roi_score as "roiScore", time_cost as "timeCost", difficulty, success_probability as "successProbability", recommended_action as "recommendedAction", status, metadata, created_at as "createdAt"
                   FROM opportunity_rankings WHERE user_id = $1`;
      const params: any[] = [userId];

      if (category) {
        query += ` AND category = $2`;
        params.push(category);
      }

      query += ` ORDER BY roi_score DESC;`;

      const { rows } = await pool.query(query, params);
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get opportunity rankings: ${e.message}`);
      return inMemoryRankings.filter(r => r.userId === userId && (!category || r.category === category));
    }
  }

  public static async saveDecision(decision: ExecutiveDecisionRecord): Promise<void> {
    inMemoryDecisions.unshift(decision);
    const pool = Database.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO executive_decisions (id, user_id, title, decision_type, lead_agent, summary, tradeoffs, expected_roi, confidence_score, action_items, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING;`,
        [
          decision.id,
          decision.userId,
          decision.title,
          decision.decisionType,
          decision.leadAgent,
          decision.summary,
          decision.tradeoffs,
          decision.expectedRoi,
          decision.confidenceScore,
          JSON.stringify(decision.actionItems),
          decision.status,
          decision.createdAt
        ]
      );
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to save decision: ${e.message}`);
    }
  }

  public static async getDecisions(userId: string): Promise<ExecutiveDecisionRecord[]> {
    const pool = Database.getPool();
    if (!pool) return inMemoryDecisions.filter(d => d.userId === userId);

    try {
      const { rows } = await pool.query(
        `SELECT id, user_id as "userId", title, decision_type as "decisionType", lead_agent as "leadAgent", summary, tradeoffs, expected_roi as "expectedRoi", confidence_score as "confidenceScore", action_items as "actionItems", status, created_at as "createdAt"
         FROM executive_decisions WHERE user_id = $1 ORDER BY created_at DESC;`,
        [userId]
      );
      return rows;
    } catch (e: any) {
      logger.error(`[ExecutiveCouncilRepo] Failed to get decisions: ${e.message}`);
      return inMemoryDecisions.filter(d => d.userId === userId);
    }
  }
}
