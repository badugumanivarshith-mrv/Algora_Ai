/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Learning Controller (Tracks, Topics, 8-Stage Progression Engine - Refactored to PostgreSQL Drizzle)
 */

import { Response } from 'express';
import crypto from 'crypto';
import { drizzleDb } from '../db/db';
import { learningTracks, topics, problems, userTopicProgress, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export async function getTracks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const tracksList = await drizzleDb.select().from(learningTracks);
    const topicsList = await drizzleDb.select().from(topics);

    const result = tracksList.map((track) => {
      const trackTopics = topicsList.filter((t) => t.trackId === track.id);
      return {
        ...track,
        totalTopics: trackTopics.length,
        completedTopics: 0,
        progressPercent: 0,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getTrackById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { trackId } = req.params;
    const tracks = await drizzleDb.select().from(learningTracks).where(eq(learningTracks.id, trackId));

    if (tracks.length === 0) {
      res.status(404).json({ success: false, error: 'Learning track not found' });
      return;
    }

    const track = tracks[0];
    const trackTopics = await drizzleDb.select()
      .from(topics)
      .where(eq(topics.trackId, trackId));

    trackTopics.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    res.status(200).json({
      success: true,
      data: {
        ...track,
        topics: trackTopics,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getTopicDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { topicId } = req.params;
    const topicsList = await drizzleDb.select().from(topics).where(eq(topics.id, topicId));

    if (topicsList.length === 0) {
      res.status(404).json({ success: false, error: 'Topic not found' });
      return;
    }

    const topic = topicsList[0];
    const topicProblems = await drizzleDb.select().from(problems).where(eq(problems.topicId, topicId));

    res.status(200).json({
      success: true,
      data: {
        ...topic,
        problems: topicProblems,
        stages: [
          'Concept',
          'Syntax',
          'Examples',
          'Common Mistakes',
          'Practice Problems',
          'Assignment',
          'Project',
          'Interview Questions',
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateTopicStageProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { topicId } = req.params;
    const { stage, completed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot save topic stage progression.' });
      return;
    }

    const topicsList = await drizzleDb.select().from(topics).where(eq(topics.id, topicId));
    if (topicsList.length === 0) {
      res.status(404).json({ success: false, error: 'Topic not found' });
      return;
    }

    // Lookup existing progress or insert new
    const progressList = await drizzleDb.select()
      .from(userTopicProgress)
      .where(and(eq(userTopicProgress.userId, userId), eq(userTopicProgress.topicId, topicId)));

    let current: any = progressList[0] || null;

    if (!current) {
      const inserted = await drizzleDb.insert(userTopicProgress).values({
        id: crypto.randomUUID(),
        userId,
        topicId,
        status: 'in_progress',
        conceptCompleted: false,
        syntaxCompleted: false,
        examplesCompleted: false,
        mistakesCompleted: false,
        problemsCompletedCount: 0,
        assignmentCompleted: false,
        projectCompleted: false,
        interviewCompleted: false,
        masteryScore: 0,
      }).returning();
      current = inserted[0];
    }

    const stageMap: Record<string, string> = {
      'Concept': 'conceptCompleted',
      'Syntax': 'syntaxCompleted',
      'Examples': 'examplesCompleted',
      'Common Mistakes': 'mistakesCompleted',
      'Assignment': 'assignmentCompleted',
      'Project': 'projectCompleted',
      'Interview Questions': 'interviewCompleted',
    };

    const fieldToUpdate: any = {};
    if (completed && stageMap[stage]) {
      fieldToUpdate[stageMap[stage]] = true;
    } else if (completed && stage === 'Practice Problems') {
      fieldToUpdate.problemsCompletedCount = 5;
    }

    const updatedConcept = stage === 'Concept' ? completed : current.conceptCompleted;
    const updatedSyntax = stage === 'Syntax' ? completed : current.syntaxCompleted;
    const updatedExamples = stage === 'Examples' ? completed : current.examplesCompleted;
    const updatedMistakes = stage === 'Common Mistakes' ? completed : current.mistakesCompleted;
    const updatedAssignment = stage === 'Assignment' ? completed : current.assignmentCompleted;
    const updatedProject = stage === 'Project' ? completed : current.projectCompleted;
    const updatedInterview = stage === 'Interview Questions' ? completed : current.interviewCompleted;
    const updatedProblems = stage === 'Practice Problems' ? 5 : current.problemsCompletedCount;

    let count = 0;
    if (updatedConcept) count++;
    if (updatedSyntax) count++;
    if (updatedExamples) count++;
    if (updatedMistakes) count++;
    if (updatedAssignment) count++;
    if (updatedProject) count++;
    if (updatedInterview) count++;
    if (updatedProblems > 0) count++;

    const masteryScore = Math.min(100, Math.round((count / 8) * 100));
    fieldToUpdate.masteryScore = masteryScore;
    fieldToUpdate.lastStudiedAt = new Date();

    if (completed) {
      const usersList = await drizzleDb.select().from(users).where(eq(users.id, userId));
      if (usersList.length > 0) {
        const user = usersList[0];
        const newXp = user.xp + 25;
        const newLevel = Math.floor(newXp / 400) + 1;
        await drizzleDb.update(users).set({ xp: newXp, level: newLevel }).where(eq(users.id, userId));
      }
    }

    const updatedRows = await drizzleDb.update(userTopicProgress)
      .set(fieldToUpdate)
      .where(eq(userTopicProgress.id, current.id))
      .returning();
    
    current = updatedRows[0] || { ...current, ...fieldToUpdate };

    res.status(200).json({
      success: true,
      message: `Stage '${stage}' progress updated`,
      data: current,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
