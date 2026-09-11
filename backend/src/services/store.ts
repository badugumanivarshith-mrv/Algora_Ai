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
  StudyPlanEntity,
  StudyPlanTopicEntity,
  UserGoalEntity,
  UserGoalProgressEntity,
  RecommendationEntity,
  ReadinessScoreEntity,
  SkillAssessmentEntity,
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

const SEED_STUDY_PLANS: StudyPlanEntity[] = [
  {
    id: "plan-dsa-mastery",
    userId: "usr-arjun-patel",
    title: "DSA Mastery & Problem Solving Core",
    planType: "DSA Mastery",
    description: "Structured curriculum advancing from core linear data structures through trees, graphs, and dynamic programming.",
    targetRoleCompany: "General Software Engineer",
    difficulty: "Intermediate",
    durationWeeks: 8,
    dailyMinutesTarget: 45,
    progressPct: 65,
    status: "active",
    createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-faang-prep",
    userId: "usr-arjun-patel",
    title: "FAANG & Tier-1 Systems Interview Prep",
    planType: "Interview Preparation",
    description: "High-frequency problem patterns, concurrency design, and algorithmic optimization requested by Top Tech employers.",
    targetRoleCompany: "FAANG-style Tech Giants",
    difficulty: "Advanced",
    durationWeeks: 12,
    dailyMinutesTarget: 60,
    progressPct: 40,
    status: "active",
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-cp-ascent",
    userId: "usr-arjun-patel",
    title: "Competitive Programming Rated Ascent",
    planType: "Competitive Programming",
    description: "Speed-oriented problem solving, time limit optimization, and math/combinatorics for rated contest circuits.",
    targetRoleCompany: "Codeforces / ICPC / Algora Grand",
    difficulty: "Advanced",
    durationWeeks: 10,
    dailyMinutesTarget: 50,
    progressPct: 25,
    status: "active",
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-beginner-dsa",
    userId: "usr-arjun-patel",
    title: "Zero-to-One Programming Fundamentals",
    planType: "Beginner Roadmap",
    description: "Foundational syntax, time complexity notation, arrays, strings, and standard algorithmic idioms.",
    targetRoleCompany: "Junior Developer / Intern",
    difficulty: "Beginner",
    durationWeeks: 4,
    dailyMinutesTarget: 30,
    progressPct: 100,
    status: "completed",
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_STUDY_PLAN_TOPICS: StudyPlanTopicEntity[] = [
  // Topics for DSA Mastery
  {
    id: "spt-1",
    planId: "plan-dsa-mastery",
    topicName: "Arrays, Two Pointers & Hashing",
    orderIndex: 1,
    status: "completed",
    estimatedHours: 6.0,
    problemsCount: 8,
    solvedCount: 8,
    milestoneTitle: "Master O(N) Hash Table Invariants",
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "spt-2",
    planId: "plan-dsa-mastery",
    topicName: "Sliding Window & Monotonic Stack",
    orderIndex: 2,
    status: "completed",
    estimatedHours: 8.0,
    problemsCount: 10,
    solvedCount: 10,
    milestoneTitle: "Optimal Window Shrinking & Stack Next-Greater",
    createdAt: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "spt-3",
    planId: "plan-dsa-mastery",
    topicName: "Trees, Binary Search Trees & BFS/DFS",
    orderIndex: 3,
    status: "in_progress",
    estimatedHours: 10.0,
    problemsCount: 12,
    solvedCount: 8,
    milestoneTitle: "Recursive Tree Traversals & LCA Patterns",
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "spt-4",
    planId: "plan-dsa-mastery",
    topicName: "Dynamic Programming (1D & Knapsack)",
    orderIndex: 4,
    status: "in_progress",
    estimatedHours: 14.0,
    problemsCount: 15,
    solvedCount: 6,
    milestoneTitle: "State Space Recurrence & Space Optimization",
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "spt-5",
    planId: "plan-dsa-mastery",
    topicName: "Graph Algorithms & Shortest Paths",
    orderIndex: 5,
    status: "not_started",
    estimatedHours: 12.0,
    problemsCount: 12,
    solvedCount: 0,
    milestoneTitle: "Topological Sort & Dijkstra Implementations",
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },

  // Topics for FAANG Prep
  {
    id: "spt-6",
    planId: "plan-faang-prep",
    topicName: "High-Frequency Hash Map & Array Design",
    orderIndex: 1,
    status: "completed",
    estimatedHours: 6.0,
    problemsCount: 6,
    solvedCount: 6,
    milestoneTitle: "LRU Cache & Two Sum Advanced Variants",
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "spt-7",
    planId: "plan-faang-prep",
    topicName: "Tree Serialization & Graph Topologies",
    orderIndex: 2,
    status: "in_progress",
    estimatedHours: 10.0,
    problemsCount: 10,
    solvedCount: 4,
    milestoneTitle: "Alien Dictionary & Tree Node Linking",
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "spt-8",
    planId: "plan-faang-prep",
    topicName: "Dynamic Programming on Strings & Intervals",
    orderIndex: 3,
    status: "not_started",
    estimatedHours: 15.0,
    problemsCount: 12,
    solvedCount: 0,
    milestoneTitle: "Edit Distance & Longest Common Subsequence",
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_USER_GOALS: UserGoalEntity[] = [
  {
    id: "goal-daily-solve",
    userId: "usr-arjun-patel",
    title: "Solve 3 Medium DSA Problems",
    goalType: "daily",
    targetMetric: "problems_solved",
    targetValue: 3,
    currentValue: 2,
    unit: "problems",
    status: "in_progress",
    periodStart: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    periodEnd: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    streakCount: 7,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-daily-xp",
    userId: "usr-arjun-patel",
    title: "Earn 150 Practice XP",
    goalType: "daily",
    targetMetric: "xp_earned",
    targetValue: 150,
    currentValue: 150,
    unit: "XP",
    status: "completed",
    periodStart: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    periodEnd: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    streakCount: 7,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-weekly-topics",
    userId: "usr-arjun-patel",
    title: "Master 2 Weak DP Sub-patterns",
    goalType: "weekly",
    targetMetric: "topics_completed",
    targetValue: 2,
    currentValue: 1,
    unit: "topics",
    status: "in_progress",
    periodStart: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    periodEnd: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    streakCount: 4,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-weekly-time",
    userId: "usr-arjun-patel",
    title: "Log 180 Minutes of Active Coding",
    goalType: "weekly",
    targetMetric: "study_time",
    targetValue: 180,
    currentValue: 145,
    unit: "mins",
    status: "in_progress",
    periodStart: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    periodEnd: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    streakCount: 3,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-monthly-contests",
    userId: "usr-arjun-patel",
    title: "Compete in 4 Algora Live Contests",
    goalType: "monthly",
    targetMetric: "contest_count",
    targetValue: 4,
    currentValue: 3,
    unit: "contests",
    status: "in_progress",
    periodStart: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    periodEnd: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    streakCount: 2,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_USER_GOAL_PROGRESS: UserGoalProgressEntity[] = [
  {
    id: "ugp-1",
    goalId: "goal-daily-solve",
    userId: "usr-arjun-patel",
    recordedDate: new Date().toISOString().split("T")[0],
    incrementValue: 2,
    currentValue: 2,
    notes: "Solved Two Sum & Longest Palindromic Substring",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ugp-2",
    goalId: "goal-daily-xp",
    userId: "usr-arjun-patel",
    recordedDate: new Date().toISOString().split("T")[0],
    incrementValue: 150,
    currentValue: 150,
    notes: "Daily review session + accepted solve",
    createdAt: new Date().toISOString(),
  },
];

const SEED_RECOMMENDATIONS: RecommendationEntity[] = [
  {
    id: "rec-1",
    userId: "usr-arjun-patel",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    problemTitle: "Longest Palindromic Substring",
    difficulty: "Medium",
    topic: "Two Pointers",
    category: "Practice Next",
    reason: "Reinforces 2-pointer center expansion immediately following Two Sum and Palindrome fundamentals.",
    score: 96,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-2",
    userId: "usr-arjun-patel",
    problemId: 5,
    problemSlug: "climbing-stairs",
    problemTitle: "Climbing Stairs (State Reduction)",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    category: "Practice Next",
    reason: "Builds intuitive foundation for recurrence relations before advancing to 2D state spaces.",
    score: 92,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-3",
    userId: "usr-arjun-patel",
    problemId: 4,
    problemSlug: "merge-intervals",
    problemTitle: "Merge Intervals",
    difficulty: "Medium",
    topic: "Intervals & Sorting",
    category: "Review Again",
    reason: "Retention score is 62%. Spaced repetition scheduler flagged interval overlap conditions for refresh.",
    score: 89,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-4",
    userId: "usr-arjun-patel",
    problemId: 3,
    problemSlug: "valid-parentheses",
    problemTitle: "Valid Parentheses Stack Invariant",
    difficulty: "Easy",
    topic: "Stacks",
    category: "Review Again",
    reason: "Quick 2-minute memory refresher to maintain 100% mastery in linear bracket validations.",
    score: 85,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-5",
    userId: "usr-arjun-patel",
    problemId: 6,
    problemSlug: "trapping-rain-water",
    problemTitle: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "Two Pointers / Monotonic Stack",
    category: "Challenge Yourself",
    reason: "High 88% accuracy in Two Pointers makes you ready to tackle this Hard-tier benchmark problem.",
    score: 94,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-6",
    userId: "usr-arjun-patel",
    problemId: 7,
    problemSlug: "course-schedule-ii",
    problemTitle: "Course Schedule II",
    difficulty: "Medium",
    topic: "Graphs & Topological Sort",
    category: "Contest Preparation",
    reason: "Topological Sort with Kahn's algorithm is tested in >40% of Div 2 Contest C/D slots.",
    score: 91,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-7",
    userId: "usr-arjun-patel",
    problemId: 8,
    problemSlug: "lru-cache",
    problemTitle: "LRU Cache Design",
    difficulty: "Medium",
    topic: "Design & Hash Map",
    category: "Interview Preparation",
    reason: "Consistently ranked #1 most frequently asked problem in FAANG-style onsite technical rounds.",
    score: 98,
    actionTaken: "pending",
    createdAt: new Date().toISOString(),
  },
];

const SEED_READINESS_SCORES: ReadinessScoreEntity[] = [
  {
    id: "rs-contest-arjun",
    userId: "usr-arjun-patel",
    assessmentType: "contest",
    overallScore: 78,
    dsaCoveragePct: 82,
    speedScore: 74,
    accuracyScore: 84,
    difficultyHandling: 72,
    topicCoverage: 80,
    breakdown: {
      suggestedContestTier: "Div 2 / Weekly Rated Contest",
      averageSolveSpeedMinutes: 18.5,
      firstSubmissionAcceptancePct: 76,
      streakMultiplier: 1.15,
      strengthAreas: ["Two Pointers", "Binary Search", "Hash Maps", "Prefix Sums"],
      weakAreas: ["Dynamic Programming (Intervals)", "Bitwise Manipulation", "Shortest Path (Dijkstra)"],
      recommendedPracticeTopics: ["2D DP Optimization", "Kahn's Topological Sort", "Disjoint Set Union (DSU)"],
    },
    calculatedAt: new Date().toISOString(),
  },
  {
    id: "rs-interview-arjun",
    userId: "usr-arjun-patel",
    assessmentType: "interview",
    overallScore: 83,
    dsaCoveragePct: 86,
    speedScore: 80,
    accuracyScore: 88,
    difficultyHandling: 78,
    topicCoverage: 85,
    breakdown: {
      companyReadiness: {
        productBased: 88,
        serviceBased: 96,
        startup: 85,
        faangStyle: 76,
      },
      topicReadiness: [
        { topic: "Arrays & Hashing", readiness: 94 },
        { topic: "Strings & Two Pointers", readiness: 90 },
        { topic: "Trees & Binary Search", readiness: 82 },
        { topic: "Graph Traversals", readiness: 78 },
        { topic: "Dynamic Programming", readiness: 64 },
        { topic: "System Object Design", readiness: 72 },
      ],
      missingTopics: ["Segment Trees", "Advanced 2D Matrix DP", "Monotonic Queue Slopes"],
      recommendedQuestions: ["LRU Cache", "Course Schedule II", "Trapping Rain Water", "Lowest Common Ancestor"],
      preparationRoadmap: [
        "Consolidate 1D and 2D DP Recurrences (Target: 80% accuracy)",
        "Practice Verbalizing Thought Process & Big-O trade-offs",
        "Complete 3 Mock Timed 45-Minute Coding Screens",
      ],
    },
    calculatedAt: new Date().toISOString(),
  },
];

const SEED_SKILL_ASSESSMENTS: SkillAssessmentEntity[] = [
  {
    id: "sa-1",
    userId: "usr-arjun-patel",
    topic: "Dynamic Programming",
    masteryScore: 58,
    accuracyPct: 52,
    learningVelocity: 0.85,
    weakPriority: "Critical",
    improvementSuggestion: "Break complex recurrences into base cases and subproblem tables before coding. Focus on 0/1 knapsack and string alignment patterns.",
    assessedAt: new Date().toISOString(),
  },
  {
    id: "sa-2",
    userId: "usr-arjun-patel",
    topic: "Intervals & Sorting",
    masteryScore: 65,
    accuracyPct: 62,
    learningVelocity: 0.90,
    weakPriority: "High",
    improvementSuggestion: "Revisit interval endpoint overlap invariants and custom comparator sorting functions in Python and C++.",
    assessedAt: new Date().toISOString(),
  },
  {
    id: "sa-3",
    userId: "usr-arjun-patel",
    topic: "Trees & BST",
    masteryScore: 72,
    accuracyPct: 74,
    learningVelocity: 1.15,
    weakPriority: "Medium",
    improvementSuggestion: "Strengthen bottom-up post-order recursion for tree diameter and path sum verification.",
    assessedAt: new Date().toISOString(),
  },
  {
    id: "sa-4",
    userId: "usr-arjun-patel",
    topic: "Graphs & BFS/DFS",
    masteryScore: 78,
    accuracyPct: 81,
    learningVelocity: 1.25,
    weakPriority: "Low",
    improvementSuggestion: "Solid graph foundations. Advance to cycle detection in directed graphs and Dijkstra's algorithm.",
    assessedAt: new Date().toISOString(),
  },
  {
    id: "sa-5",
    userId: "usr-arjun-patel",
    topic: "Two Pointers & Sliding Window",
    masteryScore: 88,
    accuracyPct: 92,
    learningVelocity: 1.40,
    weakPriority: "Low",
    improvementSuggestion: "Excellent velocity and accuracy. Ready for Hard-tier multi-pointer and monotonic queue extensions.",
    assessedAt: new Date().toISOString(),
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
  public studyPlans: Map<string, StudyPlanEntity> = new Map();
  public studyPlanTopics: Map<string, StudyPlanTopicEntity> = new Map();
  public userGoals: Map<string, UserGoalEntity> = new Map();
  public userGoalProgress: Map<string, UserGoalProgressEntity> = new Map();
  public recommendationHistory: Map<string, RecommendationEntity> = new Map();
  public readinessScores: Map<string, ReadinessScoreEntity> = new Map();
  public skillAssessments: Map<string, SkillAssessmentEntity> = new Map();

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
    for (const sp of SEED_STUDY_PLANS) {
      this.studyPlans.set(sp.id, { ...sp });
    }
    for (const spt of SEED_STUDY_PLAN_TOPICS) {
      this.studyPlanTopics.set(spt.id, { ...spt });
    }
    for (const ug of SEED_USER_GOALS) {
      this.userGoals.set(ug.id, { ...ug });
    }
    for (const ugp of SEED_USER_GOAL_PROGRESS) {
      this.userGoalProgress.set(ugp.id, { ...ugp });
    }
    for (const rec of SEED_RECOMMENDATIONS) {
      this.recommendationHistory.set(rec.id, { ...rec });
    }
    for (const rs of SEED_READINESS_SCORES) {
      this.readinessScores.set(rs.id, { ...rs });
    }
    for (const sa of SEED_SKILL_ASSESSMENTS) {
      this.skillAssessments.set(sa.id, { ...sa });
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
    this.studyPlans.clear();
    this.studyPlanTopics.clear();
    this.userGoals.clear();
    this.userGoalProgress.clear();
    this.recommendationHistory.clear();
    this.readinessScores.clear();
    this.skillAssessments.clear();
    this.seed();
  }
}

export const db = new InMemoryDatabase();

