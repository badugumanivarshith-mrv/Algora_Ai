/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Projects Controller (Beginner, Intermediate, Advanced Real-World Projects)
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export async function getProjects(req: Request, res: Response): Promise<void> {
  const { difficulty, category } = req.query;
  let list = Array.from(db.projects.values());

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
}

export async function getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { projectId } = req.params;
  const project = db.projects.get(projectId);

  if (!project) {
    res.status(404).json({ success: false, error: 'Project not found' });
    return;
  }

  const userId = req.user?.id;
  const progressKey = userId ? `${userId}:${projectId}` : null;
  const userProgress = progressKey ? db.userProjects.get(progressKey) || null : null;

  res.status(200).json({
    success: true,
    data: {
      ...project,
      userProgress,
    },
  });
}

export async function enrollProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { projectId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot enroll in project workbenches.' });
    return;
  }

  const project = db.projects.get(projectId);
  if (!project) {
    res.status(404).json({ success: false, error: 'Project not found' });
    return;
  }

  const progressKey = `${userId}:${projectId}`;
  let record = db.userProjects.get(progressKey);

  if (!record) {
    record = {
      id: 'up_' + crypto.randomUUID(),
      user_id: userId,
      project_id: projectId,
      status: 'in_progress',
      completed_task_ids: [],
      reflection_notes: '',
      score: 0,
      started_at: new Date().toISOString(),
    };
    db.userProjects.set(progressKey, record);
  }

  res.status(200).json({
    success: true,
    message: 'Enrolled in project workbench',
    data: record,
  });
}

export async function toggleProjectTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { projectId } = req.params;
  const { taskId, completed } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot save project task progress.' });
    return;
  }

  const progressKey = `${userId}:${projectId}`;
  let record = db.userProjects.get(progressKey);

  if (!record) {
    record = {
      id: 'up_' + crypto.randomUUID(),
      user_id: userId,
      project_id: projectId,
      status: 'in_progress',
      completed_task_ids: [],
      reflection_notes: '',
      score: 0,
      started_at: new Date().toISOString(),
    };
  }

  if (completed) {
    if (!record.completed_task_ids.includes(taskId)) {
      record.completed_task_ids.push(taskId);
      const user = db.users.get(userId);
      if (user) {
        user.xp += 15;
      }
    }
  } else {
    record.completed_task_ids = record.completed_task_ids.filter((id) => id !== taskId);
  }

  db.userProjects.set(progressKey, record);

  res.status(200).json({
    success: true,
    data: record,
  });
}

export async function submitProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { projectId } = req.params;
  const { repoUrl, demoUrl, reflectionNotes } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot submit projects.' });
    return;
  }

  const progressKey = `${userId}:${projectId}`;
  let record = db.userProjects.get(progressKey);

  if (!record) {
    res.status(400).json({ success: false, error: 'Must enroll in project before submitting' });
    return;
  }

  record.repo_url = repoUrl;
  record.demo_url = demoUrl;
  record.reflection_notes = reflectionNotes || record.reflection_notes;
  record.status = 'submitted';
  record.score = 92;
  record.ai_feedback = 'Exceptional architectural isolation! Clean separation of domain entities and solid transaction integrity.';
  record.completed_at = new Date().toISOString();

  const user = db.users.get(userId);
  if (user) {
    user.xp += 300;
    user.level = Math.floor(user.xp / 400) + 1;
  }

  db.userProjects.set(progressKey, record);

  res.status(200).json({
    success: true,
    message: 'Project submitted successfully for evaluation!',
    data: record,
  });
}
