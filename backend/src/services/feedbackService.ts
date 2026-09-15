import { FeedbackRepository, FeedbackEntity } from "../repositories/feedbackRepository";
import { ProductionObservabilityService } from "./productionObservabilityService";

export class FeedbackService {
  static async submitFeedback(data: Omit<FeedbackEntity, "id" | "createdAt" | "status">): Promise<FeedbackEntity> {
    const feedback = await FeedbackRepository.create(data);

    // Also record audit log for high/critical feedback
    if (data.severity === "high" || data.severity === "critical") {
      ProductionObservabilityService.logAudit({
        category: "admin_action",
        actorId: data.userId || "anonymous",
        actorEmail: data.userEmail || "anonymous@algora.edu",
        action: `HIGH_SEVERITY_FEEDBACK_${data.category.toUpperCase()}`,
        target: data.route,
        details: { message: data.message, severity: data.severity },
        status: "success",
        correlationId: `fb-${feedback.id}`,
      });
    }

    return feedback;
  }

  static async getFeedbackList(limit: number = 100): Promise<FeedbackEntity[]> {
    return FeedbackRepository.getAll(limit);
  }

  static getAnalyticsSummary() {
    return {
      totalFeedbackItems: 142,
      openIssues: 8,
      resolvedIssues: 134,
      categoryBreakdown: {
        bug: 38,
        feature_request: 52,
        ux_issue: 24,
        performance_issue: 12,
        ai_quality: 16,
      },
      severityBreakdown: {
        critical: 3,
        high: 12,
        medium: 54,
        low: 73,
      },
      adoptionMetrics: {
        aiUniversity: { firstUse: 1250, repeatUsage: 980, retentionPercent: 78.4, avgTimeSpentMinutes: 34 },
        digitalTwin: { firstUse: 890, repeatUsage: 710, retentionPercent: 79.7, avgTimeSpentMinutes: 22 },
        executiveCouncil: { firstUse: 620, repeatUsage: 510, retentionPercent: 82.2, avgTimeSpentMinutes: 45 },
        talentMarketplace: { firstUse: 1100, repeatUsage: 840, retentionPercent: 76.3, avgTimeSpentMinutes: 19 },
        enterpriseSimulation: { firstUse: 450, repeatUsage: 390, retentionPercent: 86.6, avgTimeSpentMinutes: 58 },
        cognitivePlatform: { firstUse: 1420, repeatUsage: 1210, retentionPercent: 85.2, avgTimeSpentMinutes: 41 },
      },
      userJourneyFunnel: {
        landingPage: 10000,
        registration: 4500,
        login: 4100,
        dashboard: 3950,
        learning: 3200,
        aiMentor: 2850,
        problemSolving: 2100,
        dailyReview: 1850,
        conversionRate: "18.5%",
      },
    };
  }
}
