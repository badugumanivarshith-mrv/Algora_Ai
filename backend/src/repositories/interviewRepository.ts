export interface InterviewTrackEntity {
  id: string;
  slug: string;
  name: string;
  companyTier: "FAANG" | "Big Tech" | "Fintech" | "AI Frontier";
  description: string;
  iconName: string;
  questionCount: number;
  difficulty: string;
  companies: string[];
}

export interface InterviewQuestionEntity {
  id: string;
  trackId?: string;
  title: string;
  type: "coding" | "system_design" | "behavioral";
  companyTags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  rubric: {
    keyPoints: string[];
    timeComplexityTarget?: string;
    spaceComplexityTarget?: string;
    starGuidance?: string;
  };
}

export interface MockInterviewSessionEntity {
  id: string;
  userId: string;
  trackSlug: string;
  interviewType: "coding" | "behavioral" | "system_design";
  companyTarget: string;
  status: "in_progress" | "completed";
  score: number; // 0-100
  durationSeconds: number;
  transcript: Array<{ role: "ai" | "user"; content: string; timestamp: string }>;
  aiFeedback: {
    summary: string;
    readinessRating: "Strong Hire" | "Hire" | "Lean Hire" | "No Hire";
    breakdown: {
      problemSolving: number; // 0-100
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

const memoryTracks = new Map<string, InterviewTrackEntity>();
const memoryQuestions = new Map<string, InterviewQuestionEntity>();
const memorySessions = new Map<string, MockInterviewSessionEntity>();

const initialTracks: InterviewTrackEntity[] = [
  {
    id: "track-google",
    slug: "google-swe",
    name: "Google SWE L4 / L5 Track",
    companyTier: "FAANG",
    description: "Algorithmic purity, graph invariants, dynamic programming on trees, and scalable concurrency.",
    iconName: "Zap",
    questionCount: 45,
    difficulty: "Hard",
    companies: ["Google", "DeepMind", "Waymo"],
  },
  {
    id: "track-meta",
    slug: "meta-swe",
    name: "Meta Fast-Paced Coding Track",
    companyTier: "FAANG",
    description: "High-speed 2-problem coding rounds (45 mins) focusing on binary trees, heaps, sliding windows, and graphs.",
    iconName: "Layers",
    questionCount: 50,
    difficulty: "Medium-Hard",
    companies: ["Meta", "Instagram", "WhatsApp"],
  },
  {
    id: "track-openai",
    slug: "openai-infrastructure",
    name: "AI Frontier & Infrastructure Track",
    companyTier: "AI Frontier",
    description: "GPU tensor pipelines, distributed KV caches, CUDA-friendly algorithms, and modern system design.",
    iconName: "Cpu",
    questionCount: 30,
    difficulty: "Hard",
    companies: ["OpenAI", "Anthropic", "Scale AI"],
  },
  {
    id: "track-fintech",
    slug: "fintech-quant",
    name: "Fintech & High-Frequency Trading",
    companyTier: "Fintech",
    description: "Low-latency data structures, order book simulators, cache locality, and lockless queues.",
    iconName: "TrendingUp",
    questionCount: 35,
    difficulty: "Hard",
    companies: ["Citadel", "Jane Street", "Stripe", "Two Sigma"],
  },
];

const initialQuestions: InterviewQuestionEntity[] = [
  {
    id: "q-1",
    trackId: "track-google",
    title: "Median of Two Sorted Arrays (O(log(min(m, n))))",
    type: "coding",
    companyTags: ["Google", "Amazon", "Microsoft"],
    difficulty: "Hard",
    prompt: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log(min(m,n))) time.",
    rubric: {
      keyPoints: [
        "Binary search on the smaller array partition index",
        "Handling boundary conditions with -infinity and +infinity",
        "Even vs odd total length partition math",
      ],
      timeComplexityTarget: "O(log(min(m, n)))",
      spaceComplexityTarget: "O(1)",
    },
  },
  {
    id: "q-2",
    trackId: "track-google",
    title: "Design a Distributed Rate Limiter for 100M RPS",
    type: "system_design",
    companyTags: ["Google", "Meta", "Stripe"],
    difficulty: "Hard",
    prompt: "Design a globally distributed rate limiting service that protects backend microservices against DDoS and API over-consumption.",
    rubric: {
      keyPoints: [
        "Token Bucket vs Sliding Window Log algorithms",
        "Redis cluster with Lua atomic scripts",
        "Handling multi-region replication race conditions",
      ],
    },
  },
  {
    id: "q-3",
    trackId: "track-google",
    title: "Behavioral: Disagreement with Technical Direction",
    type: "behavioral",
    companyTags: ["Google", "Meta", "Apple"],
    difficulty: "Medium",
    prompt: "Tell me about a time you strongly disagreed with a senior engineer or product manager on architectural direction. How did you handle it?",
    rubric: {
      keyPoints: [
        "STAR framework clearly structured (Situation, Task, Action, Result)",
        "Data-driven objective benchmarks vs personal bias",
        "Constructive collaboration and team alignment",
      ],
      starGuidance: "Ensure you state the quantifiable outcome and how the team grew.",
    },
  },
  {
    id: "q-4",
    trackId: "track-meta",
    title: "Binary Tree Vertical Order Traversal with BFS",
    type: "coding",
    companyTags: ["Meta", "Bloomberg"],
    difficulty: "Medium",
    prompt: "Given the root of a binary tree, return the vertical order traversal of its nodes' values from top to bottom, column by column.",
    rubric: {
      keyPoints: [
        "BFS with queue of (node, col_idx) to preserve top-to-bottom row order",
        "Min and max column tracking to avoid sorting map keys",
      ],
      timeComplexityTarget: "O(N)",
      spaceComplexityTarget: "O(N)",
    },
  },
];

initialTracks.forEach((t) => memoryTracks.set(t.slug, t));
initialQuestions.forEach((q) => memoryQuestions.set(q.id, q));

// Default completed mock session for user
memorySessions.set("mock-1", {
  id: "mock-1",
  userId: "u-1",
  trackSlug: "google-swe",
  interviewType: "coding",
  companyTarget: "Google SWE L4",
  status: "completed",
  score: 92,
  durationSeconds: 2420,
  transcript: [
    {
      role: "ai",
      content: "Hello Arjun! I will be your Google AI technical interviewer today. Let's start with a problem on partition invariants: Median of Two Sorted Arrays.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      role: "user",
      content: "Thank you! I will use binary search on the partition cut of the smaller array to achieve O(log(min(m, n))) runtime complexity.",
      timestamp: new Date(Date.now() - 3600000 * 24 + 120000).toISOString(),
    },
  ],
  aiFeedback: {
    summary: "Exceptional mastery of binary search partition conditions with clean variable naming and proactive edge case validation.",
    readinessRating: "Strong Hire",
    breakdown: {
      problemSolving: 96,
      codeQuality: 92,
      communication: 90,
      timeManagement: 88,
    },
    strengths: [
      "Immediate identification of optimal O(log(min(m, n))) bound",
      "Proactive handling of empty arrays and infinity sentinels",
      "Crisp algorithmic communication before typing code",
    ],
    improvements: [
      "Could briefly verify integer overflow edge cases in partition indexing",
    ],
  },
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

export class InterviewRepository {
  public static async listTracks(): Promise<InterviewTrackEntity[]> {
    return Array.from(memoryTracks.values());
  }

  public static async getTrack(slug: string): Promise<InterviewTrackEntity | null> {
    return memoryTracks.get(slug) || null;
  }

  public static async listQuestions(trackSlug?: string, type?: string): Promise<InterviewQuestionEntity[]> {
    let arr = Array.from(memoryQuestions.values());
    if (trackSlug) {
      const track = memoryTracks.get(trackSlug);
      if (track) arr = arr.filter((q) => !q.trackId || q.trackId === track.id);
    }
    if (type && type !== "all") {
      arr = arr.filter((q) => q.type === type);
    }
    return arr;
  }

  public static async getMockSession(id: string): Promise<MockInterviewSessionEntity | null> {
    return memorySessions.get(id) || null;
  }

  public static async listUserMockSessions(userId: string): Promise<MockInterviewSessionEntity[]> {
    return Array.from(memorySessions.values()).filter((s) => s.userId === userId);
  }

  public static async saveMockSession(session: MockInterviewSessionEntity): Promise<MockInterviewSessionEntity> {
    memorySessions.set(session.id, session);
    return session;
  }
}
