import { CompanyPrepRepository, CompanyUserReadiness } from "../../repositories/companyPrepRepository";
import { LearningMemoryRepository } from "../../repositories/learningMemoryRepository";
import { RedisManager } from "../../redis/redisClient";

export class CompanyReadinessService {
  public static async calculateReadiness(userId: string, companyId: string): Promise<CompanyUserReadiness> {
    const redisKey = `company:readiness:${userId}:${companyId.toLowerCase()}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const memoryRecords = await LearningMemoryRepository.getMemoryRecords(userId);
    const retentionRecords = await LearningMemoryRepository.getRetentionRecords(userId);

    const track = await CompanyPrepRepository.getCompanyTrack(companyId);
    const baseDifficulty = track?.baseDifficulty || "Hard";

    // Weighted readiness algorithm
    let totalScore = 0;
    let count = 0;

    memoryRecords.forEach((m) => {
      totalScore += m.confidenceScore;
      count++;
    });

    let retentionAvg = 80;
    if (retentionRecords.length > 0) {
      const sum = retentionRecords.reduce((s, r) => s + r.retentionPercentage, 0);
      retentionAvg = Math.round(sum / retentionRecords.length);
    }

    const memoryAvg = count > 0 ? Math.round(totalScore / count) : 70;
    let rawReadiness = Math.round(memoryAvg * 0.6 + retentionAvg * 0.4);

    if (baseDifficulty === "Hard") rawReadiness = Math.max(25, rawReadiness - 8);
    if (baseDifficulty === "Easy") rawReadiness = Math.min(98, rawReadiness + 12);

    const readinessEntity: CompanyUserReadiness = {
      id: `readiness-${userId}-${companyId}`,
      userId,
      companyId,
      readinessScore: rawReadiness,
      strengths: ["Arrays & Two Pointers", "BFS Grid Invariants", "Memory Persistence"],
      weaknesses: ["2D Dynamic Programming Memoization", "System Design Concurrency"],
      improvementAreas: [
        `Solve 5 high-frequency ${track?.name || companyId} Medium/Hard DSA problems`,
        `Complete 1 timed ${track?.name || companyId} Mock Assessment`,
      ],
      updatedAt: new Date().toISOString(),
    };

    await RedisManager.set(redisKey, JSON.stringify(readinessEntity), 3600);
    return readinessEntity;
  }
}
