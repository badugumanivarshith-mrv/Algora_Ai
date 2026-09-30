import React, { useState } from 'react';
import {
  RotateCw,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Award,
  BookOpenCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { RepetitionRating, Flashcard } from '../../types/review';
import confetti from 'canvas-confetti';

export const DailyReviewPage: React.FC = () => {
  const { flashcards, reviewFlashcard, user } = useLearningStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const dueCards = flashcards.filter(
    (c) => new Date(c.dueDate).getTime() <= Date.now() + 3600000
  );

  const currentCard: Flashcard | undefined = dueCards[currentIndex] || flashcards[0];

  const handleRate = (rating: RepetitionRating) => {
    if (!currentCard) return;

    reviewFlashcard(currentCard.id, rating);
    setIsFlipped(false);

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompletedSessionsCount((prev) => prev + 1);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    }
  };

  const isAllDueCompleted = dueCards.length === 0 || currentIndex >= dueCards.length;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <RotateCw className="w-4 h-4" />
            <span>Active Recall & Spaced Repetition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Daily Memory Review</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            SuperMemo-2 (SM-2) algorithm calculates the optimal review intervals to prevent knowledge decay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">{dueCards.length} Cards Due</span>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Flashcard Interactive Deck */}
      {!isAllDueCompleted && currentCard ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Card {currentIndex + 1} of {dueCards.length}</span>
            <span>Ease Factor: {currentCard.easeFactor}x</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[360px] p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all duration-300 shadow-2xl flex flex-col justify-between select-none relative group"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                {currentCard.topicTitle} • {currentCard.subtopic}
              </span>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {isFlipped ? 'Click to show question' : 'Click to flip answer'}
              </span>
            </div>

            {/* Front (Question) vs Back (Answer) */}
            <div className="my-6">
              {!isFlipped ? (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    QUESTION
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {currentCard.question}
                  </h3>
                  {currentCard.codeSnippet && (
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                      {currentCard.codeSnippet}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    EXACT ANSWER & MECHANICS
                  </span>
                  <p className="text-base font-bold text-emerald-300 leading-snug">
                    {currentCard.answer}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    {currentCard.explanation}
                  </p>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    💡 <strong>Key Takeaway:</strong> {currentCard.keyTakeaway}
                  </div>
                </div>
              )}
            </div>

            {/* Hint to flip */}
            <div className="text-center text-[11px] text-slate-500">
              {!isFlipped ? 'Tap card to check mental recall' : 'Rate how easily you recalled this below:'}
            </div>
          </div>

          {/* SM-2 Rating Buttons (When Flipped) */}
          {isFlipped && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate('again');
                }}
                className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 text-rose-200 transition text-center"
              >
                <span className="block text-xs font-bold">Again (1)</span>
                <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">&lt; 1 Day Review</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate('hard');
                }}
                className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-amber-200 transition text-center"
              >
                <span className="block text-xs font-bold">Hard (3)</span>
                <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">2 Days Review</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate('good');
                }}
                className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 hover:bg-indigo-900/50 text-indigo-200 transition text-center"
              >
                <span className="block text-xs font-bold">Good (4)</span>
                <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">4 Days Review</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate('easy');
                }}
                className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 text-emerald-200 transition text-center"
              >
                <span className="block text-xs font-bold">Easy (5)</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">7 Days Review</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completed All Due Cards State */
        <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Daily Memory Review Complete! 🎉</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            All due cards have been processed with SM-2 intervals. You reinforced your long-term memory and protected your streak.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Review Entire Deck Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
