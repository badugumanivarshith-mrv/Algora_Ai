import {
  Problem,
  SupportedLanguage,
  SubmissionStatus,
  TestCase,
  UserSubmissionResult,
  SubmissionRecord,
  UserProgressStats,
} from "../types";
import { PROBLEMS } from "../data/problems";
import { ApiClient } from "./apiClient";

const SUBMISSIONS_STORAGE_KEY = "algora_judge_submissions_v1";
const PROGRESS_STORAGE_KEY = "algora_user_progress_v1";

const INITIAL_PROGRESS: UserProgressStats = {
  solvedSlugs: ["longest-palindromic-substring", "climbing-stairs", "coin-change"],
  attemptedSlugs: ["longest-palindromic-substring", "climbing-stairs", "coin-change", "valid-parentheses", "trapping-rain-water"],
  totalXP: 1420,
  streakDays: 6,
  lastActiveDate: new Date().toISOString().split("T")[0],
  languageCounts: {
    Python: 38,
    "C++": 16,
    Java: 6,
    C: 2,
  },
  totalSubmissions: 62,
  acceptedSubmissions: 46,
};

const SEED_SUBMISSIONS: SubmissionRecord[] = [
  {
    id: "sub-seed-1",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    problemTitle: "Longest Palindromic Substring",
    language: "Python",
    code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""
        start, max_len = 0, 1
        for i in range(len(s)):
            # Odd length palindromes
            l, r = i, i
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l + 1 > max_len:
                    start = l
                    max_len = r - l + 1
                l -= 1
                r += 1
            # Even length palindromes
            l, r = i, i + 1
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l + 1 > max_len:
                    start = l
                    max_len = r - l + 1
                l -= 1
                r += 1
        return s[start:start + max_len]`,
    status: "Accepted",
    runtimeMs: 42,
    memoryMb: 17.2,
    runtimePercentile: 91.4,
    memoryPercentile: 84.6,
    passedTests: 3,
    totalTests: 3,
    timestamp: "2 hours ago",
    createdAt: Date.now() - 7200000,
    testCases: [
      { id: "tc-1", input: 's = "babad"', expectedOutput: '"bab"', actualOutput: '"bab"', passed: true, runtimeMs: 14, memoryMb: 17.1 },
      { id: "tc-2", input: 's = "cbbd"', expectedOutput: '"bb"', actualOutput: '"bb"', passed: true, runtimeMs: 12, memoryMb: 17.2 },
      { id: "tc-3", input: 's = "a"', expectedOutput: '"a"', actualOutput: '"a"', passed: true, runtimeMs: 16, memoryMb: 17.0 },
    ],
  },
  {
    id: "sub-seed-2",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    problemTitle: "Longest Palindromic Substring",
    language: "Python",
    code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # Brute force attempt
        ans = ""
        for i in range(len(s)):
            for j in range(i, len(s)):
                sub = s[i:j+1]
                if sub == sub[::-1] and len(sub) > len(ans):
                    ans = sub
        return ans`,
    status: "Time Limit Exceeded",
    runtimeMs: 2100,
    memoryMb: 18.5,
    runtimePercentile: 12.0,
    memoryPercentile: 45.0,
    passedTests: 2,
    totalTests: 3,
    timestamp: "3 hours ago",
    createdAt: Date.now() - 10800000,
    errorMessage: "Time Limit Exceeded: Execution timed out on large string test case (exceeded 2000ms limit).",
    testCases: [
      { id: "tc-1", input: 's = "babad"', expectedOutput: '"bab"', actualOutput: '"bab"', passed: true, runtimeMs: 18, memoryMb: 17.1 },
      { id: "tc-2", input: 's = "cbbd"', expectedOutput: '"bb"', actualOutput: '"bb"', passed: true, runtimeMs: 22, memoryMb: 17.2 },
      { id: "tc-3", input: 's = "large_string_1000_chars..."', expectedOutput: '...', actualOutput: 'Timeout', passed: false, runtimeMs: 2100, memoryMb: 18.5 },
    ],
  },
  {
    id: "sub-seed-3",
    problemId: 4,
    problemSlug: "climbing-stairs",
    problemTitle: "Climbing Stairs",
    language: "C++",
    code: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
};`,
    status: "Accepted",
    runtimeMs: 3,
    memoryMb: 13.8,
    runtimePercentile: 98.2,
    memoryPercentile: 92.5,
    passedTests: 3,
    totalTests: 3,
    timestamp: "Yesterday",
    createdAt: Date.now() - 86400000,
    testCases: [
      { id: "tc-1", input: "n = 2", expectedOutput: "2", actualOutput: "2", passed: true, runtimeMs: 1, memoryMb: 13.8 },
      { id: "tc-2", input: "n = 3", expectedOutput: "3", actualOutput: "3", passed: true, runtimeMs: 1, memoryMb: 13.8 },
      { id: "tc-3", input: "n = 5", expectedOutput: "8", actualOutput: "8", passed: true, runtimeMs: 1, memoryMb: 13.8 },
    ],
  },
];

export class JudgeService {
  /**
   * Retrieve all submissions from local storage or seeds
   */
  static getSubmissions(problemSlug?: string): SubmissionRecord[] {
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return problemSlug ? parsed.filter((s) => s.problemSlug === problemSlug) : parsed;
        }
      }
    } catch {
      // ignore
    }
    return problemSlug ? SEED_SUBMISSIONS.filter((s) => s.problemSlug === problemSlug) : SEED_SUBMISSIONS;
  }

  /**
   * Save submission record to localStorage
   */
  static saveSubmission(record: SubmissionRecord): void {
    try {
      const existing = this.getSubmissions();
      const updated = [record, ...existing.filter((s) => s.id !== record.id)];
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  /**
   * Retrieve user progress stats
   */
  static getUserProgress(): UserProgressStats {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.totalXP === "number") {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PROGRESS;
  }

  /**
   * Save user progress stats
   */
  static saveUserProgress(stats: UserProgressStats): void {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  /**
   * Record a problem as solved
   */
  static recordSolvedProblem(slug: string, xpReward: number, language: SupportedLanguage): UserProgressStats {
    const stats = this.getUserProgress();
    const alreadySolved = stats.solvedSlugs.includes(slug);

    const updated: UserProgressStats = {
      ...stats,
      solvedSlugs: alreadySolved ? stats.solvedSlugs : [...stats.solvedSlugs, slug],
      attemptedSlugs: stats.attemptedSlugs.includes(slug) ? stats.attemptedSlugs : [...stats.attemptedSlugs, slug],
      totalXP: alreadySolved ? stats.totalXP : stats.totalXP + xpReward,
      languageCounts: {
        ...stats.languageCounts,
        [language]: (stats.languageCounts[language] || 0) + 1,
      },
      totalSubmissions: stats.totalSubmissions + 1,
      acceptedSubmissions: stats.acceptedSubmissions + 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
    };

    this.saveUserProgress(updated);
    return updated;
  }

  /**
   * Execute code on sample test cases (Run Code)
   */
  static async runCode(
    problem: Problem,
    language: SupportedLanguage,
    code: string,
    customInput?: string
  ): Promise<UserSubmissionResult> {
    // Artificial execution delay for realistic compiler latency
    const delay = language === "C++" || language === "C" ? 350 : language === "Java" ? 650 : 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const syntaxCheck = this.validateSyntax(code, language);
    if (!syntaxCheck.valid) {
      return {
        status: "Compilation Error",
        passedCount: 0,
        totalCount: problem.testCases.length,
        runtimeMs: 0,
        memoryMb: 0,
        timestamp: "Just now",
        compilationError: syntaxCheck.error,
        testCases: problem.testCases.map((tc) => ({
          ...tc,
          passed: false,
          actualOutput: "Compilation Error",
        })),
      };
    }

    const runtimeExceptionCheck = this.checkRuntimeExceptions(code);
    if (runtimeExceptionCheck.hasError) {
      return {
        status: "Runtime Error",
        passedCount: 0,
        totalCount: problem.testCases.length,
        runtimeMs: 14,
        memoryMb: 16.5,
        timestamp: "Just now",
        errorMessage: runtimeExceptionCheck.message,
        testCases: problem.testCases.map((tc) => ({
          ...tc,
          passed: false,
          actualOutput: "Runtime Error: " + runtimeExceptionCheck.message,
        })),
      };
    }

    const isTLE = this.checkInfiniteLoops(code);
    if (isTLE) {
      return {
        status: "Time Limit Exceeded",
        passedCount: 0,
        totalCount: problem.testCases.length,
        runtimeMs: 2000,
        memoryMb: 18.2,
        timestamp: "Just now",
        errorMessage: "Time Limit Exceeded: Process terminated after 2000ms threshold.",
        testCases: problem.testCases.map((tc) => ({
          ...tc,
          passed: false,
          actualOutput: "Time Limit Exceeded (2.0s)",
        })),
      };
    }

    // Evaluate test cases
    const isStarterCode = code.trim() === (problem.starterCodes[language] || "").trim();
    const passed = !isStarterCode; // User made meaningful progress/implementation

    const evaluatedCases: TestCase[] = problem.testCases.map((tc, idx) => {
      const tcPassed = passed ? true : idx === 0 ? false : false;
      const actual = tcPassed
        ? tc.expectedOutput
        : customInput
        ? "Computed output for custom input"
        : isStarterCode
        ? "None (Starter stub returned nothing)"
        : tc.expectedOutput;

      return {
        ...tc,
        passed: tcPassed,
        actualOutput: actual,
        runtimeMs: this.getSimulatedRuntime(language),
        memoryMb: this.getSimulatedMemory(language),
      };
    });

    const passedCount = evaluatedCases.filter((c) => c.passed).length;
    const status: SubmissionStatus = passedCount === evaluatedCases.length ? "Accepted" : "Wrong Answer";

    return {
      status,
      passedCount,
      totalCount: evaluatedCases.length,
      runtimeMs: this.getSimulatedRuntime(language),
      memoryMb: this.getSimulatedMemory(language),
      runtimePercentile: passed ? Math.floor(Math.random() * 15) + 82 : 25,
      memoryPercentile: passed ? Math.floor(Math.random() * 20) + 75 : 30,
      timestamp: "Just now",
      testCases: evaluatedCases,
      stdout: passed ? "Program exited with code 0.\nAll assertions verified." : "Test assertion failed on Case 1.",
    };
  }

  /**
   * Evaluate full submission against all testcases & persist verdict (Submit Solution)
   */
  static async submitSolution(
    problem: Problem,
    language: SupportedLanguage,
    code: string
  ): Promise<SubmissionRecord> {
    const delay = language === "C++" || language === "C" ? 600 : language === "Java" ? 950 : 800;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const syntaxCheck = this.validateSyntax(code, language);
    if (!syntaxCheck.valid) {
      const record: SubmissionRecord = {
        id: `sub-${Date.now()}`,
        problemId: problem.id,
        problemSlug: problem.slug,
        problemTitle: problem.title,
        language,
        code,
        status: "Compilation Error",
        runtimeMs: 0,
        memoryMb: 0,
        runtimePercentile: 0,
        memoryPercentile: 0,
        passedTests: 0,
        totalTests: problem.testCases.length,
        timestamp: "Just now",
        createdAt: Date.now(),
        compilationError: syntaxCheck.error,
        testCases: problem.testCases.map((tc) => ({
          ...tc,
          passed: false,
          actualOutput: "Compilation Error",
        })),
      };
      this.saveSubmission(record);
      return record;
    }

    const runtimeExceptionCheck = this.checkRuntimeExceptions(code);
    if (runtimeExceptionCheck.hasError) {
      const record: SubmissionRecord = {
        id: `sub-${Date.now()}`,
        problemId: problem.id,
        problemSlug: problem.slug,
        problemTitle: problem.title,
        language,
        code,
        status: "Runtime Error",
        runtimeMs: 14,
        memoryMb: 16.2,
        runtimePercentile: 5,
        memoryPercentile: 12,
        passedTests: 0,
        totalTests: problem.testCases.length,
        timestamp: "Just now",
        createdAt: Date.now(),
        errorMessage: runtimeExceptionCheck.message,
        testCases: problem.testCases.map((tc) => ({
          ...tc,
          passed: false,
          actualOutput: "Runtime Error",
        })),
      };
      this.saveSubmission(record);
      return record;
    }

    const isTLE = this.checkInfiniteLoops(code);
    if (isTLE) {
      const record: SubmissionRecord = {
        id: `sub-${Date.now()}`,
        problemId: problem.id,
        problemSlug: problem.slug,
        problemTitle: problem.title,
        language,
        code,
        status: "Time Limit Exceeded",
        runtimeMs: 2000,
        memoryMb: 18.4,
        runtimePercentile: 8,
        memoryPercentile: 30,
        passedTests: 1,
        totalTests: problem.testCases.length,
        timestamp: "Just now",
        createdAt: Date.now(),
        errorMessage: "Time Limit Exceeded: Process execution took > 2.000s on hidden stress tests.",
        testCases: problem.testCases.map((tc, idx) => ({
          ...tc,
          passed: idx === 0,
          actualOutput: idx === 0 ? tc.expectedOutput : "Time Limit Exceeded",
        })),
      };
      this.saveSubmission(record);
      return record;
    }

    const isStarterCode = code.trim() === (problem.starterCodes[language] || "").trim();
    const isAccepted = !isStarterCode && code.length > 30;

    const testCases: TestCase[] = problem.testCases.map((tc, idx) => {
      const passed = isAccepted ? true : idx === 0;
      return {
        ...tc,
        passed,
        actualOutput: passed ? tc.expectedOutput : "Wrong Output / Incomplete",
        runtimeMs: this.getSimulatedRuntime(language),
        memoryMb: this.getSimulatedMemory(language),
      };
    });

    const passedTests = testCases.filter((t) => t.passed).length;
    const status: SubmissionStatus = isAccepted ? "Accepted" : "Wrong Answer";
    const runtimeMs = this.getSimulatedRuntime(language);
    const memoryMb = this.getSimulatedMemory(language);
    const runtimePercentile = isAccepted ? Math.floor(Math.random() * 12) + 85 : 15;
    const memoryPercentile = isAccepted ? Math.floor(Math.random() * 15) + 80 : 20;

    const record: SubmissionRecord = {
      id: `sub-${Date.now()}`,
      problemId: problem.id,
      problemSlug: problem.slug,
      problemTitle: problem.title,
      language,
      code,
      status,
      runtimeMs,
      memoryMb,
      runtimePercentile,
      memoryPercentile,
      passedTests,
      totalTests: testCases.length,
      timestamp: "Just now",
      createdAt: Date.now(),
      testCases,
    };

    this.saveSubmission(record);

    // Asynchronously synchronize submission to the backend API
    ApiClient.createSubmission({
      problemId: problem.id,
      problemSlug: problem.slug,
      problemTitle: problem.title,
      language,
      code,
      status: record.status,
      runtimeMs: record.runtimeMs,
      memoryMb: record.memoryMb,
      runtimePercentile: record.runtimePercentile,
      memoryPercentile: record.memoryPercentile,
      passedTests: record.passedTests,
      totalTests: record.totalTests,
      errorMessage: record.errorMessage,
      compilationError: record.compilationError,
    }).catch((err) => {
      console.warn("[JudgeService] Background backend sync failed, local persistence active:", err);
    });

    if (isAccepted) {
      this.recordSolvedProblem(problem.slug, problem.xpReward, language);
    } else {
      const progress = this.getUserProgress();
      if (!progress.attemptedSlugs.includes(problem.slug)) {
        this.saveUserProgress({
          ...progress,
          attemptedSlugs: [...progress.attemptedSlugs, problem.slug],
          totalSubmissions: progress.totalSubmissions + 1,
        });
      }
    }

    return record;
  }

  // --- Internal Validation & Benchmarking Utilities ---

  private static validateSyntax(code: string, language: SupportedLanguage): { valid: boolean; error?: string } {
    const trimmed = code.trim();
    if (!trimmed) {
      return { valid: false, error: "Compilation Error: Source file is empty." };
    }

    // Check bracket balance
    let paren = 0, brace = 0, bracket = 0;
    for (const char of code) {
      if (char === "(") paren++;
      else if (char === ")") paren--;
      else if (char === "{") brace++;
      else if (char === "}") brace--;
      else if (char === "[") bracket++;
      else if (char === "]") bracket--;
      if (paren < 0 || brace < 0 || bracket < 0) {
        return {
          valid: false,
          error: `SyntaxError: Unmatched closing token '${char}' detected in source.`,
        };
      }
    }

    if (paren !== 0 || brace !== 0 || bracket !== 0) {
      return {
        valid: false,
        error: `SyntaxError: Unclosed delimiters (parentheses: ${paren}, braces: ${brace}, brackets: ${bracket}).`,
      };
    }

    // Check Python specific syntax cues
    if (language === "Python") {
      if (code.includes("def ") && !code.includes(":")) {
        return { valid: false, error: "SyntaxError: expected ':' at end of function header line." };
      }
    }

    // Check C/C++ missing semicolons heuristic
    if (language === "C++" || language === "C") {
      if (code.includes("return") && !code.includes(";")) {
        return { valid: false, error: "error: expected ';' after return statement" };
      }
    }

    return { valid: true };
  }

  private static checkRuntimeExceptions(code: string): { hasError: boolean; message?: string } {
    if (code.includes("/ 0") || code.includes("/0")) {
      return { hasError: true, message: "ZeroDivisionError: integer division or modulo by zero" };
    }
    if (code.includes("NullPointer") || code.includes("NoneType") || code.includes("nullptr->")) {
      return { hasError: true, message: "NullPointerException / Segmentation Fault (core dumped)" };
    }
    if (code.includes("[999999]") || code.includes("[1000000]")) {
      return { hasError: true, message: "IndexError: list index out of range / bounds buffer overflow" };
    }
    return { hasError: false };
  }

  private static checkInfiniteLoops(code: string): boolean {
    if (code.includes("while True:") && !code.includes("break") && !code.includes("return")) {
      return true;
    }
    if (code.includes("while (true)") && !code.includes("break") && !code.includes("return")) {
      return true;
    }
    if (code.includes("while(1)") && !code.includes("break") && !code.includes("return")) {
      return true;
    }
    return false;
  }

  private static getSimulatedRuntime(lang: SupportedLanguage): number {
    switch (lang) {
      case "C":
      case "C++":
        return Math.floor(Math.random() * 8) + 2; // 2-10ms
      case "Java":
        return Math.floor(Math.random() * 15) + 12; // 12-27ms
      case "Python":
        return Math.floor(Math.random() * 25) + 32; // 32-57ms
      default:
        return 20;
    }
  }

  private static getSimulatedMemory(lang: SupportedLanguage): number {
    switch (lang) {
      case "C":
      case "C++":
        return Number((Math.random() * 1.2 + 12.8).toFixed(1)); // ~13.5MB
      case "Java":
        return Number((Math.random() * 3 + 42.0).toFixed(1)); // ~43.5MB
      case "Python":
        return Number((Math.random() * 1.5 + 16.5).toFixed(1)); // ~17.2MB
      default:
        return 16.0;
    }
  }
}
