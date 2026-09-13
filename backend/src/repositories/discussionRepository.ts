import { Database } from "../db/connection";

export interface DiscussionEntity {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  problemSlug?: string;
  contestId?: string;
  category: string; // 'general' | 'problem' | 'contest' | 'career' | 'interview' | 'algorithms'
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  viewsCount: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  acceptedReplyId?: string;
  status: string; // 'active' | 'flagged' | 'hidden' | 'deleted'
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReplyEntity {
  id: string;
  discussionId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  parentReplyId?: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionVoteEntity {
  id: string;
  userId: string;
  targetType: "discussion" | "reply";
  targetId: string;
  voteType: "up" | "down";
  createdAt: string;
}

// In-memory fallback stores
const memoryDiscussions = new Map<string, DiscussionEntity>();
const memoryReplies = new Map<string, DiscussionReplyEntity>();
const memoryVotes = new Map<string, DiscussionVoteEntity>();

// Seed some initial community discussions for richness
const initialDiscussions: DiscussionEntity[] = [
  {
    id: "disc-1",
    userId: "u-1",
    authorName: "Arjun Sharma",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=arjun",
    problemSlug: "two-sum",
    category: "problem",
    title: "Optimal O(N) One-Pass Hash Map approach vs Sorting Two-Pointers",
    content: `When solving **Two Sum**, which tradeoff do you prefer in production systems?\n\n- **Hash Map**: O(N) time complexity, O(N) memory allocation.\n- **Sorting + Two Pointers**: O(N log N) time, O(1) auxiliary space (in-place).\n\n\`\`\`python\ndef twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n\`\`\`\n\nCurious how interviewers at Google / Meta view this trade-off!`,
    tags: ["hash-map", "time-complexity", "google", "meta"],
    upvotes: 48,
    downvotes: 1,
    viewsCount: 1420,
    replyCount: 3,
    isPinned: true,
    isLocked: false,
    acceptedReplyId: "reply-1",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "disc-2",
    userId: "u-2",
    authorName: "Priya Patel",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=priya",
    problemSlug: "lru-cache",
    category: "algorithms",
    title: "Double-Linked List + Hash Map: Avoiding race conditions in thread-safe LRU Cache",
    content: `Implementing a standard LRU Cache with \`OrderedDict\` in Python or doubly-linked list nodes in C++ is great for single-threaded benchmarks. How do you approach read-write locking without throttling concurrency under heavy read traffic?`,
    tags: ["system-design", "lru-cache", "concurrency", "c++"],
    upvotes: 35,
    downvotes: 0,
    viewsCount: 890,
    replyCount: 2,
    isPinned: false,
    isLocked: false,
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "disc-3",
    userId: "u-3",
    authorName: "Rohan Verma",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rohan",
    category: "interview",
    title: "FAANG 2026 Strategy: From 1200 Rating to Google L5 in 6 Months",
    content: `Here is the exact study plan that helped me transition from grinding random easy problems to mastering DP on trees, segment trees, and system design pipelines:\n\n1. Master Patterns (Sliding Window, Monotonic Stack, Two Pointers)\n2. 50 Hard Problems across Graphs and DP\n3. Weekly mock interviews with Algora AI Mentor\n\nDrop your questions below!`,
    tags: ["faang", "roadmap", "google", "mentorship"],
    upvotes: 94,
    downvotes: 2,
    viewsCount: 3200,
    replyCount: 5,
    isPinned: true,
    isLocked: false,
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const initialReplies: DiscussionReplyEntity[] = [
  {
    id: "reply-1",
    discussionId: "disc-1",
    userId: "u-3",
    authorName: "Rohan Verma",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rohan",
    content: "At Google, interviewers strongly favor the **One-Pass Hash Map** because O(N) runtime is optimal. However, if the array is already sorted or memory constraint is strictly embedded, you should proactively mention Two Pointers!",
    codeSnippet: `// Two-Pointer snippet\nint left = 0, right = nums.size() - 1;\nwhile (left < right) {\n    int sum = nums[left] + nums[right];\n    if (sum == target) return {left, right};\n    else if (sum < target) left++;\n    else right--;\n}`,
    language: "cpp",
    upvotes: 29,
    downvotes: 0,
    isAcceptedAnswer: true,
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "reply-2",
    discussionId: "disc-1",
    userId: "u-4",
    authorName: "Ananya Iyer",
    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ananya",
    content: "Great breakdown! Don't forget that if the question asks for the indices (not just values), sorting requires storing (val, original_idx) pairs, which destroys the O(1) space advantage.",
    upvotes: 14,
    downvotes: 0,
    isAcceptedAnswer: false,
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

initialDiscussions.forEach((d) => memoryDiscussions.set(d.id, d));
initialReplies.forEach((r) => memoryReplies.set(r.id, r));

export class DiscussionRepository {
  public static async create(data: Omit<DiscussionEntity, "id" | "upvotes" | "downvotes" | "viewsCount" | "replyCount" | "isPinned" | "isLocked" | "status" | "createdAt" | "updatedAt">): Promise<DiscussionEntity> {
    const id = `disc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const entity: DiscussionEntity = {
      ...data,
      id,
      upvotes: 0,
      downvotes: 0,
      viewsCount: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO discussions (id, user_id, author_name, author_avatar, problem_slug, contest_id, category, title, content, tags, upvotes, downvotes, views_count, reply_count, is_pinned, is_locked, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0, 0, 0, false, false, 'active', $11, $12)`,
        [
          entity.id,
          entity.userId,
          entity.authorName,
          entity.authorAvatar || null,
          entity.problemSlug || null,
          entity.contestId || null,
          entity.category,
          entity.title,
          entity.content,
          JSON.stringify(entity.tags || []),
          entity.createdAt,
          entity.updatedAt,
        ]
      );
    }

    memoryDiscussions.set(id, entity);
    return entity;
  }

  public static async findById(id: string): Promise<DiscussionEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<{
        id: string;
        user_id: string;
        author_name: string;
        author_avatar: string;
        problem_slug: string;
        contest_id: string;
        category: string;
        title: string;
        content: string;
        tags: any;
        upvotes: number;
        downvotes: number;
        views_count: number;
        reply_count: number;
        is_pinned: boolean;
        is_locked: boolean;
        accepted_reply_id: string;
        status: string;
        created_at: string;
        updated_at: string;
      }>("SELECT * FROM discussions WHERE id = $1", [id]);

      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id: r.id,
          userId: r.user_id,
          authorName: r.author_name,
          authorAvatar: r.author_avatar,
          problemSlug: r.problem_slug,
          contestId: r.contest_id,
          category: r.category,
          title: r.title,
          content: r.content,
          tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [],
          upvotes: Number(r.upvotes),
          downvotes: Number(r.downvotes),
          viewsCount: Number(r.views_count),
          replyCount: Number(r.reply_count),
          isPinned: r.is_pinned,
          isLocked: r.is_locked,
          acceptedReplyId: r.accepted_reply_id,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }
    }
    return memoryDiscussions.get(id) || null;
  }

  public static async list(params: {
    problemSlug?: string;
    contestId?: string;
    category?: string;
    tag?: string;
    search?: string;
    sort?: "trending" | "newest" | "top" | "unanswered";
    limit?: number;
    offset?: number;
  }): Promise<{ items: DiscussionEntity[]; total: number }> {
    const pool = Database.getPool();
    if (pool) {
      let conditions = ["status != 'deleted'"];
      const values: any[] = [];
      let idx = 1;

      if (params.problemSlug) {
        conditions.push(`problem_slug = $${idx++}`);
        values.push(params.problemSlug);
      }
      if (params.contestId) {
        conditions.push(`contest_id = $${idx++}`);
        values.push(params.contestId);
      }
      if (params.category && params.category !== "all") {
        conditions.push(`category = $${idx++}`);
        values.push(params.category);
      }
      if (params.search) {
        conditions.push(`(title ILIKE $${idx} OR content ILIKE $${idx})`);
        values.push(`%${params.search}%`);
        idx++;
      }

      let orderBy = "is_pinned DESC, created_at DESC";
      if (params.sort === "top") orderBy = "is_pinned DESC, upvotes DESC";
      else if (params.sort === "trending") orderBy = "is_pinned DESC, (upvotes * 2 + views_count) DESC";
      else if (params.sort === "unanswered") {
        conditions.push("reply_count = 0");
      }

      const limit = params.limit || 20;
      const offset = params.offset || 0;

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const q = `SELECT * FROM discussions ${whereClause} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
      const countQ = `SELECT COUNT(*) as total FROM discussions ${whereClause}`;

      const [res, countRes] = await Promise.all([
        Database.query(q, values),
        Database.query<{ total: string }>(countQ, values),
      ]);

      const items = res.rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        authorName: r.author_name,
        authorAvatar: r.author_avatar,
        problemSlug: r.problem_slug,
        contestId: r.contest_id,
        category: r.category,
        title: r.title,
        content: r.content,
        tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [],
        upvotes: Number(r.upvotes),
        downvotes: Number(r.downvotes),
        viewsCount: Number(r.views_count),
        replyCount: Number(r.reply_count),
        isPinned: r.is_pinned,
        isLocked: r.is_locked,
        acceptedReplyId: r.accepted_reply_id,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return { items, total: parseInt(countRes.rows[0]?.total || "0", 10) };
    }

    // In-memory filter
    let arr = Array.from(memoryDiscussions.values()).filter((d) => d.status !== "deleted");
    if (params.problemSlug) arr = arr.filter((d) => d.problemSlug === params.problemSlug);
    if (params.contestId) arr = arr.filter((d) => d.contestId === params.contestId);
    if (params.category && params.category !== "all") arr = arr.filter((d) => d.category === params.category);
    if (params.search) {
      const q = params.search.toLowerCase();
      arr = arr.filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q));
    }
    if (params.sort === "top") {
      arr.sort((a, b) => b.upvotes - a.upvotes);
    } else if (params.sort === "trending") {
      arr.sort((a, b) => (b.upvotes * 2 + b.viewsCount) - (a.upvotes * 2 + a.viewsCount));
    } else if (params.sort === "unanswered") {
      arr = arr.filter((d) => d.replyCount === 0);
    } else {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pinned to top
    arr.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    const total = arr.length;
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    return { items: arr.slice(offset, offset + limit), total };
  }

  public static async incrementViews(id: string): Promise<void> {
    const disc = memoryDiscussions.get(id);
    if (disc) disc.viewsCount += 1;

    const pool = Database.getPool();
    if (pool) {
      await Database.query("UPDATE discussions SET views_count = views_count + 1 WHERE id = $1", [id]);
    }
  }

  public static async vote(userId: string, targetType: "discussion" | "reply", targetId: string, voteType: "up" | "down"): Promise<{ upvotes: number; downvotes: number; userVote: string | null }> {
    const voteKey = `${userId}:${targetType}:${targetId}`;
    const existing = memoryVotes.get(voteKey);

    let voteDeltaUp = 0;
    let voteDeltaDown = 0;
    let nextUserVote: string | null = voteType;

    if (existing) {
      if (existing.voteType === voteType) {
        // Toggle off
        memoryVotes.delete(voteKey);
        nextUserVote = null;
        if (voteType === "up") voteDeltaUp = -1;
        else voteDeltaDown = -1;
      } else {
        // Switch vote
        existing.voteType = voteType;
        if (voteType === "up") {
          voteDeltaUp = 1;
          voteDeltaDown = -1;
        } else {
          voteDeltaUp = -1;
          voteDeltaDown = 1;
        }
      }
    } else {
      memoryVotes.set(voteKey, {
        id: `vote-${Date.now()}`,
        userId,
        targetType,
        targetId,
        voteType,
        createdAt: new Date().toISOString(),
      });
      if (voteType === "up") voteDeltaUp = 1;
      else voteDeltaDown = 1;
    }

    let upvotes = 0;
    let downvotes = 0;

    if (targetType === "discussion") {
      const disc = memoryDiscussions.get(targetId);
      if (disc) {
        disc.upvotes = Math.max(0, disc.upvotes + voteDeltaUp);
        disc.downvotes = Math.max(0, disc.downvotes + voteDeltaDown);
        upvotes = disc.upvotes;
        downvotes = disc.downvotes;
      }
      const pool = Database.getPool();
      if (pool) {
        await Database.query(
          "UPDATE discussions SET upvotes = GREATEST(0, upvotes + $1), downvotes = GREATEST(0, downvotes + $2) WHERE id = $3",
          [voteDeltaUp, voteDeltaDown, targetId]
        );
      }
    } else {
      const rep = memoryReplies.get(targetId);
      if (rep) {
        rep.upvotes = Math.max(0, rep.upvotes + voteDeltaUp);
        rep.downvotes = Math.max(0, rep.downvotes + voteDeltaDown);
        upvotes = rep.upvotes;
        downvotes = rep.downvotes;
      }
      const pool = Database.getPool();
      if (pool) {
        await Database.query(
          "UPDATE discussion_replies SET upvotes = GREATEST(0, upvotes + $1), downvotes = GREATEST(0, downvotes + $2) WHERE id = $3",
          [voteDeltaUp, voteDeltaDown, targetId]
        );
      }
    }

    return { upvotes, downvotes, userVote: nextUserVote };
  }

  public static async createReply(data: Omit<DiscussionReplyEntity, "id" | "upvotes" | "downvotes" | "isAcceptedAnswer" | "status" | "createdAt" | "updatedAt">): Promise<DiscussionReplyEntity> {
    const id = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const reply: DiscussionReplyEntity = {
      ...data,
      id,
      upvotes: 0,
      downvotes: 0,
      isAcceptedAnswer: false,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    memoryReplies.set(id, reply);

    // Increment reply count on discussion
    const disc = memoryDiscussions.get(data.discussionId);
    if (disc) {
      disc.replyCount += 1;
      disc.updatedAt = now;
    }

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO discussion_replies (id, discussion_id, user_id, author_name, author_avatar, parent_reply_id, content, code_snippet, language, upvotes, downvotes, is_accepted_answer, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, false, 'active', $10, $11)`,
        [
          reply.id,
          reply.discussionId,
          reply.userId,
          reply.authorName,
          reply.authorAvatar || null,
          reply.parentReplyId || null,
          reply.content,
          reply.codeSnippet || null,
          reply.language || null,
          reply.createdAt,
          reply.updatedAt,
        ]
      );
      await Database.query("UPDATE discussions SET reply_count = reply_count + 1, updated_at = $1 WHERE id = $2", [
        now,
        data.discussionId,
      ]);
    }

    return reply;
  }

  public static async listReplies(discussionId: string): Promise<DiscussionReplyEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<{
        id: string;
        discussion_id: string;
        user_id: string;
        author_name: string;
        author_avatar: string;
        parent_reply_id: string;
        content: string;
        code_snippet: string;
        language: string;
        upvotes: number;
        downvotes: number;
        is_accepted_answer: boolean;
        status: string;
        created_at: string;
        updated_at: string;
      }>("SELECT * FROM discussion_replies WHERE discussion_id = $1 AND status != 'deleted' ORDER BY is_accepted_answer DESC, upvotes DESC, created_at ASC", [discussionId]);

      return res.rows.map((r) => ({
        id: r.id,
        discussionId: r.discussion_id,
        userId: r.user_id,
        authorName: r.author_name,
        authorAvatar: r.author_avatar,
        parentReplyId: r.parent_reply_id,
        content: r.content,
        codeSnippet: r.code_snippet,
        language: r.language,
        upvotes: Number(r.upvotes),
        downvotes: Number(r.downvotes),
        isAcceptedAnswer: r.is_accepted_answer,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }

    return Array.from(memoryReplies.values())
      .filter((r) => r.discussionId === discussionId && r.status !== "deleted")
      .sort((a, b) => (b.isAcceptedAnswer ? 1 : 0) - (a.isAcceptedAnswer ? 1 : 0) || b.upvotes - a.upvotes);
  }

  public static async acceptAnswer(discussionId: string, replyId: string, authorUserId: string): Promise<boolean> {
    const disc = memoryDiscussions.get(discussionId);
    if (!disc || disc.userId !== authorUserId) return false;

    disc.acceptedReplyId = replyId;
    const rep = memoryReplies.get(replyId);
    if (rep) rep.isAcceptedAnswer = true;

    const pool = Database.getPool();
    if (pool) {
      await Database.query("UPDATE discussions SET accepted_reply_id = $1 WHERE id = $2", [replyId, discussionId]);
      await Database.query("UPDATE discussion_replies SET is_accepted_answer = true WHERE id = $1", [replyId]);
    }
    return true;
  }
}
