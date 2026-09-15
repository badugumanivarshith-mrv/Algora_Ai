import {
  ExecutiveCouncilRepository,
  ExecutiveMemoryRecord,
  ExecutiveDecisionRecord
} from "../../repositories/executiveCouncilRepository";
import { KnowledgeFabricRepository } from "../../repositories/knowledgeFabricRepository";
import { StrategicDecisionRepository } from "../../repositories/strategicDecisionRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class ExecutiveMemoryService {
  private static CACHE_TTL = 3600;

  public static async recordMemory(
    userId: string,
    memoryType: "decision" | "council_outcome" | "strategic_pivot" | "goal_change" | "debate_outcome" | "opportunity_selection",
    title: string,
    context: string,
    rationale: string,
    impactScore: number,
    associatedAgents: string[],
    metadata: Record<string, any> = {}
  ): Promise<ExecutiveMemoryRecord> {
    logger.info(`[ExecutiveMemory] Storing executive memory [${memoryType}] for user ${userId}: ${title}`);

    const record: ExecutiveMemoryRecord = {
      id: `exec-mem-${uuidv4()}`,
      userId,
      memoryType,
      title,
      context,
      rationale,
      impactScore,
      associatedAgents,
      metadata,
      createdAt: new Date().toISOString()
    };

    await ExecutiveCouncilRepository.saveMemory(record);

    // Deep Integration: Link into Global Knowledge Fabric Entities
    try {
      const entity = await KnowledgeFabricRepository.upsertEntity({
        name: `ExecutiveMemory: ${title}`,
        entityType: "KnowledgeFragment",
        description: `${memoryType.toUpperCase()} - ${rationale}`,
        metadata: {
          memoryType,
          associatedAgents,
          impactScore,
          context
        }
      });
      await KnowledgeFabricRepository.logMemoryEvent(userId, entity.id, "ExecutiveDecision", {
        title,
        rationale,
        impactScore
      });
    } catch (e: any) {
      logger.warn(`[ExecutiveMemory] Knowledge Fabric link warning: ${e.message}`);
    }

    // Invalidate Cache
    await RedisManager.del(`executive:memory:${userId}`);
    return record;
  }

  public static async getMemories(userId: string, limit = 50): Promise<ExecutiveMemoryRecord[]> {
    const cacheKey = `executive:memory:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const memories = await ExecutiveCouncilRepository.getMemories(userId, limit);
    if (memories.length === 0) {
      // Seed default strategic executive memories
      const seeded = await this.seedDefaultMemories(userId);
      await RedisManager.set(cacheKey, JSON.stringify(seeded), this.CACHE_TTL);
      return seeded;
    }

    await RedisManager.set(cacheKey, JSON.stringify(memories), this.CACHE_TTL);
    return memories;
  }

  public static async recordDecision(
    userId: string,
    title: string,
    decisionType: string,
    leadAgent: string,
    summary: string,
    tradeoffs: string,
    expectedRoi: number,
    confidenceScore: number,
    actionItems: string[]
  ): Promise<ExecutiveDecisionRecord> {
    logger.info(`[ExecutiveMemory] Recording ratified decision for user ${userId}: ${title}`);

    const decision: ExecutiveDecisionRecord = {
      id: `dec-${uuidv4()}`,
      userId,
      title,
      decisionType,
      leadAgent,
      summary,
      tradeoffs,
      expectedRoi,
      confidenceScore,
      actionItems,
      status: "Approved",
      createdAt: new Date().toISOString()
    };

    await ExecutiveCouncilRepository.saveDecision(decision);

    // Also persist as executive memory
    await this.recordMemory(
      userId,
      "decision",
      title,
      summary,
      tradeoffs,
      expectedRoi,
      [leadAgent],
      { confidenceScore, actionItems }
    );

    return decision;
  }

  public static async getDecisions(userId: string): Promise<ExecutiveDecisionRecord[]> {
    return ExecutiveCouncilRepository.getDecisions(userId);
  }

  private static async seedDefaultMemories(userId: string): Promise<ExecutiveMemoryRecord[]> {
    const defaultMems: Array<Omit<ExecutiveMemoryRecord, "id">> = [
      {
        userId,
        memoryType: "council_outcome",
        title: "Sprint Alignment: 70/30 DSA vs Capstone Split Ratified",
        context: "The Executive Council debated between dedicating 100% time to DSA versus building the Distributed KV Store portfolio project.",
        rationale: "Career Executive demonstrated that Big Tech L4 hiring bars require both 1800+ LC contest rating and a verifiable distributed systems implementation.",
        impactScore: 92.0,
        associatedAgents: ["Career Executive", "Project Executive", "Contest Executive"],
        metadata: { weeklySplit: "14 hrs DSA / 6 hrs Capstone" },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        userId,
        memoryType: "strategic_pivot",
        title: "Pivoted Primary Hiring Target from General SDE to Google L4 Systems Track",
        context: "User demonstrated top 10% performance in concurrency and low-level cache implementation drills.",
        rationale: "Aligns high algorithmic score with distributed systems research project to maximize interview conversion probability.",
        impactScore: 95.0,
        associatedAgents: ["Career Executive", "Research Executive"],
        metadata: { targetCompany: "Google", targetLevel: "L4" },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        userId,
        memoryType: "debate_outcome",
        title: "Debate Resolved: Competitive Contest Fast-Track over Immediate Hackathon",
        context: "Debate between Contest Executive and Startup Executive regarding weekend time allocation.",
        rationale: "Contest rating delta provides verifiable signal across all FAANG screens with 92% ROI score.",
        impactScore: 88.0,
        associatedAgents: ["Contest Executive", "Startup Executive"],
        metadata: { winner: "Contest Executive" },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const results: ExecutiveMemoryRecord[] = [];
    for (const m of defaultMems) {
      const rec: ExecutiveMemoryRecord = {
        id: `exec-mem-${uuidv4()}`,
        ...m
      };
      await ExecutiveCouncilRepository.saveMemory(rec);
      results.push(rec);
    }
    return results;
  }
}
