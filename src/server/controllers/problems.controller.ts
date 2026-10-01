/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Problems & Production Code Judge Execution Controller (PostgreSQL Drizzle Refactor)
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { drizzleDb } from '../db/db';
import { problems, problemHints, submissions, users, dailyReviews } from '../db/schema';
import { eq, or, and, lte } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { JudgeLanguage } from '../services/judgeService';
import { submitToJudgeQueue } from '../services/queueService';

export async function getProblems(req: Request, res: Response): Promise<void> {
  try {
    const { topicId, difficulty, company, tag, q } = req.query;

    let list = await drizzleDb.select().from(problems);

    if (topicId) {
      list = list.filter((p) => p.topicId === String(topicId));
    }
    if (difficulty) {
      list = list.filter((p) => p.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }
    if (company) {
      list = list.filter((p) => (p.companies as string[] || []).some((c) => c.toLowerCase() === String(company).toLowerCase()));
    }
    if (tag) {
      list = list.filter((p) => (p.tags as string[] || []).some((t) => t.toLowerCase() === String(tag).toLowerCase()));
    }
    if (q) {
      const query = String(q).toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getProblemById(req: Request, res: Response): Promise<void> {
  try {
    const { idOrSlug } = req.params;
    const list = await drizzleDb.select()
      .from(problems)
      .where(or(eq(problems.id, idOrSlug), eq(problems.slug, idOrSlug)));

    if (list.length === 0) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: list[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getProblemHints(req: Request, res: Response): Promise<void> {
  try {
    const { problemId } = req.params;
    const hints = await drizzleDb.select().from(problemHints).where(eq(problemHints.problemId, problemId));

    res.status(200).json({
      success: true,
      data: hints,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Run Code - Dry run against sample test cases via Sandboxed Production Judge
 */
export async function runCode(req: Request, res: Response): Promise<void> {
  try {
    const { problemId, code, language, customInput } = req.body;

    if (!code || !language) {
      res.status(400).json({ success: false, error: 'Code and language are required' });
      return;
    }

    const list = await drizzleDb.select().from(problems).where(eq(problems.id, problemId));
    const problem = list[0] || null;
    const testCases = problem
      ? (problem.testCases as any[])
      : [{ input: customInput || 'sample', expected: 'sample' }];

    const submissionId = crypto.randomUUID();

    const result = await submitToJudgeQueue({
      submissionId,
      userId: 'anonymous_run',
      problemId: problemId || 'sandbox',
      code,
      language: language as JudgeLanguage,
      testCases,
      timeLimitMs: 2000,
      memoryLimitMb: 256
    });

    res.status(200).json({
      success: true,
      data: {
        status: result.verdict,
        totalPassed: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        executionTimeMs: result.executionTimeMs,
        memoryMb: result.memoryMb,
        errorMessage: result.errorMessage,
        results: result.testDetails,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Submit Code - Official Evaluation against ALL Test Cases (including Hidden Test Cases)
 */
export async function submitCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user?.id;

    if (!problemId || !code || !language) {
      res.status(400).json({ success: false, error: 'problemId, code, and language are required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot submit official problem attempts. Please log in or register.' });
      return;
    }

    const list = await drizzleDb.select().from(problems).where(eq(problems.id, problemId));
    const problem = list[0] || null;
    if (!problem) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }

    const submissionId = crypto.randomUUID();

    const judgeResult = await submitToJudgeQueue({
      submissionId,
      userId,
      problemId,
      code,
      language: language as JudgeLanguage,
      testCases: problem.testCases as any[],
      timeLimitMs: 2000,
      memoryLimitMb: 256
    });

    const isAccepted = judgeResult.verdict === 'Accepted';

    const submission = {
      id: submissionId,
      userId,
      problemId,
      code,
      language,
      status: judgeResult.verdict,
      executionTimeMs: judgeResult.executionTimeMs,
      memoryMb: String(judgeResult.memoryMb || 0),
      passedTestCases: judgeResult.passedTestCases,
      totalTestCases: judgeResult.totalTestCases,
      errorMessage: judgeResult.errorMessage,
    };

    await drizzleDb.insert(submissions).values(submission);

    let xpEarned = 0;
    if (isAccepted) {
      xpEarned = problem.difficulty === 'Easy' ? 50 : problem.difficulty === 'Medium' ? 100 : 200;
      const usersList = await drizzleDb.select().from(users).where(eq(users.id, userId));
      if (usersList.length > 0) {
        const user = usersList[0];
        const newXp = user.xp + xpEarned;
        const newLevel = Math.floor(newXp / 400) + 1;
        await drizzleDb.update(users).set({ xp: newXp, level: newLevel }).where(eq(users.id, userId));
      }

      const reviewId = crypto.randomUUID();
      const tags = problem.tags as string[] || [];
      await drizzleDb.insert(dailyReviews).values({
        id: reviewId,
        userId,
        itemType: 'problem',
        itemId: problem.id,
        title: `${problem.title} Optimal Pattern`,
        subtopic: tags[0] || 'Data Structures',
        frontContent: `Explain the optimal time & space complexity for ${problem.title}.`,
        backContent: `Mastered with verdict ACCEPTED in ${judgeResult.executionTimeMs}ms. Revisit key constraints.`,
        easinessFactor: "2.50",
        intervalDays: 1,
        repetitionNumber: 1,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      });
    }

    res.status(201).json({
      success: true,
      message: isAccepted ? 'Solution Accepted! Great work.' : `Submission evaluated: Verdict ${judgeResult.verdict}`,
      data: {
        submission,
        xpEarned,
        isAccepted,
        verdict: judgeResult.verdict,
        executionTimeMs: judgeResult.executionTimeMs,
        memoryMb: judgeResult.memoryMb,
        passedTestCases: judgeResult.passedTestCases,
        totalTestCases: judgeResult.totalTestCases
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
