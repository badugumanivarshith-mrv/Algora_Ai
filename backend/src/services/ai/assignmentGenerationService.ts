import { defaultAIProvider } from "./geminiProvider";
import { AIGenerationRepository } from "../../repositories/aiGenerationRepository";
import { RedisManager } from "../../redis/redisClient";

export interface GenerateAssignmentParams {
  userId?: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export class AssignmentGenerationService {
  public static async generateAssignment(params: GenerateAssignmentParams): Promise<any> {
    const cacheKey = `ai:assignment:${params.topic}:${params.difficulty}`.toLowerCase();
    const redis = RedisManager.getClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const systemInstruction = `You are a senior technical curriculum director. Generate a comprehensive hands-on programming assignment.
Return ONLY valid JSON matching this schema:
{
  "objective": "Assignment objective...",
  "requirements": ["req1", "req2"],
  "tasks": [
    {"title": "Task 1", "description": "Implement function X..."}
  ],
  "evaluationCriteria": ["Test coverage >= 90%", "Optimal O(N) complexity"],
  "expectedCompletionTime": "2 hours"
}`;

    const prompt = `Generate a ${params.difficulty} assignment for topic "${params.topic}" (Arrays, Strings, Linked Lists, Trees, Graphs, or Dynamic Programming).`;

    let rawText = "";
    try {
      rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
    } catch {
      rawText = "";
    }

    let parsed: any = null;
    try {
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        objective: `Master core ${params.topic} concepts through practical implementation.`,
        requirements: ["Implement robust error handling", "Write clean modular functions"],
        tasks: [{ title: "Core Implementation", description: `Build the primary data structure for ${params.topic}.` }],
        evaluationCriteria: ["Correctness on edge cases", "Optimal time complexity"],
        expectedCompletionTime: "90 minutes",
      };
    }

    const assignmentEntity = {
      id: `asn-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      topic: params.topic,
      difficulty: params.difficulty,
      objective: parsed.objective || `Assignment on ${params.topic}`,
      requirements: parsed.requirements || [],
      tasks: parsed.tasks || [],
      evaluationCriteria: parsed.evaluationCriteria || [],
      expectedCompletionTime: parsed.expectedCompletionTime || "60 mins",
      createdAt: new Date().toISOString(),
    };

    await AIGenerationRepository.saveAssignment(assignmentEntity);

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(assignmentEntity));
    }

    return assignmentEntity;
  }
}
