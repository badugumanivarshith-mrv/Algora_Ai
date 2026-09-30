/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Database Engine (PostgreSQL + Drizzle ORM with Connection Pooling)
 */

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Connection pooling configuration for production database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/algora_db';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Max clients in connection pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const drizzleDb = drizzle(pool, { schema });

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin' | 'faculty';
  college: string;
  avatar_url?: string;
  xp: number;
  level: number;
  streak: number;
  target_company: string;
  daily_goal_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface RefreshTokenEntity {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface PasswordResetTokenEntity {
  id: string;
  user_id: string;
  reset_token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface LearningTrackEntity {
  id: string;
  title: string;
  description: string;
  category: 'languages' | 'cs-core' | 'interview-prep';
  icon: string;
  color: string;
  order_index: number;
}

export interface TopicEntity {
  id: string;
  track_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_minutes: number;
  concept_content: string;
  syntax_cheatsheet: string;
  interactive_examples: any[];
  common_mistakes: any[];
  interview_questions: any[];
  prerequisite_topic_id?: string;
}

export interface ProblemEntity {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{ input: string; output: string; note?: string }>;
  constraints: string[];
  tags: string[];
  companies: string[];
  starter_code: Record<string, string>;
  solution_code: Record<string, string>;
  test_cases: Array<{ input: any; expected: any; hidden?: boolean }>;
  acceptance_rate: number;
  learning_objectives: string[];
}

export interface ProblemHintEntity {
  id: string;
  problem_id: string;
  tier_level: 'hint' | 'approach' | 'algorithm' | 'pseudocode' | 'partial_code' | 'solution';
  order_index: number;
  title: string;
  content: string;
}

export interface SubmissionEntity {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: 'python' | 'cpp' | 'java' | 'c';
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  execution_time_ms: number;
  memory_mb: number;
  passed_test_cases: number;
  total_test_cases: number;
  error_message?: string;
  created_at: string;
}

export interface ProjectEntity {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  summary: string;
  overview: string;
  architecture_overview: string;
  estimated_hours: number;
  learning_goals: string[];
  prerequisites: string[];
  evaluation_criteria: Array<{ criterion: string; weight: number; description: string }>;
  milestones: Array<{
    id: string;
    milestone_number: number;
    title: string;
    description: string;
    tasks: Array<{ id: string; title: string; required: boolean }>;
    learning_tips: string[];
  }>;
}

export interface UserProjectEntity {
  id: string;
  user_id: string;
  project_id: string;
  status: 'in_progress' | 'completed' | 'submitted';
  completed_task_ids: string[];
  reflection_notes: string;
  repo_url?: string;
  demo_url?: string;
  ai_feedback?: string;
  score: number;
  started_at: string;
  completed_at?: string;
}

export interface UserTopicProgressEntity {
  id: string;
  user_id: string;
  topic_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  concept_completed: boolean;
  syntax_completed: boolean;
  examples_completed: boolean;
  mistakes_completed: boolean;
  problems_completed_count: number;
  assignment_completed: boolean;
  project_completed: boolean;
  interview_completed: boolean;
  mastery_score: number;
  last_studied_at: string;
}

export interface DailyReviewEntity {
  id: string;
  user_id: string;
  item_type: 'problem' | 'concept' | 'mistake_card';
  item_id: string;
  title: string;
  subtopic: string;
  front_content: string;
  back_content: string;
  easiness_factor: number;
  interval_days: number;
  repetition_number: number;
  next_review_date: string;
  last_reviewed_at?: string;
  created_at: string;
}

export class AlgoraDatabase {
  public users = new Map<string, UserEntity>();
  public refreshTokens = new Map<string, RefreshTokenEntity>();
  public passwordResetTokens = new Map<string, PasswordResetTokenEntity>();
  public learningTracks = new Map<string, LearningTrackEntity>();
  public topics = new Map<string, TopicEntity>();
  public userTopicProgress = new Map<string, UserTopicProgressEntity>();
  public problems = new Map<string, ProblemEntity>();
  public problemHints = new Map<string, ProblemHintEntity[]>();
  public submissions = new Map<string, SubmissionEntity>();
  public projects = new Map<string, ProjectEntity>();
  public userProjects = new Map<string, UserProjectEntity>();
  public dailyReviews = new Map<string, DailyReviewEntity>();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // 1. Seed Demo User & Admin
    const demoUser: UserEntity = {
      id: 'usr_demo_student',
      name: 'Mani Varshith',
      email: 'demo@algora.edu',
      password_hash: bcrypt.hashSync('DemoStudent123!', 10),
      role: 'student',
      college: 'IIT Bombay',
      xp: 4820,
      level: 5,
      streak: 28,
      target_company: 'Google',
      daily_goal_minutes: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(demoUser.id, demoUser);

    const adminUser: UserEntity = {
      id: 'usr_admin_faculty',
      name: 'Dr. Vikram Sharma',
      email: 'faculty@algora.edu',
      password_hash: bcrypt.hashSync('AdminFaculty123!', 10),
      role: 'faculty',
      college: 'IIT Bombay',
      xp: 12500,
      level: 12,
      streak: 90,
      target_company: 'Google',
      daily_goal_minutes: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);

    // 2. Seed Learning Tracks
    const tracks: LearningTrackEntity[] = [
      { id: 'trk_python', title: 'Python 3 Masterclass', description: 'From Zero to Advanced Python Systems', category: 'languages', icon: 'Code2', color: '#3b82f6', order_index: 1 },
      { id: 'trk_cpp', title: 'C++ Systems & STL', description: 'Low-Level Systems & High Performance STL', category: 'languages', icon: 'Cpu', color: '#6366f1', order_index: 2 },
      { id: 'trk_java', title: 'Enterprise Java Core', description: 'OOP, Multithreading, JVM & Data Structures', category: 'languages', icon: 'Coffee', color: '#f59e0b', order_index: 3 },
      { id: 'trk_dsa', title: 'DSA Mastery & Patterns', description: 'LeetCode Medium/Hard Patterns for FAANG', category: 'interview-prep', icon: 'Brain', color: '#10b981', order_index: 4 },
      { id: 'trk_sysdesign', title: 'System Design (LLD & HLD)', description: 'Scalable Microservices, Databases & Cache', category: 'cs-core', icon: 'Database', color: '#8b5cf6', order_index: 5 }
    ];
    tracks.forEach((t) => this.learningTracks.set(t.id, t));

    // 3. Seed Topics
    const topics: TopicEntity[] = [
      {
        id: 'top_arrays',
        track_id: 'trk_dsa',
        title: 'Arrays & Two-Pointer Invariants',
        description: 'In-place sliding window, two-pointers, and prefix sum arrays.',
        order_index: 1,
        estimated_minutes: 90,
        concept_content: 'Arrays store contiguous elements in memory. Two-pointer technique maintains two indices moving towards each other or at varying speeds.',
        syntax_cheatsheet: 'left, right = 0, len(nums) - 1\nwhile left < right:\n    curr = nums[left] + nums[right]\n    if curr == target: return [left, right]\n    elif curr < target: left += 1\n    else: right -= 1',
        interactive_examples: [{ input: '[2, 7, 11, 15], target=9', output: '[0, 1]', explanation: '2 + 7 = 9' }],
        common_mistakes: ['Off-by-one boundary checking', 'Forgetting sorted array prerequisite for two pointers'],
        interview_questions: ['Two Sum', '3Sum', 'Container With Most Water']
      },
      {
        id: 'top_dp',
        track_id: 'trk_dsa',
        title: 'Dynamic Programming & Memoization',
        description: 'Breaking problems into overlapping subproblems with memoized lookup tables.',
        order_index: 2,
        estimated_minutes: 120,
        concept_content: 'Dynamic Programming optimizes recursion by storing calculated subproblem results in a table.',
        syntax_cheatsheet: 'memo = {}\ndef dp(n):\n    if n <= 1: return n\n    if n not in memo:\n        memo[n] = dp(n-1) + dp(n-2)\n    return memo[n]',
        interactive_examples: [{ input: 'n=5', output: '5', explanation: 'Fibonacci numbers' }],
        common_mistakes: ['Missing base cases causing recursion overflow', 'Exponential time complexity without memoization table'],
        interview_questions: ['Longest Palindromic Substring', '0/1 Knapsack', 'Coin Change']
      }
    ];
    topics.forEach((top) => this.topics.set(top.id, top));

    // 4. Seed User Topic Progress
    const progress: UserTopicProgressEntity = {
      id: 'utp_001',
      user_id: demoUser.id,
      topic_id: 'top_arrays',
      status: 'in_progress',
      concept_completed: true,
      syntax_completed: true,
      examples_completed: true,
      mistakes_completed: false,
      problems_completed_count: 5,
      assignment_completed: false,
      project_completed: false,
      interview_completed: false,
      mastery_score: 88,
      last_studied_at: new Date().toISOString(),
    };
    this.userTopicProgress.set(`${demoUser.id}_top_arrays`, progress);

    // 5. Seed Problems
    const problems: ProblemEntity[] = [
      {
        id: 'two-sum',
        topic_id: 'top_arrays',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', note: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
        tags: ['Arrays', 'Hash Table'],
        companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
        starter_code: {
          python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass',
          cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};',
          java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}',
          c: '#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    return res;\n}'
        },
        solution_code: {
          python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        needed = target - num\n        if needed in seen:\n            return [seen[needed], i]\n        seen[num] = i\n    return []'
        },
        test_cases: [
          { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
          { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
          { input: { nums: [3, 3], target: 6 }, expected: [0, 1], hidden: true }
        ],
        acceptance_rate: 88.5,
        learning_objectives: ['Master O(N) Hash Table lookup pattern', 'Avoid nested O(N^2) loops']
      },
      {
        id: 'longest-palindromic-substring',
        topic_id: 'top_dp',
        title: 'Longest Palindromic Substring',
        slug: 'longest-palindromic-substring',
        difficulty: 'Medium',
        description: 'Given a string `s`, return the longest palindromic substring in `s`.',
        examples: [{ input: 's = "babad"', output: '"bab"', note: '"aba" is also a valid answer.' }],
        constraints: ['1 <= s.length <= 1000'],
        tags: ['Dynamic Programming', 'String', 'Two Pointers'],
        companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
        starter_code: {
          python: 'def longestPalindrome(s: str) -> str:\n    # Write your solution here\n    pass'
        },
        solution_code: {
          python: 'def longestPalindrome(s: str) -> str:\n    res = ""\n    for i in range(len(s)):\n        for l, r in ((i, i), (i, i + 1)):\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > len(res):\n                    res = s[l:r+1]\n                l -= 1\n                r += 1\n    return res'
        },
        test_cases: [{ input: { s: 'babad' }, expected: 'bab' }],
        acceptance_rate: 68.2,
        learning_objectives: ['Expand around center technique', 'Understand palindrome symmetry']
      }
    ];
    problems.forEach((p) => this.problems.set(p.id, p));

    // 6. Seed Projects
    const projects: ProjectEntity[] = [
      {
        id: 'banking-system',
        title: 'Core Banking Ledger Engine',
        difficulty: 'Intermediate',
        category: 'Systems Engineering',
        summary: 'Build a double-entry transaction processing engine with ACID transaction isolation.',
        overview: 'In this project, you will design and implement a production-grade banking ledger supporting concurrent balance updates and transaction rollback guards.',
        architecture_overview: 'Express.js backend with PostgreSQL database isolation locks.',
        estimated_hours: 12,
        learning_goals: ['ACID Transactions', 'Concurrency Isolation', 'REST API Architecture'],
        prerequisites: ['SQL Basics', 'Node.js Express'],
        evaluation_criteria: [
          { criterion: 'Transaction Atomicity', weight: 40, description: 'Ensures no partial updates occur' },
          { criterion: 'API Reliability', weight: 30, description: 'Handles malformed balance updates' },
          { criterion: 'Code Structure', weight: 30, description: 'Clean modular controllers' }
        ],
        milestones: [
          {
            id: 'm1',
            milestone_number: 1,
            title: 'Database Schema & Accounts API',
            description: 'Define SQL tables and create account creation routes.',
            tasks: [
              { id: 't1', title: 'Create Accounts and Transactions schema', required: true },
              { id: 't2', title: 'Implement POST /api/accounts endpoint', required: true }
            ],
            learning_tips: ['Use UUIDs for account IDs.']
          }
        ]
      }
    ];
    projects.forEach((prj) => this.projects.set(prj.id, prj));

    // 7. Seed Submissions
    const submissions: SubmissionEntity[] = [
      {
        id: 'sub_001',
        user_id: demoUser.id,
        problem_id: 'two-sum',
        code: 'def twoSum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen: return [seen[target - x], i]\n        seen[x] = i\n    return []',
        language: 'python',
        status: 'Accepted',
        execution_time_ms: 12,
        memory_mb: 14.2,
        passed_test_cases: 3,
        total_test_cases: 3,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ];
    submissions.forEach((s) => this.submissions.set(s.id, s));

    // 8. Seed Daily Review Flashcards
    const reviews: DailyReviewEntity[] = [
      {
        id: 'rev_001',
        user_id: demoUser.id,
        item_type: 'problem',
        item_id: 'two-sum',
        title: 'Two Sum Hash Lookup Pattern',
        subtopic: 'Arrays & Hashing',
        front_content: 'What is the optimal time & space complexity for Two Sum on unsorted arrays?',
        back_content: 'Time: O(N) single pass. Space: O(N) hash map storing seen complements.',
        easiness_factor: 2.6,
        interval_days: 3,
        repetition_number: 2,
        next_review_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      }
    ];
    reviews.forEach((r) => this.dailyReviews.set(r.id, r));
  }
}

export const db = new AlgoraDatabase();
