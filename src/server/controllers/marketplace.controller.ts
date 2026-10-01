/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Industry Projects Marketplace Controller
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import {
  marketplaceProjects, marketplaceApplications,
  portfolioEntries, certificates, notifications,
  projectTeams, mentorAssignments, users
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getMarketplaceProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const projects = await drizzleDb.select().from(marketplaceProjects).orderBy(desc(marketplaceProjects.createdAt));
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createMarketplaceProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { title, company, description, techStack } = req.body;
    if (!title || !company || !description || !techStack) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const [project] = await drizzleDb.insert(marketplaceProjects).values({
      title,
      company,
      description,
      techStack,
      createdBy: userId,
      status: "open"
    }).returning();

    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function applyToProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { projectId } = req.body;
    if (!projectId) {
      res.status(400).json({ success: false, error: "Missing project ID" });
      return;
    }

    const [app] = await drizzleDb.insert(marketplaceApplications).values({
      projectId,
      studentId,
      status: "pending"
    }).returning();

    res.status(201).json({ success: true, data: app });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPortfolios(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const entries = await drizzleDb.select().from(portfolioEntries)
      .where(eq(portfolioEntries.userId, userId))
      .orderBy(desc(portfolioEntries.createdAt));

    res.json({ success: true, data: entries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPortfolioEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { title, projectUrl, description } = req.body;
    if (!title || !description) {
      res.status(400).json({ success: false, error: "Missing title or description" });
      return;
    }

    const [entry] = await drizzleDb.insert(portfolioEntries).values({
      userId,
      title,
      projectUrl,
      description
    }).returning();

    res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const certs = await drizzleDb.select().from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issuedAt));

    res.json({ success: true, data: certs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function issueCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { title } = req.body;
    if (!title) {
      res.status(400).json({ success: false, error: "Missing certificate title" });
      return;
    }

    const [cert] = await drizzleDb.insert(certificates).values({
      userId,
      title,
      issuedBy: "Algora Industry Council"
    }).returning();

    await drizzleDb.insert(notifications).values({
      userId,
      title: "New Industry Certificate Issued!",
      message: `Your certificate for "${title}" has been successfully verified and added to your portfolio.`,
      type: "system"
    });

    res.status(201).json({ success: true, data: cert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── PROJECT TEAMS & MENTORS ───

export async function getProjectTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let teams = await drizzleDb.select().from(projectTeams).orderBy(desc(projectTeams.createdAt));
    if (teams.length === 0) {
      // Seed default teams
      const [proj] = await drizzleDb.select().from(marketplaceProjects).limit(1);
      if (proj) {
        teams = await drizzleDb.insert(projectTeams).values({
          projectId: proj.id,
          name: "Alpha Squad - Distributed Engineers",
          membersJson: ["Alex R.", "Priya S.", "Marcus V."]
        }).returning();
      }
    }
    res.json({ success: true, data: teams });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createProjectTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId, name, members } = req.body;
    if (!projectId || !name) {
      res.status(400).json({ success: false, error: "Missing project ID or team name" });
      return;
    }

    const [team] = await drizzleDb.insert(projectTeams).values({
      projectId,
      name,
      membersJson: members || ["Active Student"]
    }).returning();

    res.status(201).json({ success: true, data: team });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMentorAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let mentors = await drizzleDb.select().from(mentorAssignments).orderBy(desc(mentorAssignments.assignedAt));
    if (mentors.length === 0) {
      const [proj] = await drizzleDb.select().from(marketplaceProjects).limit(1);
      const [facultyUser] = await drizzleDb.select().from(users).where(eq(users.role, "faculty")).limit(1);
      if (proj && facultyUser) {
        mentors = await drizzleDb.insert(mentorAssignments).values({
          projectId: proj.id,
          mentorId: facultyUser.id
        }).returning();
      }
    }
    res.json({ success: true, data: mentors });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

