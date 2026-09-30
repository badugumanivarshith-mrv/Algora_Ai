/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Contest Engine & Rating Data Store
 */

export type RatingTier = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master";

export function getRatingTier(rating: number): { tier: RatingTier; color: string; badge: string } {
  if (rating >= 2100) return { tier: "Master", color: "#ef4444", badge: "🔴 Master" };
  if (rating >= 1800) return { tier: "Expert", color: "#a855f7", badge: "🟣 Expert" };
  if (rating >= 1500) return { tier: "Advanced", color: "#3b82f6", badge: "🔵 Advanced" };
  if (rating >= 1200) return { tier: "Intermediate", color: "#10b981", badge: "🟢 Intermediate" };
  return { tier: "Beginner", color: "#6b7280", badge: "⚪ Beginner" };
}

export interface ContestProblem {
  id: string;
  problemId: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  solved: boolean;
  attempts: number;
  timeSpentMins?: number;
}

export interface ContestSession {
  id: string;
  title: string;
  type: "Live" | "Upcoming" | "Virtual" | "Practice";
  startTime: string;
  durationMinutes: number;
  registeredCount: number;
  isRegistered: boolean;
  isRated: boolean;
  problems: ContestProblem[];
}

export interface ContestHistoryEntry {
  id: string;
  contestTitle: string;
  date: string;
  rank: number;
  totalParticipants: number;
  solvedCount: number;
  totalProblems: number;
  ratingDelta: number; // e.g. +45, -12
  newRating: number;
  penaltyMins: number;
  strongTopic: string;
  weakTopic: string;
}

export const CONTEST_RATING_HISTORY = [
  { date: "Jan 2026", rating: 1250, event: "Algora Weekly 138" },
  { date: "Feb 2026", rating: 1320, event: "Algora Weekly 140" },
  { date: "Mar 2026", rating: 1290, event: "FAANG Sprint #9" },
  { date: "Apr 2026", rating: 1410, event: "Algora Weekly 142" },
  { date: "May 2026", rating: 1485, event: "Campus Code Sprint" },
  { date: "Jun 2026", rating: 1520, event: "Algora Weekly 144" },
  { date: "Jul 2026", rating: 1580, event: "FAANG Sprint #11" },
  { date: "Aug 2026", rating: 1605, event: "Algora Weekly 147" }
];

export const CONTEST_SESSIONS: ContestSession[] = [
  {
    id: "cnt_weekly_148",
    title: "Algora Weekly Contest 148",
    type: "Live",
    startTime: "2026-09-30T20:00:00Z",
    durationMinutes: 90,
    registeredCount: 4280,
    isRegistered: true,
    isRated: true,
    problems: [
      { id: "p1", problemId: "two-sum", title: "Two Sum", slug: "two-sum", difficulty: "Easy", points: 100, solved: true, attempts: 1, timeSpentMins: 4 },
      { id: "p2", problemId: "valid-palindrome", title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", points: 100, solved: true, attempts: 1, timeSpentMins: 6 },
      { id: "p3", problemId: "group-anagrams", title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", points: 200, solved: true, attempts: 2, timeSpentMins: 18 },
      { id: "p4", problemId: "longest-palindromic-substring", title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "Medium", points: 200, solved: false, attempts: 2 }
    ]
  },
  {
    id: "cnt_faang_12",
    title: "FAANG Interview Code Sprint #12",
    type: "Upcoming",
    startTime: "2026-10-01T18:00:00Z",
    durationMinutes: 120,
    registeredCount: 2150,
    isRegistered: false,
    isRated: true,
    problems: [
      { id: "p1", problemId: "top-k-frequent-elements", title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", points: 200, solved: false, attempts: 0 },
      { id: "p2", problemId: "container-with-most-water", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", points: 200, solved: false, attempts: 0 }
    ]
  },
  {
    id: "cnt_virtual_146",
    title: "Algora Virtual Contest 146 (Past Replay)",
    type: "Virtual",
    startTime: "Self-Paced Virtual Replay",
    durationMinutes: 90,
    registeredCount: 3100,
    isRegistered: true,
    isRated: false,
    problems: [
      { id: "p1", problemId: "three-sum", title: "3Sum", slug: "3sum", difficulty: "Medium", points: 200, solved: false, attempts: 0 },
      { id: "p2", problemId: "minimum-window-substring", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", points: 300, solved: false, attempts: 0 }
    ]
  }
];

export const CONTEST_HISTORY: ContestHistoryEntry[] = [
  { id: "h1", contestTitle: "Algora Weekly 147", date: "Sep 2026", rank: 234, totalParticipants: 3180, solvedCount: 3, totalProblems: 4, ratingDelta: 45, newRating: 1605, penaltyMins: 10, strongTopic: "Arrays & Hashing", weakTopic: "Dynamic Programming" },
  { id: "h2", contestTitle: "FAANG Sprint #11", date: "Sep 2026", rank: 89, totalParticipants: 1240, solvedCount: 4, totalProblems: 5, ratingDelta: 72, newRating: 1560, penaltyMins: 0, strongTopic: "Two Pointers", weakTopic: "Graphs" },
  { id: "h3", contestTitle: "Algora Weekly 146", date: "Aug 2026", rank: 412, totalParticipants: 3320, solvedCount: 2, totalProblems: 4, ratingDelta: -18, newRating: 1488, penaltyMins: 20, strongTopic: "Strings", weakTopic: "Backtracking" }
];
