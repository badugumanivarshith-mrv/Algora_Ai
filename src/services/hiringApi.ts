const API_BASE = "/api/hiring";

export interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  company: string;
  duration_minutes: number;
  difficulty: string;
}

export interface CandidateRanking {
  id: string;
  user_id: string;
  company: string;
  ranking_score: number;
  percentile: number;
}

export interface HiringPrediction {
  id: string;
  user_id: string;
  company: string;
  selection_probability: number;
  confidence_score: number;
}

export interface RecruiterEvaluation {
  candidateId: string;
  company: string;
  roundType: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  improvementPlan: string[];
}

export interface BenchmarkComparison {
  userId: string;
  userScore: number;
  top1PercentThreshold: number;
  top5PercentThreshold: number;
  top10PercentThreshold: number;
  companyReadyThreshold: number;
  userTier: string;
  comparisonMetrics: {
    contestElo: number;
    avgMastery: number;
    assessmentAvg: number;
  };
}

export class HiringApi {
  public static async getAssessments(company?: string): Promise<{ success: boolean; assessments: Assessment[] }> {
    const url = company ? `${API_BASE}/assessments?company=${encodeURIComponent(company)}` : `${API_BASE}/assessments`;
    const res = await fetch(url);
    return await res.json();
  }

  public static async submitAttempt(assessmentId: string, score: number): Promise<{ success: boolean; attempt: any }> {
    const res = await fetch(`${API_BASE}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId, score }),
    });
    return await res.json();
  }

  public static async evaluateRecruiterSession(data: {
    company: string;
    roundType: string;
    userResponses: string[];
  }): Promise<{ success: boolean; evaluation: RecruiterEvaluation }> {
    const res = await fetch(`${API_BASE}/recruiter/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getRankings(): Promise<{ success: boolean; rankings: CandidateRanking[] }> {
    const res = await fetch(`${API_BASE}/rankings`);
    return await res.json();
  }

  public static async getPredictions(): Promise<{ success: boolean; predictions: HiringPrediction[] }> {
    const res = await fetch(`${API_BASE}/predictions`);
    return await res.json();
  }

  public static async getBenchmark(): Promise<{ success: boolean; benchmark: BenchmarkComparison }> {
    const res = await fetch(`${API_BASE}/benchmark`);
    return await res.json();
  }

  public static async getPipeline(company: string): Promise<{ success: boolean; company: string; pipelines: any[] }> {
    const res = await fetch(`${API_BASE}/pipeline?company=${encodeURIComponent(company)}`);
    return await res.json();
  }

  public static async getAnalytics(): Promise<{ success: boolean; analytics: any }> {
    const res = await fetch(`${API_BASE}/analytics`);
    return await res.json();
  }
}
