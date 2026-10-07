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

    const isCompleted = completed !== undefined ? Boolean(completed) : true;

    const validStages = ['concept', 'syntax', 'examples', 'common mistakes', 'practice problems', 'practice', 'assignment', 'project', 'interview questions'];
    const stageKey = String(stage || '').toLowerCase();
    if (!validStages.includes(stageKey)) {
      res.status(400).json({ success: false, error: `Invalid stage. Allowed: ${validStages.join(', ')}` });
      return;
    }

    const updatedConcept = stageKey === 'concept' ? isCompleted : Boolean(current.conceptCompleted || current.concept_completed);
    const updatedSyntax = stageKey === 'syntax' ? isCompleted : Boolean(current.syntaxCompleted || current.syntax_completed);
    const updatedExamples = stageKey === 'examples' ? isCompleted : Boolean(current.examplesCompleted || current.examples_completed);
    const updatedMistakes = stageKey === 'common mistakes' ? isCompleted : Boolean(current.mistakesCompleted || current.mistakes_completed);
    const updatedAssignment = stageKey === 'assignment' ? isCompleted : Boolean(current.assignmentCompleted || current.assignment_completed);
    const updatedProject = stageKey === 'project' ? isCompleted : Boolean(current.projectCompleted || current.project_completed);
    const updatedInterview = stageKey === 'interview questions' ? isCompleted : Boolean(current.interviewCompleted || current.interview_completed);
    const updatedProblems = (stageKey === 'practice problems' || stageKey === 'practice') ? 5 : Number(current.problemsCompletedCount || current.problems_completed_count || 0);

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

    const fieldToUpdate: any = {
      conceptCompleted: updatedConcept,
      syntaxCompleted: updatedSyntax,
      examplesCompleted: updatedExamples,
      mistakesCompleted: updatedMistakes,
      assignmentCompleted: updatedAssignment,
      projectCompleted: updatedProject,
      interviewCompleted: updatedInterview,
      problemsCompletedCount: updatedProblems,
      masteryScore,
      lastStudiedAt: new Date(),
    };

    if (isCompleted) {
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
