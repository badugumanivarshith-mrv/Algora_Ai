import { Database } from "../db/connection";
import { db } from "../services/store";
import {
  StudyPlanEntity,
  StudyPlanTopicEntity,
  StudyPlanType,
  StudyPlanDifficulty,
} from "../types";

export class StudyPlanRepository {
  static async getUserStudyPlans(userId: string): Promise<StudyPlanEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const { rows: planRows } = await Database.query<any>(
          `SELECT * FROM study_plans WHERE user_id = $1 ORDER BY created_at DESC;`,
          [userId]
        );

        const plans: StudyPlanEntity[] = [];
        for (const pr of planRows) {
          const { rows: topicRows } = await Database.query<any>(
            `SELECT * FROM study_plan_topics WHERE plan_id = $1 ORDER BY order_index ASC;`,
            [pr.id]
          );

          const topics: StudyPlanTopicEntity[] = topicRows.map((tr) => ({
            id: tr.id,
            planId: tr.plan_id,
            topicName: tr.topic_name,
            orderIndex: tr.order_index,
            status: tr.status,
            estimatedHours: parseFloat(tr.estimated_hours),
            problemsCount: tr.problems_count,
            solvedCount: tr.solved_count,
            milestoneTitle: tr.milestone_title,
            createdAt: tr.created_at,
          }));

          plans.push({
            id: pr.id,
            userId: pr.user_id,
            title: pr.title,
            planType: pr.plan_type,
            description: pr.description,
            targetRoleCompany: pr.target_role_company,
            difficulty: pr.difficulty,
            durationWeeks: pr.duration_weeks,
            dailyMinutesTarget: pr.daily_minutes_target,
            progressPct: pr.progress_pct,
            status: pr.status,
            topics,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
          });
        }
        return plans;
      } catch {
        // Fallback to in-memory
      }
    }

    const plans = Array.from(db.studyPlans.values()).filter((p) => p.userId === userId);
    return plans.map((p) => {
      const topics = Array.from(db.studyPlanTopics.values())
        .filter((t) => t.planId === p.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        ...p,
        topics,
      };
    });
  }

  static async getStudyPlanById(id: string): Promise<StudyPlanEntity | null> {
    const plan = db.studyPlans.get(id);
    if (!plan) return null;
    const topics = Array.from(db.studyPlanTopics.values())
      .filter((t) => t.planId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return { ...plan, topics };
  }

  static async createStudyPlan(
    userId: string,
    params: {
      planType: StudyPlanType;
      title?: string;
      description?: string;
      targetRoleCompany?: string;
      difficulty?: StudyPlanDifficulty;
      durationWeeks?: number;
      dailyMinutesTarget?: number;
    }
  ): Promise<StudyPlanEntity> {
    const id = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const planTemplates: Record<
      StudyPlanType,
      {
        defaultTitle: string;
        defaultDesc: string;
        difficulty: StudyPlanDifficulty;
        weeks: number;
        mins: number;
        topics: { name: string; hours: number; problems: number; milestone: string }[];
      }
    > = {
      "Beginner Roadmap": {
        defaultTitle: "Zero-to-One DSA Foundations",
        defaultDesc: "Comprehensive introduction covering time complexities, linear sequences, hashing invariants, and basic recursion.",
        difficulty: "Beginner",
        weeks: 4,
        mins: 30,
        topics: [
          { name: "Time & Space Complexity Notation", hours: 3.0, problems: 5, milestone: "Analyze Big-O bounds with precision" },
          { name: "Arrays & String Manipulation", hours: 5.0, problems: 8, milestone: "Two-pointer array reversals and palindrome tests" },
          { name: "Hash Maps & Frequency Tables", hours: 6.0, problems: 8, milestone: "Single-pass complement lookup invariants" },
          { name: "Basic Recursion & Binary Search", hours: 8.0, problems: 10, milestone: "Divide and conquer search invariants" },
        ],
      },
      "DSA Mastery": {
        defaultTitle: "Core Data Structures & Algorithms Mastery",
        defaultDesc: "Rigorous end-to-end curriculum encompassing linear structures, binary search trees, BFS/DFS graph traversals, and dynamic programming.",
        difficulty: "Intermediate",
        weeks: 8,
        mins: 45,
        topics: [
          { name: "Arrays, Two Pointers & Hashing", hours: 6.0, problems: 8, milestone: "Master O(N) Hash Table Invariants" },
          { name: "Sliding Window & Monotonic Stack", hours: 8.0, problems: 10, milestone: "Optimal Window Shrinking & Stack Next-Greater" },
          { name: "Trees, Binary Search Trees & BFS/DFS", hours: 10.0, problems: 12, milestone: "Recursive Tree Traversals & LCA Patterns" },
          { name: "Dynamic Programming (1D & Knapsack)", hours: 14.0, problems: 15, milestone: "State Space Recurrence & Space Optimization" },
          { name: "Graph Algorithms & Shortest Paths", hours: 12.0, problems: 12, milestone: "Topological Sort & Dijkstra Implementations" },
        ],
      },
      "Competitive Programming": {
        defaultTitle: "Competitive Programming Rated Ascent",
        defaultDesc: "Fast-paced algorithmic training focusing on binary search on answers, bit manipulation, combinatorics, and advanced graph topologies.",
        difficulty: "Advanced",
        weeks: 10,
        mins: 50,
        topics: [
          { name: "Fast I/O, Bitwise Tricks & Math", hours: 8.0, problems: 10, milestone: "Bitmask subsets and modular arithmetic" },
          { name: "Binary Search on Monotonic Predicates", hours: 10.0, problems: 12, milestone: "Capacity search & coordinate compressions" },
          { name: "Disjoint Set Union & MST (Kruskal)", hours: 10.0, problems: 10, milestone: "Path compression and union-by-rank" },
          { name: "Interval DP & Digit DP Patterns", hours: 16.0, problems: 14, milestone: "Subsegment memoization and constraint states" },
          { name: "Segment Trees & Range Queries", hours: 14.0, problems: 12, milestone: "Point updates & lazy propagation" },
        ],
      },
      "Interview Preparation": {
        defaultTitle: "FAANG & Tier-1 Systems Interview Prep",
        defaultDesc: "Curated problem patterns, high-frequency company benchmarks, memory trade-offs, and communication guidelines for top-tier technical interviews.",
        difficulty: "Advanced",
        weeks: 12,
        mins: 60,
        topics: [
          { name: "High-Frequency Hash Map & Array Design", hours: 6.0, problems: 6, milestone: "LRU Cache & Two Sum Advanced Variants" },
          { name: "Tree Serialization & Graph Topologies", hours: 10.0, problems: 10, milestone: "Alien Dictionary & Tree Node Linking" },
          { name: "Dynamic Programming on Strings & Intervals", hours: 15.0, problems: 12, milestone: "Edit Distance & Longest Common Subsequence" },
          { name: "Heaps, Top-K & Median Streaming", hours: 8.0, problems: 8, milestone: "Two-heap dynamic median maintenance" },
          { name: "Trie Structures & Autocomplete Design", hours: 8.0, problems: 8, milestone: "Prefix lookups with wildcard matching" },
        ],
      },
      "Company Preparation": {
        defaultTitle: `${params.targetRoleCompany || "Target Company"} Technical Preparation`,
        defaultDesc: `Targeted problem set matching hiring bar and canonical interview question profiles of ${params.targetRoleCompany || "Target Company"}.`,
        difficulty: "Intermediate",
        weeks: 6,
        mins: 45,
        topics: [
          { name: "Canonical Company Problems (Round 1)", hours: 8.0, problems: 8, milestone: "High-probability screening benchmarks" },
          { name: "Data Structures & Complex Object Design", hours: 10.0, problems: 10, milestone: "Object modeling & edge case handling" },
          { name: "Optimization & Edge Case Deep-Dive", hours: 10.0, problems: 10, milestone: "Extreme constraints and memory trade-offs" },
          { name: "Mock Timed Technical Interview Sessions", hours: 12.0, problems: 6, milestone: "Whiteboard simulation & oral justification" },
        ],
      },
    };

    const template = planTemplates[params.planType] || planTemplates["DSA Mastery"];

    const newPlan: StudyPlanEntity = {
      id,
      userId,
      title: params.title || template.defaultTitle,
      planType: params.planType,
      description: params.description || template.defaultDesc,
      targetRoleCompany: params.targetRoleCompany || (params.planType === "Company Preparation" ? "Target Tech Firm" : undefined),
      difficulty: params.difficulty || template.difficulty,
      durationWeeks: params.durationWeeks || template.weeks,
      dailyMinutesTarget: params.dailyMinutesTarget || template.mins,
      progressPct: 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    db.studyPlans.set(id, newPlan);

    const generatedTopics: StudyPlanTopicEntity[] = [];
    let idx = 1;
    for (const t of template.topics) {
      const topicId = `spt-${Date.now()}-${idx}`;
      const topicEntity: StudyPlanTopicEntity = {
        id: topicId,
        planId: id,
        topicName: t.name,
        orderIndex: idx,
        status: idx === 1 ? "in_progress" : "not_started",
        estimatedHours: t.hours,
        problemsCount: t.problems,
        solvedCount: 0,
        milestoneTitle: t.milestone,
        createdAt: now,
      };
      db.studyPlanTopics.set(topicId, topicEntity);
      generatedTopics.push(topicEntity);
      idx++;
    }

    newPlan.topics = generatedTopics;
    return newPlan;
  }
}
