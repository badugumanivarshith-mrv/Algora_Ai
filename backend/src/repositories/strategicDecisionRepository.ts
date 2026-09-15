import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

export interface StrategicGoal {
  id: string;
  user_id: string;
  title: string;
  goal_type: string;
  target_role?: string;
  target_company?: string;
  current_state?: any;
  target_state?: any;
  current_position?: string;
  gap_analysis: any;
  probability_score: number;
  timeline_months?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StrategicPlan {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  roadmap_milestones: any[];
  trade_offs: any[];
  bottlenecks: string[];
  execution_velocity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionRecommendation {
  id: string;
  user_id: string;
  goal_id?: string;
  category: string;
  title: string;
  action_title: string;
  description: string;
  reasoning: string;
  priority?: string;
  expected_impact?: string;
  impact_score: number;
  urgency: string;
  effort_level?: string;
  rationale?: string;
  tradeoff_summary?: string;
  action_url?: string;
  status: string;
  metadata?: any;
  created_at: string;
}

export interface OpportunityScore {
  id: string;
  user_id: string;
  opportunity_type: string;
  title: string;
  organization: string;
  description?: string;
  opportunity_url?: string;
  match_score: number;
  relevance_score?: number;
  skill_alignment_score?: number;
  roi_score: number;
  roi_ranking?: number;
  difficulty?: string;
  deadline?: string;
  status: string;
  metadata?: any;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  user_id: string;
  risk_type: string;
  severity: string;
  title: string;
  description: string;
  impact_domain?: string;
  mitigation_strategy?: string;
  is_active: boolean;
  is_mitigated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExecutiveInsight {
  id: string;
  user_id: string;
  insight_type?: string;
  executive_summary: string;
  summary?: string;
  key_bottleneck: string;
  primary_focus_today: string;
  strategic_tradeoff: string;
  action_plan?: any[];
  confidence_level: number;
  confidence_score?: number;
  created_at: string;
}

export class StrategicDecisionRepository {
  private static memoryGoals: Map<string, StrategicGoal[]> = new Map();
  private static memoryPlans: Map<string, StrategicPlan[]> = new Map();
  private static memoryRecs: Map<string, DecisionRecommendation[]> = new Map();
  private static memoryOpps: Map<string, OpportunityScore[]> = new Map();
  private static memoryRisks: Map<string, RiskAssessment[]> = new Map();
  private static memoryInsights: Map<string, ExecutiveInsight[]> = new Map();
  private static memoryLogs: Map<string, any[]> = new Map();

  // Strategic Goals
  public static async getGoals(userId: string): Promise<StrategicGoal[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<StrategicGoal>(
          `SELECT * FROM strategic_goals WHERE user_id = $1 ORDER BY created_at DESC;`,
          [userId]
        );
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] getGoals error: ${err.message}`);
      }
    }

    return this.memoryGoals.get(userId) || [];
  }

  public static async createGoal(goal: any): Promise<StrategicGoal> {
    const userId = goal.userId || goal.user_id;
    const newGoal: StrategicGoal = {
      id: goal.id || `goal-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      title: goal.title || "Strategic Career Goal",
      goal_type: goal.goalType || goal.goal_type || "Custom",
      target_role: goal.targetRole || goal.target_role,
      target_company: goal.targetCompany || goal.target_company,
      current_state: goal.currentState || goal.current_state,
      target_state: goal.targetState || goal.target_state,
      current_position: goal.currentPosition || goal.current_position,
      gap_analysis: goal.gapAnalysis || goal.gap_analysis || [],
      probability_score: goal.probabilityScore !== undefined ? goal.probabilityScore : (goal.probability_score || 70),
      timeline_months: goal.timelineMonths || goal.timeline_months || 6,
      status: goal.status || "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO strategic_goals (id, user_id, title, goal_type, target_role, target_company, current_state, target_state, current_position, gap_analysis, probability_score, timeline_months, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO UPDATE SET
             probability_score = EXCLUDED.probability_score,
             gap_analysis = EXCLUDED.gap_analysis,
             status = EXCLUDED.status,
             updated_at = NOW();`,
          [
            newGoal.id,
            newGoal.user_id,
            newGoal.title,
            newGoal.goal_type,
            newGoal.target_role,
            newGoal.target_company,
            JSON.stringify(newGoal.current_state || {}),
            JSON.stringify(newGoal.target_state || {}),
            newGoal.current_position || "",
            JSON.stringify(newGoal.gap_analysis || []),
            newGoal.probability_score,
            newGoal.timeline_months,
            newGoal.status,
            newGoal.created_at,
            newGoal.updated_at
          ]
        );
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] createGoal error: ${err.message}`);
      }
    }

    const current = this.memoryGoals.get(userId) || [];
    const filtered = current.filter(g => g.id !== newGoal.id);
    this.memoryGoals.set(userId, [newGoal, ...filtered]);
    return newGoal;
  }

  // Strategic Plans
  public static async upsertPlan(plan: any): Promise<StrategicPlan> {
    const userId = plan.userId || plan.user_id;
    const newPlan: StrategicPlan = {
      id: plan.id || `plan-${uuidv4().slice(0, 8)}`,
      goal_id: plan.goalId || plan.goal_id,
      user_id: userId,
      title: plan.title || "Strategic Execution Plan",
      roadmap_milestones: plan.roadmapMilestones || plan.roadmap_milestones || [],
      trade_offs: plan.tradeOffs || plan.trade_offs || [],
      bottlenecks: plan.bottlenecks || [],
      execution_velocity: plan.executionVelocity !== undefined ? plan.executionVelocity : 80.0,
      status: plan.status || "In_Progress",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const current = this.memoryPlans.get(userId) || [];
    const filtered = current.filter(p => p.id !== newPlan.id);
    this.memoryPlans.set(userId, [newPlan, ...filtered]);
    return newPlan;
  }

  // Decision Recommendations
  public static async getRecommendations(userId: string): Promise<DecisionRecommendation[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<DecisionRecommendation>(
          `SELECT * FROM decision_recommendations WHERE user_id = $1 ORDER BY impact_score DESC, created_at DESC;`,
          [userId]
        );
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] getRecommendations error: ${err.message}`);
      }
    }

    return this.memoryRecs.get(userId) || [];
  }

  public static async createRecommendation(rec: any): Promise<DecisionRecommendation> {
    const userId = rec.userId || rec.user_id;
    const title = rec.title || rec.action_title || "Strategic Recommendation";
    const newRec: DecisionRecommendation = {
      id: rec.id || `rec-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      goal_id: rec.goalId || rec.goal_id,
      category: rec.category || "General",
      title,
      action_title: title,
      description: rec.description || "",
      reasoning: rec.reasoning || rec.rationale || "",
      priority: rec.priority || "High",
      expected_impact: rec.expectedImpact || rec.expected_impact || "High",
      impact_score: rec.impactScore !== undefined ? rec.impactScore : (rec.impact_score || 8.5),
      urgency: rec.urgency || "High",
      effort_level: rec.effortLevel || rec.effort_level || "Medium",
      rationale: rec.reasoning || rec.rationale || "",
      tradeoff_summary: rec.tradeoffSummary || rec.tradeoff_summary,
      action_url: rec.actionUrl || rec.action_url,
      status: rec.status || "Pending",
      metadata: rec.metadata,
      created_at: new Date().toISOString()
    };

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO decision_recommendations (id, user_id, goal_id, category, title, action_title, description, reasoning, impact_score, urgency, status, action_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`,
          [
            newRec.id,
            newRec.user_id,
            newRec.goal_id,
            newRec.category,
            newRec.title,
            newRec.action_title,
            newRec.description,
            newRec.reasoning,
            newRec.impact_score,
            newRec.urgency,
            newRec.status,
            newRec.action_url,
            newRec.created_at
          ]
        );
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] createRecommendation error: ${err.message}`);
      }
    }

    const current = this.memoryRecs.get(userId) || [];
    const filtered = current.filter(r => r.id !== newRec.id);
    this.memoryRecs.set(userId, [newRec, ...filtered]);
    return newRec;
  }

  public static async updateRecommendationStatus(id: string, status: string): Promise<DecisionRecommendation | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<DecisionRecommendation>(
          `UPDATE decision_recommendations SET status = $1 WHERE id = $2 RETURNING *;`,
          [status, id]
        );
        if (rows.length > 0) return rows[0];
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] updateRecommendationStatus error: ${err.message}`);
      }
    }

    for (const [userId, recs] of this.memoryRecs.entries()) {
      const found = recs.find(r => r.id === id);
      if (found) {
        found.status = status;
        return found;
      }
    }
    return null;
  }

  // Opportunity Scores
  public static async getOpportunities(userId: string): Promise<OpportunityScore[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<OpportunityScore>(
          `SELECT * FROM opportunity_scores WHERE user_id = $1 ORDER BY roi_score DESC, match_score DESC;`,
          [userId]
        );
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] getOpportunities error: ${err.message}`);
      }
    }

    return this.memoryOpps.get(userId) || [];
  }

  public static async upsertOpportunity(opp: any): Promise<OpportunityScore> {
    const userId = opp.userId || opp.user_id;
    const newOpp: OpportunityScore = {
      id: opp.id || `opp-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      opportunity_type: opp.opportunityType || opp.opportunity_type || "FullTime",
      title: opp.title,
      organization: opp.organization,
      description: opp.description,
      opportunity_url: opp.opportunityUrl || opp.opportunity_url,
      match_score: opp.matchScore !== undefined ? opp.matchScore : (opp.match_score || 80),
      relevance_score: opp.relevanceScore || opp.relevance_score || 85,
      skill_alignment_score: opp.skillAlignmentScore || opp.skill_alignment_score || 85,
      roi_score: opp.roiScore !== undefined ? opp.roiScore : (opp.roi_score || 90),
      roi_ranking: opp.roiRanking || opp.roi_ranking || 1,
      difficulty: opp.difficulty || "Medium",
      deadline: opp.deadline,
      status: opp.status || "Available",
      metadata: opp.metadata,
      created_at: new Date().toISOString()
    };

    const current = this.memoryOpps.get(userId) || [];
    const filtered = current.filter(o => o.id !== newOpp.id);
    this.memoryOpps.set(userId, [newOpp, ...filtered]);
    return newOpp;
  }

  // Risk Assessments
  public static async getRisks(userId: string, onlyActive = true): Promise<RiskAssessment[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const query = onlyActive
          ? `SELECT * FROM risk_assessments WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC;`
          : `SELECT * FROM risk_assessments WHERE user_id = $1 ORDER BY created_at DESC;`;
        const { rows } = await Database.query<RiskAssessment>(query, [userId]);
        if (rows.length > 0) return rows;
      } catch (err: any) {
        logger.error(`[StrategicDecisionRepository] getRisks error: ${err.message}`);
      }
    }

    const current = this.memoryRisks.get(userId) || [];
    return onlyActive ? current.filter(r => r.is_active) : current;
  }

  public static async upsertRisk(risk: any): Promise<RiskAssessment> {
    const userId = risk.userId || risk.user_id;
    const newRisk: RiskAssessment = {
      id: risk.id || `risk-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      risk_type: risk.riskType || risk.risk_type || "General",
      severity: risk.severity || "High",
      title: risk.title,
      description: risk.description,
      impact_domain: risk.impactDomain || risk.impact_domain || "Career",
      mitigation_strategy: risk.mitigationStrategy || risk.mitigation_strategy,
      is_active: risk.isActive !== undefined ? risk.isActive : true,
      is_mitigated: risk.isMitigated !== undefined ? risk.isMitigated : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const current = this.memoryRisks.get(userId) || [];
    const filtered = current.filter(r => r.id !== newRisk.id);
    this.memoryRisks.set(userId, [newRisk, ...filtered]);
    return newRisk;
  }

  // Executive Insights
  public static async saveExecutiveInsight(insight: any): Promise<ExecutiveInsight> {
    const userId = insight.userId || insight.user_id;
    const newInsight: ExecutiveInsight = {
      id: insight.id || `insight-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      insight_type: insight.insightType || insight.insight_type || "DailyBriefing",
      executive_summary: insight.executiveSummary || insight.executive_summary || "",
      summary: insight.summary || insight.executiveSummary || "",
      key_bottleneck: insight.keyBottleneck || insight.key_bottleneck || "",
      primary_focus_today: insight.primaryFocusToday || insight.primary_focus_today || "",
      strategic_tradeoff: insight.strategicTradeoff || insight.strategic_tradeoff || "",
      action_plan: insight.actionPlan || insight.action_plan || [],
      confidence_level: insight.confidenceLevel !== undefined ? insight.confidenceLevel : (insight.confidence_level || 88),
      confidence_score: insight.confidenceScore || insight.confidence_level || 88,
      created_at: new Date().toISOString()
    };

    const current = this.memoryInsights.get(userId) || [];
    this.memoryInsights.set(userId, [newInsight, ...current]);
    return newInsight;
  }

  public static async getLatestExecutiveInsight(userId: string): Promise<ExecutiveInsight | null> {
    const current = this.memoryInsights.get(userId) || [];
    return current[0] || null;
  }

  // Strategies
  public static async getCareerStrategy(userId: string): Promise<any> {
    return {
      userId,
      focusCompanyTier: "Tier 1 Global Tech",
      timelineMonths: 6,
      hiringReadinessScore: 78.5,
      criticalMilestones: [
        "Reach 1950+ contest rating",
        "Complete distributed systems consensus implementation",
        "Conduct 5 mock technical behavioral interviews"
      ]
    };
  }

  public static async getLearningStrategy(userId: string): Promise<any> {
    return {
      userId,
      primaryFocusTopic: "Advanced Dynamic Programming",
      weeklyTimeBudgetHours: 14,
      retentionTargetPercentage: 90
    };
  }

  public static async getProjectStrategy(userId: string): Promise<any> {
    return {
      userId,
      recommendedArchitecture: "Distributed Raft Cluster",
      portfolioSignalStrength: "Senior Level Systems Depth"
    };
  }

  // Decision History
  public static async logDecision(log: any): Promise<any> {
    const userId = log.userId || log.user_id;
    const entry = {
      id: `dlog-${uuidv4().slice(0, 8)}`,
      user_id: userId,
      decision_type: log.decisionType || log.decision_type || "General",
      context: log.context || {},
      recommendation_id: log.recommendationId || log.recommendation_id,
      user_action: log.userAction || log.user_action,
      outcome_metric: log.outcomeMetric || log.outcome_metric,
      feedback: log.feedback,
      created_at: new Date().toISOString()
    };

    const current = this.memoryLogs.get(userId) || [];
    this.memoryLogs.set(userId, [entry, ...current]);
    return entry;
  }
}
