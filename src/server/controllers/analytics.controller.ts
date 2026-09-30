/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Analytics & Leaderboard Controller
 */

import { Request, Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export async function getDashboardAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  const user = userId ? db.users.get(userId) : null;

  const submissions = userId ? Array.from(db.submissions.values()).filter((s) => s.user_id === userId) : [];
  const accepted = submissions.filter((s) => s.status === 'Accepted');

  const weeklyActivity = [
    { day: 'Mon', problems: user ? 4 : 0, accuracy: user ? 75 : 0 },
    { day: 'Tue', problems: user ? 7 : 0, accuracy: user ? 85 : 0 },
    { day: 'Wed', problems: user ? 3 : 0, accuracy: user ? 66 : 0 },
    { day: 'Thu', problems: user ? 9 : 0, accuracy: user ? 90 : 0 },
    { day: 'Fri', problems: user ? 6 : 0, accuracy: user ? 80 : 0 },
    { day: 'Sat', problems: user ? 11 : 0, accuracy: user ? 88 : 0 },
    { day: 'Sun', problems: user ? 5 : 0, accuracy: user ? 72 : 0 },
  ];

  const skillData = [
    { topic: 'Arrays', value: user ? 85 : 0 },
    { topic: 'Trees', value: user ? 72 : 0 },
    { topic: 'DP', value: user ? 58 : 0 },
    { topic: 'Graphs', value: user ? 90 : 0 },
    { topic: 'Strings', value: user ? 65 : 0 },
    { topic: 'Math', value: user ? 78 : 0 },
  ];

  res.status(200).json({
    success: true,
    data: {
      user: {
        name: user?.name || 'Guest User',
        xp: user?.xp || 0,
        level: user?.level || 1,
        streak: user?.streak || 0,
        totalSolved: accepted.length,
        accuracyPercent: user ? 78 : 0,
        isGuest: !user,
      },
      weeklyActivity,
      skillData,
      recentSubmissions: submissions.slice(0, 5),
    },
  });
}

export async function getFacultyAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  const students = [
    { id: '21CS001', name: 'Priya Patel', accuracy: 88, streak: 32, solved: 148, lastActive: '2h ago', risk: false },
    { id: '21CS002', name: 'Rahul Kumar', accuracy: 72, streak: 14, solved: 96, lastActive: '5h ago', risk: false },
    { id: '21CS003', name: 'Sneha Reddy', accuracy: 91, streak: 28, solved: 172, lastActive: '1h ago', risk: false },
    { id: '21CS005', name: 'Kavya Singh', accuracy: 45, streak: 2, solved: 38, lastActive: '3d ago', risk: true },
    { id: '21CS007', name: 'Ananya Iyer', accuracy: 36, streak: 0, solved: 22, lastActive: '5d ago', risk: true },
  ];

  const topicAverages = [
    { topic: 'Arrays', classAvg: 78, targetAvg: 70 },
    { topic: 'Trees', classAvg: 65, targetAvg: 65 },
    { topic: 'DP', classAvg: 52, targetAvg: 60 },
    { topic: 'Graphs', classAvg: 71, targetAvg: 65 },
    { topic: 'Strings', classAvg: 68, targetAvg: 65 },
  ];

  res.status(200).json({
    success: true,
    data: {
      totalEnrolled: 64,
      activeToday: 48,
      atRiskCount: students.filter((s) => s.risk).length,
      averageAccuracy: 74,
      students,
      topicAverages,
    },
  });
}

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const { query } = req.query;

  const names = ['Priya Patel', 'Rahul Kumar', 'Sneha Reddy', 'Kavya Singh', 'Rohan Joshi', 'Ananya Iyer'];
  const colleges = ['IIT Bombay', 'IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore'];

  let rows = names.map((name, i) => ({
    rank: i + 1,
    name,
    college: colleges[i % colleges.length],
    rating: Math.max(1200, 2840 - i * 85),
    solved: Math.max(60, 680 - i * 25),
    streak: Math.max(4, 90 - i * 5),
    xp: Math.max(2000, 50000 - i * 2500),
    isMe: false,
    badge: i < 3 ? ['🥇', '🥈', '🥉'][i] : null,
  }));

  if (query) {
    const q = String(query).toLowerCase();
    rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.college.toLowerCase().includes(q));
  }

  res.status(200).json({
    success: true,
    data: rows,
  });
}
