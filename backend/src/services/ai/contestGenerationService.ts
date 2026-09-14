import { defaultAIProvider } from "./geminiProvider";
import { AIGenerationRepository } from "../../repositories/aiGenerationRepository";
import { RedisManager } from "../../redis/redisClient";

export interface GenerateContestParams {
  userId?: string;
  contestLevel: "Beginner" | "Intermediate" | "Advanced";
}

export class ContestGenerationService {
  public static async generateContest(params: GenerateContestParams): Promise<any> {
    const cacheKey = `ai:contest:${params.contestLevel}`.toLowerCase();
    const redis = RedisManager.getClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const systemInstruction = `You are a Competitive Programming Contest Director. Generate a balanced coding contest.
Return ONLY valid JSON matching this schema:
{
  "name": "Contest Name",
  "description": "Contest overview...",
  "durationMinutes": 120,
  "difficultyMix": "2 Easy, 2 Medium, 1 Hard",
  "scoringRules": "Standard ACM ICPC scoring with 20m penalty per incorrect submission",
  "problemSet": [
    {"title": "Problem A", "difficulty": "Easy", "topic": "Arrays"}
  ]
}`;

    const prompt = `Generate a ${params.contestLevel} Contest with a well-balanced problem set.`;

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
        name: `Algora ${params.contestLevel} Challenge`,
        description: `A fast-paced competitive programming round tailored for ${params.contestLevel} developers.`,
        durationMinutes: 90,
        difficultyMix: "1 Easy, 2 Medium",
        scoringRules: "Points awarded for correct test cases passed.",
        problemSet: [{ title: "Array Equilibrium", difficulty: "Easy", topic: "Arrays" }],
      };
    }

    const contestEntity = {
      id: `contest-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      name: parsed.name || `Algora Contest`,
      description: parsed.description || "Algorithmic contest round",
      durationMinutes: parsed.durationMinutes || 90,
      difficultyMix: parsed.difficultyMix || "Balanced",
      scoringRules: parsed.scoringRules || "Standard ICPC",
      problemSet: parsed.problemSet || [],
      createdAt: new Date().toISOString(),
    };

    await AIGenerationRepository.saveContest(contestEntity);

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(contestEntity));
    }

    return contestEntity;
  }
}
