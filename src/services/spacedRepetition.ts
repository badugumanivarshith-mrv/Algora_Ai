import { Flashcard, RepetitionRating } from '../types/review';

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 * Calculates next interval, repetition count, ease factor, and due date.
 */
export function calculateNextReview(card: Flashcard, rating: RepetitionRating): {
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  dueDate: string;
  decayScore: number;
} {
  let { intervalDays, repetitionCount, easeFactor } = card;

  // Grade scale: 0-5 in standard SM-2.
  // again: 1 (failure), hard: 3 (hesitant), good: 4 (correct), easy: 5 (perfect recall)
  let quality = 4;
  if (rating === 'again') quality = 1;
  else if (rating === 'hard') quality = 3;
  else if (rating === 'good') quality = 4;
  else if (rating === 'easy') quality = 5;

  if (quality < 3) {
    // Lapse / Forgotten
    repetitionCount = 0;
    intervalDays = 1;
  } else {
    // Successful recall
    if (repetitionCount === 0) {
      intervalDays = 1;
    } else if (repetitionCount === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitionCount += 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate new due date
  const now = new Date();
  const nextDueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  // New fresh decay score
  const decayScore = quality >= 3 ? Math.min(100, 85 + quality * 3) : 30;

  return {
    intervalDays,
    repetitionCount,
    easeFactor: +easeFactor.toFixed(2),
    dueDate: nextDueDate.toISOString(),
    decayScore
  };
}

export function computeDecayScore(lastReviewedIso?: string, intervalDays = 1): number {
  if (!lastReviewedIso) return 40;
  const elapsedDays = (Date.now() - new Date(lastReviewedIso).getTime()) / (1000 * 60 * 60 * 24);
  // Ebbinghaus forgetting curve approximation: R = e^(-t / S)
  const stability = Math.max(1, intervalDays);
  const retention = Math.exp(-elapsedDays / stability);
  return Math.max(10, Math.min(100, Math.round(retention * 100)));
}
