import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface LearningMemoryRecord {
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

export interface LearningRetentionRecord {
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

export interface LearningReviewItem {
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

export interface LearningFlashcard {
  id: string;
  userId: string;
  topic: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty: string;
  createdAt: string;
}

export interface LearningRevisionNotes {
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

export class LearningMemoryRepository {
  private static memoryStore: Map<string, LearningMemoryRecord[]> = new Map();
  private static retentionStore: Map<string, LearningRetentionRecord[]> = new Map();
  private static reviewStore: Map<string, LearningReviewItem[]> = new Map();
  private static flashcardStore: Map<string, LearningFlashcard[]> = new Map();
  private static notesStore: Map<string, LearningRevisionNotes[]> = new Map();
  private static streakStore: Map<string, LearningStreak> = new Map();

  public static async getMemoryRecords(userId: string): Promise<LearningMemoryRecord[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM learning_memory WHERE user_id = $1 ORDER BY updated_at DESC;`,
          [userId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            problemsSolved: r.problems_solved,
            problemsFailed: r.problems_failed,
            quizScore: r.quiz_score,
            contestScore: r.contest_score,
            interviewScore: r.interview_score,
            hintCount: r.hint_count,
            aiInteractionsCount: r.ai_interactions_count,
            confidenceScore: r.confidence_score,
            updatedAt: r.updated_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] getMemoryRecords error: ${err.message}`);
      }
    }

    if (!this.memoryStore.has(userId)) {
      const defaults: LearningMemoryRecord[] = [
        {
          id: `mem-1`,
          userId,
          topic: "Arrays & Strings",
          problemsSolved: 24,
          problemsFailed: 3,
          quizScore: 90,
          contestScore: 85,
          interviewScore: 88,
          hintCount: 2,
          aiInteractionsCount: 8,
          confidenceScore: 88,
          updatedAt: new Date().toISOString(),
        },
        {
          id: `mem-2`,
          userId,
          topic: "Trees & BST",
          problemsSolved: 14,
          problemsFailed: 5,
          quizScore: 72,
          contestScore: 68,
          interviewScore: 75,
          hintCount: 6,
          aiInteractionsCount: 14,
          confidenceScore: 61,
          updatedAt: new Date().toISOString(),
        },
        {
          id: `mem-3`,
          userId,
          topic: "Graphs & BFS/DFS",
          problemsSolved: 8,
          problemsFailed: 7,
          quizScore: 55,
          contestScore: 40,
          interviewScore: 50,
          hintCount: 12,
          aiInteractionsCount: 22,
          confidenceScore: 42,
          updatedAt: new Date().toISOString(),
        },
        {
          id: `mem-4`,
          userId,
          topic: "Dynamic Programming",
          problemsSolved: 5,
          problemsFailed: 12,
          quizScore: 35,
          contestScore: 20,
          interviewScore: 30,
          hintCount: 18,
          aiInteractionsCount: 35,
          confidenceScore: 28,
          updatedAt: new Date().toISOString(),
        },
      ];
      this.memoryStore.set(userId, defaults);
    }
    return this.memoryStore.get(userId)!;
  }

  public static async getRetentionRecords(userId: string): Promise<LearningRetentionRecord[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM learning_retention WHERE user_id = $1 ORDER BY updated_at DESC;`,
          [userId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            retentionPercentage: r.retention_percentage,
            overallRetention: r.overall_retention,
            revisionCompletionPercentage: r.revision_completion_percentage,
            lastReviewed: r.last_reviewed,
            nextReviewDate: r.next_review_date,
            reviewAttempts: r.review_attempts,
            successRate: r.success_rate,
            updatedAt: r.updated_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] getRetentionRecords error: ${err.message}`);
      }
    }

    if (!this.retentionStore.has(userId)) {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 86400000).toISOString();
      const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString();

      const defaults: LearningRetentionRecord[] = [
        {
          id: `ret-1`,
          userId,
          topic: "Arrays & Strings",
          retentionPercentage: 88,
          overallRetention: 82,
          revisionCompletionPercentage: 92,
          lastReviewed: now.toISOString(),
          nextReviewDate: in7Days,
          reviewAttempts: 6,
          successRate: 90,
          updatedAt: now.toISOString(),
        },
        {
          id: `ret-2`,
          userId,
          topic: "Graphs & BFS/DFS",
          retentionPercentage: 42,
          overallRetention: 60,
          revisionCompletionPercentage: 45,
          lastReviewed: new Date(now.getTime() - 4 * 86400000).toISOString(),
          nextReviewDate: in3Days,
          reviewAttempts: 4,
          successRate: 50,
          updatedAt: now.toISOString(),
        },
        {
          id: `ret-3`,
          userId,
          topic: "Dynamic Programming",
          retentionPercentage: 28,
          overallRetention: 40,
          revisionCompletionPercentage: 20,
          lastReviewed: new Date(now.getTime() - 8 * 86400000).toISOString(),
          nextReviewDate: now.toISOString(),
          reviewAttempts: 2,
          successRate: 30,
          updatedAt: now.toISOString(),
        },
      ];
      this.retentionStore.set(userId, defaults);
    }
    return this.retentionStore.get(userId)!;
  }

  public static async getDailyReviews(userId: string): Promise<LearningReviewItem[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM learning_reviews WHERE user_id = $1 ORDER BY priority_score DESC;`,
          [userId]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            itemTitle: r.item_title,
            itemType: r.item_type,
            priorityScore: r.priority_score,
            estimatedMinutes: r.estimated_minutes,
            reason: r.reason,
            scheduledFor: r.scheduled_for,
            status: r.status,
            completedAt: r.completed_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] getDailyReviews error: ${err.message}`);
      }
    }

    if (!this.reviewStore.has(userId)) {
      const defaults: LearningReviewItem[] = [
        {
          id: `rev-1`,
          userId,
          topic: "Graphs",
          itemTitle: "BFS Traversal Invariants & Grid Shortest Path",
          itemType: "Revision",
          priorityScore: 95,
          estimatedMinutes: 15,
          reason: "Retention score decayed below 45% over last 4 days",
          scheduledFor: new Date().toISOString(),
          status: "pending",
        },
        {
          id: `rev-2`,
          userId,
          topic: "Arrays",
          itemTitle: "Binary Search Boundary Conditions",
          itemType: "Revision",
          priorityScore: 80,
          estimatedMinutes: 10,
          reason: "Scheduled 7-day SRS Spaced Repetition Checkpoint",
          scheduledFor: new Date().toISOString(),
          status: "pending",
        },
        {
          id: `rev-3`,
          userId,
          topic: "Graphs",
          itemTitle: "Graph Connectivity & Topological Sort Quiz",
          itemType: "Quiz",
          priorityScore: 88,
          estimatedMinutes: 12,
          reason: "Reinforce failed contest submissions",
          scheduledFor: new Date().toISOString(),
          status: "pending",
        },
        {
          id: `rev-4`,
          userId,
          topic: "Dynamic Programming",
          itemTitle: "0/1 Knapsack Bottom-Up Table Flashcards",
          itemType: "Flashcards",
          priorityScore: 98,
          estimatedMinutes: 8,
          reason: "High failure rate on 2D state transitions",
          scheduledFor: new Date().toISOString(),
          status: "pending",
        },
      ];
      this.reviewStore.set(userId, defaults);
    }
    return this.reviewStore.get(userId)!;
  }

  public static async markReviewComplete(userId: string, reviewId: string): Promise<LearningReviewItem | null> {
    const reviews = await this.getDailyReviews(userId);
    const item = reviews.find((r) => r.id === reviewId);
    if (!item) return null;

    item.status = "completed";
    item.completedAt = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `UPDATE learning_reviews SET status = 'completed', completed_at = $1 WHERE id = $2 AND user_id = $3;`,
          [item.completedAt, reviewId, userId]
        );
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] markReviewComplete error: ${err.message}`);
      }
    }
    return item;
  }

  public static async saveFlashcards(userId: string, cards: LearningFlashcard[]): Promise<LearningFlashcard[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        for (const card of cards) {
          await Database.query(
            `INSERT INTO learning_flashcards (id, user_id, topic, question, answer, hint, difficulty, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET question = $4, answer = $5, hint = $6;`,
            [card.id, card.userId, card.topic, card.question, card.answer, card.hint || null, card.difficulty, card.createdAt]
          );
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] saveFlashcards error: ${err.message}`);
      }
    }

    const current = this.flashcardStore.get(userId) || [];
    const updated = [...cards, ...current];
    this.flashcardStore.set(userId, updated);
    return cards;
  }

  public static async getFlashcards(userId: string, topic?: string): Promise<LearningFlashcard[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const query = topic
          ? `SELECT * FROM learning_flashcards WHERE user_id = $1 AND topic = $2 ORDER BY created_at DESC;`
          : `SELECT * FROM learning_flashcards WHERE user_id = $1 ORDER BY created_at DESC;`;
        const params = topic ? [userId, topic] : [userId];
        const { rows } = await Database.query<any>(query, params);
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            question: r.question,
            answer: r.answer,
            hint: r.hint,
            difficulty: r.difficulty,
            createdAt: r.created_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] getFlashcards error: ${err.message}`);
      }
    }

    if (!this.flashcardStore.has(userId)) {
      const defaults: LearningFlashcard[] = [
        {
          id: "fc-1",
          userId,
          topic: "Graphs",
          question: "What is the time complexity of BFS on an adjacency list graph with V vertices and E edges?",
          answer: "O(V + E) because every vertex and edge is visited at most once.",
          hint: "Consider vertex queue pushes and adjacency list loops.",
          difficulty: "Easy",
          createdAt: new Date().toISOString(),
        },
        {
          id: "fc-2",
          userId,
          topic: "Dynamic Programming",
          question: "What differentiates Memoization (Top-down) from Tabulation (Bottom-up)?",
          answer: "Memoization uses recursion and call-stack with a lookup table; Tabulation uses iterative table filling from base cases.",
          hint: "Recursion call-stack overhead vs loop table state.",
          difficulty: "Medium",
          createdAt: new Date().toISOString(),
        },
        {
          id: "fc-3",
          userId,
          topic: "Arrays",
          question: "When using Two Pointers on a sorted array, how do you adjust pointers when current sum < target?",
          answer: "Increment the left pointer (left++) to increase the overall sum.",
          hint: "Since array is sorted, moving left pointer right increases the value.",
          difficulty: "Easy",
          createdAt: new Date().toISOString(),
        },
      ];
      this.flashcardStore.set(userId, defaults);
    }
    const cards = this.flashcardStore.get(userId)!;
    return topic ? cards.filter((c) => c.topic.toLowerCase() === topic.toLowerCase()) : cards;
  }

  public static async saveRevisionNotes(userId: string, notes: LearningRevisionNotes): Promise<LearningRevisionNotes> {
    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO learning_revision_notes (id, user_id, topic, difficulty, learning_level, summary, cheat_sheet, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET summary = $6, cheat_sheet = $7;`,
          [notes.id, notes.userId, notes.topic, notes.difficulty, notes.learningLevel, notes.summary, JSON.stringify(notes.cheatSheet), notes.createdAt]
        );
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] saveRevisionNotes error: ${err.message}`);
      }
    }

    const current = this.notesStore.get(userId) || [];
    current.unshift(notes);
    this.notesStore.set(userId, current);
    return notes;
  }

  public static async getRevisionNotes(userId: string, topic?: string): Promise<LearningRevisionNotes[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const query = topic
          ? `SELECT * FROM learning_revision_notes WHERE user_id = $1 AND topic = $2 ORDER BY created_at DESC;`
          : `SELECT * FROM learning_revision_notes WHERE user_id = $1 ORDER BY created_at DESC;`;
        const params = topic ? [userId, topic] : [userId];
        const { rows } = await Database.query<any>(query, params);
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            userId: r.user_id,
            topic: r.topic,
            difficulty: r.difficulty,
            learningLevel: r.learning_level,
            summary: r.summary,
            cheatSheet: typeof r.cheat_sheet === "string" ? JSON.parse(r.cheat_sheet) : r.cheat_sheet,
            createdAt: r.created_at,
          }));
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] getRevisionNotes error: ${err.message}`);
      }
    }

    if (!this.notesStore.has(userId)) {
      const defaults: LearningRevisionNotes[] = [
        {
          id: "rn-1",
          userId,
          topic: "Graphs & BFS/DFS",
          difficulty: "Medium",
          learningLevel: "Intermediate",
          summary: "Core graph traversal principles focusing on Queue-based BFS for unweighted shortest paths and Stack/Recursion-based DFS for connected components and cycle detection.",
          cheatSheet: [
            "BFS uses Queue (FIFO): Always mark visited ON ENQUEUE to prevent duplicate processing.",
            "DFS uses Stack/Recursion: Maintain visited set & backtrack recursion state.",
            "Grid Neighbors: Standard directions array [(-1,0), (1,0), (0,-1), (0,1)].",
            "Dijkstra algorithm: PriorityQueue (Min-Heap) for weighted graphs without negative edges.",
          ],
          createdAt: new Date().toISOString(),
        },
      ];
      this.notesStore.set(userId, defaults);
    }
    const notes = this.notesStore.get(userId)!;
    return topic ? notes.filter((n) => n.topic.toLowerCase() === topic.toLowerCase()) : notes;
  }

  public static async getStreakRecord(userId: string): Promise<LearningStreak> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows } = await Database.query<any>(
          `SELECT * FROM learning_streaks WHERE user_id = $1 LIMIT 1;`,
          [userId]
        );
        if (rows.length > 0) {
          return {
            id: rows[0].id,
            userId: rows[0].user_id,
            currentStreak: rows[0].current_streak,
            longestStreak: rows[0].longest_streak,
            dailyReviewCompleted: rows[0].daily_review_completed,
            weeklyReviewCompleted: rows[0].weekly_review_completed,
            totalXp: rows[0].total_xp,
            lastActivityDate: rows[0].last_activity_date,
          };
        }
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] getStreakRecord error: ${err.message}`);
      }
    }

    if (!this.streakStore.has(userId)) {
      const defaultStreak: LearningStreak = {
        id: `strk-${userId}`,
        userId,
        currentStreak: 7,
        longestStreak: 14,
        dailyReviewCompleted: true,
        weeklyReviewCompleted: true,
        totalXp: 1850,
        lastActivityDate: new Date().toISOString(),
      };
      this.streakStore.set(userId, defaultStreak);
    }
    return this.streakStore.get(userId)!;
  }

  public static async addXp(userId: string, xpAmount: number): Promise<LearningStreak> {
    const streak = await this.getStreakRecord(userId);
    streak.totalXp += xpAmount;
    streak.dailyReviewCompleted = true;
    streak.lastActivityDate = new Date().toISOString();

    const pool = Database.getPool();
    if (pool) {
      try {
        await Database.query(
          `INSERT INTO learning_streaks (id, user_id, current_streak, longest_streak, daily_review_completed, weekly_review_completed, total_xp, last_activity_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET total_xp = $7, daily_review_completed = true, last_activity_date = $8;`,
          [streak.id, streak.userId, streak.currentStreak, streak.longestStreak, streak.dailyReviewCompleted, streak.weeklyReviewCompleted, streak.totalXp, streak.lastActivityDate]
        );
      } catch (err: any) {
        logger.error(`[LearningMemoryRepository] addXp error: ${err.message}`);
      }
    }
    this.streakStore.set(userId, streak);
    return streak;
  }
}
