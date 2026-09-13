export interface PlatformMetricsDailyEntity {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  retentionRate7d: number;
  retentionRate30d: number;
  engagementScore: number;
  contestParticipationRate: number;
  learningCompletionRate: number;
  aiQueryVolume: number;
  discussionsActive: number;
}

export class PlatformAnalyticsRepository {
  public static async getDailyMetrics(days = 14): Promise<PlatformMetricsDailyEntity[]> {
    const list: PlatformMetricsDailyEntity[] = [];
    const now = Date.now();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const factor = 1 + (days - i) * 0.05;

      list.push({
        date: dateStr,
        dau: Math.round(1840 * factor + Math.floor(Math.sin(i) * 120)),
        wau: Math.round(6200 * factor),
        mau: Math.round(18400 * factor),
        retentionRate7d: Math.min(94, 68 + i * 1.2),
        retentionRate30d: Math.min(86, 52 + i * 1.1),
        engagementScore: Math.min(98, 78 + (i % 5) * 3),
        contestParticipationRate: Math.min(85, 62 + (i % 4) * 4),
        learningCompletionRate: Math.min(92, 74 + (i % 3) * 3),
        aiQueryVolume: Math.round(4800 * factor + Math.floor(Math.cos(i) * 300)),
        discussionsActive: Math.round(320 * factor + (i % 6) * 15),
      });
    }

    return list;
  }

  public static async getOverviewSummary(): Promise<{
    totalUsers: number;
    activeToday: number;
    totalDiscussions: number;
    totalStudyGroups: number;
    mockInterviewsCompleted: number;
    teamContestsHeld: number;
    systemHealth: string;
  }> {
    return {
      totalUsers: 14820,
      activeToday: 2480,
      totalDiscussions: 842,
      totalStudyGroups: 128,
      mockInterviewsCompleted: 1460,
      teamContestsHeld: 42,
      systemHealth: "99.98% Healthy",
    };
  }
}
