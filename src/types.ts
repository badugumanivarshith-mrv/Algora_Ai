export type SupportedLanguage = "Python" | "C++" | "Java" | "C";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type SubmissionStatus = "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Pending";

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
  timestamp: string;
  testCases: TestCase[];
}
