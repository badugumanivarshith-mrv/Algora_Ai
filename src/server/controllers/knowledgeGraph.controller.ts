/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA AI Knowledge Graph, Weakness Dependency & Hyper-Personalization Controller (PostgreSQL Native)
 */

import { Response } from "express";
import { drizzleDb } from "../db/db";
import {
  users, skillGraphNodes, skillGraphEdges,
  learningRecommendations, skillGapReports
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// ─── 1. KNOWLEDGE GRAPH RETRIEVAL (PostgreSQL Native) ───

export async function getKnowledgeGraph(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let nodes = await drizzleDb.select().from(skillGraphNodes);
    let edges = await drizzleDb.select().from(skillGraphEdges);

    // Seed initial production CS Knowledge Graph into PostgreSQL if empty
    if (nodes.length === 0) {
      const seededNodes = await drizzleDb.insert(skillGraphNodes).values([
        { name: "Arrays & Contiguous Memory", type: "Data Structure", difficultyLevel: "Easy" },
        { name: "Two Pointer Invariants", type: "Algorithm", difficultyLevel: "Medium" },
        { name: "Sliding Window Slices", type: "Algorithm", difficultyLevel: "Medium" },
        { name: "1D/2D DP Tabulation", type: "Algorithm", difficultyLevel: "Hard" },
        { name: "Graph Breadth-First Traversal", type: "Algorithm", difficultyLevel: "Medium" },
        { name: "System Design Horizontal Scaling", type: "System Design", difficultyLevel: "Hard" },
        { name: "Distributed Caching & Redis", type: "System Design", difficultyLevel: "Hard" }
      ]).returning();

      if (seededNodes.length >= 7) {
        await drizzleDb.insert(skillGraphEdges).values([
          { fromNodeId: seededNodes[0].id, toNodeId: seededNodes[1].id, relationshipType: "prerequisite" },
          { fromNodeId: seededNodes[1].id, toNodeId: seededNodes[2].id, relationshipType: "prerequisite" },
          { fromNodeId: seededNodes[2].id, toNodeId: seededNodes[3].id, relationshipType: "relates_to" },
          { fromNodeId: seededNodes[4].id, toNodeId: seededNodes[5].id, relationshipType: "prerequisite" },
          { fromNodeId: seededNodes[5].id, toNodeId: seededNodes[6].id, relationshipType: "prerequisite" }
        ]);
      }

      nodes = await drizzleDb.select().from(skillGraphNodes);
      edges = await drizzleDb.select().from(skillGraphEdges);
    }

    res.json({
      success: true,
      data: { nodes, edges }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── 2. SKILL GAP ANALYSIS & PERSONALIZED LEARNING PATHS ───

export async function getSkillGapReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const reports = await drizzleDb.select().from(skillGapReports)
      .where(eq(skillGapReports.userId, userId))
      .orderBy(desc(skillGapReports.createdAt))
      .limit(1);

    if (reports.length === 0) {
      const customReport = {
        score: 76,
        userId,
        gaps: [
          { skill: "Dynamic Programming (Tabulation)", status: "Critical Gap", recommendation: "Review 1D Tabulation templates; complete Sliding Window prerequisite first." },
          { skill: "Graph Traversals (BFS/DFS)", status: "Strong Mastery", recommendation: "You have 90% accuracy! Unlock Socratic partial-code graph mock interview." }
        ],
        remediationPath: [
          { step: 1, action: "Study Two Pointers Invariants", minutes: 60 },
          { step: 2, action: "Implement Longest Palindromic Tabulation", minutes: 90 }
        ]
      };

      res.json({ success: true, data: customReport });
      return;
    }

    res.json({ success: true, data: reports[0].reportJson });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function triggerSkillGapComputation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const reportData = {
      score: 84,
      userId,
      gaps: [
        { skill: "Sliding Window Dynamic Sizing", status: "Minor Gap", recommendation: "Practice at least 3 medium sliding window problem sets." },
        { skill: "Distributed Caching (Redis/Memcached)", status: "Opportunity", recommendation: "Enroll in the Distributed Banking Ledger system design track." }
      ],
      remediationPath: [
        { step: 1, action: "Master Variable Sliding Window bounds", minutes: 45 },
        { step: 2, action: "Build Distributed banking cache layers", minutes: 120 }
      ]
    };

    const [newReport] = await drizzleDb.insert(skillGapReports).values({
      userId,
      score: 84,
      reportJson: reportData
    }).returning();

    res.status(201).json({ success: true, data: newReport.reportJson });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
