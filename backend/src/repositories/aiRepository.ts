import { Database } from "../db";

export interface AIConversationEntity {
  id: string;
  userId: string;
  topic: string;
  title: string;
  problemSlug?: string;
  contextData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessageEntity {
  id: string;
  conversationId: string;
  role: "user" | "ai" | "system";
  type: "text" | "code" | "insight" | "hint" | "remediation";
  content: string;
  language?: string;
  tokenCount?: number;
  createdAt: string;
}

export interface AIReportEntity {
  id: string;
  userId: string;
  reportType: "readiness" | "diagnostics" | "curriculum_plan";
  readinessScore: number;
  readinessTier: string;
  summary: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface AIRecommendationEntity {
  id: string;
  userId: string;
  recommendationType: "weakness" | "curriculum" | "strength" | "contest";
  topic: string;
  priority: "High" | "Medium" | "Stretch";
  insight: string;
  actionableStep: string;
  suggestedProblemSlug?: string;
  status: "active" | "completed" | "dismissed";
  createdAt: string;
}

// In-Memory Fallback Seed Stores
const conversationsStore = new Map<string, AIConversationEntity>();
const messagesStore = new Map<string, AIMessageEntity[]>();
const reportsStore = new Map<string, AIReportEntity[]>();
const recommendationsStore = new Map<string, AIRecommendationEntity[]>();

// Seed default initial mentor conversation
const initialConvId = "conv-seed-default";
conversationsStore.set(initialConvId, {
  id: initialConvId,
  userId: "usr-student-1",
  topic: "Dynamic Programming",
  title: "Dynamic Programming & Memoization Invariants",
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 1800000).toISOString(),
});

messagesStore.set(initialConvId, [
  {
    id: "msg-seed-1",
    conversationId: initialConvId,
    role: "ai",
    type: "text",
    content: "Welcome to your Algora Socratic AI Mentor session. What algorithmic concept or invariant would you like to explore today?",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
]);

export class AIRepository {
  static async getConversationsByUserId(userId: string): Promise<AIConversationEntity[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<AIConversationEntity>(
          `SELECT id, user_id as "userId", topic, title, problem_slug as "problemSlug", context_data as "contextData", created_at as "createdAt", updated_at as "updatedAt"
           FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        console.warn("[AIRepository] DB fallback for getConversationsByUserId:", err);
      }
    }

    return Array.from(conversationsStore.values())
      .filter((c) => c.userId === userId || c.userId === "usr-student-1")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getConversationById(id: string): Promise<AIConversationEntity | null> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<AIConversationEntity>(
          `SELECT id, user_id as "userId", topic, title, problem_slug as "problemSlug", context_data as "contextData", created_at as "createdAt", updated_at as "updatedAt"
           FROM ai_conversations WHERE id = $1`,
          [id]
        );
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn("[AIRepository] DB fallback for getConversationById:", err);
      }
    }
    return conversationsStore.get(id) || null;
  }

  static async saveConversation(conv: AIConversationEntity): Promise<void> {
    conversationsStore.set(conv.id, conv);
    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO ai_conversations (id, user_id, topic, title, problem_slug, context_data, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET title = $4, topic = $3, updated_at = $8`,
          [conv.id, conv.userId, conv.topic, conv.title, conv.problemSlug || null, JSON.stringify(conv.contextData || {}), conv.createdAt, conv.updatedAt]
        );
      } catch (err) {
        console.warn("[AIRepository] DB save conversation error:", err);
      }
    }
  }

  static async getMessagesByConversationId(conversationId: string): Promise<AIMessageEntity[]> {
    if (Database.isReady()) {
      try {
        const res = await Database.query<AIMessageEntity>(
          `SELECT id, conversation_id as "conversationId", role, type, content, language, token_count as "tokenCount", created_at as "createdAt"
           FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
          [conversationId]
        );
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        console.warn("[AIRepository] DB fallback for getMessagesByConversationId:", err);
      }
    }
    return messagesStore.get(conversationId) || [];
  }

  static async saveMessage(msg: AIMessageEntity): Promise<void> {
    const list = messagesStore.get(msg.conversationId) || [];
    list.push(msg);
    messagesStore.set(msg.conversationId, list);

    if (Database.isReady()) {
      try {
        await Database.query(
          `INSERT INTO ai_messages (id, conversation_id, role, type, content, language, token_count, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [msg.id, msg.conversationId, msg.role, msg.type, msg.content, msg.language || null, msg.tokenCount || 0, msg.createdAt]
        );
      } catch (err) {
        console.warn("[AIRepository] DB save message error:", err);
      }
    }
  }

  static async getReportsByUserId(userId: string): Promise<AIReportEntity[]> {
    return reportsStore.get(userId) || [];
  }

  static async saveReport(report: AIReportEntity): Promise<void> {
    const userReports = reportsStore.get(report.userId) || [];
    userReports.unshift(report);
    reportsStore.set(report.userId, userReports);
  }

  static async getRecommendationsByUserId(userId: string): Promise<AIRecommendationEntity[]> {
    return recommendationsStore.get(userId) || [
      {
        id: "rec-seed-1",
        userId,
        recommendationType: "weakness",
        topic: "Dynamic Programming",
        priority: "High",
        insight: "Accuracy dips on 2D grid DP memoization compared to 1D arrays.",
        actionableStep: "Practice state transition modeling on Coin Change and Unique Paths.",
        suggestedProblemSlug: "coin-change",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "rec-seed-2",
        userId,
        recommendationType: "curriculum",
        topic: "Monotonic Stacks",
        priority: "Medium",
        insight: "Higher than average runtime on span-based array problems.",
        actionableStep: "Learn the decreasing stack template for Next Greater Element.",
        suggestedProblemSlug: "daily-temperatures",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  static async saveRecommendation(rec: AIRecommendationEntity): Promise<void> {
    const list = recommendationsStore.get(rec.userId) || [];
    const idx = list.findIndex((r) => r.id === rec.id);
    if (idx >= 0) {
      list[idx] = rec;
    } else {
      list.unshift(rec);
    }
    recommendationsStore.set(rec.userId, list);
  }
}
