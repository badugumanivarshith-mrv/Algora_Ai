/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Daily Review Controller (SuperMemo-2 Spaced Repetition Engine)
 */

import { Response } from 'express';
import crypto from 'crypto';
import { db, DailyReviewEntity } from '../db/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export async function getReviewQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guest users do not have a personalized Daily Review queue.' });
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const queue = Array.from(db.dailyReviews.values()).filter(
    (r) => r.user_id === userId && r.next_review_date <= today
  );

  res.status(200).json({
    success: true,
    count: queue.length,
    data: queue,
  });
}

export async function submitReviewRating(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { reviewId } = req.params;
  const { quality } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot rate review cards.' });
    return;
  }

  const card = db.dailyReviews.get(reviewId);
  if (!card) {
    res.status(404).json({ success: false, error: 'Review card not found' });
    return;
  }

  const q = Math.max(0, Math.min(5, Number(quality) || 3));

  let { easiness_factor, interval_days, repetition_number } = card;

  easiness_factor = Math.max(1.3, +(easiness_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(2));

  if (q < 3) {
    repetition_number = 0;
    interval_days = 1;
  } else {
    if (repetition_number === 0) {
      interval_days = 1;
    } else if (repetition_number === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * easiness_factor);
    }
    repetition_number += 1;
  }

  const nextDate = new Date(Date.now() + interval_days * 86400000).toISOString().split('T')[0];

  card.easiness_factor = easiness_factor;
  card.interval_days = interval_days;
  card.repetition_number = repetition_number;
  card.next_review_date = nextDate;
  card.last_reviewed_at = new Date().toISOString();

  db.dailyReviews.set(card.id, card);

  const user = db.users.get(userId);
  if (user) {
    user.xp += 10;
  }

  res.status(200).json({
    success: true,
    message: `Card scheduled for review in ${interval_days} day(s).`,
    data: {
      cardId: card.id,
      intervalDays: interval_days,
      nextReviewDate: nextDate,
      easinessFactor: easiness_factor,
    },
  });
}

export async function createReviewCard(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { itemType, itemId, title, subtopic, frontContent, backContent } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot create review cards.' });
    return;
  }

  if (!title || !frontContent || !backContent) {
    res.status(400).json({ success: false, error: 'title, frontContent, and backContent are required' });
    return;
  }

  const cardId = 'rev_' + crypto.randomUUID();
  const card: DailyReviewEntity = {
    id: cardId,
    user_id: userId,
    item_type: itemType || 'concept',
    item_id: itemId || 'custom',
    title,
    subtopic: subtopic || 'General DSA',
    front_content: frontContent,
    back_content: backContent,
    easiness_factor: 2.5,
    interval_days: 1,
    repetition_number: 0,
    next_review_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  db.dailyReviews.set(card.id, card);

  res.status(201).json({
    success: true,
    data: card,
  });
}
