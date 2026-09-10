import {
  Contest,
  ContestLeaderboardEntry,
  GlobalLeaderboardUser,
  RatingHistoryPoint,
  XPTransaction,
  AchievementBadge,
  UserLevelInfo,
  RatingTier,
  DailyReviewQueue,
} from "../types";

const API_BASE = "/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("algora_token") || "demo_token_arjun_patel";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface GamificationProfileResponse {
  rating: number;
  highestRating: number;
  ratingTier: RatingTier;
  streakDays: number;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  rank: number;
  achievements: AchievementBadge[];
  recentXpHistory: XPTransaction[];
  recentRatingHistory: RatingHistoryPoint[];
}

export class GamificationApi {
  // Contests
  static async getContests(): Promise<Contest[]> {
    try {
      const res = await fetch(`${API_BASE}/contests`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch contests");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback contests data", err);
      return [];
    }
  }

  static async getContestDetails(id: string): Promise<Contest | null> {
    try {
      const res = await fetch(`${API_BASE}/contests/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch contest");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback contest details", err);
      return null;
    }
  }

  static async registerContest(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/contests/${id}/register`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch (err) {
      console.error("Contest registration error", err);
      return false;
    }
  }

  static async getContestLeaderboard(id: string): Promise<ContestLeaderboardEntry[]> {
    try {
      const res = await fetch(`${API_BASE}/contests/${id}/leaderboard`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch contest leaderboard");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback contest leaderboard", err);
      return [];
    }
  }

  static async submitContestSolution(
    contestId: string,
    problemSlug: string,
    points: number
  ): Promise<{ success: boolean; scoreAwarded: number; totalXP: number }> {
    try {
      const res = await fetch(`${API_BASE}/contests/${contestId}/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ problemSlug, points }),
      });
      const data = await res.json();
      return {
        success: data.success,
        scoreAwarded: data.data?.scoreAwarded || points,
        totalXP: data.data?.totalXP || 0,
      };
    } catch (err) {
      console.error("Failed to submit contest solution", err);
      return { success: false, scoreAwarded: 0, totalXP: 0 };
    }
  }

  // Leaderboard
  static async getGlobalLeaderboard(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "rating" | "totalXP" | "streakDays";
  }): Promise<{
    items: GlobalLeaderboardUser[];
    total: number;
    page: number;
    totalPages: number;
    currentUserRank?: number;
  }> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page.toString());
      if (params.limit) query.set("limit", params.limit.toString());
      if (params.search) query.set("search", params.search);
      if (params.sortBy) query.set("sortBy", params.sortBy);

      const res = await fetch(`${API_BASE}/leaderboard?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback leaderboard", err);
      return {
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  }

  // Gamification Profile & Ratings
  static async getGamificationProfile(): Promise<GamificationProfileResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/gamification/profile`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch gamification profile");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback gamification profile", err);
      return null;
    }
  }

  static async getAchievements(): Promise<AchievementBadge[]> {
    try {
      const res = await fetch(`${API_BASE}/gamification/achievements`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch achievements");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback achievements", err);
      return [];
    }
  }

  static async awardXP(amount: number, source: string, description?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/gamification/award-xp`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, source, description }),
      });
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error("Failed to award XP", err);
      return null;
    }
  }

  // Daily Spaced Repetition Review
  static async getDailyReviewQueue(): Promise<DailyReviewQueue | null> {
    try {
      const res = await fetch(`${API_BASE}/daily-review/queue`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch daily review queue");
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn("Using fallback daily review queue", err);
      return null;
    }
  }

  static async completeDailyReview(correctCount: number, totalQuestions: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/daily-review/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ correctCount, totalQuestions }),
      });
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error("Failed to complete daily review", err);
      return null;
    }
  }
}
