import { UniversityRepository, CapabilityRecord } from "../../repositories/universityRepository";
import { KnowledgeFabricRepository } from "../../repositories/knowledgeFabricRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { ReputationEngineService } from "./reputationEngineService";
import { logger } from "../../utils/logger";

export interface CapabilityGraphSummary {
  totalCapabilities: number;
  domainAverages: {
    Technical: number;
    Professional: number;
    Research: number;
    Entrepreneurship: number;
  };
  highestCapability: CapabilityRecord;
  emergingCapabilities: CapabilityRecord[];
  recommendedFocusCapability: CapabilityRecord;
  capabilityNodes: CapabilityRecord[];
}

export class CapabilityGraphService {
  public static async getCapabilityGraph(userId: string = 'usr_demo'): Promise<CapabilityGraphSummary> {
    const capabilities = await UniversityRepository.getCapabilities();

    // Domain metrics
    const domainScores: Record<string, { total: number; count: number }> = {
      Technical: { total: 0, count: 0 },
      Professional: { total: 0, count: 0 },
      Research: { total: 0, count: 0 },
      Entrepreneurship: { total: 0, count: 0 }
    };

    for (const cap of capabilities) {
      if (domainScores[cap.domain]) {
        domainScores[cap.domain].total += cap.masteryScore;
        domainScores[cap.domain].count += 1;
      }
    }

    const domainAverages = {
      Technical: parseFloat((domainScores.Technical.total / (domainScores.Technical.count || 1)).toFixed(1)),
      Professional: parseFloat((domainScores.Professional.total / (domainScores.Professional.count || 1)).toFixed(1)),
      Research: parseFloat((domainScores.Research.total / (domainScores.Research.count || 1)).toFixed(1)),
      Entrepreneurship: parseFloat((domainScores.Entrepreneurship.total / (domainScores.Entrepreneurship.count || 1)).toFixed(1))
    };

    const sorted = [...capabilities].sort((a, b) => b.masteryScore - a.masteryScore);
    const highestCapability = sorted[0] || capabilities[0];
    const emergingCapabilities = [...capabilities].sort((a, b) => a.masteryScore - b.masteryScore).slice(0, 3);
    
    // Choose recommendation based on highest ROI capability with dependencies satisfied
    const recommendedFocusCapability = emergingCapabilities.find(c => c.masteryScore < 90) || emergingCapabilities[0];

    return {
      totalCapabilities: capabilities.length,
      domainAverages,
      highestCapability,
      emergingCapabilities,
      recommendedFocusCapability,
      capabilityNodes: capabilities
    };
  }

  public static async updateCapabilityGrowth(userId: string, capabilityId: string, deltaPoints: number): Promise<CapabilityRecord | null> {
    const capabilities = await UniversityRepository.getCapabilities();
    const target = capabilities.find(c => c.id === capabilityId);
    if (!target) return null;

    const newScore = target.masteryScore + deltaPoints;
    const updated = await UniversityRepository.updateCapabilityScore(capabilityId, newScore);

    // Sync into Knowledge Fabric
    try {
      await KnowledgeFabricRepository.upsertEntity({
        id: `ent_cap_${capabilityId}`,
        name: `Capability: ${target.name}`,
        entityType: 'Capability',
        description: `Mastery Score: ${updated?.masteryScore}% in domain ${target.domain}`
      });
    } catch (e) {
      logger.warn(`[CapabilityGraphService] Failed to sync capability to knowledge fabric: ${e}`);
    }

    return updated;
  }

  public static async syncWithDigitalTwin(userId: string) {
    try {
      const summary = await this.getCapabilityGraph(userId);
      logger.info(`[CapabilityGraphService] Synced capability summary into Digital Twin for ${userId}`);
      return summary;
    } catch (e) {
      logger.error(`[CapabilityGraphService] Sync error: ${e}`);
    }
  }
}
