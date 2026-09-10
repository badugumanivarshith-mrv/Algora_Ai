import { db } from "./store";
import { SubmissionEntity, SolvedProblemEntity } from "../types";
import { ApiError } from "../middleware/error";

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
  static async getSubmissions(filter: SubmissionQueryFilter = {}): Promise<{ submissions: SubmissionEntity[]; total: number }> {
    let list = Array.from(db.submissions.values());

    if (filter.userId) {
      list = list.filter((s) => s.userId === filter.userId);
    }
    if (filter.problemSlug) {
      list = list.filter((s) => s.problemSlug === filter.problemSlug);
    }
    if (filter.status) {
      list = list.filter((s) => s.status.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter.language) {
      list = list.filter((s) => s.language.toLowerCase() === filter.language?.toLowerCase());
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { submissions: paginated, total };
  }

  static async createSubmission(input: CreateSubmissionInput, authenticatedUserId?: string): Promise<SubmissionEntity> {
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

    db.submissions.set(newSub.id, newSub);

    // If Accepted, record in solved_problems and reward XP in profile
    if (newSub.status === "Accepted") {
      let existingSolved: SolvedProblemEntity | undefined;
      for (const sp of db.solvedProblems.values()) {
        if (sp.userId === userId && sp.problemSlug === input.problemSlug) {
          existingSolved = sp;
          break;
        }
      }

      if (!existingSolved) {
        const newSolved: SolvedProblemEntity = {
          id: `sol-${Date.now()}`,
          userId,
          problemId: input.problemId,
          problemSlug: input.problemSlug,
          difficulty: input.difficulty || "Medium",
          topic: input.topic || "Algorithms",
          firstSolvedAt: now,
          bestRuntimeMs: input.runtimeMs,
          bestMemoryMb: input.memoryMb,
        };
        db.solvedProblems.set(newSolved.id, newSolved);

        // Update profile XP and rating
        const profile = db.profiles.get(userId);
        if (profile) {
          const xpGain = input.difficulty === "Hard" ? 150 : input.difficulty === "Medium" ? 75 : 40;
          profile.totalXP += xpGain;
          profile.rating += 5;
          profile.updatedAt = now;
        }
      } else {
        if (input.runtimeMs < existingSolved.bestRuntimeMs) {
          existingSolved.bestRuntimeMs = input.runtimeMs;
        }
        if (input.memoryMb < existingSolved.bestMemoryMb) {
          existingSolved.bestMemoryMb = input.memoryMb;
        }
      }
    }

    return newSub;
  }
}
