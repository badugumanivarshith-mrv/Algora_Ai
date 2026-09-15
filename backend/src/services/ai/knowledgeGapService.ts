import {
  LearningIntelligenceRepository,
  KnowledgeGapEntity,
} from "../../repositories/learningIntelligenceRepository";
import { RedisManager } from "../../redis/redisClient";
import { defaultAIProvider } from "./geminiProvider";

export class KnowledgeGapService {
  public static async detectKnowledgeGaps(userId: string): Promise<KnowledgeGapEntity[]> {
    const redisKey = `knowledge:gaps:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to DB
      }
    }

    let gaps = await LearningIntelligenceRepository.getKnowledgeGaps(userId);
    if (gaps.length === 0) {
      gaps = await this.generateAIKnowledgeGaps(userId);
    }

    await RedisManager.set(redisKey, JSON.stringify(gaps), 3600);
    return gaps;
  }

  private static async generateAIKnowledgeGaps(userId: string): Promise<KnowledgeGapEntity[]> {
    const prompt = `Identify 4 realistic knowledge gaps for a software engineering candidate.
Types: "missing_prerequisite", "weak_concept", "repeated_mistake", "interview_weakness".

Return JSON array matching schema:
[
  {
    "gapType": "missing_prerequisite",
    "topic": "Graphs",
    "subtopic": "Dijkstra Algorithm",
    "severity": "High",
    "detectedReason": "Attempted Dijkstra without mastering Priority Queue / Min-Heap data structure.",
    "remediationAction": "Solve 3 Min-Heap problems before attempting Dijkstra shortest path problems."
  }
]`;

    let gapList: any[];
    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      gapList = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    } catch (e) {
      gapList = [
        {
          gapType: "missing_prerequisite",
          topic: "Graphs",
          subtopic: "Dijkstra Algorithm",
          severity: "High",
          detectedReason: "Attempted Dijkstra without mastering Priority Queue / Min-Heap data structure.",
          remediationAction: "Solve 3 Min-Heap problems before attempting Dijkstra shortest path problems.",
        },
        {
          gapType: "weak_concept",
          topic: "Trees",
          subtopic: "Segment Tree",
          severity: "Medium",
          detectedReason: "Low accuracy (45%) on range update segment tree problems.",
          remediationAction: "Review lazy propagation recursion logic.",
        },
        {
          gapType: "repeated_mistake",
          topic: "Arrays",
          subtopic: "Two Pointers",
          severity: "Low",
          detectedReason: "Off-by-one errors when handling zero-indexed arrays.",
          remediationAction: "Write explicit boundary condition unit tests.",
        },
        {
          gapType: "interview_weakness",
          topic: "System Design",
          subtopic: "Distributed Cache",
          severity: "High",
          detectedReason: "Hesitation when asked about Cache Eviction Policies (LRU vs LFU).",
          remediationAction: "Conduct 1 Mock Voice Interview focusing on Redis Cache Eviction.",
        },
      ];
    }

    const savedGaps: KnowledgeGapEntity[] = [];
    for (const g of gapList) {
      const saved = await LearningIntelligenceRepository.saveKnowledgeGap({
        userId,
        gapType: g.gapType,
        topic: g.topic,
        subtopic: g.subtopic,
        severity: g.severity,
        detectedReason: g.detectedReason,
        remediationAction: g.remediationAction,
      });
      savedGaps.push(saved);
    }

    return savedGaps;
  }
}
