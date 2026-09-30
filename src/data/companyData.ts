/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Company Preparation Tracks & Interview Intelligence Data
 */

import { CompanyTrack } from "../types/career";

export interface InterviewExperience {
  id: string;
  companyId: string;
  candidateName: string;
  collegeTier: string;
  role: string;
  verdict: "Selected" | "Rejected" | "Waitlisted";
  offerPackage?: string;
  date: string;
  rounds: {
    roundName: string;
    duration: string;
    description: string;
    questionsAsked: string[];
    candidateApproach: string;
    keyTakeaways: string[];
  }[];
}

export interface ResumeChecklistItem {
  id: string;
  category: "Formatting" | "Projects" | "DSA & CS Core" | "Impact Metrics" | "ATS Keywords";
  label: string;
  description: string;
  isMandatory: boolean;
}

export interface CompanyData {
  id: string;
  name: string;
  category: "Tier-1 Tech" | "Enterprise Tech" | "Service Giant" | "High-Growth Startup";
  accentColor: string;
  logoBadge: string;
  tagline: string;
  description: string;
  avgPackage: string;
  hiringFocus: string[];
  frequentlyAskedTopics: {
    topic: string;
    frequencyPercentage: number;
    importance: "Critical" | "High" | "Medium";
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    problemIds: string[];
  }[];
  roadmapPhases: {
    phaseNumber: number;
    title: string;
    durationWeeks: string;
    goals: string[];
    recommendedProblemIds: string[];
  }[];
  interviewExperiences: InterviewExperience[];
  mockQuestions: {
    id: string;
    type: "Coding" | "System Design" | "Behavioral / HR";
    question: string;
    expectedKeyPoints: string[];
    sampleAnswer: string;
  }[];
  resumeChecklist: ResumeChecklistItem[];
}

export const COMPANY_TRACKS_DATA: CompanyData[] = [
  // ==========================================
  // 1. AMAZON
  // ==========================================
  {
    id: "amazon",
    name: "Amazon",
    category: "Tier-1 Tech",
    accentColor: "#ff9900",
    logoBadge: "📦",
    tagline: "Customer Obsession, Ownership & Scalable Systems",
    description: "Amazon interviews heavily emphasize Data Structures (Trees, Graphs, Heap, DP) alongside 16 Leadership Principles (LPs) tested in every single round.",
    avgPackage: "$42,000 - $65,000 (32 - 50 LPA)",
    hiringFocus: [
      "16 Amazon Leadership Principles (Customer Obsession, Bias for Action, Dive Deep)",
      "Trees & Binary Search Trees (LCA, Serializing, Traversal)",
      "Dynamic Programming (Knapsack, Grid paths, Substrings)",
      "Low-Level Object-Oriented System Design"
    ],
    frequentlyAskedTopics: [
      {
        topic: "Trees & Binary Search Trees",
        frequencyPercentage: 92,
        importance: "Critical",
        easyCount: 8,
        mediumCount: 15,
        hardCount: 7,
        problemIds: ["two-sum", "longest-palindromic-substring", "group-anagrams"]
      },
      {
        topic: "Arrays, Two Pointers & Sliding Window",
        frequencyPercentage: 88,
        importance: "Critical",
        easyCount: 10,
        mediumCount: 14,
        hardCount: 6,
        problemIds: ["two-sum", "valid-palindrome", "three-sum", "container-with-most-water"]
      },
      {
        topic: "Dynamic Programming",
        frequencyPercentage: 82,
        importance: "High",
        easyCount: 5,
        mediumCount: 12,
        hardCount: 8,
        problemIds: ["longest-palindromic-substring", "minimum-window-substring"]
      },
      {
        topic: "Graphs & Priority Queue",
        frequencyPercentage: 78,
        importance: "High",
        easyCount: 4,
        mediumCount: 14,
        hardCount: 7,
        problemIds: ["top-k-frequent-elements", "first-missing-positive"]
      }
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: "Phase 1: DSA Foundations & Pattern Recognition",
        durationWeeks: "Weeks 1-3",
        goals: ["Master Two Pointers, Sliding Window, and Hash Table lookups", "Practice 25 Amazon Easy/Medium problems"],
        recommendedProblemIds: ["two-sum", "valid-anagram", "contains-duplicate", "valid-palindrome"]
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Advanced Trees, Graphs & DP",
        durationWeeks: "Weeks 4-6",
        goals: ["Solve 30 Tree & Graph traversal problems", "Master Amazon LP stories using STAR framework"],
        recommendedProblemIds: ["group-anagrams", "top-k-frequent-elements", "three-sum", "container-with-most-water"]
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Low-Level OOD & Mock Bar Raiser",
        durationWeeks: "Weeks 7-8",
        goals: ["Design Parking Lot & Shopping Cart OOD systems", "Simulate 3 AI Mock Bar Raiser interviews"],
        recommendedProblemIds: ["product-of-array-except-self", "minimum-window-substring", "first-missing-positive"]
      }
    ],
    interviewExperiences: [
      {
        id: "exp-amazon-1",
        companyId: "amazon",
        candidateName: "Rohan Verma",
        collegeTier: "Tier-2 College",
        role: "SDE I (Software Development Engineer)",
        verdict: "Selected",
        offerPackage: "44 LPA (Base + Stocks + Joining Bonus)",
        date: "September 2026",
        rounds: [
          {
            roundName: "Online Assessment (OA)",
            duration: "90 Mins",
            description: "2 Coding Questions on HackerRank + Amazon Work Style Survey (LP Scenarios).",
            questionsAsked: ["Find Subarrays with Target Sum", "Reorder Log Files"],
            candidateApproach: "Used Sliding Window for Q1 in O(N) time. Used custom Comparator sorting for Q2.",
            keyTakeaways: ["Work Style Survey answers MUST align with Amazon Leadership Principles strictly."]
          },
          {
            roundName: "Technical Round 1 (Trees & LPs)",
            duration: "60 Mins",
            description: "20 Mins LP Behavioral + 40 Mins Coding.",
            questionsAsked: ["Lowest Common Ancestor in Binary Tree", "LP: Tell me about a time you delivered under tight deadline"],
            candidateApproach: "Explained STAR method (Situation, Task, Action, Result) for LP. Wrote clean recursive LCA in C++.",
            keyTakeaways: ["Interviewer listened intently to time complexity analysis and edge cases."]
          },
          {
            roundName: "Bar Raiser Round",
            duration: "60 Mins",
            description: "Strict evaluation on Ownership, Customer Obsession, and Hard Coding problem.",
            questionsAsked: ["Minimum Window Substring", "LP: Tell me about a time you had a disagreement with a team member"],
            candidateApproach: "Used dynamic sliding window with frequency map. Explained trade-offs clearly.",
            keyTakeaways: ["Bar Raiser checks whether you raise the average performance bar of the team."]
          }
        ]
      }
    ],
    mockQuestions: [
      {
        id: "mock-amz-1",
        type: "Coding",
        question: "Given a binary tree, serialize it to a string and deserialize it back to the original tree structure in O(N) time.",
        expectedKeyPoints: ["Pre-order traversal with delimiter", "Handling null nodes with marker (e.g. #)", "Queue/Iterator based deserialization"],
        sampleAnswer: "Use pre-order traversal with commas. Null nodes stored as '#'. Deserialization uses queue popping pre-order elements recursively."
      },
      {
        id: "mock-amz-2",
        type: "Behavioral / HR",
        question: "Describe a situation where you had to make a decision without complete data (Bias for Action).",
        expectedKeyPoints: ["STAR format", "Calculated risk analysis", "Speed over perfection", "Measurable positive impact"],
        sampleAnswer: "During my database migration project, benchmark data was incomplete. I created an isolated sandbox test suite, validated sample load under 80% stress, and migrated ahead of schedule."
      }
    ],
    resumeChecklist: [
      { id: "res-amz-1", category: "Impact Metrics", label: "Include Quantifiable Metrics", description: "Use metrics like 'Reduced latency by 35%' or 'Handled 10,000+ daily requests'", isMandatory: true },
      { id: "res-amz-2", category: "Projects", label: "Distributed or Systems Project", description: "Include at least 1 real-world project demonstrating concurrency, ledger, or API microservices", isMandatory: true },
      { id: "res-amz-3", category: "ATS Keywords", label: "Amazon Tech Stack Keywords", description: "Include C++, Java, Python, AWS, REST API, OOD, Unit Testing", isMandatory: true }
    ]
  },

  // ==========================================
  // 2. GOOGLE
  // ==========================================
  {
    id: "google",
    name: "Google",
    category: "Tier-1 Tech",
    accentColor: "#4285f4",
    logoBadge: "🔍",
    tagline: "Algorithmic Precision, Graph Theory & Googleyness",
    description: "Google tests deep algorithmic problem solving, clean bug-free code writeups without compiler IDE, and Googleyness collaboration values.",
    avgPackage: "$50,000 - $80,000 (40 - 65 LPA)",
    frequentlyAskedTopics: [
      {
        topic: "Graphs & Topological Sort",
        frequencyPercentage: 95,
        importance: "Critical",
        easyCount: 5,
        mediumCount: 18,
        hardCount: 12,
        problemIds: ["minimum-window-substring", "first-missing-positive"]
      },
      {
        topic: "Advanced Dynamic Programming",
        frequencyPercentage: 90,
        importance: "Critical",
        easyCount: 4,
        mediumCount: 16,
        hardCount: 10,
        problemIds: ["longest-palindromic-substring"]
      },
      {
        topic: "Trie & String Algorithms",
        frequencyPercentage: 84,
        importance: "High",
        easyCount: 6,
        mediumCount: 12,
        hardCount: 8,
        problemIds: ["group-anagrams"]
      }
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: "Phase 1: Advanced Data Structures & Graph Theory",
        durationWeeks: "Weeks 1-4",
        goals: ["Master BFS, DFS, Dijkstra, Union-Find, and Topological Sort", "Practice Google Hard problems on Google Docs without syntax autocomplete"],
        recommendedProblemIds: ["two-sum", "three-sum", "top-k-frequent-elements"]
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Dynamic Programming & Math Predicates",
        durationWeeks: "Weeks 5-8",
        goals: ["Master 2D DP, Digit DP, and Monotonic Binary Search", "Simulate 4 Google Mock Coding Rounds"],
        recommendedProblemIds: ["longest-palindromic-substring", "first-missing-positive", "minimum-window-substring"]
      }
    ],
    interviewExperiences: [
      {
        id: "exp-google-1",
        companyId: "google",
        candidateName: "Ananya Sharma",
        collegeTier: "Tier-1 IIT",
        role: "Software Engineer (STEP / L3)",
        verdict: "Selected",
        offerPackage: "58 LPA",
        date: "August 2026",
        rounds: [
          {
            roundName: "Technical Round 1 (Graph & Matrix)",
            duration: "45 Mins",
            description: "Google Docs whiteboard coding. No compiler execution allowed.",
            questionsAsked: ["Shortest Path in Weighted Grid with Obstacles"],
            candidateApproach: "Implemented 0-1 BFS / Dijkstra using Deque in Python. Stated time and space complexity explicitly.",
            keyTakeaways: ["Google interviewers care deeply about code readability, variable naming, and edge case proofing."]
          }
        ]
      }
    ],
    mockQuestions: [
      {
        id: "mock-goog-1",
        type: "Coding",
        question: "Find the median of two sorted arrays of sizes M and N in O(log(min(M, N))) time.",
        expectedKeyPoints: ["Binary search on smaller array partition", "Partition left/right boundary max/min comparisons", "Handling odd vs even combined length"],
        sampleAnswer: "Run binary search on partition index of shorter array. Ensure A_left <= B_right and B_left <= A_right."
      }
    ],
    resumeChecklist: [
      { id: "res-goog-1", category: "DSA & CS Core", label: "High Competitive Programming / DSA Rating", description: "Highlight top rating or 500+ problems solved across Algorithms", isMandatory: true }
    ]
  },

  // ==========================================
  // 3. MICROSOFT
  // ==========================================
  {
    id: "microsoft",
    name: "Microsoft",
    category: "Tier-1 Tech",
    accentColor: "#00a4ef",
    logoBadge: "🪟",
    tagline: "Systems Engineering, Object-Oriented Design & Problem Solving",
    description: "Microsoft focuses on Arrays, Linked Lists, Trees, Systems OOP Design, and core CS fundamentals (OS, DBMS, Computer Networks).",
    avgPackage: "$38,000 - $55,000 (30 - 45 LPA)",
    frequentlyAskedTopics: [
      {
        topic: "Arrays, Strings & Linked Lists",
        frequencyPercentage: 90,
        importance: "Critical",
        easyCount: 12,
        mediumCount: 18,
        hardCount: 5,
        problemIds: ["two-sum", "product-of-array-except-self", "valid-palindrome"]
      },
      {
        topic: "Object-Oriented Design & Low-Level Design",
        frequencyPercentage: 85,
        importance: "Critical",
        easyCount: 6,
        mediumCount: 15,
        hardCount: 4,
        problemIds: ["group-anagrams", "top-k-frequent-elements"]
      }
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: "Phase 1: DSA Foundations & CS Core Revision",
        durationWeeks: "Weeks 1-3",
        goals: ["Solve 40 Microsoft Frequently Asked Questions", "Revise OS Process Management, DBMS Indexing, and Networking"],
        recommendedProblemIds: ["two-sum", "contains-duplicate", "valid-anagram"]
      }
    ],
    interviewExperiences: [],
    mockQuestions: [],
    resumeChecklist: []
  },

  // ==========================================
  // 4. ORACLE
  // ==========================================
  {
    id: "oracle",
    name: "Oracle",
    category: "Enterprise Tech",
    accentColor: "#f80000",
    logoBadge: "🔴",
    tagline: "Database Engineering, Multithreading & High Concurrency",
    description: "Oracle places heavy emphasis on SQL queries, Indexing, Multithreading, Concurrency, and Core Java / C++ memory management.",
    avgPackage: "$25,000 - $40,000 (20 - 32 LPA)",
    frequentlyAskedTopics: [
      {
        topic: "Database Systems & SQL Optimization",
        frequencyPercentage: 94,
        importance: "Critical",
        easyCount: 10,
        mediumCount: 15,
        hardCount: 5,
        problemIds: ["two-sum", "contains-duplicate"]
      }
    ],
    roadmapPhases: [],
    interviewExperiences: [],
    mockQuestions: [],
    resumeChecklist: []
  },

  // ==========================================
  // 5. ADOBE
  // ==========================================
  {
    id: "adobe",
    name: "Adobe",
    category: "Enterprise Tech",
    accentColor: "#ff0000",
    logoBadge: "🅰️",
    tagline: "Document Engineering, Geometry, Math & C++ Systems",
    description: "Adobe technical rounds focus on Mathematical problem solving, Strings, Matrices, Geometry algorithms, and C++ memory layouts.",
    avgPackage: "$28,000 - $45,000 (22 - 36 LPA)",
    frequentlyAskedTopics: [
      {
        topic: "Matrix, Geometry & Bit Manipulation",
        frequencyPercentage: 88,
        importance: "High",
        easyCount: 8,
        mediumCount: 14,
        hardCount: 6,
        problemIds: ["product-of-array-except-self"]
      }
    ],
    roadmapPhases: [],
    interviewExperiences: [],
    mockQuestions: [],
    resumeChecklist: []
  },

  // ==========================================
  // 6. SERVICE COMPANIES (TCS, Infosys, Wipro, etc.)
  // ==========================================
  {
    id: "service-companies",
    name: "Service Companies (TCS, Infosys, Wipro, Accenture, Cognizant)",
    category: "Service Giant",
    accentColor: "#10b981",
    logoBadge: "🏢",
    tagline: "Mass Hiring, Aptitude, Core Programming & Behavioral HR",
    description: "Service company drives focus on Quantitative Aptitude, Logical Reasoning, Verbal Ability, basic Coding in C/Java/Python, and Managerial HR rounds.",
    avgPackage: "$5,000 - $12,000 (4 - 9 LPA / Digital / Ninja)",
    frequentlyAskedTopics: [
      {
        topic: "Aptitude, Logical Reasoning & Math",
        frequencyPercentage: 98,
        importance: "Critical",
        easyCount: 20,
        mediumCount: 10,
        hardCount: 0,
        problemIds: ["two-sum", "contains-duplicate", "valid-palindrome"]
      },
      {
        topic: "Basic String & Array Manipulation",
        frequencyPercentage: 90,
        importance: "High",
        easyCount: 25,
        mediumCount: 10,
        hardCount: 0,
        problemIds: ["valid-anagram", "contains-duplicate"]
      }
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: "Phase 1: Quantitative Aptitude & Logical Speed",
        durationWeeks: "Weeks 1-2",
        goals: ["Master Permutations, Probability, Time & Distance, Speed Math"],
        recommendedProblemIds: ["two-sum", "contains-duplicate"]
      }
    ],
    interviewExperiences: [],
    mockQuestions: [],
    resumeChecklist: []
  },

  // ==========================================
  // 7. STARTUPS
  // ==========================================
  {
    id: "startups",
    name: "High-Growth Tech Startups (YC / Unicorns)",
    category: "High-Growth Startup",
    accentColor: "#8b5cf6",
    logoBadge: "🚀",
    tagline: "Product Speed, Full-Stack Mastery & Practical Problem Solving",
    description: "Startups evaluate speed of execution, full-stack product building, API integrations, database design, and real-world debugging.",
    avgPackage: "$20,000 - $50,000 (16 - 40 LPA + Equity)",
    frequentlyAskedTopics: [
      {
        topic: "Full-Stack Web & Real-Time APIs",
        frequencyPercentage: 96,
        importance: "Critical",
        easyCount: 5,
        mediumCount: 15,
        hardCount: 5,
        problemIds: ["group-anagrams", "top-k-frequent-elements"]
      }
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        title: "Phase 1: Production Full-Stack Portfolio",
        durationWeeks: "Weeks 1-3",
        goals: ["Build 2 production full-stack projects from Project Hub"],
        recommendedProblemIds: ["group-anagrams", "top-k-frequent-elements"]
      }
    ],
    interviewExperiences: [],
    mockQuestions: [],
    resumeChecklist: []
  }
];
