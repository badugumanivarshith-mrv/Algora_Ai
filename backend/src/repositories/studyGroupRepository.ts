import { Database } from "../db/connection";

export interface StudyGroupEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  avatarUrl?: string;
  isPrivate: boolean;
  inviteCode: string;
  maxMembers: number;
  memberCount: number;
  targetTopic: string;
  targetGoal: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupMemberEntity {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  contributionScore: number;
  problemsSolvedInGroup: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface StudyGroupMessageEntity {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  messageType: "text" | "code" | "goal_update" | "problem_share";
  metadata: any;
  createdAt: string;
}

export interface StudyGroupGoalEntity {
  id: string;
  groupId: string;
  title: string;
  description: string;
  targetProblemsCount: number;
  completedProblemsCount: number;
  deadline?: string;
  status: "active" | "completed";
  createdAt: string;
}

// In-memory fallback stores
const memoryGroups = new Map<string, StudyGroupEntity>();
const memoryMembers = new Map<string, StudyGroupMemberEntity[]>();
const memoryMessages = new Map<string, StudyGroupMessageEntity[]>();
const memoryGoals = new Map<string, StudyGroupGoalEntity[]>();

// Seed default study groups
const initialGroups: StudyGroupEntity[] = [
  {
    id: "grp-1",
    name: "FAANG 2026 Vanguard",
    slug: "faang-2026-vanguard",
    description: "Daily grinding of Hard Dynamic Programming, Graphs, and System Design patterns for senior SWE loops.",
    ownerId: "u-1",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=faang2026",
    isPrivate: false,
    inviteCode: "FAANG26",
    maxMembers: 30,
    memberCount: 14,
    targetTopic: "Dynamic Programming & Graphs",
    targetGoal: "Solve 75 NeetCode / Hard problems before Q3",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "grp-2",
    name: "CP Grandmaster Sprint",
    slug: "cp-grandmaster-sprint",
    description: "Speed contest solving, segment tree speedruns, bitmask math, and interactive problem theory.",
    ownerId: "u-2",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=cpmaster",
    isPrivate: false,
    inviteCode: "CPMAST",
    maxMembers: 20,
    memberCount: 8,
    targetTopic: "Advanced Trees & Combinatorics",
    targetGoal: "Reach 2000+ Algora Elo Rating",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "grp-3",
    name: "System Design & LLD Syndicate",
    slug: "system-design-lld-syndicate",
    description: "Deep dives into Distributed Key-Value Stores, Rate Limiters, Consistent Hashing, and Kafka pipelines.",
    ownerId: "u-3",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=sysdesign",
    isPrivate: false,
    inviteCode: "SYSDES",
    maxMembers: 50,
    memberCount: 22,
    targetTopic: "Distributed Systems & LLD",
    targetGoal: "Present 10 complete architecture blueprints",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

initialGroups.forEach((g) => {
  memoryGroups.set(g.id, g);
  memoryMembers.set(g.id, [
    {
      id: `mem-${g.id}-1`,
      groupId: g.id,
      userId: g.ownerId,
      username: "Arjun Sharma",
      fullName: "Arjun Sharma",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=arjun",
      role: "owner",
      contributionScore: 480,
      problemsSolvedInGroup: 28,
      joinedAt: g.createdAt,
      lastActiveAt: new Date().toISOString(),
    },
    {
      id: `mem-${g.id}-2`,
      groupId: g.id,
      userId: "u-2",
      username: "Priya Patel",
      fullName: "Priya Patel",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=priya",
      role: "member",
      contributionScore: 350,
      problemsSolvedInGroup: 19,
      joinedAt: g.createdAt,
      lastActiveAt: new Date().toISOString(),
    },
  ]);

  memoryMessages.set(g.id, [
    {
      id: `msg-${g.id}-1`,
      groupId: g.id,
      userId: g.ownerId,
      username: "Arjun Sharma",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=arjun",
      message: "Welcome everyone! Today's group objective is completing the LRU Cache with O(1) eviction.",
      messageType: "text",
      metadata: {},
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: `msg-${g.id}-2`,
      groupId: g.id,
      userId: "u-2",
      username: "Priya Patel",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=priya",
      message: "Just solved it in C++ with doubly linked list + unordered_map! Passed all 24 test cases.",
      messageType: "code",
      metadata: { problemSlug: "lru-cache", language: "cpp" },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ]);

  memoryGoals.set(g.id, [
    {
      id: `goal-${g.id}-1`,
      groupId: g.id,
      title: "Complete 30 Dynamic Programming Problems",
      description: "Knapsack, Longest Common Subsequence, Matrix Chain, and Tree DP.",
      targetProblemsCount: 30,
      completedProblemsCount: 18,
      deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
      status: "active",
      createdAt: g.createdAt,
    },
    {
      id: `goal-${g.id}-2`,
      groupId: g.id,
      title: "Team Mock Interview Round",
      description: "Pair up and conduct 45-minute peer mock coding rounds.",
      targetProblemsCount: 10,
      completedProblemsCount: 8,
      deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: "active",
      createdAt: g.createdAt,
    },
  ]);
});

export class StudyGroupRepository {
  public static async create(data: {
    name: string;
    description: string;
    ownerId: string;
    targetTopic: string;
    targetGoal: string;
    isPrivate?: boolean;
    maxMembers?: number;
    avatarUrl?: string;
  }): Promise<StudyGroupEntity> {
    const id = `grp-${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date().toISOString();

    const entity: StudyGroupEntity = {
      id,
      name: data.name,
      slug: `${slug}-${Math.random().toString(36).substr(2, 4)}`,
      description: data.description,
      ownerId: data.ownerId,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`,
      isPrivate: !!data.isPrivate,
      inviteCode,
      maxMembers: data.maxMembers || 50,
      memberCount: 1,
      targetTopic: data.targetTopic,
      targetGoal: data.targetGoal,
      createdAt: now,
      updatedAt: now,
    };

    memoryGroups.set(id, entity);
    memoryMembers.set(id, [
      {
        id: `mem-${id}-1`,
        groupId: id,
        userId: data.ownerId,
        username: "Group Leader",
        fullName: "Group Leader",
        role: "owner",
        contributionScore: 100,
        problemsSolvedInGroup: 0,
        joinedAt: now,
        lastActiveAt: now,
      },
    ]);
    memoryMessages.set(id, []);
    memoryGoals.set(id, [
      {
        id: `goal-${id}-1`,
        groupId: id,
        title: data.targetGoal,
        description: `Primary milestone for ${data.name}`,
        targetProblemsCount: 20,
        completedProblemsCount: 0,
        status: "active",
        createdAt: now,
      },
    ]);

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO study_groups (id, name, slug, description, owner_id, avatar_url, is_private, invite_code, max_members, member_count, target_topic, target_goal, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10, $11, $12, $13)`,
        [
          entity.id,
          entity.name,
          entity.slug,
          entity.description,
          entity.ownerId,
          entity.avatarUrl,
          entity.isPrivate,
          entity.inviteCode,
          entity.maxMembers,
          entity.targetTopic,
          entity.targetGoal,
          entity.createdAt,
          entity.updatedAt,
        ]
      );
      await Database.query(
        `INSERT INTO study_group_members (id, group_id, user_id, username, full_name, role, contribution_score, problems_solved_in_group, joined_at, last_active_at)
         VALUES ($1, $2, $3, $4, $5, 'owner', 100, 0, $6, $7)`,
        [`mem-${id}-1`, id, data.ownerId, "Group Leader", "Group Leader", now, now]
      );
    }

    return entity;
  }

  public static async findById(id: string): Promise<StudyGroupEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<any>("SELECT * FROM study_groups WHERE id = $1", [id]);
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          ownerId: r.owner_id,
          avatarUrl: r.avatar_url,
          isPrivate: r.is_private,
          inviteCode: r.invite_code,
          maxMembers: Number(r.max_members),
          memberCount: Number(r.member_count),
          targetTopic: r.target_topic,
          targetGoal: r.target_goal,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }
    }
    return memoryGroups.get(id) || null;
  }

  public static async list(search?: string, topic?: string): Promise<StudyGroupEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      let q = "SELECT * FROM study_groups WHERE is_private = false";
      const params: any[] = [];
      let idx = 1;
      if (topic && topic !== "all") {
        q += ` AND target_topic ILIKE $${idx++}`;
        params.push(`%${topic}%`);
      }
      if (search) {
        q += ` AND (name ILIKE $${idx} OR description ILIKE $${idx})`;
        params.push(`%${search}%`);
      }
      q += " ORDER BY member_count DESC, created_at DESC";
      const res = await Database.query<any>(q, params);
      return res.rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        ownerId: r.owner_id,
        avatarUrl: r.avatar_url,
        isPrivate: r.is_private,
        inviteCode: r.invite_code,
        maxMembers: Number(r.max_members),
        memberCount: Number(r.member_count),
        targetTopic: r.target_topic,
        targetGoal: r.target_goal,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }

    let arr = Array.from(memoryGroups.values()).filter((g) => !g.isPrivate);
    if (topic && topic !== "all") arr = arr.filter((g) => g.targetTopic.toLowerCase().includes(topic.toLowerCase()));
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter((g) => g.name.toLowerCase().includes(s) || g.description.toLowerCase().includes(s));
    }
    return arr.sort((a, b) => b.memberCount - a.memberCount);
  }

  public static async join(groupId: string, user: { id: string; username: string; fullName: string; avatarUrl?: string }): Promise<boolean> {
    const group = memoryGroups.get(groupId);
    if (!group) return false;

    const members = memoryMembers.get(groupId) || [];
    if (members.some((m) => m.userId === user.id)) return true; // Already joined
    if (members.length >= group.maxMembers) return false; // Full

    const now = new Date().toISOString();
    const newMember: StudyGroupMemberEntity = {
      id: `mem-${groupId}-${Date.now()}`,
      groupId,
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: "member",
      contributionScore: 10,
      problemsSolvedInGroup: 0,
      joinedAt: now,
      lastActiveAt: now,
    };

    members.push(newMember);
    memoryMembers.set(groupId, members);
    group.memberCount = members.length;

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO study_group_members (id, group_id, user_id, username, full_name, role, contribution_score, problems_solved_in_group, joined_at, last_active_at)
         VALUES ($1, $2, $3, $4, $5, 'member', 10, 0, $6, $7)
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [newMember.id, groupId, user.id, user.username, user.fullName, now, now]
      );
      await Database.query("UPDATE study_groups SET member_count = member_count + 1 WHERE id = $1", [groupId]);
    }
    return true;
  }

  public static async getMembers(groupId: string): Promise<StudyGroupMemberEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<any>("SELECT * FROM study_group_members WHERE group_id = $1 ORDER BY contribution_score DESC", [groupId]);
      return res.rows.map((r) => ({
        id: r.id,
        groupId: r.group_id,
        userId: r.user_id,
        username: r.username,
        fullName: r.full_name,
        avatarUrl: r.avatar_url,
        role: r.role,
        contributionScore: Number(r.contribution_score),
        problemsSolvedInGroup: Number(r.problems_solved_in_group),
        joinedAt: r.joined_at,
        lastActiveAt: r.last_active_at,
      }));
    }
    return (memoryMembers.get(groupId) || []).sort((a, b) => b.contributionScore - a.contributionScore);
  }

  public static async getMessages(groupId: string, limit = 50): Promise<StudyGroupMessageEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<any>("SELECT * FROM study_group_messages WHERE group_id = $1 ORDER BY created_at ASC LIMIT $2", [groupId, limit]);
      return res.rows.map((r) => ({
        id: r.id,
        groupId: r.group_id,
        userId: r.user_id,
        username: r.username,
        avatarUrl: r.avatar_url,
        message: r.message,
        messageType: r.message_type,
        metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata || {},
        createdAt: r.created_at,
      }));
    }
    return memoryMessages.get(groupId) || [];
  }

  public static async addMessage(data: {
    groupId: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    message: string;
    messageType?: "text" | "code" | "goal_update" | "problem_share";
    metadata?: any;
  }): Promise<StudyGroupMessageEntity> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const entity: StudyGroupMessageEntity = {
      id,
      groupId: data.groupId,
      userId: data.userId,
      username: data.username,
      avatarUrl: data.avatarUrl,
      message: data.message,
      messageType: data.messageType || "text",
      metadata: data.metadata || {},
      createdAt: now,
    };

    const msgs = memoryMessages.get(data.groupId) || [];
    msgs.push(entity);
    memoryMessages.set(data.groupId, msgs);

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO study_group_messages (id, group_id, user_id, username, avatar_url, message, message_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          entity.id,
          entity.groupId,
          entity.userId,
          entity.username,
          entity.avatarUrl || null,
          entity.message,
          entity.messageType,
          JSON.stringify(entity.metadata),
          entity.createdAt,
        ]
      );
    }
    return entity;
  }

  public static async getGoals(groupId: string): Promise<StudyGroupGoalEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<any>("SELECT * FROM study_group_goals WHERE group_id = $1 ORDER BY created_at ASC", [groupId]);
      return res.rows.map((r) => ({
        id: r.id,
        groupId: r.group_id,
        title: r.title,
        description: r.description,
        targetProblemsCount: Number(r.target_problems_count),
        completedProblemsCount: Number(r.completed_problems_count),
        deadline: r.deadline,
        status: r.status,
        createdAt: r.created_at,
      }));
    }
    return memoryGoals.get(groupId) || [];
  }
}
