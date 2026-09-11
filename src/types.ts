export type SupportedLanguage = "Python" | "C++" | "Java" | "C";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Runtime Error"
  | "Compilation Error"
  | "Pending"
  | "Running"
  | "Idle";

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
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

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  language: SupportedLanguage;
  topic: string;
  tags: string[];
  xpReward: number;
  acceptance: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  starterCodes: Record<SupportedLanguage, string>;
  solutionCodes?: Partial<Record<SupportedLanguage, string>>;
  testCases: TestCase[];
  solved?: boolean;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  type: "lesson" | "example" | "quiz" | "problem" | "assignment";
  duration: string;
  status: "completed" | "active" | "locked";
  problemSlug?: string;
  xp?: number;
}

export interface CurriculumModule {
  id: string;
  title: string;
  status: "completed" | "active" | "locked";
  progress: number;
  lessons: CurriculumLesson[];
}

export interface CurriculumTopic {
  id: string;
  slug: string;
  title: string;
  language: SupportedLanguage;
  description: string;
  iconName: string;
  totalProblems: number;
  completedProblems: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  progress: number;
  modules: CurriculumModule[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  color: string;
  language?: SupportedLanguage;
  totalModules: number;
  completedModules: number;
  progress: number;
  topics: CurriculumTopic[];
}

export interface UserSubmissionResult {
  status: SubmissionStatus;
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  memoryMb: number;
  runtimePercentile?: number;
  memoryPercentile?: number;
  timestamp: string;
  testCases: TestCase[];
  errorMessage?: string;
  compilationError?: string;
  stdout?: string;
  stderr?: string;
}

export interface SubmissionRecord {
  id: string;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  language: SupportedLanguage;
  code: string;
  status: SubmissionStatus;
  runtimeMs: number;
  memoryMb: number;
  runtimePercentile: number;
  memoryPercentile: number;
  passedTests: number;
  totalTests: number;
  timestamp: string;
  createdAt: number;
  errorMessage?: string;
  compilationError?: string;
  testCases: TestCase[];
}

export interface UserProgressStats {
  solvedSlugs: string[];
  attemptedSlugs: string[];
  totalXP: number;
  streakDays: number;
  lastActiveDate: string;
  languageCounts: Record<SupportedLanguage, number>;
  totalSubmissions: number;
  acceptedSubmissions: number;
}

export type MentorMessageType = "text" | "code" | "insight" | "hint" | "remediation";

export type MentorQuickActionType =
  | "explain_concept"
  | "give_hint"
  | "find_mistake"
  | "improve_solution"
  | "learning_advice"
  | "build_study_plan"
  | "analyze_weaknesses"
  | "recommend_problems"
  | "contest_prep"
  | "interview_prep";

export interface MentorMessage {
  id: string;
  role: "user" | "ai";
  type: MentorMessageType;
  content: string;
  codeSnippet?: string;
  language?: SupportedLanguage;
  timestamp: string;
  actionType?: MentorQuickActionType;
  feedback?: "positive" | "negative";
}

export interface MentorConversation {
  id: string;
  title: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
  messages: MentorMessage[];
}

export interface TopicMasteryStat {
  topic: string;
  score: number;
  benchmark: number;
  solvedCount: number;
  totalCount: number;
  accuracy: number;
  level: "Strong" | "Proficient" | "Needs Practice" | "Critical";
}

export interface AccuracyTrendPoint {
  period: string;
  accuracy: number;
  problemsSolved: number;
  practiceMinutes: number;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface LanguageUsageStat {
  language: SupportedLanguage;
  problemCount: number;
  percentage: number;
  accuracy: number;
  color: string;
}

export interface AnalystRecommendation {
  id: string;
  type: "weakness" | "strength" | "pacing" | "curriculum";
  topic: string;
  priority: "High" | "Medium" | "Low" | "Stretch";
  insight: string;
  actionableStep: string;
  suggestedProblemSlug?: string;
  suggestedTopicId?: string;
}

export interface AnalystReport {
  readinessScore: number;
  readinessTier: string;
  totalSolved: number;
  totalSubmissions: number;
  overallAccuracy: number;
  difficultyStats: DifficultyDistribution;
  topicMastery: TopicMasteryStat[];
  accuracyTrends: AccuracyTrendPoint[];
  languageUsage: LanguageUsageStat[];
  recommendations: AnalystRecommendation[];
  weakAreas: {
    topic: string;
    accuracy: number;
    gap: string;
    severity: "Critical" | "Moderate" | "Minor";
    suggestedAction: string;
  }[];
}

// ==========================================
// PHASE 6: GAMIFICATION & CONTESTS TYPES
// ==========================================

export type ContestType =
  | "Weekly Contest"
  | "Monthly Contest"
  | "Topic Contest"
  | "Company Assessment";

export type ContestStatus = "upcoming" | "active" | "completed";

export interface ContestProblem {
  id: string;
  contestId: string;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  orderIndex: number;
  scorePoints: number;
  difficulty?: ProblemDifficulty;
  solved?: boolean;
}

export interface ContestLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  institution?: string;
  score: number;
  penaltySeconds: number;
  problemsSolved: number;
  totalProblems: number;
  submissionTime: string;
  isCurrentUser?: boolean;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  contestType: ContestType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  difficulty: ProblemDifficulty;
  participantCount: number;
  status: ContestStatus;
  problems?: ContestProblem[];
  leaderboard?: ContestLeaderboardEntry[];
  registered?: boolean;
}

export type RatingTier = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master";

export interface RatingHistoryPoint {
  id: string;
  contestId?: string;
  contestTitle?: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  reason: string;
  recordedAt: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

export interface UserLevelInfo {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  rank: number;
}

export type AchievementCategory = "learning" | "problem_solving" | "contest" | "ai_learning";

export interface AchievementBadge {
  id: string;
  badgeCode: string;
  badgeName: string;
  description: string;
  iconName: string;
  xpReward: number;
  category: AchievementCategory;
  unlocked: boolean;
  unlockedAt?: string;
  progressValue: number;
}

export interface GlobalLeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  institution?: string;
  preferredLanguage?: SupportedLanguage;
  rating: number;
  ratingTier?: RatingTier;
  streakDays: number;
  totalXP: number;
  isCurrentUser?: boolean;
}

export interface DailyReviewQuestion {
  id: string;
  problemId: number;
  problemSlug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  retentionScore: number;
  lastPracticedDaysAgo: number;
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyReviewQueue {
  queue: DailyReviewQuestion[];
  totalDue: number;
  overallRetentionScore: number;
  weakTopics: {
    topic: string;
    masteryScore: number;
    solvedCount: number;
  }[];
  streakDays: number;
  xpRewardTotal: number;
}

export function calculateLevelInfo(totalXP: number): UserLevelInfo {
  let level = 1;
  let threshold = 500;
  let remaining = totalXP;

  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold = Math.round(500 * Math.pow(1.35, level - 1));
  }

  const currentLevelXP = remaining;
  const nextLevelXP = threshold;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100));

  return {
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    rank: 1,
  };
}

export function getRatingTier(rating: number): RatingTier {
  if (rating >= 2200) return "Master";
  if (rating >= 1900) return "Expert";
  if (rating >= 1600) return "Advanced";
  if (rating >= 1300) return "Intermediate";
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
  createdAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface UserGoalProgressEntity {
  id: string;
  goalId: string;
  userId: string;
  recordedDate: string;
  incrementValue: number;
  currentValue: number;
  notes?: string;
  createdAt?: string;
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
  createdAt?: string;
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
  calculatedAt?: string;
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
  assessedAt?: string;
}

export interface PersonalizationOverview {
  activePlan: StudyPlanEntity | null;
  totalPlans: number;
  todayGoals: UserGoalEntity[];
  weeklyGoals: UserGoalEntity[];
  allGoals: UserGoalEntity[];
  recommendations: RecommendationEntity[];
  contestReadiness: ReadinessScoreEntity | null;
  interviewReadiness: ReadinessScoreEntity | null;
  weakTopics: SkillAssessmentEntity[];
  todayFocus: {
    primaryTopic: string;
    subGoal: string;
    recommendedProblemsCount: number;
    estimatedTimeMinutes: number;
    reviewUrgentCount: number;
  };
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
    role: "student" | "instructor" | "admin";
  };
  role?: RoleEntity;
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
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  starterCodes: Record<string, string>;
  solutionCodes?: Record<string, string>;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  status: "draft" | "published" | "archived";
  changeSummary?: string;
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
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
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
  createdAt?: string;
}

export interface CurriculumModuleEntity {
  id: string;
  pathId: string;
  title: string;
  description: string;
  orderIndex: number;
  status: "active" | "completed" | "locked";
  lessons?: CurriculumLessonEntity[];
  createdAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
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

export type TestCaseItem = TestCase;

export interface ContestEntity {
  id: string;
  title: string;
  description: string;
  contestType: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  difficulty: string;
  status: "upcoming" | "active" | "completed";
  problems?: ContestProblem[];
  participantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ContestProblemEntity = ContestProblem;

export type AdminAnalyticsData = PlatformAnalyticsSummary & {
  passRate?: string;
  newUsersLast7Days?: number;
  submissionsByLanguage?: Record<string, number>;
};

export interface AdminUserRecord {
  id: string;
  userId: string;
  role: string;
  email?: string;
  fullName?: string;
  permissions: string[];
  status: string;
  lastLoginAt?: string;
}


