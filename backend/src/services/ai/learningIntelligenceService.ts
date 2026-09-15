import { KnowledgeGraphService } from "./knowledgeGraphService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { KnowledgeGapService } from "./knowledgeGapService";
import { DependencyAnalysisService } from "./dependencyAnalysisService";
import { LearningPredictionService } from "./learningPredictionService";
import { RecommendationEngineService } from "./recommendationEngineService";

export class LearningIntelligenceService {
  public static async getIntelligenceDashboard(userId: string) {
    const graph = await KnowledgeGraphService.getGraph(userId);
    const masteryScores = await MasteryTrackingService.getMasteryScores(userId);
    const gaps = await KnowledgeGapService.detectKnowledgeGaps(userId);
    const blockers = await DependencyAnalysisService.analyzeBlockers(userId);
    const predictions = await LearningPredictionService.getPredictions(userId);
    const recommendations = await RecommendationEngineService.getRecommendations(userId);

    // Calculate aggregated overall readiness metrics
    const avgMastery = masteryScores.length > 0
      ? Math.round(masteryScores.reduce((acc, curr) => acc + Number(curr.mastery_rating), 0) / masteryScores.length)
      : 78;

    const companyReadiness = Math.round(avgMastery * 0.9 + 5);
    const interviewReadiness = Math.round(avgMastery * 0.85 + 8);

    return {
      graph,
      masteryScores,
      avgMastery,
      gaps,
      blockers,
      predictions,
      recommendations,
      companyReadiness,
      interviewReadiness,
    };
  }
}
