/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Contest System Controller (PostgreSQL + BullMQ + Real-Time SSE + Deep System Integrations)
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import {
  contests,
  contestProblems,
  contestRegistrations,
  contestSubmissions,
  contestLeaderboards,
  problems,
  users,
  userTopicProgress,
  dailyReviews
} from "../db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { submitToJudgeQueue } from "../services/queueService";
import { createNotificationInternal } from "./notifications.controller";
import { realtimeBroadcaster } from "../services/realtimeService";
import crypto from "crypto";

export async function getContests(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const allContests = await drizzleDb.select().from(contests).orderBy(desc(contests.startTime));

    let registrationsMap: Record<string, boolean> = {};
    if (userId) {
      const regs = await drizzleDb
        .select()
        .from(contestRegistrations)
        .where(eq(contestRegistrations.userId, userId));
      regs.forEach((r) => {
        registrationsMap[r.contestId] = true;
      });
    }

    const data = allContests.map((c) => ({
      ...c,
      isRegistered: !!registrationsMap[c.id],
    }));

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getContestById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const list = await drizzleDb.select().from(contests).where(eq(contests.id, id));
    const contest = list[0] || null;

    if (!contest) {
      res.status(404).json({ success: false, error: "Contest not found" });
      return;
    }

    let isRegistered = false;
    if (userId) {
      const reg = await drizzleDb
        .select()
        .from(contestRegistrations)
        .where(and(eq(contestRegistrations.contestId, id), eq(contestRegistrations.userId, userId)));
      isRegistered = reg.length > 0;
    }

    // Get contest problems
    const cProblems = await drizzleDb
      .select({
        id: contestProblems.id,
        contestId: contestProblems.contestId,
        problemId: contestProblems.problemId,
        orderIndex: contestProblems.orderIndex,
        points: contestProblems.points,
        title: problems.title,
        slug: problems.slug,
        difficulty: problems.difficulty,
      })
      .from(contestProblems)
      .leftJoin(problems, eq(contestProblems.problemId, problems.id))
      .where(eq(contestProblems.contestId, id))
      .orderBy(asc(contestProblems.orderIndex));

    res.status(200).json({
      success: true,
      data: {
        ...contest,
        isRegistered,
        problems: cProblems,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createContest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, slug, description, startTime, endTime, durationMinutes, problemIds } = req.body;

    if (!title || !slug || !startTime || !endTime) {
      res.status(400).json({ success: false, error: "title, slug, startTime, and endTime required" });
      return;
    }

    const contestId = crypto.randomUUID();
    const newContest = {
      id: contestId,
      title,
      slug,
      description: description || "Algora Competitive Programming Sprint",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      durationMinutes: durationMinutes || 90,
      status: "upcoming",
      createdAt: new Date(),
    };

    await drizzleDb.insert(contests).values(newContest);

    if (Array.isArray(problemIds)) {
      for (let i = 0; i < problemIds.length; i++) {
        await drizzleDb.insert(contestProblems).values({
          id: crypto.randomUUID(),
          contestId,
          problemId: problemIds[i],
          orderIndex: i + 1,
          points: (i + 1) * 100,
        });
      }
    }

    res.status(201).json({ success: true, message: "Contest created", data: newContest });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function registerForContest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const cList = await drizzleDb.select().from(contests).where(eq(contests.id, id));
    const contest = cList[0];
    if (!contest) {
      res.status(404).json({ success: false, error: "Contest not found" });
      return;
    }

    const regId = crypto.randomUUID();
    await drizzleDb.insert(contestRegistrations).values({
      id: regId,
      contestId: id,
      userId,
      registeredAt: new Date(),
    }).onConflictDoNothing();

    // Create persistent notification for user
    await createNotificationInternal(
      userId,
      `Contest Registration Confirmed: ${contest.title}`,
      `You are successfully registered for ${contest.title}. The event begins at ${new Date(contest.startTime).toLocaleTimeString()}.`,
      "contest",
      { contestId: id }
    );

    res.status(200).json({ success: true, message: "Successfully registered for contest" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitContestSolution(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params; // contestId
    const { problemId, code, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const cList = await drizzleDb.select().from(contests).where(eq(contests.id, id));
    const contest = cList[0];
    if (!contest) {
      res.status(404).json({ success: false, error: "Contest not found" });
      return;
    }

    // Deadline & timing check
    const now = new Date();
    if (now > new Date(contest.endTime) || contest.status === "completed" || contest.status === "expired") {
      res.status(400).json({ success: false, error: "Contest has ended" });
      return;
    }

    const pList = await drizzleDb.select().from(problems).where(eq(problems.id, problemId));
    const problem = pList[0];
    if (!problem) {
      res.status(404).json({ success: false, error: "Problem not found" });
      return;
    }

    // Check if user already solved this problem in this contest
    const previousSubmissions = await drizzleDb
      .select()
      .from(contestSubmissions)
      .where(and(eq(contestSubmissions.contestId, id), eq(contestSubmissions.userId, userId), eq(contestSubmissions.problemId, problemId)));
    const alreadySolved = previousSubmissions.some((s) => s.status === "Accepted");

    const submissionId = crypto.randomUUID();
    const testCases = (problem.testCases as any[]) || [{ input: "sample", expected: "sample" }];

    // Execute through BullMQ / Code Judge Service
    const judgeResult = await submitToJudgeQueue({
      submissionId,
      userId,
      problemId,
      code,
      language,
      testCases,
      timeLimitMs: 3000,
    });

    const isAccepted = judgeResult.verdict === "Accepted";
    // Only award points if it wasn't already solved previously
    const pointsAwarded = (isAccepted && !alreadySolved) ? 100 : 0;
    const penaltyMinutes = isAccepted ? 0 : 5;

    // Persist contest submission record
    const cSubId = crypto.randomUUID();
    await drizzleDb.insert(contestSubmissions).values({
      id: cSubId,
      contestId: id,
      problemId,
      userId,
      status: judgeResult.verdict,
      pointsAwarded,
      penaltyMinutes,
      submittedAt: new Date(),
    });

    // Update Contest Leaderboard Score for user
    const existingLeaderboard = await drizzleDb
      .select()
      .from(contestLeaderboards)
      .where(and(eq(contestLeaderboards.contestId, id), eq(contestLeaderboards.userId, userId)));

    let currentLB = existingLeaderboard[0];
    if (!currentLB) {
      const lbId = crypto.randomUUID();
      const newLB = await drizzleDb
        .insert(contestLeaderboards)
        .values({
          id: lbId,
          contestId: id,
          userId,
          totalScore: pointsAwarded,
          totalPenaltyMinutes: penaltyMinutes,
          solvedCount: isAccepted ? 1 : 0,
          updatedAt: new Date(),
        })
        .returning();
      currentLB = newLB[0];
    } else {
      await drizzleDb
        .update(contestLeaderboards)
        .set({
          totalScore: currentLB.totalScore + pointsAwarded,
          totalPenaltyMinutes: currentLB.totalPenaltyMinutes + penaltyMinutes,
          solvedCount: currentLB.solvedCount + (isAccepted ? 1 : 0),
          updatedAt: new Date(),
        })
        .where(eq(contestLeaderboards.id, currentLB.id));
    }

    // =========================================================
    // DEEP SYSTEM INTEGRATION ACTIONS
    // =========================================================

    // 1. Learning Memory & Daily Review System Integration
    if (!isAccepted) {
      const revId = crypto.randomUUID();
      await drizzleDb.insert(dailyReviews).values({
        id: revId,
        userId,
        itemType: "problem",
        itemId: problemId,
        title: `Contest Mistake: ${problem.title}`,
        subtopic: "Contest Review",
        frontContent: `Failed contest submission on ${problem.title}. Review logic.`,
        backContent: `Review optimal approach and edge cases for ${problem.title}.`,
        easinessFactor: "2.50",
        intervalDays: 1,
        repetitionNumber: 0,
        nextReviewDate: new Date().toISOString().split("T")[0],
      }).onConflictDoNothing();

      // Notify user of auto-generated review card
      await createNotificationInternal(
        userId,
        `Daily Review Entry Added: ${problem.title}`,
        `Your failed contest submission on "${problem.title}" was added to your SM-2 Daily Review queue for active recall.`,
        "review",
        { problemId, contestId: id }
      );
    } else {
      // Award XP for solving contest problem
      const userList = await drizzleDb.select().from(users).where(eq(users.id, userId));
      if (userList[0]) {
        const u = userList[0];
        const newXp = u.xp + 50;
        await drizzleDb.update(users).set({ xp: newXp }).where(eq(users.id, userId));

        await createNotificationInternal(
          userId,
          `Contest Problem Solved! +50 XP`,
          `Great job! You accepted "${problem.title}" during the contest and gained +50 XP.`,
          "level_up",
          { xpEarned: 50 }
        );
      }
    }

    // 2. Real-time Leaderboard SSE Broadcast
    realtimeBroadcaster.broadcastLeaderboardUpdate(id, [{
      contestId: id,
      userId,
      problemId,
      status: judgeResult.verdict,
      timestamp: new Date().toISOString(),
    }]);

    res.status(200).json({
      success: true,
      data: {
        judgeResult,
        pointsAwarded,
        penaltyMinutes,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getContestLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const lbList = await drizzleDb
      .select({
        id: contestLeaderboards.id,
        contestId: contestLeaderboards.contestId,
        userId: contestLeaderboards.userId,
        userName: users.name,
        totalScore: contestLeaderboards.totalScore,
        totalPenaltyMinutes: contestLeaderboards.totalPenaltyMinutes,
        solvedCount: contestLeaderboards.solvedCount,
        updatedAt: contestLeaderboards.updatedAt,
      })
      .from(contestLeaderboards)
      .leftJoin(users, eq(contestLeaderboards.userId, users.id))
      .where(eq(contestLeaderboards.contestId, id))
      .orderBy(desc(contestLeaderboards.totalScore), asc(contestLeaderboards.totalPenaltyMinutes));

    // Assign rank indices
    const ranked = lbList.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    res.status(200).json({ success: true, data: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
