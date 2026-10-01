/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Enterprise Placements, Drive Registrations & Offer Tracking Controller
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import {
  users, placementDrives, driveRegistrations,
  interviewRounds, offers, companyPartnerships, notifications
} from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// ─── 1. PLACEMENT DRIVES ───

export async function createPlacementDrive(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const facultyId = req.user?.id;
    if (!facultyId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { title, company, eligibilityCgpa, eligibilityXp, status } = req.body;
    if (!title || !company) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const [drive] = await drizzleDb.insert(placementDrives).values({
      title,
      company,
      eligibilityCgpa: eligibilityCgpa ? parseFloat(eligibilityCgpa) : 7.0,
      eligibilityXp: eligibilityXp ? parseInt(eligibilityXp, 10) : 100,
      status: status || "upcoming"
    }).returning();

    // Notify all eligible students immediately
    const students = await drizzleDb.select().from(users).where(eq(users.role, "student"));
    for (const s of students) {
      if (s.xp >= (eligibilityXp || 100)) {
        await drizzleDb.insert(notifications).values({
          userId: s.id,
          title: "New Placement Drive Announced!",
          message: `${company} is hiring for "${title}"! You qualify under eligibility metrics. Register today!`,
          type: "system"
        });
      }
    }

    res.status(201).json({ success: true, data: drive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPlacementDrives(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const drivesList = await drizzleDb.select().from(placementDrives).orderBy(desc(placementDrives.createdAt));
    res.json({ success: true, data: drivesList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 2. DRIVE REGISTRATIONS & ELIGIBILITY ───

export async function registerForDrive(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { driveId } = req.body;
    if (!driveId) {
      res.status(400).json({ success: false, error: "Missing drive ID" });
      return;
    }

    // Verify Eligibility
    const studentUserList = await drizzleDb.select().from(users).where(eq(users.id, studentId));
    const driveDetailsList = await drizzleDb.select().from(placementDrives).where(eq(placementDrives.id, driveId));
    const studentUser = studentUserList[0] || null;
    const driveDetails = driveDetailsList[0] || null;

    if (!studentUser || !driveDetails) {
      res.status(404).json({ success: false, error: "Student or Drive details not found" });
      return;
    }

    if (studentUser.xp < driveDetails.eligibilityXp) {
      res.status(400).json({
        success: false,
        error: `Ineligible. Drive requires at least ${driveDetails.eligibilityXp} XP points (You have: ${studentUser.xp}).`
      });
      return;
    }

    // Check existing
    const existing = await drizzleDb.select().from(driveRegistrations).where(
      and(
        eq(driveRegistrations.driveId, driveId),
        eq(driveRegistrations.studentId, studentId)
      )
    );

    if (existing.length > 0) {
      res.status(400).json({ success: false, error: "Already registered for this drive" });
      return;
    }

    const [reg] = await drizzleDb.insert(driveRegistrations).values({
      driveId,
      studentId
    }).returning();

    res.status(201).json({ success: true, data: reg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDriveRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const regs = await drizzleDb.select().from(driveRegistrations).orderBy(desc(driveRegistrations.registeredAt));
    res.json({ success: true, data: regs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 3. INTERVIEW ROUNDS & EVALUATION ───

export async function createInterviewRound(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { registrationId, roundNumber, roundType, scheduledAt } = req.body;
    if (!registrationId || !roundType) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const [round] = await drizzleDb.insert(interviewRounds).values({
      registrationId,
      roundNumber: roundNumber ? parseInt(roundNumber, 10) : 1,
      roundType,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      status: "scheduled"
    }).returning();

    res.status(201).json({ success: true, data: round });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 4. OFFER TRACKING ───

export async function awardOffer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { registrationId, packageAmount } = req.body;
    if (!registrationId || !packageAmount) {
      res.status(400).json({ success: false, error: "Missing registration ID or package amount" });
      return;
    }

    const [offer] = await drizzleDb.insert(offers).values({
      registrationId,
      packageAmount,
      status: "pending"
    }).returning();

    // Notify student of direct offer award
    const regList = await drizzleDb.select().from(driveRegistrations).where(eq(driveRegistrations.id, registrationId));
    const reg = regList[0] || null;
    if (reg) {
      await drizzleDb.insert(notifications).values({
        userId: reg.studentId,
        title: "Congratulations! Placement Offer Awarded!",
        message: `You received an official placement offer package of "${packageAmount}"! Check your Dashboard under placements.`,
        type: "system"
      });
    }

    res.status(201).json({ success: true, data: offer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 5. COMPANY PARTNERSHIPS ───

export async function getCompanyPartnerships(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let partnerships = await drizzleDb.select().from(companyPartnerships).orderBy(desc(companyPartnerships.signedAt));
    if (partnerships.length === 0) {
      // Seed initial partner tiers
      partnerships = await drizzleDb.insert(companyPartnerships).values([
        { companyName: "Google India", partnershipTier: "Platinum" },
        { companyName: "Amazon SDE", partnershipTier: "Platinum" },
        { companyName: "Microsoft", partnershipTier: "Gold" },
        { companyName: "Stripe", partnershipTier: "Gold" },
        { companyName: "Flipkart", partnershipTier: "Silver" }
      ]).returning();
    }
    res.json({ success: true, data: partnerships });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createCompanyPartnership(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { companyName, partnershipTier } = req.body;
    if (!companyName) {
      res.status(400).json({ success: false, error: "Missing company name" });
      return;
    }

    const [partner] = await drizzleDb.insert(companyPartnerships).values({
      companyName,
      partnershipTier: partnershipTier || "Gold"
    }).returning();

    res.status(201).json({ success: true, data: partner });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

