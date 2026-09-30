export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'problem_solving' | 'projects' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  solvedCount: number;
  level: number;
  badgeCount: number;
  isCurrentUser?: boolean;
}
