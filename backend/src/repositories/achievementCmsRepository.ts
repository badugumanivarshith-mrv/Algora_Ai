import { AchievementCMSEntity } from "../types";

const DEFAULT_CMS_ACHIEVEMENTS: AchievementCMSEntity[] = [
  {
    id: "ach-first-ac",
    badgeCode: "FIRST_ACCEPTED",
    badgeName: "First AC",
    description: "Successfully solve your first algorithmic challenge with an Accepted verdict.",
    iconName: "CheckCircle2",
    xpReward: 100,
    category: "problem_solving",
    unlockCondition: "Pass all test cases on any problem for the first time.",
    isPublished: true,
    totalUnlockedCount: 842,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "ach-streak-7",
    badgeCode: "STREAK_7_DAYS",
    badgeName: "7 Day Streak",
    description: "Maintain a daily problem-solving streak for 7 consecutive days.",
    iconName: "Flame",
    xpReward: 250,
    category: "learning",
    unlockCondition: "Solve at least 1 problem each day for 7 consecutive 24-hour cycles.",
    isPublished: true,
    totalUnlockedCount: 420,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "ach-solved-50",
    badgeCode: "SOLVED_50",
    badgeName: "50 Solved",
    description: "Reach the milestone of 50 unique accepted problem solutions.",
    iconName: "Award",
    xpReward: 500,
    category: "problem_solving",
    unlockCondition: "Accumulate 50 distinct problem acceptance records.",
    isPublished: true,
    totalUnlockedCount: 168,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "ach-first-contest",
    badgeCode: "FIRST_CONTEST",
    badgeName: "First Contest",
    description: "Register and participate in your first official Algora timed contest.",
    iconName: "Trophy",
    xpReward: 200,
    category: "contest",
    unlockCondition: "Submit at least 1 solution during a live contest window.",
    isPublished: true,
    totalUnlockedCount: 310,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "ach-hard-master",
    badgeCode: "HARD_PROBLEM_MASTER",
    badgeName: "Hard Problem Master",
    description: "Solve 10 Hard-difficulty algorithmic problems with optimal space-time complexity.",
    iconName: "ShieldAlert",
    xpReward: 800,
    category: "problem_solving",
    unlockCondition: "Solve 10 problems tagged with Hard difficulty.",
    isPublished: true,
    totalUnlockedCount: 45,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export class AchievementCmsRepository {
  private inMemoryAchievements: Map<string, AchievementCMSEntity> = new Map();

  constructor() {
    DEFAULT_CMS_ACHIEVEMENTS.forEach((a) => this.inMemoryAchievements.set(a.id, a));
  }

  public async getAll(): Promise<AchievementCMSEntity[]> {
    return Array.from(this.inMemoryAchievements.values());
  }

  public async getById(id: string): Promise<AchievementCMSEntity | null> {
    return this.inMemoryAchievements.get(id) || null;
  }

  public async create(
    data: Omit<AchievementCMSEntity, "id" | "totalUnlockedCount" | "createdAt">
  ): Promise<AchievementCMSEntity> {
    const id = `ach-${data.badgeCode.toLowerCase().replace(/_/g, "-")}-${Date.now().toString(36)}`;
    const newAch: AchievementCMSEntity = {
      ...data,
      id,
      totalUnlockedCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryAchievements.set(id, newAch);
    return newAch;
  }

  public async update(
    id: string,
    updates: Partial<AchievementCMSEntity>
  ): Promise<AchievementCMSEntity | null> {
    const existing = this.inMemoryAchievements.get(id);
    if (!existing) return null;

    const updated: AchievementCMSEntity = {
      ...existing,
      ...updates,
      id: existing.id,
    };

    this.inMemoryAchievements.set(id, updated);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    return this.inMemoryAchievements.delete(id);
  }

  public async togglePublish(id: string): Promise<AchievementCMSEntity | null> {
    const existing = this.inMemoryAchievements.get(id);
    if (!existing) return null;

    existing.isPublished = !existing.isPublished;
    this.inMemoryAchievements.set(id, existing);
    return existing;
  }
}

export const achievementCmsRepository = new AchievementCmsRepository();
