import { KnowledgeFabricRepository } from "../../repositories/knowledgeFabricRepository";
import { LearningMemoryRepository } from "../../repositories/learningMemoryRepository";
import { AgentRepository } from "../../repositories/agentRepository";
import { ProductivityRepository } from "../../repositories/productivityRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class KnowledgeFabricService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  private static CACHE_TTL = 3600;

  // Global Knowledge Graph Initialization
  public static async initializeFabric() {
    const existing = await KnowledgeFabricRepository.getEntities();
    if (existing.length > 0) return;

    logger.info("[KnowledgeFabric] Seeding global entities...");
    
    // Seed Topics
    const topics = [
      { id: 'ent_arr', name: 'Arrays', entityType: 'Topic', description: 'Fundamental linear data structure.' },
      { id: 'ent_sw', name: 'Sliding Window', entityType: 'Topic', description: 'Technique for sub-array problems.' },
      { id: 'ent_dp', name: 'Dynamic Programming', entityType: 'Topic', description: 'Optimization technique for overlapping subproblems.' },
    ];

    for (const t of topics) await KnowledgeFabricRepository.upsertEntity(t);

    // Seed Skills
    const skills = [
      { id: 'ent_ps_alg', name: 'Problem Solving (Algorithms)', entityType: 'Skill' },
      { id: 'ent_sys_design', name: 'System Design', entityType: 'Skill' },
      { id: 'ent_ai_prompting', name: 'AI Prompt Engineering', entityType: 'Skill' },
    ];
    for (const s of skills) await KnowledgeFabricRepository.upsertEntity(s);

    // Seed Companies (Hiring Targets)
    const companies = [
      { id: 'ent_google', name: 'Google', entityType: 'Company' },
      { id: 'ent_amazon', name: 'Amazon', entityType: 'Company' },
      { id: 'ent_meta', name: 'Meta', entityType: 'Company' },
    ];
    for (const c of companies) await KnowledgeFabricRepository.upsertEntity(c);

    // Seed Relationships
    await KnowledgeFabricRepository.upsertRelationship({
      sourceId: 'ent_arr', targetId: 'ent_sw', relationshipType: 'Prerequisite', weight: 1.0
    });
    await KnowledgeFabricRepository.upsertRelationship({
      sourceId: 'ent_sw', targetId: 'ent_google', relationshipType: 'RelatedToInterview', weight: 0.8
    });
    
    logger.info("[KnowledgeFabric] Fabric initialization complete.");
  }

  // Memory Consolidation
  public static async syncUserKnowledge(userId: string) {
    logger.info(`[KnowledgeFabric] Syncing knowledge for user: ${userId}`);
    
    const [learningMem, agentMem, productivity] = await Promise.all([
      LearningMemoryRepository.getMemoryRecords(userId),
      AgentRepository.getAgents(userId),
      ProductivityRepository.getMetrics(userId)
    ]);

    // Log events for consolidation
    for (const record of learningMem) {
      await KnowledgeFabricRepository.logMemoryEvent(userId, null, 'Learning', {
        topic: record.topic,
        mastery: record.confidenceScore,
        solved: record.problemsSolved
      });
    }

    // Update Intelligence Profile
    const profile = await this.calculateIntelligenceProfile(userId, { learningMem, agentMem, productivity });
    await KnowledgeFabricRepository.updateIntelligenceProfile(userId, profile);
    
    // Generate Insights
    await this.generateCrossDomainInsights(userId, profile);

    // Synchronize into Autonomous Digital Twin
    DigitalTwinService.updateDigitalTwin(userId).catch(e => logger.warn(`[KnowledgeFabric] DigitalTwin sync warning: ${e}`));

    await RedisManager.del(`intelligence:profile:${userId}`);
    return profile;
  }

  private static async calculateIntelligenceProfile(userId: string, data: any) {
    const { learningMem, productivity } = data;
    
    const overallMastery = learningMem.reduce((acc: number, r: any) => acc + r.confidenceScore, 0) / (learningMem.length || 1);
    const learningVelocity = (productivity?.problemsSolved || 0) / 7; // Per day avg
    
    return {
      overallMastery,
      learningVelocity,
      hiringReadiness: Math.min(100, overallMastery * 1.1),
      careerProgress: 45, // Placeholder
      researchImpact: 20, // Placeholder
      projectCompletionRate: 85,
      topSkills: ['Algorithms', 'TypeScript', 'React'],
      skillDistribution: {
        'Frontend': 40,
        'Backend': 30,
        'AI': 20,
        'CS Fundamentals': 10
      }
    };
  }

  // Gemini Insight Generation
  private static async generateCrossDomainInsights(userId: string, profile: any) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      User Intelligence Profile: ${JSON.stringify(profile)}
      Recent Memory Events: (System Log for user ${userId})
      
      Task: Generate 3 high-impact cross-domain insights for this user.
      Focus on connections between Learning, Career, and Projects.
      Example: "Weak DP mastery is impacting your Amazon Interview Readiness."
      
      Return JSON: [{"title": "...", "type": "Performance/Readiness/Gap", "description": "...", "recommendation": "..."}]
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const insights = JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1));
      
      for (const ins of insights) {
        await KnowledgeFabricRepository.createInsight(userId, {
          title: ins.title,
          insightType: ins.type,
          description: ins.description,
          recommendation: ins.recommendation
        });
      }
    } catch (e) {
      logger.error(`[KnowledgeFabric] Failed to generate insights: ${e}`);
    }
  }

  // Graph Exploration
  public static async getGlobalGraph() {
    const cacheKey = "knowledge:fabric:global";
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [entities, relationships] = await Promise.all([
      KnowledgeFabricRepository.getEntities(),
      KnowledgeFabricRepository.getRelationships()
    ]);

    const graph = { entities, relationships };
    await RedisManager.set(cacheKey, JSON.stringify(graph), 3600);
    return graph;
  }

  public static async getUserIntelligence(userId: string) {
    const cacheKey = `intelligence:profile:${userId}`;
    const cached = await RedisManager.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [profile, insights] = await Promise.all([
      KnowledgeFabricRepository.getIntelligenceProfile(userId),
      KnowledgeFabricRepository.getInsights(userId)
    ]);

    const data = { profile, insights };
    await RedisManager.set(cacheKey, JSON.stringify(data), 3600);
    return data;
  }

  // Agent Unified Access Layer
  public static async agentQueryGraph(userId: string, queryText: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const graph = await this.getGlobalGraph();
    const profile = await this.getUserIntelligence(userId);

    const prompt = `
      Context: ${JSON.stringify({ graph, profile })}
      User Query: ${queryText}
      
      Task: Answer the query based on the unified knowledge fabric and user intelligence.
      Return the response in a structured way that an AI agent can use.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  public static async agentWriteMemory(userId: string, agentId: string, entityName: string, memory: any) {
    // Link agent memory to global entities
    const entity = await KnowledgeFabricRepository.upsertEntity({
      name: entityName,
      entityType: 'KnowledgeFragment',
      metadata: { sourceAgent: agentId, originalMemory: memory }
    });

    await KnowledgeFabricRepository.logMemoryEvent(userId, entity.id, 'AgentMemory', memory);
    
    // Invalidate caches
    await RedisManager.del(`intelligence:profile:${userId}`);
    return entity;
  }
}
