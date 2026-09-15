import { HiringRepository, HiringPredictionEntity } from "../../repositories/hiringRepository";
import { ContestAnalyticsService } from "./contestAnalyticsService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { KnowledgeGapService } from "./knowledgeGapService";
import { AttendanceService } from "./attendanceService";
import { AssignmentService } from "./assignmentService";
import { ProjectAnalyticsService } from "./projectAnalyticsService";
import { ProjectSkillTrackingService } from "./projectSkillTrackingService";
import { ResearchRepository } from "../../repositories/researchRepository";
import { RedisManager } from "../../redis/redisClient";

export class HiringPredictionService {
  public static async getPredictions(userId: string): Promise<HiringPredictionEntity[]> {
    const redisKey = `hiring:prediction:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    let predictions = await HiringRepository.getHiringPredictions(userId);
    if (predictions.length === 0) {
      predictions = await this.computeAndSavePredictions(userId);
    }

    await RedisManager.set(redisKey, JSON.stringify(predictions), 3600);
    return predictions;
  }

  public static async computeAndSavePredictions(userId: string): Promise<HiringPredictionEntity[]> {
    const contestAnalytics = await ContestAnalyticsService.getUserAnalytics(userId);
    const masteryScores = await MasteryTrackingService.getTopicMastery(userId);
    const gaps = await KnowledgeGapService.detectKnowledgeGaps(userId);
    const attendance = await AttendanceService.getAttendanceSummary(userId);
    const submissions = await AssignmentService.getSubmissions(userId);
    const projectSummary = await ProjectAnalyticsService.getUserProjectSummary(userId);
    const projectSkills = await ProjectSkillTrackingService.getUserSkillMetrics(userId);
    const researchAnalytics = await ResearchRepository.getResearchAnalytics(userId);
    const ossHistory = await ResearchRepository.getContributionHistory(userId);

    const contestRating = contestAnalytics?.rating || 1500;
    const avgMastery = masteryScores.length > 0
      ? masteryScores.reduce((acc, m) => acc + Number(m.mastery_rating || 0), 0) / masteryScores.length
      : 75;

    // Active knowledge gaps reduce readiness score
    const gapPenalty = Math.min(25, gaps.length * 5);
    const attendanceBonus = (attendance.percentage >= 90 ? 5 : 0);
    const assignmentBonus = submissions.length > 0 ? 5 : 0;
    const projectBonus = Math.min(10, (projectSummary.totalWorkspaces * 2) + (projectSummary.avgCompletion / 20));
    const skillBonus = Math.min(5, projectSkills.length * 0.5);
    const researchBonus = Math.min(15, (Number(researchAnalytics?.impact_factor || 0) * 0.5) + (researchAnalytics?.papers_read || 0) * 0.1);
    const ossBonus = Math.min(10, ossHistory.length * 2);

    const baseScore = Math.max(10, Math.round((contestRating / 2000) * 30 + avgMastery * 0.25 - gapPenalty + attendanceBonus + assignmentBonus + projectBonus + skillBonus + researchBonus + ossBonus));

    const targetCompanies = [
      { name: "Google", difficultyMultiplier: 0.82 },
      { name: "Amazon", difficultyMultiplier: 0.90 },
      { name: "Microsoft", difficultyMultiplier: 0.88 },
      { name: "Meta", difficultyMultiplier: 0.80 },
      { name: "Netflix", difficultyMultiplier: 0.78 },
      { name: "Uber", difficultyMultiplier: 0.85 },
      { name: "Adobe", difficultyMultiplier: 0.91 },
      { name: "Atlassian", difficultyMultiplier: 0.87 },
      { name: "TCS", difficultyMultiplier: 1.25 },
      { name: "Infosys", difficultyMultiplier: 1.30 },
    ];

    const results: HiringPredictionEntity[] = [];

    for (const c of targetCompanies) {
      const selectionProbability = Math.min(98.5, Math.max(5.0, Math.round(baseScore * c.difficultyMultiplier * 10) / 10));
      const confidenceScore = Math.round((85 + (contestAnalytics?.contests_joined || 10) * 0.5) * 10) / 10;

      const pred = await HiringRepository.upsertHiringPrediction({
        userId,
        company: c.name,
        selectionProbability,
        confidenceScore: Math.min(99.0, confidenceScore),
      });
      results.push(pred);
    }

    return results;
  }
}
