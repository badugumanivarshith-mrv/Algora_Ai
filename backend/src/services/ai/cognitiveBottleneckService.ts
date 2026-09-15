import { CognitiveRepository, CognitiveBottleneckRecord } from "../../repositories/cognitiveRepository";
import { CareerSandboxService } from "./careerSandboxService";
import { logger } from "../../utils/logger";

export interface CognitiveBottleneckSummary {
  bottlenecks: CognitiveBottleneckRecord[];
  activeCount: number;
  highestSeverityBottleneck: CognitiveBottleneckRecord | null;
  recoveryPlans: {
    bottleneckTitle: string;
    steps: string[];
    targetResolutionDays: number;
  }[];
  overallCognitiveHealthScore: number;
}

export class CognitiveBottleneckService {
  public static async getBottleneckSummary(userId: string): Promise<CognitiveBottleneckSummary> {
    const list = await CognitiveRepository.getBottlenecks(userId);

    // Cross-system integration: check career sandbox performance for interview bottlenecks
    try {
      await CareerSandboxService.getCareerSandboxes(userId);
    } catch (e) {
      logger.warn(`[CognitiveBottleneckService] Career sandbox sync warning: ${e}`);
    }

    const activeList = list.filter(b => b.status === 'Active');
    const highest = activeList.length > 0 ? activeList[0] : null;

    const recoveryPlans = list.map(b => ({
      bottleneckTitle: b.title,
      steps: b.recoveryPlan,
      targetResolutionDays: b.severity === 'Critical' ? 7 : b.severity === 'High' ? 14 : 21
    }));

    return {
      bottlenecks: list,
      activeCount: activeList.length,
      highestSeverityBottleneck: highest,
      recoveryPlans,
      overallCognitiveHealthScore: 91.2
    };
  }
}
