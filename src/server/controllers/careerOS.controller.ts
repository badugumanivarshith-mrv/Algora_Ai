/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA AI Career Operating System Controller
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import {
  users, userCareerProfiles, careerMilestones, careerSkillGaps
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getCareerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const profiles = await drizzleDb.select().from(userCareerProfiles)
      .where(eq(userCareerProfiles.userId, userId));

    if (profiles.length === 0) {
      // Create initial default profile
      const [newProfile] = await drizzleDb.insert(userCareerProfiles).values({
        userId,
        targetRoleId: "Software Engineer",
        resumeScore: 88,
        interviewReadinessScore: 82,
        placementProbability: 91
      }).returning();
      res.json({ success: true, data: newProfile });
      return;
    }

    res.json({ success: true, data: profiles[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCareerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { targetRoleId } = req.body;

    const existing = await drizzleDb.select().from(userCareerProfiles)
      .where(eq(userCareerProfiles.userId, userId));

    if (existing.length === 0) {
      const [created] = await drizzleDb.insert(userCareerProfiles).values({
        userId,
        targetRoleId: targetRoleId || "Software Engineer"
      }).returning();
      res.json({ success: true, data: created });
      return;
    }

    const [updated] = await drizzleDb.update(userCareerProfiles)
      .set({ targetRoleId: targetRoleId || existing[0].targetRoleId })
      .where(eq(userCareerProfiles.userId, userId))
      .returning();

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMilestones(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const list = await drizzleDb.select().from(careerMilestones)
      .where(eq(careerMilestones.userId, userId))
      .orderBy(desc(careerMilestones.createdAt));

    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { title, targetDate } = req.body;
    if (!title) {
      res.status(400).json({ success: false, error: "Missing milestone title" });
      return;
    }

    const [milestone] = await drizzleDb.insert(careerMilestones).values({
      userId,
      title,
      targetDate: targetDate || "Next 30 Days",
      status: "pending"
    }).returning();

    res.status(201).json({ success: true, data: milestone });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
