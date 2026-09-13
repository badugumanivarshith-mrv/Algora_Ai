import { Database } from "../db/connection";

export interface MentorProfileEntity {
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
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipRequestEntity {
  id: string;
  mentorId: string;
  studentId: string;
  studentUsername: string;
  message: string;
  targetRoleCompany: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipSessionEntity {
  id: string;
  mentorId: string;
  studentId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  status: "scheduled" | "completed" | "cancelled";
  mentorNotes?: string;
  studentFeedback?: string;
  rating?: number;
  createdAt: string;
}

const memoryMentors = new Map<string, MentorProfileEntity>();
const memoryRequests = new Map<string, MentorshipRequestEntity>();
const memorySessions = new Map<string, MentorshipSessionEntity>();

const initialMentors: MentorProfileEntity[] = [
  {
    id: "mentor-1",
    userId: "u-mentor-1",
    name: "Dr. Vikram Sengupta",
    headline: "Staff SWE @ Google | Ex-Uber Tech Lead",
    company: "Google",
    yearsExperience: 11,
    specialties: ["Distributed Systems", "Hard Dynamic Programming", "Staff Architecture", "Mock Interviews"],
    hourlyRateCredits: 0,
    bio: "Mentored 120+ engineers into Google, Meta, and Stripe. Passionate about clarifying complex graphs and concurrency locks.",
    rating: 4.96,
    reviewCount: 48,
    isAvailable: true,
    maxActiveStudents: 5,
    activeStudentsCount: 3,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=vikram",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mentor-2",
    userId: "u-mentor-2",
    name: "Elena Rostova",
    headline: "Principal Engineer @ Meta | ICPC World Finalist",
    company: "Meta",
    yearsExperience: 8,
    specialties: ["Competitive Programming", "Tree Decompositions", "System Design", "Behavioral STAR"],
    hourlyRateCredits: 0,
    bio: "Specializing in algorithmic speed, contest strategies, and rigorous coding round preparation.",
    rating: 4.98,
    reviewCount: 62,
    isAvailable: true,
    maxActiveStudents: 6,
    activeStudentsCount: 4,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=elena",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mentor-3",
    userId: "u-mentor-3",
    name: "Marcus Vance",
    headline: "Senior Architect @ OpenAI | Ex-Netflix",
    company: "OpenAI",
    yearsExperience: 9,
    specialties: ["LLM Infrastructure", "High Throughput Systems", "Coding Interview Strategy"],
    hourlyRateCredits: 0,
    bio: "Helping competitive coders transition to high-impact AI infrastructure and tier-1 tech roles.",
    rating: 4.92,
    reviewCount: 34,
    isAvailable: true,
    maxActiveStudents: 4,
    activeStudentsCount: 2,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=marcus",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

initialMentors.forEach((m) => memoryMentors.set(m.id, m));

// Seed one mock session
memorySessions.set("sess-1", {
  id: "sess-1",
  mentorId: "mentor-1",
  studentId: "u-1",
  title: "Google L5 Coding & System Design Deep Dive",
  scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  durationMinutes: 45,
  meetingLink: "https://meet.algora.ai/session-l5-google",
  status: "scheduled",
  createdAt: new Date().toISOString(),
});

export class MentorshipRepository {
  public static async listMentors(specialty?: string, search?: string): Promise<MentorProfileEntity[]> {
    let arr = Array.from(memoryMentors.values());
    if (specialty && specialty !== "all") {
      arr = arr.filter((m) => m.specialties.some((s) => s.toLowerCase().includes(specialty.toLowerCase())));
    }
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((m) => m.name.toLowerCase().includes(q) || m.company.toLowerCase().includes(q) || m.headline.toLowerCase().includes(q));
    }
    return arr.sort((a, b) => b.rating - a.rating);
  }

  public static async getMentorById(id: string): Promise<MentorProfileEntity | null> {
    return memoryMentors.get(id) || null;
  }

  public static async createRequest(data: {
    mentorId: string;
    studentId: string;
    studentUsername: string;
    message: string;
    targetRoleCompany: string;
  }): Promise<MentorshipRequestEntity> {
    const id = `req-${Date.now()}`;
    const now = new Date().toISOString();
    const req: MentorshipRequestEntity = {
      id,
      mentorId: data.mentorId,
      studentId: data.studentId,
      studentUsername: data.studentUsername,
      message: data.message,
      targetRoleCompany: data.targetRoleCompany,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    memoryRequests.set(id, req);
    return req;
  }

  public static async getRequestsForUser(userId: string): Promise<MentorshipRequestEntity[]> {
    return Array.from(memoryRequests.values()).filter((r) => r.studentId === userId || r.mentorId === userId);
  }

  public static async getSessionsForUser(userId: string): Promise<MentorshipSessionEntity[]> {
    return Array.from(memorySessions.values()).filter((s) => s.studentId === userId || s.mentorId === userId);
  }

  public static async createSession(data: {
    mentorId: string;
    studentId: string;
    title: string;
    scheduledAt: string;
    durationMinutes?: number;
  }): Promise<MentorshipSessionEntity> {
    const id = `sess-${Date.now()}`;
    const session: MentorshipSessionEntity = {
      id,
      mentorId: data.mentorId,
      studentId: data.studentId,
      title: data.title,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes || 45,
      meetingLink: `https://meet.algora.ai/${id}`,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    memorySessions.set(id, session);
    return session;
  }
}
