export type UserRole = "student" | "instructor" | "admin";

export interface UserEntity {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileEntity {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  institution: string;
  githubHandle?: string;
  preferredLanguage: string;
  rating: number;
  streakDays: number;
  totalXP: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionEntity {
  id: string;
  userId: string;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  language: string;
  code: string;
  status: string;
  runtimeMs: number;
  memoryMb: number;
  runtimePercentile: number;
  memoryPercentile: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  compilationError?: string;
  testCasesPayload?: string;
  createdAt: string;
}

export interface SolvedProblemEntity {
  id: string;
  userId: string;
  problemId: number;
  problemSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  firstSolvedAt: string;
  bestRuntimeMs: number;
  bestMemoryMb: number;
  createdAt?: string;
}

export type AchievementCategory = "learning" | "problem_solving" | "contest" | "ai_learning";

export interface AchievementEntity {
  id: string;
  badgeCode: string;
  badgeName: string;
  description: string;
  iconName: string;
  xpReward: number;
  category: AchievementCategory | string;
  createdAt: string;
}

export interface UserAchievementEntity {
  id: string;
  userId: string;
  achievementId: string;
  badgeCode: string;
  progressValue: number;
  unlockedAt: string;
  badgeName?: string;
  description?: string;
  iconName?: string;
  xpReward?: number;
  category?: string;
}

export interface LearningProgressEntity {
  id: string;
  userId: string;
  topic: string;
  masteryScore: number;
  solvedCount: number;
  accuracyRate: number;
  lastPracticedAt: string;
}

export interface UserSessionEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// === Contests & Gamification Entities ===

export type ContestType = "Weekly Contest" | "Monthly Contest" | "Topic Contest" | "Company Assessment";
export type ContestStatus = "upcoming" | "active" | "completed";

export interface ContestEntity {
  id: string;
  title: string;
  description: string;
  contestType: ContestType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard" | "All Levels";
  participantCount: number;
  status: ContestStatus;
  problemIds?: number[];
  problems?: ContestProblemEntity[];
  registered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContestProblemEntity {
  id: string;
  contestId: string;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  orderIndex: number;
  scorePoints: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  solved?: boolean;
}

export interface ContestParticipantEntity {
  id: string;
  contestId: string;
  userId: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  institution?: string;
  score: number;
  penaltySeconds: number;
  rank?: number;
  registeredAt: string;
}

export interface ContestSubmissionEntity {
  id: string;
  contestId: string;
  userId: string;
  problemSlug: string;
  status: string;
  pointsAwarded: number;
  submissionTime: string;
}

export type RatingTier = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master";

export interface RatingHistoryEntity {
  id: string;
  userId: string;
  contestId?: string;
  contestTitle?: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  reason: string;
  recordedAt: string;
}

export type XPSource =
  | "Accepted Solution"
  | "Hard Problem Bonus"
  | "Topic Completion"
  | "Quiz Completion"
  | "Contest Participation"
  | "Contest Victory"
  | "Daily Review Completion";

export interface XPTransactionEntity {
  id: string;
  userId: string;
  amount: number;
  source: XPSource | string;
  description: string;
  createdAt: string;
}

export interface UserXPProfile {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  rank: number;
  history: XPTransactionEntity[];
}

export interface GlobalLeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  institution: string;
  rating: number;
  ratingTier: RatingTier;
  totalXP: number;
  level: number;
  problemsSolved: number;
  contestsAttended: number;
  streakDays: number;
  rankChange: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export interface ContestLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  institution: string;
  score: number;
  penaltySeconds: number;
  problemsSolved: number;
  totalProblems: number;
  submissionTime: string;
  isCurrentUser?: boolean;
}

export interface DatabaseHealthStatus {
  status: "connected" | "fallback_ready" | "error";
  databaseType: "PostgreSQL" | "In-Memory SQL Engine";
  connected: boolean;
  latencyMs: number;
  migrationVersion: string;
  activePoolClients?: number;
  idlePoolClients?: number;
  totalPoolClients?: number;
  timestamp: string;
  error?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Level calculation helpers
export function calculateLevelInfo(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  // Level threshold: Level N requires (N - 1)^2 * 100 XP
  // Total XP for Level 1 = 0, Level 2 = 100, Level 3 = 400, Level 4 = 900, Level 5 = 1600, etc.
  const level = Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXP) / 100)) + 1);
  const currentFloorXP = Math.pow(level - 1, 2) * 100;
  const nextFloorXP = Math.pow(level, 2) * 100;
  const xpInLevel = Math.max(0, totalXP - currentFloorXP);
  const requiredForLevel = nextFloorXP - currentFloorXP;
  const progressPercent = Math.min(100, Math.round((xpInLevel / requiredForLevel) * 100));

  return {
    level,
    currentLevelXP: xpInLevel,
    nextLevelXP: requiredForLevel,
    progressPercent,
  };
}

export function getRatingTier(rating: number): RatingTier {
  if (rating >= 2300) return "Master";
  if (rating >= 2000) return "Expert";
  if (rating >= 1700) return "Advanced";
  if (rating >= 1400) return "Intermediate";
  return "Beginner";
}
