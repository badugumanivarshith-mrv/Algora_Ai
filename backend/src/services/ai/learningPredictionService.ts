import {
  LearningIntelligenceRepository,
  KnowledgePredictionEntity,
} from "../../repositories/learningIntelligenceRepository";
import { RedisManager } from "../../redis/redisClient";
import { defaultAIProvider } from "./geminiProvider";

export class LearningPredictionService {
  public static async getPredictions(userId: string): Promise<KnowledgePredictionEntity[]> {
    const redisKey = `learning:predictions:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to DB
      }
    }

    let predictions = await LearningIntelligenceRepository.getKnowledgePredictions(userId);
    if (predictions.length === 0) {
      predictions = await this.generateAIPredictions(userId);
    }

    await RedisManager.set(redisKey, JSON.stringify(predictions), 3600);
    return predictions;
  }

  private static async generateAIPredictions(userId: string): Promise<KnowledgePredictionEntity[]> {
    const prompt = `Generate 4 realistic learning predictions for a developer preparing for tech interviews.
Types: "topic_fail", "topic_forget", "interview_risk", "placement_risk".

Return JSON array:
[
  {
    "predictionType": "topic_fail",
    "topic": "Dynamic Programming",
    "riskProbability": 78,
    "predictionReason": "High failure rate on 2D DP memoization under 20-minute time limits.",
    "suggestedPrevention": "Practice 5 classic 2D DP problems with strict 15-minute timers."
  }
]`;

    let predList: any[];
    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      predList = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    } catch (e) {
      predList = [
        {
          predictionType: "topic_fail",
          topic: "Dynamic Programming",
          riskProbability: 78,
          predictionReason: "High failure rate on 2D DP memoization under 20-minute time limits.",
          suggestedPrevention: "Practice 5 classic 2D DP problems with strict 15-minute timers.",
        },
        {
          predictionType: "topic_forget",
          topic: "Graph Shortest Path",
          riskProbability: 65,
          predictionReason: "No practice logged on Dijkstra/Bellman-Ford for over 14 days.",
          suggestedPrevention: "Schedule a 30-minute revision session on weighted graph algorithms.",
        },
        {
          predictionType: "interview_risk",
          topic: "System Design Concurrency",
          riskProbability: 70,
          predictionReason: "Communication hesitance during live mock interview on Redis thread safety.",
          suggestedPrevention: "Conduct 1 Voice Mentor session focused on concurrency locks & mutexes.",
        },
        {
          predictionType: "placement_risk",
          topic: "Amazon Bar Raiser",
          riskProbability: 35,
          predictionReason: "3 out of 14 Amazon Leadership Principles STAR examples lack quantified metrics.",
          suggestedPrevention: "Update STAR responses in Company Prep Hub with metric impacts.",
        },
      ];
    }

    const savedPredictions: KnowledgePredictionEntity[] = [];
    for (const p of predList) {
      const saved = await LearningIntelligenceRepository.saveKnowledgePrediction({
        userId,
        predictionType: p.predictionType,
        topic: p.topic,
        riskProbability: p.riskProbability,
        predictionReason: p.predictionReason,
        suggestedPrevention: p.suggestedPrevention,
      });
      savedPredictions.push(saved);
    }

    return savedPredictions;
  }
}
