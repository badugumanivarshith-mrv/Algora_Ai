import {
  PersonalizationOverview,
  StudyPlanEntity,
  StudyPlanType,
  StudyPlanDifficulty,
  UserGoalEntity,
  UserGoalType,
  GoalMetric,
  RecommendationEntity,
  RecommendationCategory,
  ReadinessScoreEntity,
  SkillAssessmentEntity,
} from "../types";

const API_BASE = "/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("algora_token") || "demo_token_arjun_patel";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export class AdaptiveApi {
  // Overview
  static async getPersonalizationOverview(): Promise<PersonalizationOverview> {
    try {
      const res = await fetch(`${API_BASE}/analytics/personalization-overview`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch personalization overview");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback personalization overview", err);
      return {
        activePlan: null,
        totalPlans: 0,
        todayGoals: [],
        weeklyGoals: [],
        allGoals: [],
        recommendations: [],
        contestReadiness: null,
        interviewReadiness: null,
        weakTopics: [],
        todayFocus: {
          primaryTopic: "Dynamic Programming",
          subGoal: "Reinforce state recurrence relations",
          recommendedProblemsCount: 3,
          estimatedTimeMinutes: 45,
          reviewUrgentCount: 2,
        },
      };
    }
  }

  // Study Plans
  static async getStudyPlans(): Promise<StudyPlanEntity[]> {
    try {
      const res = await fetch(`${API_BASE}/study-plans`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch study plans");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback study plans", err);
      return [];
    }
  }

  static async getStudyPlanById(id: string): Promise<StudyPlanEntity | null> {
    try {
      const res = await fetch(`${API_BASE}/study-plans/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch study plan");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback study plan", err);
      return null;
    }
  }

  static async createStudyPlan(params: {
    planType: StudyPlanType;
    title?: string;
    description?: string;
    targetRoleCompany?: string;
    difficulty?: StudyPlanDifficulty;
    durationWeeks?: number;
    dailyMinutesTarget?: number;
  }): Promise<StudyPlanEntity> {
    const res = await fetch(`${API_BASE}/study-plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to create study plan");
    const json = await res.json();
    return json.data;
  }

  // Goals
  static async getGoals(): Promise<UserGoalEntity[]> {
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback goals", err);
      return [];
    }
  }

  static async createGoal(params: {
    title: string;
    goalType: UserGoalType;
    targetMetric: GoalMetric;
    targetValue: number;
    unit?: string;
  }): Promise<UserGoalEntity> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to create goal");
    const json = await res.json();
    return json.data;
  }

  static async recordGoalProgress(
    goalId: string,
    increment: number,
    notes?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/goals/${goalId}/progress`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ increment, notes }),
    });
    if (!res.ok) throw new Error("Failed to record goal progress");
    const json = await res.json();
    return json.data;
  }

  // Recommendations
  static async getRecommendations(category?: RecommendationCategory): Promise<RecommendationEntity[]> {
    try {
      const url = category
        ? `${API_BASE}/recommendations?category=${encodeURIComponent(category)}`
        : `${API_BASE}/recommendations`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback recommendations", err);
      return [];
    }
  }

  static async updateRecommendationStatus(
    recId: string,
    action: "solved" | "dismissed"
  ): Promise<RecommendationEntity | null> {
    try {
      const res = await fetch(`${API_BASE}/recommendations/${recId}/status`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update recommendation status");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error("Failed to update recommendation status", err);
      return null;
    }
  }

  static async refreshRecommendations(): Promise<RecommendationEntity[]> {
    const res = await fetch(`${API_BASE}/recommendations/refresh`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to refresh recommendations");
    const json = await res.json();
    return json.data;
  }

  // Readiness & Skills
  static async getContestReadiness(): Promise<ReadinessScoreEntity | null> {
    try {
      const res = await fetch(`${API_BASE}/readiness/contest`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch contest readiness");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback contest readiness", err);
      return null;
    }
  }

  static async getInterviewReadiness(): Promise<ReadinessScoreEntity | null> {
    try {
      const res = await fetch(`${API_BASE}/readiness/interview`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch interview readiness");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback interview readiness", err);
      return null;
    }
  }

  static async getWeakTopics(): Promise<SkillAssessmentEntity[]> {
    try {
      const res = await fetch(`${API_BASE}/readiness/weak-topics`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch weak topics");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback weak topics", err);
      return [];
    }
  }

  // Analytics
  static async getMasteryTimeline(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/analytics/mastery-timeline`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch mastery timeline");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback mastery timeline", err);
      return [];
    }
  }

  static async getSkillGapAnalysis(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/analytics/skill-gap-analysis`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch skill gap analysis");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Using fallback skill gap analysis", err);
      return [];
    }
  }
}
