import {
  UserEntity,
  ProfileEntity,
  SubmissionEntity,
  SolvedProblemEntity,
  AchievementEntity,
  UserAchievementEntity,
  LearningProgressEntity,
} from "../types";
import { hashPassword } from "../utils/crypto";

// Seed data
const initialPasswordHash = hashPassword("algora123");

const SEED_USER: UserEntity = {
  id: "usr-arjun-patel",
  email: "arjun.patel@algora.edu",
  username: "arjun_patel",
  passwordHash: initialPasswordHash,
  role: "student",
  createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const SEED_PROFILE: ProfileEntity = {
  id: "prof-arjun-patel",
  userId: "usr-arjun-patel",
  fullName: "Arjun Patel",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bio: "CS Undergraduate @ MIT. Passionate about graph algorithms, high-performance C++, and competitive programming.",
  institution: "Massachusetts Institute of Technology",
  githubHandle: "arjunpatel-cs",
  preferredLanguage: "Python",
  rating: 1842,
  streakDays: 6,
  totalXP: 1420,
  createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const SEED_SUBMISSIONS: SubmissionEntity[] = [
  {
    id: "sub-1001",
    userId: "usr-arjun-patel",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    problemTitle: "Longest Palindromic Substring",
    language: "Python",
    code: `class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s:\n            return ""\n        start, max_len = 0, 1\n        for i in range(len(s)):\n            l, r = i, i\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if r - l + 1 > max_len:\n                    start = l\n                    max_len = r - l + 1\n                l -= 1\n                r += 1\n            l, r = i, i + 1\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if r - l + 1 > max_len:\n                    start = l\n                    max_len = r - l + 1\n                l -= 1\n                r += 1\n        return s[start:start + max_len]`,
    status: "Accepted",
    runtimeMs: 42,
    memoryMb: 17.2,
    runtimePercentile: 91.4,
    memoryPercentile: 84.6,
    passedTests: 3,
    totalTests: 3,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "sub-1002",
    userId: "usr-arjun-patel",
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
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const SEED_SOLVED: SolvedProblemEntity[] = [
  {
    id: "sol-1",
    userId: "usr-arjun-patel",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    difficulty: "Medium",
    topic: "Two Pointers",
    firstSolvedAt: new Date(Date.now() - 7200000).toISOString(),
    bestRuntimeMs: 42,
    bestMemoryMb: 17.2,
  },
  {
    id: "sol-2",
    userId: "usr-arjun-patel",
    problemId: 5,
    problemSlug: "climbing-stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    firstSolvedAt: new Date(Date.now() - 14400000).toISOString(),
    bestRuntimeMs: 28,
    bestMemoryMb: 16.4,
  },
];

const SEED_ACHIEVEMENTS: AchievementEntity[] = [
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
];

const SEED_USER_ACHIEVEMENTS: UserAchievementEntity[] = [
  {
    id: "uach-1",
    userId: "usr-arjun-patel",
    achievementId: "ach-first-blood",
    badgeCode: "FIRST_ACCEPTED",
    progressValue: 100,
    unlockedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "uach-2",
    userId: "usr-arjun-patel",
    achievementId: "ach-speed-demon",
    badgeCode: "SPEED_DEMON",
    progressValue: 100,
    unlockedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_PROGRESS: LearningProgressEntity[] = [
  {
    id: "lp-1",
    userId: "usr-arjun-patel",
    topic: "Arrays & Hashing",
    masteryScore: 88,
    solvedCount: 18,
    accuracyRate: 88,
    lastPracticedAt: new Date().toISOString(),
  },
  {
    id: "lp-2",
    userId: "usr-arjun-patel",
    topic: "Dynamic Programming",
    masteryScore: 58,
    solvedCount: 6,
    accuracyRate: 58,
    lastPracticedAt: new Date().toISOString(),
  },
];

class InMemoryDatabase {
  public users: Map<string, UserEntity> = new Map();
  public profiles: Map<string, ProfileEntity> = new Map();
  public submissions: Map<string, SubmissionEntity> = new Map();
  public solvedProblems: Map<string, SolvedProblemEntity> = new Map();
  public achievements: Map<string, AchievementEntity> = new Map();
  public userAchievements: Map<string, UserAchievementEntity> = new Map();
  public learningProgress: Map<string, LearningProgressEntity> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    this.users.set(SEED_USER.id, { ...SEED_USER });
    this.profiles.set(SEED_PROFILE.userId, { ...SEED_PROFILE });

    for (const sub of SEED_SUBMISSIONS) {
      this.submissions.set(sub.id, { ...sub });
    }
    for (const sp of SEED_SOLVED) {
      this.solvedProblems.set(sp.id, { ...sp });
    }
    for (const ach of SEED_ACHIEVEMENTS) {
      this.achievements.set(ach.id, { ...ach });
    }
    for (const uach of SEED_USER_ACHIEVEMENTS) {
      this.userAchievements.set(uach.id, { ...uach });
    }
    for (const lp of SEED_PROGRESS) {
      this.learningProgress.set(lp.id, { ...lp });
    }
  }

  public reset() {
    this.users.clear();
    this.profiles.clear();
    this.submissions.clear();
    this.solvedProblems.clear();
    this.achievements.clear();
    this.userAchievements.clear();
    this.learningProgress.clear();
    this.seed();
  }
}

export const db = new InMemoryDatabase();
