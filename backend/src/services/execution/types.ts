export type SupportedLanguage = "python" | "python3" | "c" | "cpp" | "c++" | "java" | "javascript" | "typescript";

export type JudgeVerdict =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Memory Limit Exceeded"
  | "Runtime Error"
  | "Compilation Error"
  | "Internal Error";

export type ExecutionJobStatus = "queued" | "compiling" | "executing" | "completed" | "failed";

export interface JudgeTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface TestCaseExecutionResult {
  id: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  runtimeMs: number;
  memoryMb: number;
  verdict: JudgeVerdict;
  stderr?: string;
  compileError?: string;
}

export interface ExecutionJobEntity {
  id: string;
  userId?: string;
  problemId?: string;
  problemSlug: string;
  language: SupportedLanguage;
  code: string;
  customInput?: string;
  jobType: "run" | "submit" | "test_case";
  status: ExecutionJobStatus;
  verdict: JudgeVerdict;
  executionTimeMs: number;
  memoryMb: number;
  compileOutput?: string;
  stdout?: string;
  stderr?: string;
  testCasesTotal: number;
  testCasesPassed: number;
  testCaseResults: TestCaseExecutionResult[];
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SubmissionResultEntity {
  id: string;
  jobId: string;
  submissionId?: string;
  userId?: string;
  problemSlug: string;
  language: string;
  verdict: JudgeVerdict;
  runtimeMs: number;
  memoryMb: number;
  testCasesPassed: number;
  testCasesTotal: number;
  xpAwarded: number;
  codeSizeBytes: number;
  createdAt: string;
}

export interface ExecutionMetrics {
  activeJobs: number;
  queueLength: number;
  totalExecuted: number;
  successRate: number; // percentage 0-100
  avgExecutionTimeMs: number;
  verdictBreakdown: Record<string, number>;
}
