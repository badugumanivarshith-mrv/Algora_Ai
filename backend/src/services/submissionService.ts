import { SubmissionEntity, SolvedProblemEntity } from "../types";
import { ApiError } from "../middleware/error";
import {
  SubmissionRepository,
  ProgressRepository,
  ProfileRepository,
  AchievementRepository,
} from "../repositories";

export interface CreateSubmissionInput {
  userId?: string;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  language: string;
  code: string;
  status: string;
  runtimeMs: number;
  memoryMb: number;
  runtimePercentile?: number;
  memoryPercentile?: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  compilationError?: string;
  testCasesPayload?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
}

export interface SubmissionQueryFilter {
  userId?: string;
  problemSlug?: string;
  status?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export class SubmissionService {
  static async getSubmissions(
    filter: SubmissionQueryFilter = {}
  ): Promise<{ submissions: SubmissionEntity[]; total: number }> {
    return SubmissionRepository.findMany({
      userId: filter.userId,
      problemSlug: filter.problemSlug,
      status: filter.status,
      language: filter.language,
      limit: filter.limit,
      offset: filter.offset,
    });
  }

  static async createSubmission(
    input: CreateSubmissionInput,
    authenticatedUserId?: string
  ): Promise<SubmissionEntity> {
    if (!input.problemSlug || !input.code || !input.language) {
      throw new ApiError(400, "MISSING_FIELDS", "problemSlug, language, and code are required.");
    }

    const userId = authenticatedUserId || input.userId || "usr-arjun-patel";
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newSub: SubmissionEntity = {
      id: submissionId,
      userId,
      problemId: input.problemId,
      problemSlug: input.problemSlug,
      problemTitle: input.problemTitle || input.problemSlug,
      language: input.language,
      code: input.code,
      status: input.status || "Accepted",
      runtimeMs: input.runtimeMs || 30,
      memoryMb: input.memoryMb || 16.0,
      runtimePercentile: input.runtimePercentile ?? 85.0,
      memoryPercentile: input.memoryPercentile ?? 80.0,
      passedTests: input.passedTests ?? 1,
      totalTests: input.totalTests ?? 1,
      errorMessage: input.errorMessage,
      compilationError: input.compilationError,
      testCasesPayload: input.testCasesPayload,
      createdAt: now,
    };

    const savedSub = await SubmissionRepository.create(newSub);

    // If Accepted, record in solved_problems, topic progress, achievements, and reward XP
    if (newSub.status === "Accepted") {
      const existingSolvedList = await ProgressRepository.findSolvedProblems(userId);
      const existingSolved = existingSolvedList.find((sp) => sp.problemSlug === input.problemSlug);

      const topicName = input.topic || "Algorithms";

      if (!existingSolved) {
        const newSolved: SolvedProblemEntity = {
          id: `sol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId,
          problemId: input.problemId,
          problemSlug: input.problemSlug,
          difficulty: input.difficulty || "Medium",
          topic: topicName,
          firstSolvedAt: now,
          bestRuntimeMs: input.runtimeMs,
          bestMemoryMb: input.memoryMb,
          createdAt: now,
        };

        await ProgressRepository.recordSolvedProblem(newSolved);

        // Update profile XP & Rating
        const xpGain = input.difficulty === "Hard" ? 150 : input.difficulty === "Medium" ? 75 : 40;
        await ProfileRepository.incrementXPAndRating(userId, xpGain, 5);

        // Update Topic Progress
        await ProgressRepository.updateTopicProgress(userId, topicName, true);

        // Award first blood achievement if not unlocked
        await AchievementRepository.awardAchievement(userId, "FIRST_ACCEPTED", 100);

        // Check for Speed Demon
        if (newSub.runtimePercentile >= 90) {
          await AchievementRepository.awardAchievement(userId, "SPEED_DEMON", 100);
        }
      } else {
        await ProgressRepository.recordSolvedProblem({
          ...existingSolved,
          bestRuntimeMs: Math.min(existingSolved.bestRuntimeMs, input.runtimeMs),
          bestMemoryMb: Math.min(existingSolved.bestMemoryMb, input.memoryMb),
        });
      }
    }

    return savedSub;
  }
}
