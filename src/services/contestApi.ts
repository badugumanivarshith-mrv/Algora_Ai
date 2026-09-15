const API_BASE = "/api/contests-v2";

export interface Contest {
  id: string;
  title: string;
  description: string;
  contest_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface ContestProblem {
  id: string;
  contest_id: string;
  problem_id: string;
  points: number;
  order_index: number;
}

export interface ContestLeaderboardItem {
  rank: number;
  userId: string;
  score: number;
  ratingBefore: number;
  ratingAfter: number;
}

export interface ContestAnalytics {
  id: string;
  user_id: string;
  contests_joined: number;
  contests_won: number;
  average_rank: number;
  rating: number;
  updated_at: string;
}

export interface ContestPrediction {
  id: string;
  user_id: string;
  predicted_rank: number;
  predicted_rating: number;
  predicted_company_readiness: number;
}

export interface CoachAdvice {
  adviceType: string;
  headline: string;
  socraticHint: string;
  strategyRecommendation: string;
  recommendedTimeAllocation: string;
}

export class ContestApi {
  public static async getContests(): Promise<{ success: boolean; contests: Contest[] }> {
    const res = await fetch(`${API_BASE}/list`);
    return await res.json();
  }

  public static async getContestById(id: string): Promise<{
    success: boolean;
    contest: Contest;
    problems: ContestProblem[];
    leaderboard: ContestLeaderboardItem[];
  }> {
    const res = await fetch(`${API_BASE}/detail/${id}`);
    return await res.json();
  }

  public static async registerParticipant(contestId: string): Promise<{ success: boolean; participant: any }> {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contestId }),
    });
    return await res.json();
  }

  public static async submitSolution(data: {
    contestId: string;
    problemId?: string;
    verdict?: string;
    runtime?: number;
    memory?: number;
    topic?: string;
  }): Promise<{ success: boolean; submission: any }> {
    const res = await fetch(`${API_BASE}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async createTeam(contestId: string, teamName: string): Promise<{ success: boolean; team: any }> {
    const res = await fetch(`${API_BASE}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contestId, teamName }),
    });
    return await res.json();
  }

  public static async getAnalytics(): Promise<{
    success: boolean;
    analytics: ContestAnalytics;
    predictions: ContestPrediction[];
  }> {
    const res = await fetch(`${API_BASE}/analytics`);
    return await res.json();
  }

  public static async getCoachAdvice(data: {
    contestId: string;
    problemTitle?: string;
    userCode?: string;
    errorLog?: string;
    timeRemainingMinutes?: number;
    requestType?: string;
  }): Promise<{ success: boolean; advice: CoachAdvice }> {
    const res = await fetch(`${API_BASE}/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getReplay(contestId: string): Promise<{
    success: boolean;
    replay: {
      contestId: string;
      timeline: Array<{ minute: number; userId: string; problemId: string; verdict: string; scoreDelta: number }>;
    };
  }> {
    const res = await fetch(`${API_BASE}/replay/${contestId}`);
    return await res.json();
  }
}
