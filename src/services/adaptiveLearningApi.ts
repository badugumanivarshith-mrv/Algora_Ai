export interface SkillProfileData {
  id: string;
  userId: string;
  overallSkillLevel: string;
  topicMastery: Record<string, number>;
  updatedAt: string;
}

export interface WeaknessData {
  id: string;
  userId: string;
  topic: string;
  weaknessType: string;
  severity: "Low" | "Medium" | "High";
  details: string;
  createdAt: string;
}

export interface DailyReviewData {
  id: string;
  userId: string;
  topic: string;
  itemTitle: string;
  itemType: string;
  scheduledFor: string;
  retentionScore: number;
  status: "pending" | "reviewed" | "needs_revision";
}

export interface LearningPathData {
  userId: string;
  targetGoal: string;
  overallSkillLevel: string;
  weeks: {
    weekNumber: number;
    title: string;
    status: string;
    reason: string;
    topics: string[];
    problems: { id: string; title: string; difficulty: string; topic: string; status: string }[];
  }[];
}

export interface StudyPlanData {
  id: string;
  userId: string;
  placementGoal: string;
  availableHoursPerWeek: number;
  dailyPlan: { day: string; focus: string; durationHours: number; tasks: string[] }[];
  weeklyPlan: { week: string; theme: string; targetTopics: string[] }[];
  monthlyPlan: { month: string; milestone: string; keyOutcome: string }[];
}

export class AdaptiveLearningApi {
  public static async getSkillProfile(): Promise<SkillProfileData> {
    const res = await fetch("/api/adaptive/profile");
    const json = await res.json();
    return json.data;
  }

  public static async getWeaknesses(): Promise<WeaknessData[]> {
    const res = await fetch("/api/adaptive/weaknesses");
    const json = await res.json();
    return json.data;
  }

  public static async getDailyReviews(): Promise<{ todaysReview: DailyReviewData[]; needsRevision: DailyReviewData[] }> {
    const res = await fetch("/api/adaptive/daily-review");
    const json = await res.json();
    return json.data;
  }

  public static async submitDailyReview(reviewId: string, score: number): Promise<any> {
    const res = await fetch("/api/adaptive/daily-review/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, score }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async getLearningPath(targetGoal: string = "Google"): Promise<LearningPathData> {
    const res = await fetch(`/api/adaptive/learning-path?targetGoal=${encodeURIComponent(targetGoal)}`);
    const json = await res.json();
    return json.data;
  }

  public static async generateStudyPlan(placementGoal: string, availableHours: number): Promise<StudyPlanData> {
    const res = await fetch("/api/adaptive/study-plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placementGoal, availableHours }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async getRecommendations(): Promise<any[]> {
    const res = await fetch("/api/adaptive/recommendations");
    const json = await res.json();
    return json.data;
  }
}
