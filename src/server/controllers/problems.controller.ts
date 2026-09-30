/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Problems & Production Code Judge Execution Controller
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { db, SubmissionEntity } from '../db/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { JudgeLanguage } from '../services/judgeService';
import { submitToJudgeQueue } from '../services/queueService';

export async function getProblems(req: Request, res: Response): Promise<void> {
  const { topicId, difficulty, company, tag, q } = req.query;

  let list = Array.from(db.problems.values());

  if (topicId) {
    list = list.filter((p) => p.topic_id === String(topicId));
  }
  if (difficulty) {
    list = list.filter((p) => p.difficulty.toLowerCase() === String(difficulty).toLowerCase());
  }
  if (company) {
    list = list.filter((p) => p.companies.some((c) => c.toLowerCase() === String(company).toLowerCase()));
  }
  if (tag) {
    list = list.filter((p) => p.tags.some((t) => t.toLowerCase() === String(tag).toLowerCase()));
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
}

export async function getProblemById(req: Request, res: Response): Promise<void> {
  const { idOrSlug } = req.params;
  const problem =
    db.problems.get(idOrSlug) ||
    Array.from(db.problems.values()).find((p) => p.slug === idOrSlug);

  if (!problem) {
    res.status(404).json({ success: false, error: 'Problem not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: problem,
  });
}

export async function getProblemHints(req: Request, res: Response): Promise<void> {
  const { problemId } = req.params;
  const hints = db.problemHints.get(problemId) || [];

  res.status(200).json({
    success: true,
    data: hints,
  });
}

/**
 * Run Code - Dry run against sample test cases via Sandboxed Production Judge
 */
export async function runCode(req: Request, res: Response): Promise<void> {
  const { problemId, code, language, customInput } = req.body;

  if (!code || !language) {
    res.status(400).json({ success: false, error: 'Code and language are required' });
    return;
  }

  const problem = db.problems.get(problemId);
  const testCases = problem
    ? problem.test_cases
    : [{ input: customInput || 'sample', expected: 'sample' }];

  const submissionId = 'run_' + crypto.randomUUID();

  // Route through BullMQ Queue & Production Code Judge Worker
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
}

/**
 * Submit Code - Official Evaluation against ALL Test Cases (including Hidden Test Cases)
 */
export async function submitCode(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  const problem = db.problems.get(problemId);
  if (!problem) {
    res.status(404).json({ success: false, error: 'Problem not found' });
    return;
  }

  const submissionId = 'sub_' + crypto.randomUUID();

  // Route through BullMQ Queue & Production Code Judge Worker
  const judgeResult = await submitToJudgeQueue({
    submissionId,
    userId,
    problemId,
    code,
    language: language as JudgeLanguage,
    testCases: problem.test_cases,
    timeLimitMs: 2000,
    memoryLimitMb: 256
  });

  const isAccepted = judgeResult.verdict === 'Accepted';

  const submission: SubmissionEntity = {
    id: submissionId,
    user_id: userId,
    problem_id: problemId,
    code,
    language,
    status: judgeResult.verdict,
    execution_time_ms: judgeResult.executionTimeMs,
    memory_mb: judgeResult.memoryMb,
    passed_test_cases: judgeResult.passedTestCases,
    total_test_cases: judgeResult.totalTestCases,
    error_message: judgeResult.errorMessage,
    created_at: new Date().toISOString(),
  };

  db.submissions.set(submission.id, submission);

  let xpEarned = 0;
  if (isAccepted) {
    xpEarned = problem.difficulty === 'Easy' ? 50 : problem.difficulty === 'Medium' ? 100 : 200;
    const user = db.users.get(userId);
    if (user) {
      user.xp += xpEarned;
      user.level = Math.floor(user.xp / 400) + 1;
    }

    // Schedule into Daily Review Spaced Repetition Queue
    const reviewId = 'rev_' + crypto.randomUUID();
    db.dailyReviews.set(reviewId, {
      id: reviewId,
      user_id: userId,
      item_type: 'problem',
      item_id: problem.id,
      title: `${problem.title} Optimal Pattern`,
      subtopic: problem.tags[0] || 'Data Structures',
      front_content: `Explain the optimal time & space complexity for ${problem.title}.`,
      back_content: `Mastered with verdict ACCEPTED in ${judgeResult.executionTimeMs}ms. Revisit key constraints.`,
      easiness_factor: 2.5,
      interval_days: 1,
      repetition_number: 1,
      next_review_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
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
}
