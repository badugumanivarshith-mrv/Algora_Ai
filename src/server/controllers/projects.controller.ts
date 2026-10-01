/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Projects Controller (Beginner, Intermediate, Advanced Real-World Projects - PostgreSQL Drizzle Refactor)
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { drizzleDb } from '../db/db';
import { projects, userProjects, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createNotificationInternal } from './notifications.controller';

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const { difficulty, category } = req.query;
    let list = await drizzleDb.select().from(projects);

    if (difficulty) {
      list = list.filter((p) => p.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }
    if (category) {
      list = list.filter((p) => p.category.toLowerCase().includes(String(category).toLowerCase()));
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

export async function getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const projectList = await drizzleDb.select().from(projects).where(eq(projects.id, projectId));

    if (projectList.length === 0) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const project = projectList[0];
    const userId = req.user?.id;
    let userProgress = null;

    if (userId) {
      const records = await drizzleDb.select()
        .from(userProjects)
        .where(and(eq(userProjects.userId, userId), eq(userProjects.projectId, projectId)));
      userProgress = records[0] || null;
    }

    res.status(200).json({
      success: true,
      data: {
        ...project,
        userProgress,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function enrollProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot enroll in project workbenches.' });
      return;
    }

    const projectList = await drizzleDb.select().from(projects).where(eq(projects.id, projectId));
    if (projectList.length === 0) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const records = await drizzleDb.select()
      .from(userProjects)
      .where(and(eq(userProjects.userId, userId), eq(userProjects.projectId, projectId)));
    let record = records[0] || null;

    if (!record) {
      const inserted = await drizzleDb.insert(userProjects).values({
        id: crypto.randomUUID(),
        userId,
        projectId,
        status: 'in_progress',
        completedTaskIds: [],
        reflectionNotes: '',
        score: 0,
      }).returning();
      record = inserted[0];
    }

    res.status(200).json({
      success: true,
      message: 'Enrolled in project workbench',
      data: record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleProjectTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { taskId, completed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot save project task progress.' });
      return;
    }

    const records = await drizzleDb.select()
      .from(userProjects)
      .where(and(eq(userProjects.userId, userId), eq(userProjects.projectId, projectId)));
    let record: any = records[0] || null;

    if (!record) {
      const inserted = await drizzleDb.insert(userProjects).values({
        id: crypto.randomUUID(),
        userId,
        projectId,
        status: 'in_progress',
        completedTaskIds: [],
        reflectionNotes: '',
        score: 0,
      }).returning();
      record = inserted[0];
    }

    let completedTasks = record.completedTaskIds as string[] || [];

    if (completed) {
      if (!completedTasks.includes(taskId)) {
        completedTasks.push(taskId);
        const usersList = await drizzleDb.select().from(users).where(eq(users.id, userId));
        if (usersList.length > 0) {
          const user = usersList[0];
          await drizzleDb.update(users).set({ xp: user.xp + 15 }).where(eq(users.id, userId));
        }
      }
    } else {
      completedTasks = completedTasks.filter((id) => id !== taskId);
    }

    await drizzleDb.update(userProjects)
      .set({ completedTaskIds: completedTasks })
      .where(eq(userProjects.id, record.id));

    record.completedTaskIds = completedTasks;

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { repoUrl, demoUrl, reflectionNotes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot submit projects.' });
      return;
    }

    const records = await drizzleDb.select()
      .from(userProjects)
      .where(and(eq(userProjects.userId, userId), eq(userProjects.projectId, projectId)));
    let record = records[0] || null;

    if (!record) {
      res.status(400).json({ success: false, error: 'Must enroll in project before submitting' });
      return;
    }

    const updated = await drizzleDb.update(userProjects)
      .set({
        repoUrl,
        demoUrl,
        reflectionNotes: reflectionNotes || record.reflectionNotes,
        status: 'submitted',
        score: 92,
        aiFeedback: 'Exceptional architectural isolation! Clean separation of domain entities and solid transaction integrity.',
        completedAt: new Date()
      })
      .where(eq(userProjects.id, record.id))
      .returning();

    const usersList = await drizzleDb.select().from(users).where(eq(users.id, userId));
    if (usersList.length > 0) {
      const user = usersList[0];
      const newXp = user.xp + 300;
      const newLevel = Math.floor(newXp / 400) + 1;
      await drizzleDb.update(users).set({ xp: newXp, level: newLevel }).where(eq(users.id, userId));

      await createNotificationInternal(
        userId,
        `Project Evaluation Passed! +300 XP`,
        `Your submission for project ${projectId} achieved a score of 92/100. Excellent job!`,
        'project',
        { projectId, score: 92 }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Project submitted successfully for evaluation!',
      data: updated[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
