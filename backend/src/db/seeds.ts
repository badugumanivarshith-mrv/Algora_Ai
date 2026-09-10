import { Database } from "./connection";
import { hashPassword } from "../utils/crypto";
import { logger } from "../utils/logger";
import { AchievementEntity, UserEntity, ProfileEntity } from "../types";

export const DEFAULT_ACHIEVEMENTS: AchievementEntity[] = [
  {
    id: "ach-first-blood",
    badgeCode: "FIRST_ACCEPTED",
    badgeName: "First Blood",
    description: "Successfully solved your first algorithm problem with an Accepted verdict.",
    iconName: "Zap",
    xpReward: 50,
    category: "milestone",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-speed-demon",
    badgeCode: "SPEED_DEMON",
    badgeName: "Speed Demon",
    description: "Submit a solution that beats 90% of submissions in runtime execution.",
    iconName: "Flame",
    xpReward: 100,
    category: "performance",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-streak-master",
    badgeCode: "STREAK_7",
    badgeName: "Streak Master",
    description: "Maintain a daily problem-solving streak for 7 consecutive days.",
    iconName: "Calendar",
    xpReward: 150,
    category: "consistency",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-dp-specialist",
    badgeCode: "DP_EXPERT",
    badgeName: "Dynamic Specialist",
    description: "Master 10 Dynamic Programming challenges with optimal memoization.",
    iconName: "Layers",
    xpReward: 200,
    category: "topic",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-graph-architect",
    badgeCode: "GRAPH_MASTER",
    badgeName: "Graph Architect",
    description: "Solve 10 Graph traversal and shortest path problems.",
    iconName: "Network",
    xpReward: 200,
    category: "topic",
    createdAt: new Date().toISOString(),
  },
];

export class Seeder {
  public static async runSeeds(): Promise<{ seeded: boolean; message: string }> {
    const pool = Database.getPool();

    if (!pool) {
      logger.info("[Seeder] Operating in fallback mode; standard seeds initialized.");
      return { seeded: true, message: "Seeds applied to local storage." };
    }

    const client = await pool.connect();
    try {
      // 1. Seed Achievements Catalogue
      for (const ach of DEFAULT_ACHIEVEMENTS) {
        await client.query(
          `
          INSERT INTO achievements (id, badge_code, badge_name, description, icon_name, xp_reward, category, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (badge_code) DO UPDATE SET
            badge_name = EXCLUDED.badge_name,
            description = EXCLUDED.description,
            icon_name = EXCLUDED.icon_name,
            xp_reward = EXCLUDED.xp_reward;
        `,
          [ach.id, ach.badgeCode, ach.badgeName, ach.description, ach.iconName, ach.xpReward, ach.category, ach.createdAt]
        );
      }

      // 2. Check if Demo User exists
      const demoUserId = "usr-arjun-patel";
      const { rows: existingUsers } = await client.query(`SELECT id FROM users WHERE id = $1;`, [demoUserId]);

      if (existingUsers.length === 0) {
        logger.info("[Seeder] Seeding default demo user Arjun Patel...");

        const now = new Date().toISOString();
        const demoUser: UserEntity = {
          id: demoUserId,
          email: "arjun.patel@algora.edu",
          username: "arjun_patel",
          passwordHash: hashPassword("algora123"),
          role: "student",
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          updatedAt: now,
        };

        const demoProfile: ProfileEntity = {
          id: `prof-${demoUserId}`,
          userId: demoUserId,
          fullName: "Arjun Patel",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          bio: "CS Undergraduate @ MIT. Passionate about graph algorithms, high-performance C++, and competitive programming.",
          institution: "Massachusetts Institute of Technology",
          githubHandle: "arjunpatel-cs",
          preferredLanguage: "Python",
          rating: 1842,
          streakDays: 6,
          totalXP: 1420,
          createdAt: demoUser.createdAt,
          updatedAt: now,
        };

        await client.query(
          `
          INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING;
        `,
          [demoUser.id, demoUser.email, demoUser.username, demoUser.passwordHash, demoUser.role, demoUser.createdAt, demoUser.updatedAt]
        );

        await client.query(
          `
          INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, institution, github_handle, preferred_language, rating, streak_days, total_xp, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (user_id) DO NOTHING;
        `,
          [
            demoProfile.id,
            demoProfile.userId,
            demoProfile.fullName,
            demoProfile.avatarUrl,
            demoProfile.bio,
            demoProfile.institution,
            demoProfile.githubHandle,
            demoProfile.preferredLanguage,
            demoProfile.rating,
            demoProfile.streakDays,
            demoProfile.totalXP,
            demoProfile.createdAt,
            demoProfile.updatedAt,
          ]
        );

        // Seed Sample Submissions
        const sub1 = {
          id: "sub-1001",
          userId: demoUserId,
          problemId: 2,
          problemSlug: "longest-palindromic-substring",
          problemTitle: "Longest Palindromic Substring",
          language: "Python",
          code: `class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s: return ""\n        start, max_len = 0, 1\n        for i in range(len(s)):\n            l, r = i, i\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if r - l + 1 > max_len:\n                    start, max_len = l, r - l + 1\n                l -= 1\n                r += 1\n            l, r = i, i + 1\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if r - l + 1 > max_len:\n                    start, max_len = l, r - l + 1\n                l -= 1\n                r += 1\n        return s[start:start + max_len]`,
          status: "Accepted",
          runtimeMs: 42,
          memoryMb: 17.2,
          runtimePercentile: 91.4,
          memoryPercentile: 84.6,
          passedTests: 3,
          totalTests: 3,
          createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        };

        const sub2 = {
          id: "sub-1002",
          userId: demoUserId,
          problemId: 5,
          problemSlug: "climbing-stairs",
          problemTitle: "Climbing Stairs",
          language: "Python",
          code: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        a, b = 1, 2\n        for _ in range(3, n + 1):\n            a, b = b, a + b\n        return b`,
          status: "Accepted",
          runtimeMs: 28,
          memoryMb: 16.4,
          runtimePercentile: 96.2,
          memoryPercentile: 89.1,
          passedTests: 3,
          totalTests: 3,
          createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        };

        for (const sub of [sub1, sub2]) {
          await client.query(
            `
            INSERT INTO submissions (id, user_id, problem_id, problem_slug, problem_title, language, code, status, runtime_ms, memory_mb, runtime_percentile, memory_percentile, passed_tests, total_tests, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (id) DO NOTHING;
          `,
            [
              sub.id,
              sub.userId,
              sub.problemId,
              sub.problemSlug,
              sub.problemTitle,
              sub.language,
              sub.code,
              sub.status,
              sub.runtimeMs,
              sub.memoryMb,
              sub.runtimePercentile,
              sub.memoryPercentile,
              sub.passedTests,
              sub.totalTests,
              sub.createdAt,
            ]
          );
        }

        // Seed Solved Problems
        await client.query(
          `
          INSERT INTO solved_problems (id, user_id, problem_id, problem_slug, difficulty, topic, first_solved_at, best_runtime_ms, best_memory_mb, created_at)
          VALUES
            ('sol-1', $1, 2, 'longest-palindromic-substring', 'Medium', 'Dynamic Programming', $2, 42, 17.20, $2),
            ('sol-2', $1, 5, 'climbing-stairs', 'Easy', 'Dynamic Programming', $3, 28, 16.40, $3)
          ON CONFLICT (user_id, problem_slug) DO NOTHING;
        `,
          [demoUserId, sub1.createdAt, sub2.createdAt]
        );

        // Seed User Achievements
        await client.query(
          `
          INSERT INTO user_achievements (id, user_id, achievement_id, badge_code, progress_value, unlocked_at)
          VALUES
            ('uach-1', $1, 'ach-first-blood', 'FIRST_ACCEPTED', 100, $2),
            ('uach-2', $1, 'ach-speed-demon', 'SPEED_DEMON', 100, $3)
          ON CONFLICT (user_id, badge_code) DO NOTHING;
        `,
          [demoUserId, sub1.createdAt, sub2.createdAt]
        );

        // Seed Learning Progress
        await client.query(
          `
          INSERT INTO learning_progress (id, user_id, topic, mastery_score, solved_count, accuracy_rate, last_practiced_at)
          VALUES
            ('lp-1', $1, 'Dynamic Programming', 88.5, 8, 92.0, $2),
            ('lp-2', $1, 'Graph Algorithms', 74.0, 5, 85.0, $3),
            ('lp-3', $1, 'Arrays & Hashing', 95.0, 12, 98.0, $2)
          ON CONFLICT (user_id, topic) DO NOTHING;
        `,
          [demoUserId, sub1.createdAt, sub2.createdAt]
        );

        logger.info("[Seeder] Demo seed data successfully populated.");
      }

      return { seeded: true, message: "PostgreSQL database seeded successfully." };
    } finally {
      client.release();
    }
  }
}
