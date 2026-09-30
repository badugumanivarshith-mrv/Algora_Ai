export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  targetCompany?: string;
  targetRole?: string;
  preferredLanguage: 'python' | 'cpp' | 'java' | 'c';
  dailyGoalMinutes: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  xp: number;
  level: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}
