const API_BASE = "/api/memory";

export interface MemoryRecord {
  id: string;
  userId: string;
  topic: string;
  problemsSolved: number;
  problemsFailed: number;
  quizScore: number;
  contestScore: number;
  interviewScore: number;
  hintCount: number;
  aiInteractionsCount: number;
  confidenceScore: number;
  updatedAt: string;
}

export interface RetentionRecord {
  id: string;
  userId: string;
  topic: string;
  retentionPercentage: number;
  overallRetention: number;
  revisionCompletionPercentage: number;
  lastReviewed: string;
  nextReviewDate: string;
  reviewAttempts: number;
  successRate: number;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  userId: string;
  topic: string;
  itemTitle: string;
  itemType: string;
  priorityScore: number;
  estimatedMinutes: number;
  reason: string;
  scheduledFor: string;
  status: "pending" | "completed" | "overdue";
  completedAt?: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  topic: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty: string;
  createdAt: string;
}

export interface RevisionNotes {
  id: string;
  userId: string;
  topic: string;
  difficulty: string;
  learningLevel: string;
  summary: string;
  cheatSheet: string[];
  createdAt: string;
}

export interface LearningStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  dailyReviewCompleted: boolean;
  weeklyReviewCompleted: boolean;
  totalXp: number;
  lastActivityDate: string;
}

export interface DailyReport {
  greeting: string;
  yesterdaySummary: {
    problemsSolved: number;
    xpEarned: number;
    topicsStudied: string[];
  };
  weakAreas: string[];
  todayQueueCount: number;
  estimatedMinutesTotal: number;
  aiAdvice: string;
}

export class LearningMemoryApi {
  private static getHeaders() {
    const token = localStorage.getItem("algora_auth_token_v1");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public static async getMemoryOverview(): Promise<{ records: MemoryRecord[]; topicMastery: Record<string, number>; overallConfidence: number }> {
    const res = await fetch(`${API_BASE}/overview`, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async getRetentionOverview(): Promise<{ retentionRecords: RetentionRecord[]; overallRetention: number; revisionCompletionPercentage: number }> {
    const res = await fetch(`${API_BASE}/retention`, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async getDailyReviews(): Promise<ReviewItem[]> {
    const res = await fetch(`${API_BASE}/daily-reviews`, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async markReviewComplete(reviewId: string): Promise<{ review: ReviewItem; streak: LearningStreak }> {
    const res = await fetch(`${API_BASE}/daily-reviews/complete`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ reviewId }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async getDailyReport(): Promise<DailyReport> {
    const res = await fetch(`${API_BASE}/daily-report`, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async getStreak(): Promise<LearningStreak> {
    const res = await fetch(`${API_BASE}/streak`, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async generateFlashcards(topic: string, count: number = 3, difficulty: string = "Medium"): Promise<Flashcard[]> {
    const res = await fetch(`${API_BASE}/flashcards/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ topic, count, difficulty }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async getFlashcards(topic?: string): Promise<Flashcard[]> {
    const url = topic ? `${API_BASE}/flashcards?topic=${encodeURIComponent(topic)}` : `${API_BASE}/flashcards`;
    const res = await fetch(url, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async generateRevisionNotes(topic: string, difficulty: string = "Medium", learningLevel: string = "Intermediate"): Promise<RevisionNotes> {
    const res = await fetch(`${API_BASE}/revision-notes/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ topic, difficulty, learningLevel }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async getRevisionNotes(topic?: string): Promise<RevisionNotes[]> {
    const url = topic ? `${API_BASE}/revision-notes?topic=${encodeURIComponent(topic)}` : `${API_BASE}/revision-notes`;
    const res = await fetch(url, { headers: this.getHeaders() });
    const json = await res.json();
    return json.data;
  }

  public static async generateQuickQuiz(topic: string, difficulty: string = "Medium"): Promise<any> {
    const res = await fetch(`${API_BASE}/quick-quiz/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ topic, difficulty }),
    });
    const json = await res.json();
    return json.data;
  }
}
