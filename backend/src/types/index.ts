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
}

export interface AchievementEntity {
  id: string;
  userId: string;
  badgeCode: string;
  badgeName: string;
  description: string;
  iconName: string;
  unlockedAt: string;
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
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
