export interface UserReputationEntity {
  userId: string;
  reputationScore: number;
  helpfulAnswersCount: number;
  articlesWritten: number;
  upvotesReceived: number;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  featuredBadges: Array<{
    id: string;
    name: string;
    icon: string;
    tier: "legendary" | "epic" | "rare";
  }>;
}

export interface ActivityTimelineEntity {
  id: string;
  userId: string;
  activityType: "problem_solved" | "discussion_created" | "reply_accepted" | "contest_ranked" | "achievement_earned" | "mock_interview";
  title: string;
  description: string;
  link?: string;
  metadata?: any;
  createdAt: string;
}

const memoryReputations = new Map<string, UserReputationEntity>();
const memoryActivities = new Map<string, ActivityTimelineEntity[]>();

// Seed default profile reputation
memoryReputations.set("u-1", {
  userId: "u-1",
  reputationScore: 1480,
  helpfulAnswersCount: 24,
  articlesWritten: 5,
  upvotesReceived: 312,
  socialLinks: {
    github: "https://github.com/arjunsharma",
    linkedin: "https://linkedin.com/in/arjunsharma-swe",
    twitter: "https://twitter.com/arjun_codes",
    website: "https://arjunsharma.dev",
  },
  featuredBadges: [
    { id: "b1", name: "Grandmaster Solver", icon: "Crown", tier: "legendary" },
    { id: "b2", name: "Community Pillar", icon: "HeartHandshake", tier: "epic" },
    { id: "b3", name: "Google Track Ace", icon: "Flame", tier: "rare" },
  ],
});

memoryActivities.set("u-1", [
  {
    id: "act-1",
    userId: "u-1",
    activityType: "mock_interview",
    title: "Completed Google SWE L4 Mock Interview",
    description: "Scored 92/100 (Strong Hire) on Median of Two Sorted Arrays",
    link: "/interview-hub",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "act-2",
    userId: "u-1",
    activityType: "discussion_created",
    title: "Published Discussion: Optimal Hash Map vs Two Pointers",
    description: "Received 48 upvotes and 3 peer comments",
    link: "/community",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "act-3",
    userId: "u-1",
    activityType: "contest_ranked",
    title: "Ranked #1 in Algora Weekly Contest 42",
    description: "Solved 4/4 problems with team ByteForce Alpha in 42 minutes",
    link: "/contests",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "act-4",
    userId: "u-1",
    activityType: "problem_solved",
    title: "Solved LRU Cache (Hard)",
    description: "100% test cases passed with O(1) eviction time",
    link: "/workspace?problem=lru-cache",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
]);

export class CommunityProfileRepository {
  public static async getReputation(userId: string): Promise<UserReputationEntity> {
    const existing = memoryReputations.get(userId);
    if (existing) return existing;

    const fallback: UserReputationEntity = {
      userId,
      reputationScore: 100,
      helpfulAnswersCount: 0,
      articlesWritten: 0,
      upvotesReceived: 0,
      socialLinks: {},
      featuredBadges: [
        { id: "b-starter", name: "Algora Initiate", icon: "Award", tier: "rare" },
      ],
    };
    memoryReputations.set(userId, fallback);
    return fallback;
  }

  public static async getActivityTimeline(userId: string): Promise<ActivityTimelineEntity[]> {
    return memoryActivities.get(userId) || [];
  }

  public static async logActivity(data: Omit<ActivityTimelineEntity, "id" | "createdAt">): Promise<ActivityTimelineEntity> {
    const id = `act-${Date.now()}`;
    const activity: ActivityTimelineEntity = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    const list = memoryActivities.get(data.userId) || [];
    list.unshift(activity);
    memoryActivities.set(data.userId, list.slice(0, 50));
    return activity;
  }

  public static async updateSocialLinks(userId: string, links: any): Promise<UserReputationEntity> {
    const rep = await this.getReputation(userId);
    rep.socialLinks = { ...rep.socialLinks, ...links };
    memoryReputations.set(userId, rep);
    return rep;
  }
}
