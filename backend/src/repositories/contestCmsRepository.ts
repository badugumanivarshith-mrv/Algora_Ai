import {
  ContestEntity,
  ContestProblemEntity,
  ContestRegistrationEntity,
} from "../types";

const DEFAULT_CONTESTS: ContestEntity[] = [
  {
    id: "contest-weekly-42",
    title: "Algora Weekly Championship #42",
    description: "4 algorithmic problems spanning arrays, dynamic programming, and graphs. Speed and accuracy determine global ranking.",
    contestType: "Weekly Contest",
    startTime: new Date(Date.now() + 2 * 86400000).toISOString(),
    endTime: new Date(Date.now() + 2 * 86400000 + 90 * 60000).toISOString(),
    durationMinutes: 90,
    difficulty: "All Levels",
    participantCount: 428,
    status: "upcoming",
    problems: [
      { id: "cp-1", contestId: "contest-weekly-42", problemId: 1, problemSlug: "two-sum", problemTitle: "Two Sum", orderIndex: 1, scorePoints: 100, difficulty: "Easy" },
      { id: "cp-2", contestId: "contest-weekly-42", problemId: 4, problemSlug: "valid-anagram", problemTitle: "Valid Anagram", orderIndex: 2, scorePoints: 200, difficulty: "Easy" },
      { id: "cp-3", contestId: "contest-weekly-42", problemId: 2, problemSlug: "longest-palindromic-substring", problemTitle: "Longest Palindromic Substring", orderIndex: 3, scorePoints: 400, difficulty: "Medium" },
      { id: "cp-4", contestId: "contest-weekly-42", problemId: 6, problemSlug: "network-delay-time", problemTitle: "Network Delay Time (Dijkstra)", orderIndex: 4, scorePoints: 700, difficulty: "Medium" },
    ],
    registered: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "contest-dp-sprint",
    title: "Dynamic Programming Master Sprint",
    description: "Focused timed battle on 1D/2D memoization, knapsack constraints, and state space reduction.",
    contestType: "Topic Contest",
    startTime: new Date(Date.now() - 10 * 86400000).toISOString(),
    endTime: new Date(Date.now() - 10 * 86400000 + 120 * 60000).toISOString(),
    durationMinutes: 120,
    difficulty: "Medium",
    participantCount: 612,
    status: "completed",
    problems: [
      { id: "cp-5", contestId: "contest-dp-sprint", problemId: 5, problemSlug: "climbing-stairs", problemTitle: "Climbing Stairs", orderIndex: 1, scorePoints: 200, difficulty: "Easy" },
      { id: "cp-6", contestId: "contest-dp-sprint", problemId: 2, problemSlug: "longest-palindromic-substring", problemTitle: "Longest Palindromic Substring", orderIndex: 2, scorePoints: 500, difficulty: "Medium" },
    ],
    registered: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_REGISTRATIONS: ContestRegistrationEntity[] = [
  {
    id: "reg-1",
    contestId: "contest-dp-sprint",
    userId: "usr-arjun-patel",
    status: "completed",
    registeredAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    score: 700,
    penaltyMinutes: 42,
    rank: 4,
    username: "arjun_patel",
    fullName: "Arjun Patel",
    institution: "MIT",
  },
  {
    id: "reg-2",
    contestId: "contest-weekly-42",
    userId: "usr-arjun-patel",
    status: "registered",
    registeredAt: new Date().toISOString(),
    score: 0,
    penaltyMinutes: 0,
    username: "arjun_patel",
    fullName: "Arjun Patel",
    institution: "MIT",
  },
];

export class ContestCmsRepository {
  private inMemoryContests: Map<string, ContestEntity> = new Map();
  private inMemoryRegistrations: Map<string, ContestRegistrationEntity[]> = new Map();

  constructor() {
    DEFAULT_CONTESTS.forEach((c) => this.inMemoryContests.set(c.id, c));
    DEFAULT_REGISTRATIONS.forEach((r) => {
      const list = this.inMemoryRegistrations.get(r.contestId) || [];
      list.push(r);
      this.inMemoryRegistrations.set(r.contestId, list);
    });
  }

  public async getAllContests(): Promise<ContestEntity[]> {
    return Array.from(this.inMemoryContests.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  public async getContestById(id: string): Promise<ContestEntity | null> {
    return this.inMemoryContests.get(id) || null;
  }

  public async createContest(
    contestData: Omit<ContestEntity, "id" | "participantCount" | "createdAt" | "updatedAt">
  ): Promise<ContestEntity> {
    const id = `contest-${Date.now()}`;
    const now = new Date().toISOString();
    const newContest: ContestEntity = {
      ...contestData,
      id,
      participantCount: 0,
      problems: contestData.problems || [],
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryContests.set(id, newContest);
    return newContest;
  }

  public async updateContest(
    id: string,
    updates: Partial<ContestEntity>
  ): Promise<ContestEntity | null> {
    const existing = this.inMemoryContests.get(id);
    if (!existing) return null;

    const updated: ContestEntity = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryContests.set(id, updated);
    return updated;
  }

  public async deleteContest(id: string): Promise<boolean> {
    this.inMemoryRegistrations.delete(id);
    return this.inMemoryContests.delete(id);
  }

  public async getRegistrations(contestId: string): Promise<ContestRegistrationEntity[]> {
    return this.inMemoryRegistrations.get(contestId) || [];
  }

  public async addProblemToContest(
    contestId: string,
    problem: Omit<ContestProblemEntity, "id" | "contestId">
  ): Promise<ContestProblemEntity | null> {
    const contest = this.inMemoryContests.get(contestId);
    if (!contest) return null;

    const id = `cp-${Date.now()}`;
    const newProblem: ContestProblemEntity = {
      ...problem,
      id,
      contestId,
    };

    if (!contest.problems) contest.problems = [];
    contest.problems.push(newProblem);
    contest.updatedAt = new Date().toISOString();
    return newProblem;
  }

  public async removeProblemFromContest(contestId: string, problemId: number): Promise<boolean> {
    const contest = this.inMemoryContests.get(contestId);
    if (!contest || !contest.problems) return false;

    contest.problems = contest.problems.filter((p) => p.problemId !== problemId);
    contest.updatedAt = new Date().toISOString();
    return true;
  }
}

export const contestCmsRepository = new ContestCmsRepository();
