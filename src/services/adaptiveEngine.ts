/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Adaptive Learning Engine & Learning Memory System
 */

export interface StudentMistake {
  id: string;
  problemId: string;
  problemTitle: string;
  topic: string;
  errorType: "Syntax Error" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error";
  failedCodeSnippet: string;
  errorDetails: string;
  timestamp: string;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  accuracyPercentage: number;
  avgSolveTimeMins: number;
  solvedCount: number;
  totalAttempted: number;
  status: "Mastered" | "Strong" | "Good" | "Weak" | "Critical Focus";
  retentionScore: number; // 0 - 100% SuperMemo-2 decay
}

export interface AdaptiveRecommendation {
  id: string;
  type: "concept" | "problem" | "project" | "company";
  title: string;
  topic: string;
  reason: string;
  actionUrl: string;
  priority: "Critical" | "High" | "Medium" | "Stretch";
  colorBadge: string;
}

export interface LearningMemoryState {
  userId: string;
  userName: string;
  overallAccuracy: number;
  solvingVelocityMins: number;
  retentionRate: number;
  strongTopics: string[];
  weakTopics: string[];
  identifiedErrorPatterns: {
    patternName: string;
    description: string;
    occurrences: number;
    recommendedRemediation: string;
  }[];
  topicMasteries: TopicMastery[];
  mistakesLog: StudentMistake[];
  adaptiveRecommendations: AdaptiveRecommendation[];
  nextMilestoneGoal: string;
}

export const INITIAL_LEARNING_MEMORY: LearningMemoryState = {
  userId: "usr_algora_demo",
  userName: "Mani Varshith",
  overallAccuracy: 74.5,
  solvingVelocityMins: 18.2,
  retentionRate: 82.0,
  strongTopics: ["Arrays & Hashing", "Two Pointers", "Graph BFS/DFS"],
  weakTopics: ["Dynamic Programming", "Backtracking Recursion", "Heaps / Priority Queue"],
  identifiedErrorPatterns: [
    {
      patternName: "Missing Memoization Cache in Recursive DP",
      description: "Triggered 3 Time Limit Exceeded (TLE) errors due to un-memoized exponential call trees O(2^N).",
      occurrences: 3,
      recommendedRemediation: "Always define a `memo = {}` dictionary or `@cache` decorator before writing recursive step."
    },
    {
      patternName: "Off-by-One Boundary Condition in Binary Search",
      description: "Encountered 2 Wrong Answers on rotated sorted search due to using `low < high` instead of `low <= high`.",
      occurrences: 2,
      recommendedRemediation: "Use strict invariant boundary checks: `low = mid + 1` or `high = mid - 1`."
    }
  ],
  topicMasteries: [
    { topicId: "arrays-hashing", topicName: "Arrays & Hashing", accuracyPercentage: 88, avgSolveTimeMins: 12, solvedCount: 18, totalAttempted: 20, status: "Mastered", retentionScore: 92 },
    { topicId: "two-pointers", topicName: "Two Pointers", accuracyPercentage: 82, avgSolveTimeMins: 15, solvedCount: 10, totalAttempted: 12, status: "Strong", retentionScore: 88 },
    { topicId: "sliding-window", topicName: "Sliding Window", accuracyPercentage: 78, avgSolveTimeMins: 18, solvedCount: 8, totalAttempted: 10, status: "Good", retentionScore: 80 },
    { topicId: "binary-search", topicName: "Binary Search", accuracyPercentage: 72, avgSolveTimeMins: 20, solvedCount: 7, totalAttempted: 9, status: "Good", retentionScore: 75 },
    { topicId: "graphs", topicName: "Graphs & BFS/DFS", accuracyPercentage: 90, avgSolveTimeMins: 16, solvedCount: 15, totalAttempted: 16, status: "Mastered", retentionScore: 94 },
    { topicId: "dynamic-programming", topicName: "Dynamic Programming", accuracyPercentage: 58, avgSolveTimeMins: 32, solvedCount: 6, totalAttempted: 11, status: "Critical Focus", retentionScore: 54 },
    { topicId: "backtracking", topicName: "Backtracking", accuracyPercentage: 62, avgSolveTimeMins: 28, solvedCount: 5, totalAttempted: 8, status: "Weak", retentionScore: 60 }
  ],
  mistakesLog: [
    {
      id: "misk_01",
      problemId: "longest-palindromic-substring",
      problemTitle: "Longest Palindromic Substring",
      topic: "Dynamic Programming",
      errorType: "Time Limit Exceeded",
      failedCodeSnippet: "def helper(s):\n    return helper(s[1:]) + helper(s[:-1])",
      errorDetails: "Exponential O(2^N) time complexity without DP table memoization.",
      timestamp: "2026-09-29T14:20:00Z"
    },
    {
      id: "misk_02",
      problemId: "two-sum",
      problemTitle: "Two Sum",
      topic: "Arrays & Hashing",
      errorType: "Wrong Answer",
      failedCodeSnippet: "if nums[i] + nums[j] == target:\n    return [i, i]",
      errorDetails: "Used duplicate index i twice instead of j.",
      timestamp: "2026-09-28T10:15:00Z"
    }
  ],
  adaptiveRecommendations: [
    {
      id: "rec_01",
      type: "problem",
      title: "1D Dynamic Programming Tabulation",
      topic: "Dynamic Programming",
      reason: "Your DP accuracy is 58% vs 82% global average. Rebuilding 1D tabulation will fix TLE errors.",
      actionUrl: "/workspace?problem=longest-palindromic-substring",
      priority: "Critical",
      colorBadge: "var(--red)"
    },
    {
      id: "rec_02",
      type: "concept",
      title: "SuperMemo-2 Spaced Repetition Flashcards",
      topic: "Backtracking & Recursion",
      reason: "Retention for Backtracking dropped to 60%. Schedule 10-minute daily review.",
      actionUrl: "/daily-review",
      priority: "High",
      colorBadge: "var(--amber)"
    },
    {
      id: "rec_03",
      type: "project",
      title: "Core Banking Ledger Project",
      topic: "Systems & Invariants",
      reason: "Reinforce transaction atomicity and OOP encapsulation skills.",
      actionUrl: "/projects?project=banking-system",
      priority: "Medium",
      colorBadge: "var(--blue)"
    },
    {
      id: "rec_04",
      type: "company",
      title: "Amazon Leadership & Trees Preparation Track",
      topic: "Company Readiness",
      reason: "Your Tree & Graph mastery (90%) makes you 82% ready for Amazon Bar Raiser.",
      actionUrl: "/company-prep?company=amazon",
      priority: "Stretch",
      colorBadge: "var(--green)"
    }
  ],
  nextMilestoneGoal: "Master 1D DP Tabulation & Reach 80% Overall DSA Accuracy"
};

/**
 * Re-evaluates student memory state after a problem attempt or review session.
 */
export function evaluateStudentMemory(
  currentState: LearningMemoryState,
  attempt: {
    problemId: string;
    problemTitle: string;
    topic: string;
    passed: boolean;
    errorType?: "Syntax Error" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error";
    runtimeMs: number;
  }
): LearningMemoryState {
  const updatedState = { ...currentState };

  // Update accuracy & velocity
  if (!attempt.passed && attempt.errorType) {
    updatedState.mistakesLog = [
      {
        id: "misk_" + Date.now(),
        problemId: attempt.problemId,
        problemTitle: attempt.problemTitle,
        topic: attempt.topic,
        errorType: attempt.errorType,
        failedCodeSnippet: "Recorded from Workspace execution",
        errorDetails: `Failed attempt on ${attempt.problemTitle}`,
        timestamp: new Date().toISOString()
      },
      ...updatedState.mistakesLog
    ];
  }

  return updatedState;
}
