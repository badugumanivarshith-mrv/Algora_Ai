import { defaultAIProvider } from "./geminiProvider";
import { AIGenerationRepository } from "../../repositories/aiGenerationRepository";
import { RedisManager } from "../../redis/redisClient";

export interface GenerateInterviewParams {
  userId?: string;
  roundType: "Technical" | "Coding" | "HR";
  difficulty: "Easy" | "Medium" | "Hard";
}

export class InterviewGenerationService {
  public static async generateInterview(params: GenerateInterviewParams): Promise<any> {
    const cacheKey = `ai:interview:${params.roundType}:${params.difficulty}`.toLowerCase();
    const redis = RedisManager.getClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const systemInstruction = `You are a Principal FAANG Engineering Hiring Manager. Generate a structured interview round.
Return ONLY valid JSON matching this schema:
{
  "evaluationGuidelines": "Guidelines for the interviewer...",
  "questions": [
    {"question": "Explain trade-offs...", "expectedAnswer": "Good answer...", "followUp": "What if N doubles?"}
  ],
  "scoringRubric": [
    {"criterion": "Technical Correctness", "maxPoints": 40, "description": "Accurate algorithm design"}
  ]
}`;

    const prompt = `Generate a ${params.difficulty} difficulty "${params.roundType}" interview round.`;

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
        evaluationGuidelines: "Assess communication, problem decomposition, and invariant validation.",
        questions: [{ question: "Describe how you would scale a real-time collaborative system.", expectedAnswer: "Mention WebSockets and Redis Pub/Sub.", followUp: "How do you handle partition recovery?" }],
        scoringRubric: [{ criterion: "Problem Solving", maxPoints: 50, description: "Clarity of algorithmic breakdown" }],
      };
    }

    const interviewEntity = {
      id: `int-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      roundType: params.roundType,
      difficulty: params.difficulty,
      questions: parsed.questions || [],
      evaluationGuidelines: parsed.evaluationGuidelines || "Evaluate structured thinking and clean code.",
      scoringRubric: parsed.scoringRubric || [],
      createdAt: new Date().toISOString(),
    };

    await AIGenerationRepository.saveInterview(interviewEntity);

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(interviewEntity));
    }

    return interviewEntity;
  }
}
