/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Recruiter Placement, Job Hunt & Application Management Controller
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import { users, jobs, applications, notifications } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// ─── 1. JOB POSTINGS ───

export async function createJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const recruiterId = req.user?.id;
    if (!recruiterId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { title, company, description, location, type, salary, requirements } = req.body;
    if (!title || !company || !description || !requirements) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const [job] = await drizzleDb.insert(jobs).values({
      title,
      company,
      description,
      location: location || "Remote",
      type: type || "Full-Time",
      salary,
      requirements,
      createdBy: recruiterId
    }).returning();

    res.status(201).json({ success: true, data: job });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const jobList = await drizzleDb.select().from(jobs).orderBy(desc(jobs.createdAt));
    res.json({ success: true, data: jobList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 2. CANDIDATE DISCOVERY & PLACEMENT PROFILE SEARCH ───

export async function getCandidateProfiles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Returns students with accumulated mastery analytics, XP, and reputationScore for recruiter search
    const studentsList = await drizzleDb.select().from(users).where(eq(users.role, "student"));
    res.json({ success: true, data: studentsList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 3. APPLICATION PIPELINE & WORKFLOW ───

export async function applyToJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { jobId } = req.body;
    if (!jobId) {
      res.status(400).json({ success: false, error: "Missing job ID" });
      return;
    }

    // Verify job exists
    const [targetJob] = await drizzleDb.select().from(jobs).where(eq(jobs.id, jobId));
    if (!targetJob) {
      res.status(404).json({ success: false, error: "Job posting not found" });
      return;
    }

    // Check existing
    const existing = await drizzleDb.select().from(applications).where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.studentId, studentId)
      )
    );

    if (existing.length > 0) {
      res.status(400).json({ success: false, error: "Already applied to this opening" });
      return;
    }

    const [app] = await drizzleDb.insert(applications).values({
      jobId,
      studentId,
      status: "Applied"
    }).returning();

    // Notify recruiter / system logs
    const jobDetailsList = await drizzleDb.select().from(jobs).where(eq(jobs.id, jobId));
    const jobDetails = jobDetailsList[0] || null;
    if (jobDetails) {
      await drizzleDb.insert(notifications).values({
        userId: jobDetails.createdBy,
        title: "New Application Received",
        message: `A top Algora student submitted an application for ${jobDetails.title}. Review their verified placement profile.`,
        type: "system"
      });
    }

    res.status(201).json({ success: true, data: app });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getJobApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const recruiterId = req.user?.id;
    if (!recruiterId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const recruiterJobs = await drizzleDb.select().from(jobs).where(eq(jobs.createdBy, recruiterId));
    const jobIds = recruiterJobs.map((j) => j.id);

    if (jobIds.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    const allApps = await drizzleDb.select().from(applications).orderBy(desc(applications.appliedAt));
    
    // Filter applications belonging to this recruiter's jobs
    const filteredApps = allApps.filter((app) => jobIds.includes(app.jobId));

    res.json({ success: true, data: filteredApps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { appId, applicationId, status, feedback } = req.body;
    const targetAppId = appId || applicationId;
    if (!targetAppId || !status) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const [updatedApp] = await drizzleDb.update(applications)
      .set({ status, feedback })
      .where(eq(applications.id, targetAppId))
      .returning();

    // Trigger persistent real-time notifications to the student
    await drizzleDb.insert(notifications).values({
      userId: updatedApp.studentId,
      title: "Placement Application Update",
      message: `Your application status was moved to: "${status}". Guidance notes: "${feedback || 'Keep crushing DSA challenge targets!'}"`,
      type: "system"
    });

    res.json({ success: true, data: updatedApp });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
