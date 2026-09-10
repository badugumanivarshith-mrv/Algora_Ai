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
  | "learning_advice";

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

