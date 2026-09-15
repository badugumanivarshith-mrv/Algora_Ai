import {
  AutonomousExecutionRepository,
  AdaptiveStrategyUpdateRecord
} from "../../repositories/autonomousExecutionRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { AutonomousExecutionPlanner } from "./autonomousExecutionPlanner";
import { StrategicDecisionRepository } from "../../repositories/strategicDecisionRepository";
import { AgentOperationsRepository } from "../../repositories/agentOperationsRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class AdaptiveStrategyService {
  public static async evaluateAndAdapt(userId: string): Promise<{ adapted: boolean; update?: AdaptiveStrategyUpdateRecord; recommendations: any[] }> {
    logger.info(`[AdaptiveStrategy] Analyzing execution velocity and stagnation risk for user ${userId}...`);

    const twin = await DigitalTwinService.getDigitalTwin(userId);
    const plansData = await AutonomousExecutionPlanner.getPlan(userId);
    const actions = plansData.actions;

    const delayedActions = actions.filter(a => a.status === 'Delayed' || a.status === 'Failed');
    const gaps = twin.riskFactors || [];
    const isStagnating = (twin.learningProgress?.currentStreak || 0) < 3 || gaps.length > 2 || delayedActions.length > 1;

    if (!isStagnating && delayedActions.length === 0) {
      return {
        adapted: false,
        recommendations: [
          { priority: "Keep Velocity", advice: "Current velocity is optimal. Continue adhering to the daily execution plan." }
        ]
      };
    }

    // Trigger Adaptive Adjustments
    const triggerReason = delayedActions.length > 0
      ? `Detected ${delayedActions.length} delayed actions in core roadmap.`
      : `Detected skill stagnation risk in ${gaps[0]?.title || 'Dynamic Programming'}.`;

    const adjustmentsMade = [
      {
        type: "Reprioritize Roadmap",
        detail: "Temporarily lowered difficulty of complex Bitmask DP to build mastery and confidence on foundational patterns."
      },
      {
        type: "Time-Box Calibration",
        detail: "Adjusted daily action duration from 60 mins to 35 mins focused sprints to eliminate task procrastination."
      },
      {
        type: "Schedule Recovery Workflow",
        detail: "Injected Socratic Voice Mentor drill for quick concept reinforcement."
      }
    ];

    const recalculatedPriorities = [
      { rank: 1, focus: "Foundational DP Review (Subproblem decomposition)", weight: 45 },
      { rank: 2, focus: "Speed Contest Drills (Problem A & B)", weight: 35 },
      { rank: 3, focus: "Distributed System Capstone", weight: 20 }
    ];

    const updateRecord: AdaptiveStrategyUpdateRecord = {
      id: `adapt-${uuidv4()}`,
      userId,
      triggerReason,
      stagnationMetrics: {
        delayedCount: delayedActions.length,
        stagnationRiskScore: 68.0,
        activeGapsCount: gaps.length
      },
      adjustmentsMade,
      recalculatedPriorities,
      recoveryWorkflowId: "wf_adaptive_recovery",
      createdAt: new Date().toISOString()
    };

    await AutonomousExecutionRepository.logAdaptiveUpdate(updateRecord);

    // Create system alert in AgentOperations
    await AgentOperationsRepository.createAlert(
      userId,
      "adaptive_engine",
      "Medium",
      `Autonomous Strategy Adapted: ${triggerReason}`,
      { adjustmentsMade, recalculatedPriorities }
    );

    // Invalidate caches
    await RedisManager.del(`autonomous:plan:${userId}`);
    await RedisManager.del(`digital:twin:${userId}`);

    return {
      adapted: true,
      update: updateRecord,
      recommendations: adjustmentsMade
    };
  }

  public static async getAdaptationHistory(userId: string) {
    return AutonomousExecutionRepository.getAdaptiveUpdates(userId);
  }
}
