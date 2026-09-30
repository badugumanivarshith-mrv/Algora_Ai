export type RepetitionRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  topicId: string;
  topicTitle: string;
  subtopic: string;
  language?: string;
  question: string;
  codeSnippet?: string;
  answer: string;
  explanation: string;
  keyTakeaway: string;
  // SM-2 Spaced Repetition parameters:
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  dueDate: string; // ISO Date
  lastReviewedDate?: string;
  decayScore: number; // 0 (forgotten) to 100 (fresh)
}

export interface DailyReviewSummary {
  date: string;
  totalDue: number;
  completedToday: number;
  cardsReviewed: {
    cardId: string;
    rating: RepetitionRating;
    timeSpentSec: number;
  }[];
  streakRetained: boolean;
}

export interface ReviewQuizQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}
