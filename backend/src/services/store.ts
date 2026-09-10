import {
  UserEntity,
  ProfileEntity,
  SubmissionEntity,
  SolvedProblemEntity,
  AchievementEntity,
  UserAchievementEntity,
  LearningProgressEntity,
  ContestEntity,
  ContestProblemEntity,
  ContestParticipantEntity,
  ContestSubmissionEntity,
  RatingHistoryEntity,
  XPTransactionEntity,
} from "../types";
import { hashPassword } from "../utils/crypto";

// Seed users
const initialPasswordHash = hashPassword("algora123");

const SEED_USERS: UserEntity[] = [
  {
    id: "usr-arjun-patel",
    email: "arjun.patel@algora.edu",
    username: "arjun_patel",
    passwordHash: initialPasswordHash,
    role: "student",
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-priya-sharma",
    email: "priya.sharma@algora.edu",
    username: "priya_s",
    passwordHash: initialPasswordHash,
    role: "student",
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-rahul-kumar",
    email: "rahul.kumar@algora.edu",
    username: "rahul_k",
    passwordHash: initialPasswordHash,
    role: "student",
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-sneha-reddy",
    email: "sneha.reddy@algora.edu",
    username: "sneha_r",
    passwordHash: initialPasswordHash,
    role: "student",
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-vikram-nair",
    email: "vikram.nair@algora.edu",
    username: "vikram_n",
    passwordHash: initialPasswordHash,
    role: "student",
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_PROFILES: ProfileEntity[] = [
  {
    id: "prof-arjun-patel",
    userId: "usr-arjun-patel",
    fullName: "Arjun Patel",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "CS Undergraduate @ NIT Trichy. Graph algorithms, competitive programming & full-stack systems.",
    institution: "NIT Trichy",
    githubHandle: "arjunpatel-cs",
    preferredLanguage: "Python",
    rating: 1842,
    streakDays: 7,
    totalXP: 4820,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof-priya-sharma",
    userId: "usr-priya-sharma",
    fullName: "Priya Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Algorithms researcher & competitive coder @ IIT Bombay. ICPC Regionalist.",
    institution: "IIT Bombay",
    githubHandle: "priyasharma",
    preferredLanguage: "C++",
    rating: 2380,
    streakDays: 32,
    totalXP: 14850,
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof-rahul-kumar",
    userId: "usr-rahul-kumar",
    fullName: "Rahul Kumar",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Speed coder & systems architect @ IIT Delhi. Master rating candidate.",
    institution: "IIT Delhi",
    githubHandle: "rahulkumar",
    preferredLanguage: "C++",
    rating: 2210,
    streakDays: 19,
    totalXP: 11200,
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof-sneha-reddy",
    userId: "usr-sneha-reddy",
    fullName: "Sneha Reddy",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    bio: "Dynamic programming enthusiast @ BITS Pilani. FAANG prep tutor.",
    institution: "BITS Pilani",
    githubHandle: "snehareddy",
    preferredLanguage: "Java",
    rating: 2040,
    streakDays: 14,
    totalXP: 9400,
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof-vikram-nair",
    userId: "usr-vikram-nair",
    fullName: "Vikram Nair",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Math & combinatorics enthusiast @ IIIT Hyderabad.",
    institution: "IIIT Hyderabad",
    githubHandle: "vikramnair",
    preferredLanguage: "Python",
    rating: 1960,
    streakDays: 11,
    totalXP: 8100,
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

// Complete Catalog of Badges across 4 categories
const SEED_ACHIEVEMENTS: AchievementEntity[] = [
  // 1. Learning
  {
    id: "ach-first-topic",
    badgeCode: "FIRST_TOPIC",
    badgeName: "First Topic",
    description: "Complete all introductory modules and quizzes for your first learning topic.",
    iconName: "BookOpen",
    xpReward: 150,
    category: "learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-streak-7",
    badgeCode: "STREAK_7_DAYS",
    badgeName: "7 Day Streak",
    description: "Maintain a daily problem-solving streak for 7 consecutive days.",
    iconName: "Flame",
    xpReward: 250,
    category: "learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-streak-30",
    badgeCode: "STREAK_30_DAYS",
    badgeName: "30 Day Streak",
    description: "Achieve mastery through unbroken dedication with a 30-day streak.",
    iconName: "Zap",
    xpReward: 1000,
    category: "learning",
    createdAt: new Date().toISOString(),
  },

  // 2. Problem Solving
  {
    id: "ach-first-ac",
    badgeCode: "FIRST_ACCEPTED",
    badgeName: "First AC",
    description: "Successfully solve your first algorithmic challenge with an Accepted verdict.",
    iconName: "CheckCircle2",
    xpReward: 100,
    category: "problem_solving",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-solved-50",
    badgeCode: "SOLVED_50",
    badgeName: "50 Solved",
    description: "Reach the milestone of 50 unique accepted problem solutions.",
    iconName: "Award",
    xpReward: 500,
    category: "problem_solving",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-solved-100",
    badgeCode: "SOLVED_100",
    badgeName: "100 Solved",
    description: "Centurion coder! Successfully solve 100 unique algorithmic problems.",
    iconName: "Crown",
    xpReward: 1200,
    category: "problem_solving",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-hard-master",
    badgeCode: "HARD_PROBLEM_MASTER",
    badgeName: "Hard Problem Master",
    description: "Solve 10 Hard-difficulty algorithmic problems with optimal space-time complexity.",
    iconName: "ShieldAlert",
    xpReward: 800,
    category: "problem_solving",
    createdAt: new Date().toISOString(),
  },

  // 3. Contest
  {
    id: "ach-first-contest",
    badgeCode: "FIRST_CONTEST",
    badgeName: "First Contest",
    description: "Register and participate in your first official Algora timed contest.",
    iconName: "Trophy",
    xpReward: 200,
    category: "contest",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-top-10",
    badgeCode: "TOP_10_FINISH",
    badgeName: "Top 10 Finish",
    description: "Finish in the top 10 positions of any official ranked contest.",
    iconName: "Medal",
    xpReward: 750,
    category: "contest",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-contest-champion",
    badgeCode: "CONTEST_CHAMPION",
    badgeName: "Contest Champion",
    description: "Claim 1st place Rank #1 in an official weekly or monthly contest.",
    iconName: "Sparkles",
    xpReward: 2000,
    category: "contest",
    createdAt: new Date().toISOString(),
  },

  // 4. AI Learning
  {
    id: "ach-ai-mentor",
    badgeCode: "AI_MENTOR_USER",
    badgeName: "AI Mentor User",
    description: "Leverage AI-guided code reviews, algorithmic diagnostics, and complexity hints.",
    iconName: "Brain",
    xpReward: 150,
    category: "ai_learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ach-daily-reviewer",
    badgeCode: "DAILY_REVIEWER",
    badgeName: "Daily Reviewer",
    description: "Complete spaced repetition daily review cycles for 5 consecutive days.",
    iconName: "Calendar",
    xpReward: 300,
    category: "ai_learning",
    createdAt: new Date().toISOString(),
  },
];

const SEED_USER_ACHIEVEMENTS: UserAchievementEntity[] = [
  {
    id: "uach-1",
    userId: "usr-arjun-patel",
    achievementId: "ach-first-ac",
    badgeCode: "FIRST_ACCEPTED",
    progressValue: 100,
    unlockedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    badgeName: "First AC",
    description: "Successfully solve your first algorithmic challenge with an Accepted verdict.",
    iconName: "CheckCircle2",
    xpReward: 100,
    category: "problem_solving",
  },
  {
    id: "uach-2",
    userId: "usr-arjun-patel",
    achievementId: "ach-streak-7",
    badgeCode: "STREAK_7_DAYS",
    progressValue: 100,
    unlockedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    badgeName: "7 Day Streak",
    description: "Maintain a daily problem-solving streak for 7 consecutive days.",
    iconName: "Flame",
    xpReward: 250,
    category: "learning",
  },
  {
    id: "uach-3",
    userId: "usr-arjun-patel",
    achievementId: "ach-first-contest",
    badgeCode: "FIRST_CONTEST",
    progressValue: 100,
    unlockedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    badgeName: "First Contest",
    description: "Register and participate in your first official Algora timed contest.",
    iconName: "Trophy",
    xpReward: 200,
    category: "contest",
  },
  {
    id: "uach-4",
    userId: "usr-arjun-patel",
    achievementId: "ach-ai-mentor",
    badgeCode: "AI_MENTOR_USER",
    progressValue: 100,
    unlockedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    badgeName: "AI Mentor User",
    description: "Leverage AI-guided code reviews, algorithmic diagnostics, and complexity hints.",
    iconName: "Brain",
    xpReward: 150,
    category: "ai_learning",
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
  {
    id: "lp-3",
    userId: "usr-arjun-patel",
    topic: "Binary Search",
    masteryScore: 72,
    solvedCount: 9,
    accuracyRate: 75,
    lastPracticedAt: new Date().toISOString(),
  },
  {
    id: "lp-4",
    userId: "usr-arjun-patel",
    topic: "Graphs & Trees",
    masteryScore: 84,
    solvedCount: 12,
    accuracyRate: 82,
    lastPracticedAt: new Date().toISOString(),
  },
];

// Contests
const SEED_CONTESTS: ContestEntity[] = [
  {
    id: "cnt-w148",
    title: "Algora Weekly Contest 148",
    description: "Standard weekly rated 90-minute algorithmic sprint with 4 original challenges ranging from Easy to Hard.",
    contestType: "Weekly Contest",
    startTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4.5 * 3600 * 1000).toISOString(),
    durationMinutes: 90,
    difficulty: "Medium",
    participantCount: 4210,
    status: "upcoming",
    registered: true,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cnt-live-147",
    title: "Algora Weekly Contest 147",
    description: "Live weekly competitive battle test. Dynamic programming, graph connectivity, and greedy scheduling.",
    contestType: "Weekly Contest",
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    difficulty: "Medium",
    participantCount: 3180,
    status: "active",
    registered: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cnt-faang-12",
    title: "FAANG Interview Assessment #12",
    description: "Timed company mock assessment modeled after Google and Meta technical screening loops.",
    contestType: "Company Assessment",
    startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
    durationMinutes: 120,
    difficulty: "Hard",
    participantCount: 1850,
    status: "upcoming",
    registered: false,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cnt-topic-graphs",
    title: "Graph Theory Mastery Sprint",
    description: "Topic-focused competition testing shortest path algorithms, topological sorting, and minimum spanning trees.",
    contestType: "Topic Contest",
    startTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 74 * 3600 * 1000).toISOString(),
    durationMinutes: 120,
    difficulty: "Medium",
    participantCount: 1240,
    status: "upcoming",
    registered: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cnt-month-aug",
    title: "Algora Grand Monthly Championship",
    description: "Monthly pinnacle challenge featuring 6 algorithmic puzzles and heavy rating multiplier.",
    contestType: "Monthly Contest",
    startTime: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString(),
    durationMinutes: 180,
    difficulty: "Hard",
    participantCount: 5200,
    status: "completed",
    registered: true,
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_CONTEST_PROBLEMS: ContestProblemEntity[] = [
  // For cnt-live-147
  {
    id: "cp-1",
    contestId: "cnt-live-147",
    problemId: 1,
    problemSlug: "two-sum",
    problemTitle: "Two City Scheduling",
    orderIndex: 1,
    scorePoints: 100,
    difficulty: "Easy",
    solved: true,
  },
  {
    id: "cp-2",
    contestId: "cnt-live-147",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    problemTitle: "Minimum Cost to Connect Points",
    orderIndex: 2,
    scorePoints: 200,
    difficulty: "Medium",
    solved: true,
  },
  {
    id: "cp-3",
    contestId: "cnt-live-147",
    problemId: 5,
    problemSlug: "climbing-stairs",
    problemTitle: "Kth Largest Element",
    orderIndex: 3,
    scorePoints: 200,
    difficulty: "Medium",
    solved: true,
  },
  {
    id: "cp-4",
    contestId: "cnt-live-147",
    problemId: 4,
    problemSlug: "merge-intervals",
    problemTitle: "Jump Game VII",
    orderIndex: 4,
    scorePoints: 300,
    difficulty: "Hard",
    solved: false,
  },
  // For cnt-w148
  {
    id: "cp-5",
    contestId: "cnt-w148",
    problemId: 1,
    problemSlug: "two-sum",
    problemTitle: "Subarray Sum Equals K",
    orderIndex: 1,
    scorePoints: 100,
    difficulty: "Easy",
  },
  {
    id: "cp-6",
    contestId: "cnt-w148",
    problemId: 3,
    problemSlug: "valid-parentheses",
    problemTitle: "Decode String",
    orderIndex: 2,
    scorePoints: 200,
    difficulty: "Medium",
  },
  {
    id: "cp-7",
    contestId: "cnt-w148",
    problemId: 4,
    problemSlug: "merge-intervals",
    problemTitle: "Course Schedule II",
    orderIndex: 3,
    scorePoints: 200,
    difficulty: "Medium",
  },
  {
    id: "cp-8",
    contestId: "cnt-w148",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    problemTitle: "Word Ladder II",
    orderIndex: 4,
    scorePoints: 300,
    difficulty: "Hard",
  },
];

const SEED_CONTEST_PARTICIPANTS: ContestParticipantEntity[] = [
  {
    id: "cp-part-1",
    contestId: "cnt-live-147",
    userId: "usr-priya-sharma",
    username: "priya_s",
    fullName: "Priya Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    institution: "IIT Bombay",
    score: 800,
    penaltySeconds: 2410,
    rank: 1,
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "cp-part-2",
    contestId: "cnt-live-147",
    userId: "usr-rahul-kumar",
    username: "rahul_k",
    fullName: "Rahul Kumar",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    institution: "IIT Delhi",
    score: 800,
    penaltySeconds: 3120,
    rank: 2,
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "cp-part-3",
    contestId: "cnt-live-147",
    userId: "usr-sneha-reddy",
    username: "sneha_r",
    fullName: "Sneha Reddy",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    institution: "BITS Pilani",
    score: 500,
    penaltySeconds: 1850,
    rank: 3,
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "cp-part-4",
    contestId: "cnt-live-147",
    userId: "usr-arjun-patel",
    username: "arjun_patel",
    fullName: "Arjun Patel",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    institution: "NIT Trichy",
    score: 500,
    penaltySeconds: 2140,
    rank: 4,
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "cp-part-5",
    contestId: "cnt-live-147",
    userId: "usr-vikram-nair",
    username: "vikram_n",
    fullName: "Vikram Nair",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    institution: "IIIT Hyderabad",
    score: 300,
    penaltySeconds: 1400,
    rank: 5,
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_RATINGS_HISTORY: RatingHistoryEntity[] = [
  {
    id: "rh-1",
    userId: "usr-arjun-patel",
    contestId: "cnt-month-aug",
    contestTitle: "Algora Grand Monthly Championship",
    oldRating: 1754,
    newRating: 1842,
    ratingChange: 88,
    reason: "Rank #12 in Algora Grand Monthly Championship",
    recordedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rh-2",
    userId: "usr-arjun-patel",
    contestId: "cnt-w146",
    contestTitle: "Algora Weekly Contest 146",
    oldRating: 1772,
    newRating: 1754,
    ratingChange: -18,
    reason: "Rank #412 in Algora Weekly Contest 146",
    recordedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rh-3",
    userId: "usr-arjun-patel",
    contestId: "cnt-w145",
    contestTitle: "Algora Weekly Contest 145",
    oldRating: 1722,
    newRating: 1772,
    ratingChange: 50,
    reason: "Rank #178 in Algora Weekly Contest 145",
    recordedAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rh-4",
    userId: "usr-arjun-patel",
    contestId: "cnt-faang-11",
    contestTitle: "FAANG Sprint #11",
    oldRating: 1650,
    newRating: 1722,
    ratingChange: 72,
    reason: "Rank #89 in FAANG Sprint #11",
    recordedAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_XP_TRANSACTIONS: XPTransactionEntity[] = [
  {
    id: "xp-1",
    userId: "usr-arjun-patel",
    amount: 100,
    source: "Accepted Solution",
    description: "Solved 'Longest Palindromic Substring' (Medium)",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "xp-2",
    userId: "usr-arjun-patel",
    amount: 50,
    source: "Accepted Solution",
    description: "Solved 'Climbing Stairs' (Easy)",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "xp-3",
    userId: "usr-arjun-patel",
    amount: 250,
    source: "Topic Completion",
    description: "Completed 'Arrays & Hashing' master topic module",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "xp-4",
    userId: "usr-arjun-patel",
    amount: 150,
    source: "Quiz Completion",
    description: "Passed 'Time Complexity and Big-O' diagnostic quiz",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: "xp-5",
    userId: "usr-arjun-patel",
    amount: 300,
    source: "Contest Participation",
    description: "Participated in Algora Grand Monthly Championship",
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "xp-6",
    userId: "usr-arjun-patel",
    amount: 500,
    source: "Hard Problem Bonus",
    description: "Solved 'Merge k Sorted Lists' (Hard)",
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "xp-7",
    userId: "usr-arjun-patel",
    amount: 200,
    source: "Daily Review Completion",
    description: "Completed 5-question spaced repetition review session",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
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
  public contests: Map<string, ContestEntity> = new Map();
  public contestProblems: Map<string, ContestProblemEntity> = new Map();
  public contestParticipants: Map<string, ContestParticipantEntity> = new Map();
  public contestSubmissions: Map<string, ContestSubmissionEntity> = new Map();
  public ratingsHistory: Map<string, RatingHistoryEntity> = new Map();
  public xpTransactions: Map<string, XPTransactionEntity> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    for (const u of SEED_USERS) {
      this.users.set(u.id, { ...u });
    }
    for (const p of SEED_PROFILES) {
      this.profiles.set(p.userId, { ...p });
    }
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
    for (const c of SEED_CONTESTS) {
      this.contests.set(c.id, { ...c });
    }
    for (const cp of SEED_CONTEST_PROBLEMS) {
      this.contestProblems.set(cp.id, { ...cp });
    }
    for (const part of SEED_CONTEST_PARTICIPANTS) {
      this.contestParticipants.set(part.id, { ...part });
    }
    for (const rh of SEED_RATINGS_HISTORY) {
      this.ratingsHistory.set(rh.id, { ...rh });
    }
    for (const xp of SEED_XP_TRANSACTIONS) {
      this.xpTransactions.set(xp.id, { ...xp });
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
    this.contests.clear();
    this.contestProblems.clear();
    this.contestParticipants.clear();
    this.contestSubmissions.clear();
    this.ratingsHistory.clear();
    this.xpTransactions.clear();
    this.seed();
  }
}

export const db = new InMemoryDatabase();
