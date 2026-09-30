export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  topicId: string;
  topicTitle: string;
  subtopic: string;
  tags: string[];
  companies: string[];
  learningObjectives: string[];
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    python: string;
    cpp: string;
    java: string;
    c: string;
  };
  hints: {
    level: 1 | 2 | 3 | 4 | 5 | 6; // 1: Hint, 2: Approach, 3: Algorithm, 4: Pseudocode, 5: Partial Code, 6: Solution
    title: string;
    content: string;
    codeSnippet?: string;
  }[];
  solutionApproach?: {
    optimalTimeComplexity: string;
    optimalSpaceComplexity: string;
    intuition: string;
    algorithm: string;
  };
  acceptanceRate: number;
  totalSubmissions: number;
  xpReward: number;
}

export interface ProblemAttempt {
  id: string;
  problemId: string;
  userId: string;
  code: string;
  language: 'python' | 'cpp' | 'java' | 'c';
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  memoryMb: number;
  timestamp: string;
  feedbackNotes?: string;
}

export interface UserProblemState {
  problemId: string;
  status: 'unsolved' | 'attempted' | 'solved';
  savedCode: Record<string, string>;
  bestRuntimeMs?: number;
  attemptsCount: number;
  hintsViewed: number;
  lastAttemptDate?: string;
  bookmarked?: boolean;
  notes?: string;
}
