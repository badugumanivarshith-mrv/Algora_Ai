export type UserRole = "student" | "instructor" | "admin";
export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

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

// ==========================================
// PHASE 7: ADAPTIVE LEARNING & PERSONALIZATION
// ==========================================

export type StudyPlanType =
  | "Beginner Roadmap"
  | "DSA Mastery"
  | "Competitive Programming"
  | "Interview Preparation"
  | "Company Preparation";

export type StudyPlanDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface StudyPlanTopicEntity {
  id: string;
  planId: string;
  topicName: string;
  orderIndex: number;
  status: "completed" | "in_progress" | "not_started";
  estimatedHours: number;
  problemsCount: number;
  solvedCount: number;
  milestoneTitle: string;
  createdAt: string;
}

export interface StudyPlanEntity {
  id: string;
  userId: string;
  title: string;
  planType: StudyPlanType;
  description: string;
  targetRoleCompany?: string;
  difficulty: StudyPlanDifficulty;
  durationWeeks: number;
  dailyMinutesTarget: number;
  progressPct: number;
  status: "active" | "completed" | "archived";
  topics?: StudyPlanTopicEntity[];
  createdAt: string;
  updatedAt: string;
}

export type UserGoalType = "daily" | "weekly" | "monthly";
export type GoalMetric =
  | "problems_solved"
  | "xp_earned"
  | "topics_completed"
  | "study_time"
  | "contest_count";

export interface UserGoalEntity {
  id: string;
  userId: string;
  title: string;
  goalType: UserGoalType;
  targetMetric: GoalMetric;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: "in_progress" | "completed" | "missed";
  periodStart: string;
  periodEnd: string;
  streakCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserGoalProgressEntity {
  id: string;
  goalId: string;
  userId: string;
  recordedDate: string;
  incrementValue: number;
  currentValue: number;
  notes?: string;
  createdAt: string;
}

export type RecommendationCategory =
  | "Practice Next"
  | "Review Again"
  | "Challenge Yourself"
  | "Contest Preparation"
  | "Interview Preparation";

export interface RecommendationEntity {
  id: string;
  userId: string;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  difficulty: ProblemDifficulty;
  topic: string;
  category: RecommendationCategory;
  reason: string;
  score: number;
  actionTaken: "pending" | "solved" | "dismissed";
  createdAt: string;
}

export interface ReadinessScoreEntity {
  id: string;
  userId: string;
  assessmentType: "contest" | "interview";
  overallScore: number;
  dsaCoveragePct: number;
  speedScore: number;
  accuracyScore: number;
  difficultyHandling: number;
  topicCoverage: number;
  breakdown: Record<string, any>;
  calculatedAt: string;
}

export interface SkillAssessmentEntity {
  id: string;
  userId: string;
  topic: string;
  masteryScore: number;
  accuracyPct: number;
  learningVelocity: number;
  weakPriority: "Critical" | "High" | "Medium" | "Low";
  improvementSuggestion: string;
  assessedAt: string;
}

// ==========================================
// PHASE 8: ADMIN CMS & CONTENT MANAGEMENT
// ==========================================

export interface RoleEntity {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionEntity {
  id: string;
  key: string;
  name: string;
  description: string;
  module: "problems" | "topics" | "curriculum" | "contests" | "achievements" | "users" | "analytics" | "settings";
  createdAt: string;
}

export interface AdminEntity {
  id: string;
  userId: string;
  roleId?: string;
  isSuperAdmin: boolean;
  customPermissions: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
    role: UserRole;
  };
  role?: RoleEntity;
}

export interface ProblemExampleItem {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCaseItem {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  runtimeMs?: number;
  memoryMb?: number;
  isHidden?: boolean;
  errorMessage?: string;
}

export interface ProblemCMSEntity {
  id: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  language: string;
  topic: string;
  tags: string[];
  xpReward: number;
  acceptance: string;
  description: string;
  examples: ProblemExampleItem[];
  constraints: string[];
  hints: string[];
  starterCodes: Record<string, string>;
  solutionCodes?: Record<string, string>;
  testCases: TestCaseItem[];
  hiddenTestCases: TestCaseItem[];
  status: "draft" | "published" | "archived";
  authorId?: string;
  authorName?: string;
  viewCount: number;
  submissionCount: number;
  acceptedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemVersionEntity {
  id: string;
  problemId: number;
  versionNumber: number;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  description: string;
  testCases: TestCaseItem[];
  hiddenTestCases: TestCaseItem[];
  starterCodes: Record<string, string>;
  changedBy?: string;
  changerName?: string;
  changeSummary: string;
  createdAt: string;
}

export interface TopicCMSEntity {
  id: string;
  slug: string;
  title: string;
  language: string;
  description: string;
  iconName: string;
  orderIndex: number;
  prerequisites: string[];
  learningObjectives: string[];
  isPublished: boolean;
  problemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumLessonEntity {
  id: string;
  moduleId: string;
  title: string;
  lessonType: "lesson" | "example" | "quiz" | "problem" | "assignment";
  duration: string;
  problemSlug?: string;
  xpReward: number;
  orderIndex: number;
  createdAt: string;
}

export interface CurriculumModuleEntity {
  id: string;
  pathId: string;
  title: string;
  description: string;
  orderIndex: number;
  status: "active" | "completed" | "locked";
  lessons?: CurriculumLessonEntity[];
  createdAt: string;
}

export interface CurriculumPathEntity {
  id: string;
  slug: string;
  title: string;
  language: string;
  description: string;
  targetRole: string;
  difficulty: string;
  estimatedHours: number;
  iconName: string;
  orderIndex: number;
  isPublished: boolean;
  modules?: CurriculumModuleEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface ContestRegistrationEntity {
  id: string;
  contestId: string;
  userId: string;
  status: "registered" | "participating" | "completed" | "disqualified";
  registeredAt: string;
  score: number;
  penaltyMinutes: number;
  rank?: number;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  institution?: string;
}

export interface AchievementCMSEntity {
  id: string;
  badgeCode: string;
  badgeName: string;
  description: string;
  iconName: string;
  xpReward: number;
  category: string;
  unlockCondition?: string;
  isPublished: boolean;
  totalUnlockedCount?: number;
  createdAt: string;
}

export interface SystemSettingEntity {
  key: string;
  value: any;
  description: string;
  category: "general" | "submissions" | "contests" | "security" | "ui";
  isPublic: boolean;
  updatedBy?: string;
  updatedAt: string;
}

export interface AdminAuditLogEntity {
  id: string;
  adminId: string;
  adminName?: string;
  action: string;
  entityType: "problem" | "topic" | "curriculum" | "contest" | "achievement" | "user" | "setting";
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface PlatformAnalyticsSummary {
  totalUsers: number;
  activeUsersToday: number;
  activeUsers7Days: number;
  totalProblems: number;
  publishedProblems: number;
  draftProblems: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  overallAcceptanceRate: string;
  totalContests: number;
  activeContests: number;
  totalContestParticipants: number;
  languageDistribution: { language: string; count: number; percentage: number }[];
  difficultyDistribution: { difficulty: string; count: number; percentage: number }[];
  submissionTrend: { date: string; submissions: number; accepted: number }[];
  userGrowthTrend: { date: string; users: number }[];
  topProblems: {
    id: number;
    title: string;
    slug: string;
    difficulty: string;
    submissions: number;
    acceptance: string;
  }[];
  recentActivity: AdminAuditLogEntity[];
}


