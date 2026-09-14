const API_BASE = "/api/company";

export interface CompanyTrack {
  id: string;
  companyId: string;
  name: string;
  category: "MAANG" | "Tier 1 Product" | "IT Services";
  overview: string;
  hiringProcess: string[];
  interviewPattern: string[];
  recommendedTopics: string[];
  baseDifficulty: string;
}

export interface CompanyRoadmapWeek {
  id: string;
  companyId: string;
  weekNumber: number;
  title: string;
  topics: string[];
  estimatedHours: number;
}

export interface CompanyProblemMapping {
  id: string;
  problemId: string;
  title: string;
  companyId: string;
  frequency: number;
  importance: "High" | "Critical" | "Medium";
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

export interface CompanyInterviewPatternRound {
  id: string;
  companyId: string;
  roundNumber: number;
  roundName: string;
  roundType: "OA" | "Coding" | "LLD" | "HLD" | "HR" | "Bar Raiser";
  description: string;
  durationMinutes: number;
  keyFocus: string[];
}

export interface CompanyUserReadiness {
  id: string;
  userId: string;
  companyId: string;
  readinessScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  updatedAt: string;
}

export interface CompanyPrepPlan {
  id: string;
  userId: string;
  companyId: string;
  targetDate: string;
  availableHoursPerWeek: number;
  dailyPlan: Array<{ day: string; task: string; type: string; estMinutes: number }>;
  weeklyPlan: Array<{ week: number; focus: string; milestones: string[] }>;
  monthlyPlan: Array<{ month: number; goal: string }>;
  createdAt: string;
}

export interface MockInterviewQuestion {
  id: string;
  roundName: string;
  questionTitle: string;
  problemDescription: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  expectedOutputFormat: string;
  starterCode: string;
  hints: string[];
  evaluationCriteria: string[];
}

export class CompanyPrepApi {
  public static async getTracks(): Promise<CompanyTrack[]> {
    const res = await fetch(`${API_BASE}/tracks`);
    const json = await res.json();
    return json.data;
  }

  public static async getTrackDetails(companyId: string): Promise<{
    track: CompanyTrack | null;
    roadmap: CompanyRoadmapWeek[];
    interviewPattern: CompanyInterviewPatternRound[];
    highFreqProblems: CompanyProblemMapping[];
  }> {
    const res = await fetch(`${API_BASE}/track/${companyId}`);
    const json = await res.json();
    return json.data;
  }

  public static async getProblems(companyId?: string, topic?: string, difficulty?: string): Promise<CompanyProblemMapping[]> {
    const query = new URLSearchParams();
    if (companyId) query.append("companyId", companyId);
    if (topic) query.append("topic", topic);
    if (difficulty) query.append("difficulty", difficulty);

    const res = await fetch(`${API_BASE}/problems?${query.toString()}`);
    const json = await res.json();
    return json.data;
  }

  public static async getReadiness(companyId: string): Promise<CompanyUserReadiness> {
    const res = await fetch(`${API_BASE}/readiness/${companyId}`);
    const json = await res.json();
    return json.data;
  }

  public static async generatePrepPlan(companyId: string, targetDate: string, availableHoursPerWeek: number): Promise<CompanyPrepPlan> {
    const res = await fetch(`${API_BASE}/plan/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, targetDate, availableHoursPerWeek }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async generateMockInterview(companyId: string, roundType: string, difficulty: string): Promise<MockInterviewQuestion[]> {
    const res = await fetch(`${API_BASE}/mock/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, roundType, difficulty }),
    });
    const json = await res.json();
    return json.data;
  }
}
