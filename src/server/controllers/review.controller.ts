/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Daily Review Controller (SuperMemo-2 Spaced Repetition Engine - PostgreSQL Drizzle Refactor)
 */

import { Response } from 'express';
import crypto from 'crypto';
import { drizzleDb } from '../db/db';
import { dailyReviews, users } from '../db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export async function getReviewQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guest users do not have a personalized Daily Review queue.' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const records = await drizzleDb.select()
      .from(dailyReviews)
      .where(and(eq(dailyReviews.userId, userId), lte(dailyReviews.nextReviewDate, today)));

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitReviewRating(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { reviewId } = req.params;
    const { quality } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Guests cannot rate review cards.' });
      return;
    }

    if (quality === undefined || quality === null || isNaN(Number(quality)) || Number(quality) < 0 || Number(quality) > 5) {
      res.status(400).json({ success: false, error: 'Rating must be an integer between 0 and 5' });
      return;
    }

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(reviewId);
    if (!isUuid) {
      res.status(404).json({ success: false, error: 'Review card not found' });
      return;
    }

    const records = await drizzleDb.select().from(dailyReviews).where(eq(dailyReviews.id, reviewId));
    const card = records[0] || null;
    if (!card) {
      res.status(404).json({ success: false, error: 'Review card not found' });
      return;
    }

    const q = Number(quality);

    let easiness_factor = Number(card.easinessFactor || 2.5);
    let interval_days = Number(card.intervalDays || 1);
    let repetition_number = Number(card.repetitionNumber || 0);

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

    await drizzleDb.update(dailyReviews)
      .set({
        easinessFactor: String(easiness_factor),
        intervalDays: interval_days,
        repetitionNumber: repetition_number,
        nextReviewDate: nextDate,
        lastReviewedAt: new Date(),
      })
      .where(eq(dailyReviews.id, card.id));

    const usersList = await drizzleDb.select().from(users).where(eq(users.id, userId));
    if (usersList.length > 0) {
      const user = usersList[0];
      await drizzleDb.update(users).set({ xp: user.xp + 10 }).where(eq(users.id, userId));
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createReviewCard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
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

    const cardId = crypto.randomUUID();
    const card = {
      id: cardId,
      userId,
      itemType: itemType || 'concept',
      itemId: itemId || 'custom',
      title,
      subtopic: subtopic || 'General DSA',
      frontContent,
      backContent,
      easinessFactor: "2.50",
      intervalDays: 1,
      repetitionNumber: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
    };

    await drizzleDb.insert(dailyReviews).values(card);

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
