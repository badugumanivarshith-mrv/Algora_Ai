import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface DigitalTwinRecord {
  id: string;
  userId: string;
  learningProgress: Record<string, any>;
  masteryScores: Record<string, any>;
  contestRatings: Record<string, any>;
  hiringReadiness: Record<string, any>;
  researchPerformance: Record<string, any>;
  projectAchievements: Record<string, any>;
  productivityMetrics: Record<string, any>;
  strategicGoals: Record<string, any>;
  agentActivity: Record<string, any>;
  growthModels: Record<string, any>;
  riskFactors: any[];
  readinessForecast: Record<string, any>;
  updatedAt: string;
  createdAt: string;
}

export interface FutureSimulationRecord {
  id: string;
  userId: string;
  goalId?: string;
  timeframe: "30_days" | "90_days" | "6_months" | "1_year" | "3_years";
  assumptions: Record<string, any>;
  status: "Completed" | "In_Progress" | "Failed";
  createdAt: string;
  updatedAt: string;
}

export interface SimulationResultRecord {
  id: string;
  simulationId: string;
  userId: string;
  scenarioType: "Best_Case" | "Expected_Case" | "Worst_Case";
  learningGrowth: Record<string, any>;
  contestRatings: Record<string, any>;
  hiringProbability: Record<string, any>;
  researchImpact: Record<string, any>;
  careerOutcomes: Record<string, any>;
  startupPotential: Record<string, any>;
  keyMilestones: any[];
  riskAnalysis: any[];
  createdAt: string;
}

export interface AutonomousPlanRecord {
  id: string;
  userId: string;
  goalId?: string;
  planType: "Quarterly" | "Monthly" | "Weekly" | "Daily";
  title: string;
  description: string;
  roadmaps: Record<string, any>;
  milestones: any[];
  status: "Active" | "Completed" | "Paused" | "Adapted";
  executionVelocity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionActionRecord {
  id: string;
  planId?: string;
  userId: string;
  actionType: "DSA_Practice" | "System_Design" | "Contest" | "Project_Build" | "Open_Source" | "Research" | "Interview_Prep";
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  estimatedMinutes: number;
  deadline?: string;
  status: "Planned" | "Active" | "Completed" | "Failed" | "Delayed";
  workflowId?: string;
  outcomeData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionTimelineRecord {
  id: string;
  userId: string;
  eventType: "Plan_Created" | "Action_Completed" | "Milestone_Reached" | "Strategy_Adapted" | "Opportunity_Claimed" | "Risk_Mitigated" | "Simulation_Run";
  title: string;
  description: string;
  status: "Success" | "Pending" | "Warning" | "Failed";
  timestamp: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AdaptiveStrategyUpdateRecord {
  id: string;
  userId: string;
  triggerReason: string;
  stagnationMetrics: Record<string, any>;
  adjustmentsMade: any[];
  recalculatedPriorities: any[];
  recoveryWorkflowId?: string;
  createdAt: string;
}

export interface OpportunityDiscoveryRecord {
  id: string;
  userId: string;
  opportunityType: "Internship" | "Project" | "Open_Source" | "Research" | "Contest" | "Hiring_Drive" | "Certification";
  sourcePlatform: string;
  title: string;
  organization: string;
  description: string;
  opportunityUrl?: string;
  matchScore: number;
  roiScore: number;
  timeInvestment: string;
  strategicValue: string;
  recommendedAction: string;
  status: "Discovered" | "Pursuing" | "Completed" | "Dismissed";
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ExecutionPredictionRecord {
  id: string;
  userId: string;
  metricName: string;
  currentValue: number;
  predictedValue30d: number;
  predictedValue90d: number;
  confidenceLevel: number;
  modelFactors: Record<string, any>;
  createdAt: string;
}

// In-Memory Fallback Stores
const memoryDigitalTwins = new Map<string, DigitalTwinRecord>();
const memorySimulations = new Map<string, FutureSimulationRecord>();
const memorySimulationResults = new Map<string, SimulationResultRecord[]>();
const memoryAutonomousPlans = new Map<string, AutonomousPlanRecord>();
const memoryExecutionActions = new Map<string, ExecutionActionRecord>();
const memoryExecutionTimelines = new Map<string, ExecutionTimelineRecord[]>();
const memoryAdaptiveUpdates = new Map<string, AdaptiveStrategyUpdateRecord[]>();
const memoryOpportunities = new Map<string, OpportunityDiscoveryRecord>();
const memoryPredictions = new Map<string, ExecutionPredictionRecord[]>();

export class AutonomousExecutionRepository {
  // Digital Twin
  public static async upsertDigitalTwin(record: DigitalTwinRecord): Promise<DigitalTwinRecord> {
    memoryDigitalTwins.set(record.userId, record);
    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO digital_twins (
            id, user_id, learning_progress, mastery_scores, contest_ratings, hiring_readiness,
            research_performance, project_achievements, productivity_metrics, strategic_goals,
            agent_activity, growth_models, risk_factors, readiness_forecast, updated_at, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            learning_progress = EXCLUDED.learning_progress,
            mastery_scores = EXCLUDED.mastery_scores,
            contest_ratings = EXCLUDED.contest_ratings,
            hiring_readiness = EXCLUDED.hiring_readiness,
            research_performance = EXCLUDED.research_performance,
            project_achievements = EXCLUDED.project_achievements,
            productivity_metrics = EXCLUDED.productivity_metrics,
            strategic_goals = EXCLUDED.strategic_goals,
            agent_activity = EXCLUDED.agent_activity,
            growth_models = EXCLUDED.growth_models,
            risk_factors = EXCLUDED.risk_factors,
            readiness_forecast = EXCLUDED.readiness_forecast,
            updated_at = NOW()`,
          [
            record.id, record.userId, JSON.stringify(record.learningProgress), JSON.stringify(record.masteryScores),
            JSON.stringify(record.contestRatings), JSON.stringify(record.hiringReadiness), JSON.stringify(record.researchPerformance),
            JSON.stringify(record.projectAchievements), JSON.stringify(record.productivityMetrics), JSON.stringify(record.strategicGoals),
            JSON.stringify(record.agentActivity), JSON.stringify(record.growthModels), JSON.stringify(record.riskFactors),
            JSON.stringify(record.readinessForecast), record.updatedAt, record.createdAt
          ]
        );
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB upsertDigitalTwin fallback:", e);
      }
    }
    return record;
  }

  public static async getDigitalTwin(userId: string): Promise<DigitalTwinRecord | null> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<any>(
          `SELECT * FROM digital_twins WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
          [userId]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            userId: r.user_id,
            learningProgress: typeof r.learning_progress === 'string' ? JSON.parse(r.learning_progress) : r.learning_progress,
            masteryScores: typeof r.mastery_scores === 'string' ? JSON.parse(r.mastery_scores) : r.mastery_scores,
            contestRatings: typeof r.contest_ratings === 'string' ? JSON.parse(r.contest_ratings) : r.contest_ratings,
            hiringReadiness: typeof r.hiring_readiness === 'string' ? JSON.parse(r.hiring_readiness) : r.hiring_readiness,
            researchPerformance: typeof r.research_performance === 'string' ? JSON.parse(r.research_performance) : r.research_performance,
            projectAchievements: typeof r.project_achievements === 'string' ? JSON.parse(r.project_achievements) : r.project_achievements,
            productivityMetrics: typeof r.productivity_metrics === 'string' ? JSON.parse(r.productivity_metrics) : r.productivity_metrics,
            strategicGoals: typeof r.strategic_goals === 'string' ? JSON.parse(r.strategic_goals) : r.strategic_goals,
            agentActivity: typeof r.agent_activity === 'string' ? JSON.parse(r.agent_activity) : r.agent_activity,
            growthModels: typeof r.growth_models === 'string' ? JSON.parse(r.growth_models) : r.growth_models,
            riskFactors: typeof r.risk_factors === 'string' ? JSON.parse(r.risk_factors) : (r.risk_factors || []),
            readinessForecast: typeof r.readiness_forecast === 'string' ? JSON.parse(r.readiness_forecast) : r.readiness_forecast,
            updatedAt: r.updated_at,
            createdAt: r.created_at
          };
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getDigitalTwin fallback:", e);
      }
    }
    return memoryDigitalTwins.get(userId) || null;
  }

  // Future Simulations
  public static async createSimulation(sim: FutureSimulationRecord, results: SimulationResultRecord[]): Promise<FutureSimulationRecord> {
    memorySimulations.set(sim.id, sim);
    memorySimulationResults.set(sim.id, results);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO future_simulations (id, user_id, goal_id, timeframe, assumptions, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [sim.id, sim.userId, sim.goalId || null, sim.timeframe, JSON.stringify(sim.assumptions), sim.status, sim.createdAt, sim.updatedAt]
        );

        for (const res of results) {
          await Database.query(
            `INSERT INTO simulation_results (
              id, simulation_id, user_id, scenario_type, learning_growth, contest_ratings, hiring_probability,
              research_impact, career_outcomes, startup_potential, key_milestones, risk_analysis, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              res.id, res.simulationId, res.userId, res.scenarioType, JSON.stringify(res.learningGrowth),
              JSON.stringify(res.contestRatings), JSON.stringify(res.hiringProbability), JSON.stringify(res.researchImpact),
              JSON.stringify(res.careerOutcomes), JSON.stringify(res.startupPotential), JSON.stringify(res.keyMilestones),
              JSON.stringify(res.riskAnalysis), res.createdAt
            ]
          );
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB createSimulation fallback:", e);
      }
    }
    return sim;
  }

  public static async getSimulations(userId: string): Promise<{ simulation: FutureSimulationRecord; results: SimulationResultRecord[] }[]> {
    if (Database.isReady()) {
      try {
        const sims = await Database.query<any>(
          `SELECT * FROM future_simulations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
          [userId]
        );
        const out = [];
        for (const s of sims.rows) {
          const resRows = await Database.query<any>(
            `SELECT * FROM simulation_results WHERE simulation_id = $1`,
            [s.id]
          );
          out.push({
            simulation: {
              id: s.id,
              userId: s.user_id,
              goalId: s.goal_id,
              timeframe: s.timeframe,
              assumptions: typeof s.assumptions === 'string' ? JSON.parse(s.assumptions) : s.assumptions,
              status: s.status,
              createdAt: s.created_at,
              updatedAt: s.updated_at
            },
            results: resRows.rows.map(r => ({
              id: r.id,
              simulationId: r.simulation_id,
              userId: r.user_id,
              scenarioType: r.scenario_type,
              learningGrowth: typeof r.learning_growth === 'string' ? JSON.parse(r.learning_growth) : r.learning_growth,
              contestRatings: typeof r.contest_ratings === 'string' ? JSON.parse(r.contest_ratings) : r.contest_ratings,
              hiringProbability: typeof r.hiring_probability === 'string' ? JSON.parse(r.hiring_probability) : r.hiring_probability,
              researchImpact: typeof r.research_impact === 'string' ? JSON.parse(r.research_impact) : r.research_impact,
              careerOutcomes: typeof r.career_outcomes === 'string' ? JSON.parse(r.career_outcomes) : r.career_outcomes,
              startupPotential: typeof r.startup_potential === 'string' ? JSON.parse(r.startup_potential) : r.startup_potential,
              keyMilestones: typeof r.key_milestones === 'string' ? JSON.parse(r.key_milestones) : r.key_milestones,
              riskAnalysis: typeof r.risk_analysis === 'string' ? JSON.parse(r.risk_analysis) : r.risk_analysis,
              createdAt: r.created_at
            }))
          });
        }
        if (out.length > 0) return out;
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getSimulations fallback:", e);
      }
    }

    const sims = Array.from(memorySimulations.values()).filter(s => s.userId === userId);
    return sims.map(s => ({
      simulation: s,
      results: memorySimulationResults.get(s.id) || []
    }));
  }

  // Autonomous Plans & Actions
  public static async saveAutonomousPlan(plan: AutonomousPlanRecord, actions: ExecutionActionRecord[]): Promise<AutonomousPlanRecord> {
    memoryAutonomousPlans.set(plan.id, plan);
    for (const a of actions) {
      memoryExecutionActions.set(a.id, a);
    }

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO autonomous_plans (id, user_id, goal_id, plan_type, title, description, roadmaps, milestones, status, execution_velocity, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
            roadmaps = EXCLUDED.roadmaps,
            milestones = EXCLUDED.milestones,
            status = EXCLUDED.status,
            execution_velocity = EXCLUDED.execution_velocity,
            updated_at = NOW()`,
          [
            plan.id, plan.userId, plan.goalId || null, plan.planType, plan.title, plan.description,
            JSON.stringify(plan.roadmaps), JSON.stringify(plan.milestones), plan.status, plan.executionVelocity,
            plan.createdAt, plan.updatedAt
          ]
        );

        for (const action of actions) {
          await Database.query(
            `INSERT INTO execution_actions (id, plan_id, user_id, action_type, title, description, priority, estimated_minutes, deadline, status, workflow_id, outcome_data, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              outcome_data = EXCLUDED.outcome_data,
              updated_at = NOW()`,
            [
              action.id, action.planId || null, action.userId, action.actionType, action.title, action.description,
              action.priority, action.estimatedMinutes, action.deadline || null, action.status, action.workflowId || null,
              JSON.stringify(action.outcomeData || {}), action.createdAt, action.updatedAt
            ]
          );
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB saveAutonomousPlan fallback:", e);
      }
    }
    return plan;
  }

  public static async getAutonomousPlans(userId: string): Promise<{ plan: AutonomousPlanRecord; actions: ExecutionActionRecord[] }[]> {
    if (Database.isReady()) {
      try {
        const pRows = await Database.query<any>(
          `SELECT * FROM autonomous_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
          [userId]
        );
        const out = [];
        for (const p of pRows.rows) {
          const actRows = await Database.query<any>(
            `SELECT * FROM execution_actions WHERE plan_id = $1 ORDER BY priority ASC, created_at ASC`,
            [p.id]
          );
          out.push({
            plan: {
              id: p.id,
              userId: p.user_id,
              goalId: p.goal_id,
              planType: p.plan_type,
              title: p.title,
              description: p.description,
              roadmaps: typeof p.roadmaps === 'string' ? JSON.parse(p.roadmaps) : p.roadmaps,
              milestones: typeof p.milestones === 'string' ? JSON.parse(p.milestones) : p.milestones,
              status: p.status,
              executionVelocity: parseFloat(p.execution_velocity || "80.0"),
              createdAt: p.created_at,
              updatedAt: p.updated_at
            },
            actions: actRows.rows.map(a => ({
              id: a.id,
              planId: a.plan_id,
              userId: a.user_id,
              actionType: a.action_type,
              title: a.title,
              description: a.description,
              priority: a.priority,
              estimatedMinutes: a.estimated_minutes,
              deadline: a.deadline,
              status: a.status,
              workflowId: a.workflow_id,
              outcomeData: typeof a.outcome_data === 'string' ? JSON.parse(a.outcome_data) : a.outcome_data,
              createdAt: a.created_at,
              updatedAt: a.updated_at
            }))
          });
        }
        if (out.length > 0) return out;
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getAutonomousPlans fallback:", e);
      }
    }

    const plans = Array.from(memoryAutonomousPlans.values()).filter(p => p.userId === userId);
    return plans.map(p => ({
      plan: p,
      actions: Array.from(memoryExecutionActions.values()).filter(a => a.planId === p.id)
    }));
  }

  public static async updateActionStatus(actionId: string, status: ExecutionActionRecord["status"], outcome?: any): Promise<boolean> {
    const action = memoryExecutionActions.get(actionId);
    if (action) {
      action.status = status;
      if (outcome) action.outcomeData = outcome;
      action.updatedAt = new Date().toISOString();
    }

    if (Database.isReady()) {
      try {
        await Database.query(
          `UPDATE execution_actions SET status = $1, outcome_data = $2, updated_at = NOW() WHERE id = $3`,
          [status, JSON.stringify(outcome || {}), actionId]
        );
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB updateActionStatus fallback:", e);
      }
    }
    return true;
  }

  // Execution Timelines
  public static async addTimelineEvent(event: ExecutionTimelineRecord): Promise<ExecutionTimelineRecord> {
    const list = memoryExecutionTimelines.get(event.userId) || [];
    list.unshift(event);
    memoryExecutionTimelines.set(event.userId, list);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO execution_timelines (id, user_id, event_type, title, description, status, timestamp, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [event.id, event.userId, event.eventType, event.title, event.description, event.status, event.timestamp, JSON.stringify(event.metadata), event.createdAt]
        );
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB addTimelineEvent fallback:", e);
      }
    }
    return event;
  }

  public static async getTimeline(userId: string, limit = 50): Promise<ExecutionTimelineRecord[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<any>(
          `SELECT * FROM execution_timelines WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2`,
          [userId, limit]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            eventType: r.event_type,
            title: r.title,
            description: r.description,
            status: r.status,
            timestamp: r.timestamp,
            metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getTimeline fallback:", e);
      }
    }
    return (memoryExecutionTimelines.get(userId) || []).slice(0, limit);
  }

  // Adaptive Strategy Updates
  public static async logAdaptiveUpdate(update: AdaptiveStrategyUpdateRecord): Promise<AdaptiveStrategyUpdateRecord> {
    const list = memoryAdaptiveUpdates.get(update.userId) || [];
    list.unshift(update);
    memoryAdaptiveUpdates.set(update.userId, list);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO adaptive_strategy_updates (id, user_id, trigger_reason, stagnation_metrics, adjustments_made, recalculated_priorities, recovery_workflow_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            update.id, update.userId, update.triggerReason, JSON.stringify(update.stagnationMetrics),
            JSON.stringify(update.adjustmentsMade), JSON.stringify(update.recalculatedPriorities),
            update.recoveryWorkflowId || null, update.createdAt
          ]
        );
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB logAdaptiveUpdate fallback:", e);
      }
    }
    return update;
  }

  public static async getAdaptiveUpdates(userId: string): Promise<AdaptiveStrategyUpdateRecord[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<any>(
          `SELECT * FROM adaptive_strategy_updates WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            triggerReason: r.trigger_reason,
            stagnationMetrics: typeof r.stagnation_metrics === 'string' ? JSON.parse(r.stagnation_metrics) : r.stagnation_metrics,
            adjustmentsMade: typeof r.adjustments_made === 'string' ? JSON.parse(r.adjustments_made) : r.adjustments_made,
            recalculatedPriorities: typeof r.recalculated_priorities === 'string' ? JSON.parse(r.recalculated_priorities) : r.recalculated_priorities,
            recoveryWorkflowId: r.recovery_workflow_id,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getAdaptiveUpdates fallback:", e);
      }
    }
    return memoryAdaptiveUpdates.get(userId) || [];
  }

  // Opportunity Discoveries
  public static async saveOpportunities(opps: OpportunityDiscoveryRecord[]): Promise<OpportunityDiscoveryRecord[]> {
    for (const opp of opps) {
      memoryOpportunities.set(opp.id, opp);
    }

    if (Database.isReady()) {
      try {
        for (const opp of opps) {
          await Database.query(
            `INSERT INTO opportunity_discoveries (id, user_id, opportunity_type, source_platform, title, organization, description, opportunity_url, match_score, roi_score, time_investment, strategic_value, recommended_action, status, metadata, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO UPDATE SET
              match_score = EXCLUDED.match_score,
              roi_score = EXCLUDED.roi_score,
              status = EXCLUDED.status,
              recommended_action = EXCLUDED.recommended_action`,
            [
              opp.id, opp.userId, opp.opportunityType, opp.sourcePlatform, opp.title, opp.organization,
              opp.description, opp.opportunityUrl || null, opp.matchScore, opp.roiScore, opp.timeInvestment,
              opp.strategicValue, opp.recommendedAction, opp.status, JSON.stringify(opp.metadata), opp.createdAt
            ]
          );
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB saveOpportunities fallback:", e);
      }
    }
    return opps;
  }

  public static async getOpportunities(userId: string): Promise<OpportunityDiscoveryRecord[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<any>(
          `SELECT * FROM opportunity_discoveries WHERE user_id = $1 ORDER BY roi_score DESC, match_score DESC LIMIT 20`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            opportunityType: r.opportunity_type,
            sourcePlatform: r.source_platform,
            title: r.title,
            organization: r.organization,
            description: r.description,
            opportunityUrl: r.opportunity_url,
            matchScore: parseFloat(r.match_score || "80"),
            roiScore: parseFloat(r.roi_score || "85"),
            timeInvestment: r.time_investment,
            strategicValue: r.strategic_value,
            recommendedAction: r.recommended_action,
            status: r.status,
            metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getOpportunities fallback:", e);
      }
    }
    return Array.from(memoryOpportunities.values()).filter(o => o.userId === userId);
  }

  // Execution Predictions
  public static async savePredictions(userId: string, preds: ExecutionPredictionRecord[]): Promise<ExecutionPredictionRecord[]> {
    memoryPredictions.set(userId, preds);

    if (Database.isReady()) {
      try {
        for (const p of preds) {
          await Database.query(
            `INSERT INTO execution_predictions (id, user_id, metric_name, current_value, predicted_value_30d, predicted_value_90d, confidence_level, model_factors, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [p.id, p.userId, p.metricName, p.currentValue, p.predictedValue30d, p.predictedValue90d, p.confidenceLevel, JSON.stringify(p.modelFactors), p.createdAt]
          );
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB savePredictions fallback:", e);
      }
    }
    return preds;
  }

  public static async getPredictions(userId: string): Promise<ExecutionPredictionRecord[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<any>(
          `SELECT * FROM execution_predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            metricName: r.metric_name,
            currentValue: parseFloat(r.current_value),
            predictedValue30d: parseFloat(r.predicted_value_30d),
            predictedValue90d: parseFloat(r.predicted_value_90d),
            confidenceLevel: parseFloat(r.confidence_level),
            modelFactors: typeof r.model_factors === 'string' ? JSON.parse(r.model_factors) : r.model_factors,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        logger.warn("[AutonomousExecutionRepository] DB getPredictions fallback:", e);
      }
    }
    return memoryPredictions.get(userId) || [];
  }
}
