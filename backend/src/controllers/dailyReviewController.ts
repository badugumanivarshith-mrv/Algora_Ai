import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { ProgressRepository } from "../repositories/progressRepository";
import { XPRepository } from "../repositories/xpRepository";
import { AchievementRepository } from "../repositories/achievementRepository";
import { ProfileRepository } from "../repositories/profileRepository";
import { logger } from "../utils/logger";

interface ReviewQuestion {
  id: string;
  problemId: number;
  problemSlug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  retentionScore: number;
  lastPracticedDaysAgo: number;
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const REVIEW_CATALOG: ReviewQuestion[] = [
  {
    id: "rev-1",
    problemId: 2,
    problemSlug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    topic: "Two Pointers",
    retentionScore: 68,
    lastPracticedDaysAgo: 4,
    prompt: "What is the optimal time and space complexity for finding the longest palindromic substring using center expansion?",
    codeSnippet: `def expandAroundCenter(s, left, right):\n    while left >= 0 and right < len(s) and s[left] == s[right]:\n        left -= 1\n        right += 1\n    return right - left - 1`,
    options: [
      "Time: O(N), Space: O(1)",
      "Time: O(N^2), Space: O(1)",
      "Time: O(N^2), Space: O(N^2)",
      "Time: O(N log N), Space: O(N)",
    ],
    correctIndex: 1,
    explanation: "Expanding around each of the 2N - 1 potential centers takes O(N) per center, resulting in O(N^2) total time with O(1) auxiliary space.",
  },
  {
    id: "rev-2",
    problemId: 5,
    problemSlug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    retentionScore: 54,
    lastPracticedDaysAgo: 6,
    prompt: "Why can the dynamic programming state space for the Climbing Stairs recurrence f(n) = f(n-1) + f(n-2) be reduced from O(n) to O(1)?",
    options: [
      "Because every state is independent of previous states",
      "Because f(n) only depends on the immediately preceding two computed values",
      "Because memoization caches all subproblems into global registers",
      "Because recursive branches can be pruned using binary search",
    ],
    correctIndex: 1,
    explanation: "Since the Fibonacci recurrence only queries the last two states (prev1 and prev2), two rolling scalar variables suffice for O(1) space.",
  },
  {
    id: "rev-3",
    problemId: 4,
    problemSlug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Intervals & Sorting",
    retentionScore: 62,
    lastPracticedDaysAgo: 5,
    prompt: "When sorting intervals by start time [start_i, end_i], what condition dictates whether current interval i overlaps with the merged top?",
    options: [
      "intervals[i][0] <= merged[-1][1]",
      "intervals[i][1] >= merged[-1][0]",
      "intervals[i][0] == merged[-1][0]",
      "intervals[i][1] - intervals[i][0] > 0",
    ],
    correctIndex: 0,
    explanation: "If the new interval's start is less than or equal to the previous interval's end, they overlap and should be merged by taking max(end1, end2).",
  },
  {
    id: "rev-4",
    problemId: 1,
    problemSlug: "two-sum",
    title: "Two Sum Hash Map Invariant",
    difficulty: "Easy",
    topic: "Arrays & Hashing",
    retentionScore: 89,
    lastPracticedDaysAgo: 2,
    prompt: "In a single-pass hash map solution for Two Sum, why is checking 'target - num' before inserting 'num' into the table safe and sufficient?",
    options: [
      "It prevents matching an element with itself at the same index",
      "It sorts the keys automatically in descending order",
      "It eliminates hash collisions in the bucket array",
      "It forces constant memory reallocation",
    ],
    correctIndex: 0,
    explanation: "Checking the complement before storing the current index guarantees an element cannot pair with itself.",
  },
  {
    id: "rev-5",
    problemId: 3,
    problemSlug: "valid-parentheses",
    title: "Valid Parentheses Stack Invariant",
    difficulty: "Easy",
    topic: "Stacks",
    retentionScore: 78,
    lastPracticedDaysAgo: 3,
    prompt: "When encountering a closing bracket, under what two conditions is the string immediately deemed invalid?",
    options: [
      "Stack is empty OR top of stack does not match the matching opening bracket",
      "Stack length is even OR top of stack is a digit",
      "String length is odd only",
      "Closing bracket index is prime",
    ],
    correctIndex: 0,
    explanation: "A closing bracket without a prior unmatched opening bracket (empty stack) or with a mismatched top bracket immediately violates balance.",
  },
];

export class DailyReviewController {
  static async getReviewQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";

      const topicProgress = await ProgressRepository.findTopicProgress(userId);

      // Identify weakest topics (lowest mastery score)
      const weakTopics = [...topicProgress]
        .sort((a, b) => a.masteryScore - b.masteryScore)
        .slice(0, 3)
        .map((t) => ({
          topic: t.topic,
          masteryScore: t.masteryScore,
          solvedCount: t.solvedCount,
        }));

      // Calculate overall retention score
      const avgMastery =
        topicProgress.length > 0
          ? Math.round(topicProgress.reduce((sum, t) => sum + t.masteryScore, 0) / topicProgress.length)
          : 72;

      res.json({
        success: true,
        data: {
          queue: REVIEW_CATALOG,
          totalDue: REVIEW_CATALOG.length,
          overallRetentionScore: avgMastery,
          weakTopics,
          streakDays: 7,
          xpRewardTotal: 150,
        },
      });
    } catch (error: any) {
      logger.error(`[DailyReviewController] Error getting review queue: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to fetch daily review queue" });
    }
  }

  static async completeReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || "usr-arjun-patel";
      const { correctCount = 5, totalQuestions = 5 } = req.body;

      const xpEarned = Math.max(50, Math.round((correctCount / totalQuestions) * 150));

      // Award XP
      const xpResult = await XPRepository.recordXP(
        userId,
        xpEarned,
        "Daily Review Completion",
        `Completed daily spaced repetition review (${correctCount}/${totalQuestions} correct)`
      );

      // Increment streak days in profile
      const profile = await ProfileRepository.findByUserId(userId);
      if (profile) {
        profile.streakDays += 1;
        await ProfileRepository.update(userId, { streakDays: profile.streakDays });
      }

      // Check for Daily Reviewer badge & streak badges
      await AchievementRepository.awardAchievement(userId, "DAILY_REVIEWER");
      const newBadges = await AchievementRepository.evaluateAndUnlockAchievements(userId);

      res.json({
        success: true,
        message: "Daily review completed successfully!",
        data: {
          xpEarned,
          totalXP: xpResult.totalXP,
          level: xpResult.level,
          streakDays: profile?.streakDays || 8,
          newBadges,
        },
      });
    } catch (error: any) {
      logger.error(`[DailyReviewController] Error completing review: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to submit review" });
    }
  }
}
