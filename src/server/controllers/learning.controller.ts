/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Learning Controller (Tracks, Topics, 8-Stage Progression Engine)
 */

import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export async function getTracks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tracks = Array.from(db.learningTracks.values());
  const topicsList = Array.from(db.topics.values());

  const result = tracks.map((track) => {
    const trackTopics = topicsList.filter((t) => t.track_id === track.id);
    return {
      ...track,
      totalTopics: trackTopics.length,
      completedTopics: 0,
      progressPercent: 0,
    };
  });

  res.status(200).json({ success: true, data: result });
}

export async function getTrackById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { trackId } = req.params;
  const track = db.learningTracks.get(trackId);

  if (!track) {
    res.status(404).json({ success: false, error: 'Learning track not found' });
    return;
  }

  const topics = Array.from(db.topics.values())
    .filter((t) => t.track_id === trackId)
    .sort((a, b) => a.order_index - b.order_index);

  res.status(200).json({
    success: true,
    data: {
      ...track,
      topics,
    },
  });
}

export async function getTopicDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { topicId } = req.params;
  const topic = db.topics.get(topicId);

  if (!topic) {
    res.status(404).json({ success: false, error: 'Topic not found' });
    return;
  }

  const topicProblems = Array.from(db.problems.values()).filter((p) => p.topic_id === topicId);

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
}

export async function updateTopicStageProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { topicId } = req.params;
  const { stage, completed } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot save topic stage progression.' });
    return;
  }

  const topic = db.topics.get(topicId);
  if (!topic) {
    res.status(404).json({ success: false, error: 'Topic not found' });
    return;
  }

  const progressKey = `${userId}:${topicId}`;
  const current = db.topicProgress.get(progressKey) || {
    userId,
    topicId,
    completedStages: [],
    masteryScore: 0,
  };

  if (completed && !current.completedStages.includes(stage)) {
    current.completedStages.push(stage);
    current.masteryScore = Math.min(100, Math.round((current.completedStages.length / 8) * 100));

    const user = db.users.get(userId);
    if (user) {
      user.xp += 25;
      user.level = Math.floor(user.xp / 400) + 1;
    }
  }

  db.topicProgress.set(progressKey, current);

  res.status(200).json({
    success: true,
    message: `Stage '${stage}' progress updated`,
    data: current,
  });
}
