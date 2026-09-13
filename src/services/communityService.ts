export interface DiscussionItem {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  problemSlug?: string;
  contestId?: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  viewsCount: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  acceptedReplyId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  parentReplyId?: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  avatarUrl?: string;
  isPrivate: boolean;
  inviteCode: string;
  maxMembers: number;
  memberCount: number;
  targetTopic: string;
  targetGoal: string;
  createdAt: string;
}

export interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  contributionScore: number;
  problemsSolvedInGroup: number;
  joinedAt: string;
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  messageType: "text" | "code" | "goal_update" | "problem_share";
  metadata?: any;
  createdAt: string;
}

export interface StudyGroupGoal {
  id: string;
  groupId: string;
  title: string;
  description: string;
  targetProblemsCount: number;
  completedProblemsCount: number;
  deadline?: string;
  status: "active" | "completed";
}

export interface ContestTeamItem {
  id: string;
  contestId: string;
  teamName: string;
  teamCode: string;
  captainId: string;
  captainUsername: string;
  memberCount: number;
  maxMembers: number;
  totalScore: number;
  totalPenaltySeconds: number;
  rank?: number;
  createdAt: string;
}

export interface MentorProfileItem {
  id: string;
  userId: string;
  name: string;
  headline: string;
  company: string;
  yearsExperience: number;
  specialties: string[];
  hourlyRateCredits: number;
  bio: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  maxActiveStudents: number;
  activeStudentsCount: number;
  avatarUrl?: string;
}

export interface InterviewTrackItem {
  id: string;
  slug: string;
  name: string;
  companyTier: string;
  description: string;
  iconName: string;
  questionCount: number;
  difficulty: string;
  companies: string[];
}

export interface InterviewQuestionItem {
  id: string;
  trackId?: string;
  title: string;
  type: "coding" | "system_design" | "behavioral";
  companyTags: string[];
  difficulty: string;
  prompt: string;
  rubric: any;
}

export interface MockInterviewSessionItem {
  id: string;
  userId: string;
  trackSlug: string;
  interviewType: string;
  companyTarget: string;
  status: string;
  score: number;
  durationSeconds: number;
  transcript: any[];
  aiFeedback: {
    summary: string;
    readinessRating: string;
    breakdown: {
      problemSolving: number;
      codeQuality: number;
      communication: number;
      timeManagement: number;
      behavioralStar?: number;
    };
    strengths: string[];
    improvements: string[];
  };
  createdAt: string;
}

export class CommunityService {
  private static async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api/community${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // Discussions
  public static async listDiscussions(params?: {
    problemSlug?: string;
    contestId?: string;
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: DiscussionItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.append(k, String(v));
      });
    }
    return this.request<{ items: DiscussionItem[]; total: number }>(`/discussions?${query.toString()}`);
  }

  public static async getDiscussion(id: string): Promise<{ discussion: DiscussionItem; replies: DiscussionReply[] }> {
    return this.request<{ discussion: DiscussionItem; replies: DiscussionReply[] }>(`/discussions/${id}`);
  }

  public static async createDiscussion(data: {
    userId?: string;
    authorName?: string;
    authorAvatar?: string;
    problemSlug?: string;
    contestId?: string;
    category: string;
    title: string;
    content: string;
    tags?: string[];
  }): Promise<{ discussion: DiscussionItem }> {
    return this.request<{ discussion: DiscussionItem }>("/discussions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async voteDiscussion(id: string, targetType: "discussion" | "reply", voteType: "up" | "down", userId = "u-1"): Promise<{ upvotes: number; downvotes: number; userVote: string | null }> {
    return this.request(`/discussions/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ userId, targetType, voteType }),
    });
  }

  public static async createReply(discussionId: string, data: {
    userId?: string;
    authorName?: string;
    authorAvatar?: string;
    parentReplyId?: string;
    content: string;
    codeSnippet?: string;
    language?: string;
  }): Promise<{ reply: DiscussionReply }> {
    return this.request<{ reply: DiscussionReply }>(`/discussions/${discussionId}/replies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async acceptAnswer(discussionId: string, replyId: string, userId = "u-1"): Promise<{ acceptedReplyId: string }> {
    return this.request(`/discussions/${discussionId}/replies/${replyId}/accept`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  // Study Groups
  public static async listStudyGroups(search?: string, topic?: string): Promise<{ groups: StudyGroupItem[] }> {
    const q = new URLSearchParams();
    if (search) q.append("search", search);
    if (topic) q.append("topic", topic);
    return this.request<{ groups: StudyGroupItem[] }>(`/study-groups?${q.toString()}`);
  }

  public static async getStudyGroup(id: string): Promise<{
    group: StudyGroupItem;
    members: StudyGroupMember[];
    messages: StudyGroupMessage[];
    goals: StudyGroupGoal[];
  }> {
    return this.request(`/study-groups/${id}`);
  }

  public static async createStudyGroup(data: {
    name: string;
    description: string;
    targetTopic: string;
    targetGoal?: string;
    isPrivate?: boolean;
    maxMembers?: number;
  }): Promise<{ group: StudyGroupItem }> {
    return this.request("/study-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async joinStudyGroup(id: string, user: { userId: string; username: string; fullName: string; avatarUrl?: string }): Promise<{ message: string }> {
    return this.request(`/study-groups/${id}/join`, {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  public static async sendGroupMessage(id: string, data: {
    userId: string;
    username: string;
    avatarUrl?: string;
    message: string;
    messageType?: string;
    metadata?: any;
  }): Promise<{ message: StudyGroupMessage }> {
    return this.request(`/study-groups/${id}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Team Contests
  public static async listContestTeams(contestId: string): Promise<{ teams: ContestTeamItem[] }> {
    return this.request(`/contests/${contestId}/teams`);
  }

  public static async createContestTeam(contestId: string, teamName: string, captainId = "u-1", captainUsername = "Arjun Sharma"): Promise<{ team: ContestTeamItem }> {
    return this.request(`/contests/${contestId}/teams`, {
      method: "POST",
      body: JSON.stringify({ teamName, captainId, captainUsername }),
    });
  }

  public static async joinContestTeam(contestId: string, teamCode: string, userId = "u-1", username = "Arjun Sharma"): Promise<{ team: ContestTeamItem }> {
    return this.request(`/contests/${contestId}/teams/join`, {
      method: "POST",
      body: JSON.stringify({ teamCode, userId, username }),
    });
  }

  // Mentorship
  public static async listMentors(specialty?: string, search?: string): Promise<{ mentors: MentorProfileItem[] }> {
    const q = new URLSearchParams();
    if (specialty) q.append("specialty", specialty);
    if (search) q.append("search", search);
    return this.request<{ mentors: MentorProfileItem[] }>(`/mentors?${q.toString()}`);
  }

  public static async requestMentorship(data: {
    mentorId: string;
    studentId?: string;
    studentUsername?: string;
    message: string;
    targetRoleCompany?: string;
  }): Promise<{ request: any }> {
    return this.request("/mentors/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async getMyMentorship(userId = "u-1"): Promise<{ requests: any[]; sessions: any[] }> {
    return this.request(`/mentorship/my?userId=${userId}`);
  }

  public static async scheduleSession(data: {
    mentorId: string;
    studentId?: string;
    title: string;
    scheduledAt: string;
    durationMinutes?: number;
  }): Promise<{ session: any }> {
    return this.request("/mentorship/schedule", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Interview Hub
  public static async listInterviewTracks(): Promise<{ tracks: InterviewTrackItem[] }> {
    return this.request<{ tracks: InterviewTrackItem[] }>("/interview/tracks");
  }

  public static async listInterviewQuestions(trackSlug?: string, type?: string): Promise<{ questions: InterviewQuestionItem[] }> {
    const q = new URLSearchParams();
    if (trackSlug) q.append("trackSlug", trackSlug);
    if (type) q.append("type", type);
    return this.request<{ questions: InterviewQuestionItem[] }>(`/interview/questions?${q.toString()}`);
  }

  public static async submitMockInterview(data: {
    userId?: string;
    trackSlug: string;
    interviewType: string;
    companyTarget: string;
    questionTitle: string;
    questionPrompt: string;
    userResponse: string;
    codeSnippet?: string;
    durationSeconds?: number;
  }): Promise<{ session: MockInterviewSessionItem }> {
    return this.request<{ session: MockInterviewSessionItem }>("/interview/mock/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async listUserMockSessions(userId = "u-1"): Promise<{ sessions: MockInterviewSessionItem[] }> {
    return this.request<{ sessions: MockInterviewSessionItem[] }>(`/interview/mock/sessions?userId=${userId}`);
  }

  // Profile & Activity
  public static async getPublicProfile(usernameOrId = "u-1"): Promise<{ profile: any }> {
    return this.request(`/profile/${usernameOrId}`);
  }

  public static async updateSocials(userId = "u-1", links: any): Promise<{ reputation: any }> {
    return this.request("/profile/socials", {
      method: "POST",
      body: JSON.stringify({ userId, links }),
    });
  }

  // Moderation & Platform Analytics
  public static async createReport(data: {
    reporterId?: string;
    reporterUsername?: string;
    targetType: string;
    targetId: string;
    targetTitle?: string;
    reason: string;
    details?: string;
  }): Promise<{ report: any }> {
    return this.request("/moderation/report", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async listReports(status?: string): Promise<{ reports: any[] }> {
    const q = status ? `?status=${status}` : "";
    return this.request(`/moderation/reports${q}`);
  }

  public static async resolveReport(reportId: string, action: string, status: "resolved" | "dismissed"): Promise<{ report: any }> {
    return this.request(`/moderation/reports/${reportId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ action, status }),
    });
  }

  public static async moderateUser(data: {
    userId: string;
    username: string;
    restrictionType: "banned" | "muted" | "warning";
    reason: string;
    expiresAt?: string;
  }): Promise<{ moderation: any }> {
    return this.request("/moderation/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async getPlatformAnalytics(days = 14): Promise<{ daily: any[]; overview: any }> {
    return this.request(`/analytics/platform?days=${days}`);
  }
}
