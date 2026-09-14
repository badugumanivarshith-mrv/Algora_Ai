import { defaultAIProvider } from "./geminiProvider";
import { AIGenerationRepository } from "../../repositories/aiGenerationRepository";
import { RedisManager } from "../../redis/redisClient";

export interface GenerateProblemParams {
  userId?: string;
  language: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  learningLevel: "Beginner" | "Intermediate" | "Advanced";
}

export class ProblemGenerationService {
  public static async generateProblem(params: GenerateProblemParams): Promise<any> {
    const cacheKey = `ai:problem:${params.language}:${params.topic}:${params.difficulty}:${params.learningLevel}`.toLowerCase();
    const redis = RedisManager.getClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const systemInstruction = `You are an expert Computer Science professor and competitive programming judge author.
Generate a high-quality coding problem based on the requested Language, Topic, Difficulty, and Learning Level.
CRITICAL: Return ONLY valid JSON matching this exact schema (no markdown wrappers around the JSON if possible, or standard JSON):
{
  "title": "Problem Title",
  "problemStatement": "Detailed description...",
  "constraints": "1 <= N <= 10^5...",
  "inputFormat": "First line contains...",
  "outputFormat": "Print the result...",
  "sampleInputs": ["sample 1", "sample 2"],
  "sampleOutputs": ["output 1", "output 2"],
  "explanation": "Step by step reasoning...",
  "tags": ["tag1", "tag2"],
  "estimatedTime": "30 mins"
}`;

    const prompt = `Generate a ${params.difficulty} level coding problem for topic "${params.topic}" in ${params.language} tailored for a ${params.learningLevel} student.`;

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
        title: `${params.topic} Challenge (${params.difficulty})`,
        problemStatement: `Implement an efficient algorithm in ${params.language} to solve the ${params.topic} problem for ${params.learningLevel} learners.`,
        constraints: "1 <= N <= 100,000, Time Limit: 1.0s",
        inputFormat: "Standard input containing size N and elements.",
        outputFormat: "Standard output with computed result.",
        sampleInputs: ["5\n1 2 3 4 5"],
        sampleOutputs: ["15"],
        explanation: "Iterate through the collection while maintaining state invariants.",
        tags: [params.topic, params.difficulty],
        estimatedTime: "25 mins",
      };
    }

    const problemEntity = {
      id: `prob-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      language: params.language,
      topic: params.topic,
      difficulty: params.difficulty,
      learningLevel: params.learningLevel,
      ...parsed,
      createdAt: new Date().toISOString(),
    };

    await AIGenerationRepository.saveProblem(problemEntity);

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(problemEntity));
    }

    return problemEntity;
  }
}
