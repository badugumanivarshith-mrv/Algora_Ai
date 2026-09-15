import { logger } from "../utils/logger";

export interface RetentionMetrics {
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  streakRetention: number;
  contestRetention: number;
  churnRiskScore: number;
}

export interface UserSegmentProfile {
  userId: string;
  segment: "New Learner" | "Active Learner" | "Contest Enthusiast" | "Career Focused" | "Research Focused" | "Power User" | "At-Risk User" | "Inactive User";
  churnProbability: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  recommendations: string[];
}

export class RetentionService {
  static getPlatformRetentionMetrics(): RetentionMetrics {
    return {
      day1Retention: 86.4,
      day7Retention: 72.1,
      day30Retention: 58.6,
      streakRetention: 79.2,
      contestRetention: 68.5,
      churnRiskScore: 14.2,
    };
  }

  static analyzeUserSegment(userId: string, activityDays: number, submissionsCount: number, lastActiveDaysAgo: number): UserSegmentProfile {
    let segment: UserSegmentProfile["segment"] = "Active Learner";
    let riskLevel: UserSegmentProfile["riskLevel"] = "Low";
    let churnProbability = 5.0;

    if (activityDays <= 3) {
      segment = "New Learner";
      churnProbability = 25.0;
      riskLevel = "Medium";
    } else if (lastActiveDaysAgo > 14) {
      segment = "Inactive User";
      churnProbability = 88.0;
      riskLevel = "Critical";
    } else if (lastActiveDaysAgo > 7) {
      segment = "At-Risk User";
      churnProbability = 62.0;
      riskLevel = "High";
    } else if (submissionsCount > 100) {
      segment = "Power User";
      churnProbability = 2.1;
      riskLevel = "Low";
    }

    const recommendations = [];
    if (riskLevel === "High" || riskLevel === "Critical") {
      recommendations.push("Send personalized re-engagement streak recovery notification");
      recommendations.push("Trigger AI Advisor weak-area reinforcement study plan");
    } else {
      recommendations.push("Invite to upcoming weekly coding contest");
      recommendations.push("Suggest advanced AI University certification path");
    }

    return {
      userId,
      segment,
      churnProbability,
      riskLevel,
      recommendations,
    };
  }

  static getGrowthCampaigns() {
    return [
      { type: "Learning", title: "Topic Recovery Plan", targetSegment: "At-Risk User", uplift: "+14.2% retention" },
      { type: "Career", title: "Hiring Readiness Nudge", targetSegment: "Career Focused", uplift: "+18.5% conversion" },
      { type: "Contest", title: "Weekly Contest Participation", targetSegment: "Contest Enthusiast", uplift: "+22.1% engagement" },
    ];
  }
}
