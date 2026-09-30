/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA PostgreSQL Database Seeder
 */

import { drizzleDb, pool } from "./db";
import { users, learningTracks, topics, problems, projects } from "./schema";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("🌱 Starting ALGORA Production Database Seeding...");

  try {
    // 1. Seed Demo & Admin Users
    const hashedPassword = await bcrypt.hash("DemoStudent123!", 10);
    
    await drizzleDb.insert(users).values([
      {
        name: "Mani Varshith",
        email: "demo@algora.edu",
        passwordHash: hashedPassword,
        role: "student",
        college: "IIT Bombay",
        xp: 4820,
        level: 5,
        streak: 28,
        targetCompany: "Google"
      },
      {
        name: "Dr. Vikram Sharma",
        email: "faculty@algora.edu",
        passwordHash: hashedPassword,
        role: "faculty",
        college: "IIT Bombay",
        xp: 12500,
        level: 12,
        streak: 90,
        targetCompany: "Google"
      }
    ]).onConflictDoNothing();

    // 2. Seed Learning Tracks
    await drizzleDb.insert(learningTracks).values([
      { id: "trk_python", title: "Python 3 Masterclass", description: "From Zero to Advanced Python Systems", category: "languages", icon: "Code2", color: "#3b82f6", orderIndex: 1 },
      { id: "trk_cpp", title: "C++ Systems & STL", description: "Low-Level Systems & High Performance STL", category: "languages", icon: "Cpu", color: "#6366f1", orderIndex: 2 },
      { id: "trk_java", title: "Enterprise Java Core", description: "OOP, Multithreading, JVM & Data Structures", category: "languages", icon: "Coffee", color: "#f59e0b", orderIndex: 3 },
      { id: "trk_dsa", title: "DSA Mastery & Patterns", description: "LeetCode Medium/Hard Patterns for FAANG", category: "interview-prep", icon: "Brain", color: "#10b981", orderIndex: 4 },
      { id: "trk_sysdesign", title: "System Design (LLD & HLD)", description: "Scalable Microservices, Databases & Cache", category: "cs-core", icon: "Database", color: "#8b5cf6", orderIndex: 5 }
    ]).onConflictDoNothing();

    // 3. Seed Topics
    await drizzleDb.insert(topics).values([
      {
        id: "top_arrays",
        trackId: "trk_dsa",
        title: "Arrays & Two-Pointer Invariants",
        description: "In-place sliding window, two-pointers, and prefix sum arrays.",
        orderIndex: 1,
        estimatedMinutes: 90,
        conceptContent: "Arrays store contiguous elements in memory. Two-pointer technique maintains two indices moving towards each other or at varying speeds.",
        syntaxCheatsheet: "left, right = 0, len(nums) - 1\nwhile left < right:\n    curr = nums[left] + nums[right]\n    if curr == target: return [left, right]\n    elif curr < target: left += 1\n    else: right -= 1",
        interactiveExamples: [{ input: "[2, 7, 11, 15], target=9", output: "[0, 1]", explanation: "2 + 7 = 9" }],
        commonMistakes: ["Off-by-one boundary checking", "Forgetting sorted array prerequisite for two pointers"],
        interviewQuestions: ["Two Sum", "3Sum", "Container With Most Water"]
      },
      {
        id: "top_dp",
        trackId: "trk_dsa",
        title: "Dynamic Programming & Memoization",
        description: "Breaking problems into overlapping subproblems with memoized lookup tables.",
        orderIndex: 2,
        estimatedMinutes: 120,
        conceptContent: "Dynamic Programming optimizes recursion by storing calculated subproblem results in a table.",
        syntaxCheatsheet: "memo = {}\ndef dp(n):\n    if n <= 1: return n\n    if n not in memo:\n        memo[n] = dp(n-1) + dp(n-2)\n    return memo[n]",
        interactiveExamples: [{ input: "n=5", output: "5", explanation: "Fibonacci numbers" }],
        commonMistakes: ["Missing base cases causing recursion overflow", "Exponential time complexity without memoization table"],
        interviewQuestions: ["Longest Palindromic Substring", "0/1 Knapsack", "Coin Change"]
      }
    ]).onConflictDoNothing();

    // 4. Seed Problems
    await drizzleDb.insert(problems).values([
      {
        id: "two-sum",
        topicId: "top_arrays",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", note: "Because nums[0] + nums[1] == 9, we return [0, 1]." }],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
        tags: ["Arrays", "Hash Table"],
        companies: ["Google", "Amazon", "Microsoft", "Meta"],
        starterCode: { python: "def twoSum(nums: list[int], target: int) -> list[int]:\n    pass" },
        solutionCode: { python: "def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []" },
        testCases: [{ input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] }],
        acceptanceRate: "88.50",
        learningObjectives: ["Master O(N) Hash Table lookup pattern"]
      }
    ]).onConflictDoNothing();

    // 5. Seed Projects
    await drizzleDb.insert(projects).values([
      {
        id: "banking-system",
        title: "Core Banking Ledger Engine",
        difficulty: "Intermediate",
        category: "Systems Engineering",
        summary: "Build a double-entry transaction processing engine with ACID transaction isolation.",
        overview: "In this project, you will design and implement a production-grade banking ledger supporting concurrent balance updates.",
        architectureOverview: "Express.js backend with PostgreSQL database isolation locks.",
        estimatedHours: 12,
        learningGoals: ["ACID Transactions", "Concurrency Isolation", "REST API Architecture"],
        prerequisites: ["SQL Basics", "Node.js Express"],
        evaluationCriteria: [{ criterion: "Transaction Atomicity", weight: 40, description: "Ensures no partial updates occur" }]
      }
    ]).onConflictDoNothing();

    console.log("✅ Database seeding completed successfully!");
  } catch (err) {
    console.error("⚠️ Seeding warning:", err);
  }
}
