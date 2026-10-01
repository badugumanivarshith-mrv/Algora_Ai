/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Seed Data (Single Source of Truth)
 */

import bcrypt from 'bcryptjs';

export const DEMO_USERS = [
  {
    id: 'e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41',
    name: 'Mani Varshith',
    email: 'demo@algora.edu',
    passwordHash: bcrypt.hashSync('DemoStudent123!', 10),
    role: 'student',
    college: 'IIT Bombay',
    xp: 4820,
    level: 5,
    streak: 28,
    targetCompany: 'Google',
    dailyGoalMinutes: 45,
  },
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Dr. Vikram Sharma',
    email: 'faculty@algora.edu',
    passwordHash: bcrypt.hashSync('AdminFaculty123!', 10),
    role: 'faculty',
    college: 'IIT Bombay',
    xp: 12500,
    level: 12,
    streak: 90,
    targetCompany: 'Google',
    dailyGoalMinutes: 60,
  }
];

export const SEED_TRACKS = [
  { id: 'trk_python', title: 'Python 3 Masterclass', description: 'From Zero to Advanced Python Systems', category: 'languages', icon: 'Code2', color: '#3b82f6', orderIndex: 1 },
  { id: 'trk_cpp', title: 'C++ Systems & STL', description: 'Low-Level Systems & High Performance STL', category: 'languages', icon: 'Cpu', color: '#6366f1', orderIndex: 2 },
  { id: 'trk_java', title: 'Enterprise Java Core', description: 'OOP, Multithreading, JVM & Data Structures', category: 'languages', icon: 'Coffee', color: '#f59e0b', orderIndex: 3 },
  { id: 'trk_dsa', title: 'DSA Mastery & Patterns', description: 'LeetCode Medium/Hard Patterns for FAANG', category: 'interview-prep', icon: 'Brain', color: '#10b981', orderIndex: 4 },
  { id: 'trk_sysdesign', title: 'System Design (LLD & HLD)', description: 'Scalable Microservices, Databases & Cache', category: 'cs-core', icon: 'Database', color: '#8b5cf6', orderIndex: 5 }
];

export const SEED_TOPICS = [
  {
    id: 'top_arrays',
    trackId: 'trk_dsa',
    title: 'Arrays & Two-Pointer Invariants',
    description: 'In-place sliding window, two-pointers, and prefix sum arrays.',
    orderIndex: 1,
    estimatedMinutes: 90,
    conceptContent: 'Arrays store contiguous elements in memory. Two-pointer technique maintains two indices moving towards each other or at varying speeds.',
    syntaxCheatsheet: 'left, right = 0, len(nums) - 1\nwhile left < right:\n    curr = nums[left] + nums[right]\n    if curr == target: return [left, right]\n    elif curr < target: left += 1\n    else: right -= 1',
    interactiveExamples: [{ input: '[2, 7, 11, 15], target=9', output: '[0, 1]', explanation: '2 + 7 = 9' }],
    commonMistakes: ['Off-by-one boundary checking', 'Forgetting sorted array prerequisite for two pointers'],
    interviewQuestions: ['Two Sum', '3Sum', 'Container With Most Water']
  },
  {
    id: 'top_dp',
    trackId: 'trk_dsa',
    title: 'Dynamic Programming & Memoization',
    description: 'Breaking problems into overlapping subproblems with memoized lookup tables.',
    orderIndex: 2,
    estimatedMinutes: 120,
    conceptContent: 'Dynamic Programming optimizes recursion by storing calculated subproblem results in a table.',
    syntaxCheatsheet: 'memo = {}\ndef dp(n):\n    if n <= 1: return n\n    if n not in memo:\n        memo[n] = dp(n-1) + dp(n-2)\n    return memo[n]',
    interactiveExamples: [{ input: 'n=5', output: '5', explanation: 'Fibonacci numbers' }],
    commonMistakes: ['Missing base cases causing recursion overflow', 'Exponential time complexity without memoization table'],
    interviewQuestions: ['Longest Palindromic Substring', '0/1 Knapsack', 'Coin Change']
  }
];

export const SEED_PROBLEMS = [
  {
    id: 'two-sum',
    topicId: 'top_arrays',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', note: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    tags: ['Arrays', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    starterCode: {
      python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}',
      c: '#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    return res;\n}'
    },
    solutionCode: {
      python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        needed = target - num\n        if needed in seen:\n            return [seen[needed], i]\n        seen[num] = i\n    return []'
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1], hidden: true }
    ],
    acceptanceRate: "88.50",
    learningObjectives: ['Master O(N) Hash Table lookup pattern', 'Avoid nested O(N^2) loops']
  },
  {
    id: 'longest-palindromic-substring',
    topicId: 'top_dp',
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    difficulty: 'Medium',
    description: 'Given a string `s`, return the longest palindromic substring in `s`.',
    examples: [{ input: 's = "babad"', output: '"bab"', note: '"aba" is also a valid answer.' }],
    constraints: ['1 <= s.length <= 1000'],
    tags: ['Dynamic Programming', 'String', 'Two Pointers'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    starterCode: {
      python: 'def longestPalindrome(s: str) -> str:\n    # Write your solution here\n    pass'
    },
    solutionCode: {
      python: 'def longestPalindrome(s: str) -> str:\n    res = ""\n    for i in range(len(s)):\n        for l, r in ((i, i), (i, i + 1)):\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > len(res):\n                    res = s[l:r+1]\n                l -= 1\n                r += 1\n    return res'
    },
    testCases: [{ input: { s: 'babad' }, expected: 'bab' }],
    acceptanceRate: "68.20",
    learningObjectives: ['Expand around center technique', 'Understand palindrome symmetry']
  }
];

export const SEED_HINTS = [
  { id: '11111111-1111-1111-1111-111111111111', problemId: 'two-sum', tierLevel: 'hint', orderIndex: 1, title: 'Brute Force vs Hash Map', content: 'Consider trading O(N) extra space to achieve O(N) time complexity.' },
  { id: '22222222-2222-2222-2222-222222222222', problemId: 'two-sum', tierLevel: 'approach', orderIndex: 2, title: 'Complement Lookup', content: 'As you iterate, calculate complement = target - num and check if it exists in your hash map.' },
  { id: '33333333-3333-3333-3333-333333333333', problemId: 'two-sum', tierLevel: 'algorithm', orderIndex: 3, title: 'Single Pass Hash Map', content: 'Store each number and its index in the hash map as you traverse.' }
];

export const SEED_PROJECTS = [
  {
    id: 'banking-system',
    title: 'Core Banking Ledger Engine',
    difficulty: 'Intermediate',
    category: 'Systems Engineering',
    summary: 'Build a double-entry transaction processing engine with ACID transaction isolation.',
    overview: 'In this project, you will design and implement a production-grade banking ledger supporting concurrent balance updates.',
    architectureOverview: 'Express.js backend with PostgreSQL database isolation locks.',
    estimatedHours: 12,
    learningGoals: ['ACID Transactions', 'Concurrency Isolation', 'REST API Architecture'],
    prerequisites: ['SQL Basics', 'Node.js Express'],
    evaluationCriteria: [
      { criterion: 'Transaction Atomicity', weight: 40, description: 'Ensures no partial updates occur' },
      { criterion: 'API Reliability', weight: 30, description: 'Handles malformed balance updates' },
      { criterion: 'Code Structure', weight: 30, description: 'Clean modular controllers' }
    ],
    milestones: [
      {
        id: 'm1',
        milestoneNumber: 1,
        title: 'Database Schema & Accounts API',
        description: 'Define SQL tables and create account creation routes.',
        tasks: [
          { id: 't1', title: 'Create Accounts and Transactions schema', required: true },
          { id: 't2', title: 'Implement POST /api/accounts endpoint', required: true }
        ],
        learningTips: ['Use UUIDs for account IDs.']
      }
    ]
  }
];

export const SEED_SUBMISSIONS = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    userId: 'e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41',
    problemId: 'two-sum',
    code: 'def twoSum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen: return [seen[target - x], i]\n        seen[x] = i\n    return []',
    language: 'python',
    status: 'Accepted' as const,
    executionTimeMs: 12,
    memoryMb: "14.20",
    passedTestCases: 3,
    totalTestCases: 3,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const SEED_REVIEWS = [
  {
    id: '55555554-5555-5555-5555-555555555555',
    userId: 'e0c25a7a-6eb2-4c28-9bf9-9c5d76d49d41',
    itemType: 'problem' as const,
    itemId: 'two-sum',
    title: 'Two Sum Hash Lookup Pattern',
    subtopic: 'Arrays & Hashing',
    frontContent: 'What is the optimal time & space complexity for Two Sum on unsorted arrays?',
    backContent: 'Time: O(N) single pass. Space: O(N) hash map storing seen complements.',
    easinessFactor: "2.60",
    intervalDays: 3,
    repetitionNumber: 2,
    nextReviewDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
];
