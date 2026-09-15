import {
  TalentMarketplaceRepository,
  SkillAssetEntity,
  SkillValuationEntity
} from "../../repositories/talentMarketplaceRepository";
import { KnowledgeFabricService } from "./knowledgeFabricService";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class SkillEconomyService {
  private static CACHE_TTL = 3600;

  /**
   * Generates or fetches user's tokenized skill assets with market demand and valuation
   */
  public static async getUserSkillAssets(userId: string): Promise<SkillAssetEntity[]> {
    const cached = await RedisManager.get(`skill_economy:assets:${userId}`);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }

    let assets = await TalentMarketplaceRepository.getSkillAssets(userId);
    if (assets.length === 0) {
      // Initialize core 8 standard skill categories
      assets = [
        {
          id: `sk-dsa-${uuidv4()}`,
          userId,
          skillCategory: "DSA",
          skillName: "Data Structures & Advanced Algorithms",
          proficiencyLevel: "Elite / Master",
          masteryScore: 92.5,
          verifiedProofs: [
            { source: "Contest Division 1", rating: 1860, date: "2026-09" },
            { source: "Hard DP & Graph Verified", count: 48, date: "2026-08" }
          ],
          marketDemandScore: 95.0,
          scarcityIndex: 82.0,
          industryRelevance: 98.0,
          estimatedAssetValue: 68000.0,
          growthRatePct: 18.2,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-sys-${uuidv4()}`,
          userId,
          skillCategory: "System Design",
          skillName: "Distributed Consensus & High-Throughput Architecture",
          proficiencyLevel: "Advanced",
          masteryScore: 88.0,
          verifiedProofs: [
            { source: "Raft Distributed KV Store", role: "Author", date: "2026-08" },
            { source: "Enterprise Sev-1 Incident Resolution", score: 96, date: "2026-09" }
          ],
          marketDemandScore: 98.0,
          scarcityIndex: 89.5,
          industryRelevance: 99.0,
          estimatedAssetValue: 84000.0,
          growthRatePct: 22.4,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-ai-${uuidv4()}`,
          userId,
          skillCategory: "AI Engineering",
          skillName: "Agentic Workflows & Speculative Decoding",
          proficiencyLevel: "Advanced",
          masteryScore: 89.5,
          verifiedProofs: [
            { source: "Autonomous AI OS Kernel", status: "Production", date: "2026-09" },
            { source: "NeurIPS Research Preprint", venue: "NeurIPS 2026", date: "2026-08" }
          ],
          marketDemandScore: 99.0,
          scarcityIndex: 94.0,
          industryRelevance: 99.5,
          estimatedAssetValue: 92000.0,
          growthRatePct: 35.0,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-backend-${uuidv4()}`,
          userId,
          skillCategory: "Backend",
          skillName: "Concurrent Microservices & Low-Latency Engines",
          proficiencyLevel: "Advanced",
          masteryScore: 91.0,
          verifiedProofs: [
            { source: "Lock-Free Ring Buffer C++ / Go", status: "Merged", date: "2026-07" },
            { source: "PostgreSQL & Redis Pipeline", status: "Verified", date: "2026-09" }
          ],
          marketDemandScore: 93.0,
          scarcityIndex: 76.0,
          industryRelevance: 96.0,
          estimatedAssetValue: 58000.0,
          growthRatePct: 12.0,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-ml-${uuidv4()}`,
          userId,
          skillCategory: "ML Engineering",
          skillName: "Distributed PyTorch & Triton GPU Optimization",
          proficiencyLevel: "Proficient",
          masteryScore: 82.0,
          verifiedProofs: [
            { source: "Triton Kernels Benchmarked", speedup: "2.4x", date: "2026-08" }
          ],
          marketDemandScore: 96.5,
          scarcityIndex: 91.0,
          industryRelevance: 97.0,
          estimatedAssetValue: 76000.0,
          growthRatePct: 28.5,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-devops-${uuidv4()}`,
          userId,
          skillCategory: "DevOps",
          skillName: "Kubernetes, Envoy Mesh & Production Observability",
          proficiencyLevel: "Proficient",
          masteryScore: 84.0,
          verifiedProofs: [
            { source: "Cloud Run & K8s Envoy Mesh", status: "Active", date: "2026-09" }
          ],
          marketDemandScore: 89.0,
          scarcityIndex: 72.0,
          industryRelevance: 92.0,
          estimatedAssetValue: 46000.0,
          growthRatePct: 9.5,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-research-${uuidv4()}`,
          userId,
          skillCategory: "Research",
          skillName: "Empirical Validation & Mathematical Formalism",
          proficiencyLevel: "Advanced",
          masteryScore: 86.0,
          verifiedProofs: [
            { source: "NeurIPS 2026 Draft Defense", score: 8.2, date: "2026-09" }
          ],
          marketDemandScore: 88.0,
          scarcityIndex: 87.0,
          industryRelevance: 90.0,
          estimatedAssetValue: 54000.0,
          growthRatePct: 15.0,
          updatedAt: new Date().toISOString()
        },
        {
          id: `sk-frontend-${uuidv4()}`,
          userId,
          skillCategory: "Frontend",
          skillName: "Modern React 19, WebGL & Reactive Interfaces",
          proficiencyLevel: "Advanced",
          masteryScore: 87.5,
          verifiedProofs: [
            { source: "Algora Multi-Agent Canvas Hub", status: "Shipped", date: "2026-09" }
          ],
          marketDemandScore: 85.0,
          scarcityIndex: 65.0,
          industryRelevance: 91.0,
          estimatedAssetValue: 42000.0,
          growthRatePct: 11.0,
          updatedAt: new Date().toISOString()
        }
      ];

      await TalentMarketplaceRepository.saveSkillAssets(userId, assets);
    }

    await RedisManager.set(`skill_economy:assets:${userId}`, JSON.stringify(assets), this.CACHE_TTL);
    return assets;
  }

  /**
   * Returns global market demand indices and compensation premiums for skill valuations
   */
  public static async getGlobalSkillValuations(): Promise<SkillValuationEntity[]> {
    let valuations = await TalentMarketplaceRepository.getSkillValuations();
    if (valuations.length === 0) {
      valuations = [
        {
          id: "val-ai-agents",
          skillName: "Autonomous Multi-Agent Architecture",
          category: "AI Engineering",
          marketDemandIndex: 99.4,
          scarcityScore: 96.0,
          averageCompPremium: 72000.0,
          trendDirection: "Surging",
          topEmployers: ["OpenAI", "Anthropic", "Google DeepMind", "Meta FAIR"],
          calculatedAt: new Date().toISOString()
        },
        {
          id: "val-dist-sys",
          skillName: "Distributed Consensus & Storage Engines",
          category: "System Design",
          marketDemandIndex: 97.8,
          scarcityScore: 91.5,
          averageCompPremium: 64000.0,
          trendDirection: "Rising",
          topEmployers: ["Stripe", "Amazon AWS", "Databricks", "Snowflake"],
          calculatedAt: new Date().toISOString()
        },
        {
          id: "val-gpu-opt",
          skillName: "Triton & CUDA Kernel Optimization",
          category: "ML Engineering",
          marketDemandIndex: 98.2,
          scarcityScore: 94.8,
          averageCompPremium: 85000.0,
          trendDirection: "Surging",
          topEmployers: ["NVIDIA", "OpenAI", "Meta", "Tesla Autopilot"],
          calculatedAt: new Date().toISOString()
        },
        {
          id: "val-dsa-hard",
          skillName: "Competitive Graph & DP Optimization",
          category: "DSA",
          marketDemandIndex: 94.0,
          scarcityScore: 84.0,
          averageCompPremium: 48000.0,
          trendDirection: "Stable",
          topEmployers: ["Google", "Hudson River Trading", "Jane Street", "Citadel"],
          calculatedAt: new Date().toISOString()
        },
        {
          id: "val-cloud-k8s",
          skillName: "Envoy, eBPF & Distributed Mesh",
          category: "DevOps",
          marketDemandIndex: 91.0,
          scarcityScore: 79.0,
          averageCompPremium: 42000.0,
          trendDirection: "Rising",
          topEmployers: ["Cloudflare", "Datadog", "Google Cloud", "Netflix"],
          calculatedAt: new Date().toISOString()
        }
      ];
      await TalentMarketplaceRepository.saveSkillValuations(valuations);
    }
    return valuations;
  }

  public static async calculateTotalPortfolioAssetValue(userId: string): Promise<{
    totalValuation: number;
    highestValuedSkill: string;
    annualAppreciationRate: number;
    skillsCount: number;
  }> {
    const assets = await this.getUserSkillAssets(userId);
    const totalValuation = assets.reduce((sum, a) => sum + a.estimatedAssetValue, 0);
    const highestValuedSkill = assets.sort((a, b) => b.estimatedAssetValue - a.estimatedAssetValue)[0]?.skillName || "AI Engineering";
    const avgGrowth = assets.reduce((sum, a) => sum + a.growthRatePct, 0) / (assets.length || 1);

    return {
      totalValuation,
      highestValuedSkill,
      annualAppreciationRate: parseFloat(avgGrowth.toFixed(1)),
      skillsCount: assets.length
    };
  }
}
