export interface SkillGapItem {
  topic: string;
  currentMastery: number; // 0-100
  targetMastery: number;  // 0-100
  deficitPercentage: number;
  criticality: "High" | "Medium" | "Low";
  recommendedPrerequisites: string[];
  diagnosticInsight: string;
}

export interface DifficultyPredictionItem {
  problemId: string;
  problemTitle: string;
  topic: string;
  nominalDifficulty: "Easy" | "Medium" | "Hard";
  predictedUserDifficultyScore: number; // 1 - 100
  estimatedSolveTimeMinutes: number;
  expectedSuccessProbability: number; // 0 - 100%
  primaryChallengeReason: string;
}

export interface RetentionRiskItem {
  topic: string;
  lastPracticedDaysAgo: number;
  estimatedMemoryRetention: number; // 0 - 100%
  decayRisk: "Critical Decay" | "Moderate Decay" | "Stable";
  suggestedSpacedRepetitionProblem: string;
  recommendedReviewDate: string;
}

export interface PersonalizedRoadmapV2 {
  targetGoal: string;
  targetCompanyTier: string;
  currentOverallMastery: number;
  projectedMasteryGain: number;
  estimatedWeeksToReadiness: number;
  weeklyPlan: {
    weekNumber: number;
    theme: string;
    focusAreas: string[];
    curatedProblems: { id: string; title: string; difficulty: string; predictedGain: string }[];
    milestoneAssessment: string;
  }[];
}

class RecommendationV2Repository {
  getSkillGaps(userId?: string): SkillGapItem[] {
    return [
      {
        topic: "Dynamic Programming (Bitmask & State Compression)",
        currentMastery: 48,
        targetMastery: 85,
        deficitPercentage: 37,
        criticality: "High",
        recommendedPrerequisites: ["Bitwise Operators", "Subsequence Recursion", "Memoization Arrays"],
        diagnosticInsight: "High frequency of Time Limit Exceeded (TLE) when exploring overlapping subproblems beyond 2 dimensions.",
      },
      {
        topic: "Graph Shortest Paths (Dijkstra & Min-Priority Queue)",
        currentMastery: 62,
        targetMastery: 90,
        deficitPercentage: 28,
        criticality: "High",
        recommendedPrerequisites: ["Binary Min-Heap", "Adjacency List Traversal"],
        diagnosticInsight: "Tendency to use unweighted BFS patterns on weighted edge matrices, leading to suboptimal time complexity.",
      },
      {
        topic: "Trie & Prefix Tree Optimization",
        currentMastery: 68,
        targetMastery: 80,
        deficitPercentage: 12,
        criticality: "Medium",
        recommendedPrerequisites: ["String Matching", "N-ary Tree Structures"],
        diagnosticInsight: "Memory allocation overhead in Trie nodes is causing memory limit near-misses on large streaming inputs.",
      },
      {
        topic: "Monotonic Stack & Sliding Window Maximum",
        currentMastery: 74,
        targetMastery: 85,
        deficitPercentage: 11,
        criticality: "Medium",
        recommendedPrerequisites: ["Double-ended Queues", "Array Indices Tracking"],
        diagnosticInsight: "Solid conceptual grasp; minor edge case issues with strictly vs non-strictly decreasing invariants.",
      },
    ];
  }

  getDifficultyPredictions(userId?: string): DifficultyPredictionItem[] {
    return [
      {
        problemId: "trapping-rain-water",
        problemTitle: "Trapping Rain Water",
        topic: "Two Pointers & Monotonic Stack",
        nominalDifficulty: "Hard",
        predictedUserDifficultyScore: 76,
        estimatedSolveTimeMinutes: 24,
        expectedSuccessProbability: 82,
        primaryChallengeReason: "High correlation with your two-pointer strengths; monotonic stack optimization required for O(1) space.",
      },
      {
        problemId: "edit-distance",
        problemTitle: "Edit Distance",
        topic: "Dynamic Programming",
        nominalDifficulty: "Medium",
        predictedUserDifficultyScore: 68,
        estimatedSolveTimeMinutes: 28,
        expectedSuccessProbability: 71,
        primaryChallengeReason: "2D matrix state transition equation requires careful boundary initialization.",
      },
      {
        problemId: "course-schedule-ii",
        problemTitle: "Course Schedule II",
        topic: "Graph / Topological Sort",
        nominalDifficulty: "Medium",
        predictedUserDifficultyScore: 54,
        estimatedSolveTimeMinutes: 18,
        expectedSuccessProbability: 88,
        primaryChallengeReason: "Direct match for Kahn's in-degree algorithm which you recently practiced.",
      },
      {
        problemId: "word-break-ii",
        problemTitle: "Word Break II",
        topic: "Backtracking & Trie",
        nominalDifficulty: "Hard",
        predictedUserDifficultyScore: 89,
        estimatedSolveTimeMinutes: 38,
        expectedSuccessProbability: 58,
        primaryChallengeReason: "Exponential branching without memoized string partition pruning.",
      },
    ];
  }

  getRetentionForecast(userId?: string): RetentionRiskItem[] {
    return [
      {
        topic: "Binary Search on Answer Space",
        lastPracticedDaysAgo: 16,
        estimatedMemoryRetention: 54,
        decayRisk: "Critical Decay",
        suggestedSpacedRepetitionProblem: "Koko Eating Bananas",
        recommendedReviewDate: "Today",
      },
      {
        topic: "Union-Find with Rank & Path Compression",
        lastPracticedDaysAgo: 12,
        estimatedMemoryRetention: 66,
        decayRisk: "Moderate Decay",
        suggestedSpacedRepetitionProblem: "Number of Connected Components in an Undirected Graph",
        recommendedReviewDate: "Tomorrow",
      },
      {
        topic: "Two Pointers (Fast & Slow Pointer)",
        lastPracticedDaysAgo: 3,
        estimatedMemoryRetention: 92,
        decayRisk: "Stable",
        suggestedSpacedRepetitionProblem: "Linked List Cycle II",
        recommendedReviewDate: "In 8 days",
      },
    ];
  }

  generatePersonalizedRoadmap(goal: string = "FAANG SDE-2"): PersonalizedRoadmapV2 {
    return {
      targetGoal: goal,
      targetCompanyTier: "Tier 1 Top Tech / High-Frequency Trading",
      currentOverallMastery: 78,
      projectedMasteryGain: 17,
      estimatedWeeksToReadiness: 4,
      weeklyPlan: [
        {
          weekNumber: 1,
          theme: "Bitmask DP & State Compression Optimization",
          focusAreas: ["Bitwise shifts in DP states", "Traveling Salesman Formulations", "Space complexity reduction to O(2^N)"],
          curatedProblems: [
            { id: "can-i-win", title: "Can I Win", difficulty: "Medium", predictedGain: "+4.2% DP Mastery" },
            { id: "shortest-path-visiting-all-nodes", title: "Shortest Path Visiting All Nodes", difficulty: "Hard", predictedGain: "+6.8% DP Mastery" },
          ],
          milestoneAssessment: "Proctored 45-min Bitmask DP Timed Drill",
        },
        {
          weekNumber: 2,
          theme: "Advanced Graph Flow & Topological Dependencies",
          focusAreas: ["Tarjan's SCC Algorithm", "Kahn's Topo Sort with Priority Queues", "Disjoint Sets in Matrix Grid Cycle Detection"],
          curatedProblems: [
            { id: "critical-connections-in-a-network", title: "Critical Connections in a Network", difficulty: "Hard", predictedGain: "+5.5% Graph Mastery" },
            { id: "alien-dictionary", title: "Alien Dictionary", difficulty: "Hard", predictedGain: "+4.8% Graph Mastery" },
          ],
          milestoneAssessment: "Google-Style Graph Technical Mock Interview",
        },
        {
          weekNumber: 3,
          theme: "Monotonic Queues, Range Queries & Segment Trees",
          focusAreas: ["Range Sum Query - Mutable", "Sliding Window Maximum invariant proofs", "Coordinate Compression"],
          curatedProblems: [
            { id: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", predictedGain: "+5.1% Range Query Mastery" },
            { id: "count-of-smaller-numbers-after-self", title: "Count of Smaller Numbers After Self", difficulty: "Hard", predictedGain: "+6.0% Segment Tree Mastery" },
          ],
          milestoneAssessment: "Speed OA Simulator (90 mins, 3 Hard problems)",
        },
        {
          weekNumber: 4,
          theme: "FAANG Final Simulation & System Design Integration",
          focusAreas: ["End-to-end full loop timed mocks", "Trade-off articulation", "Zero-bug first submissions"],
          curatedProblems: [
            { id: "lru-cache", title: "LRU Cache (Optimal Concurrency Safe)", difficulty: "Medium", predictedGain: "+3.5% Architecture Mastery" },
            { id: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "Hard", predictedGain: "+4.0% Binary Search Mastery" },
          ],
          milestoneAssessment: "Final Comprehensive Algora Certified Assessment",
        },
      ],
    };
  }
}

export const recommendationV2Repo = new RecommendationV2Repository();
