import { defaultAIProvider } from "./geminiProvider";
import { AIGenerationRepository } from "../../repositories/aiGenerationRepository";
import { RedisManager } from "../../redis/redisClient";

export interface GenerateQuizParams {
  userId?: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export class QuizGenerationService {
  public static async generateQuiz(params: GenerateQuizParams): Promise<any> {
    const cacheKey = `ai:quiz:${params.topic}:${params.difficulty}`.toLowerCase();
    const redis = RedisManager.getClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const systemInstruction = `You are a computer science educator. Generate a 5-question quiz (mix of MCQ, Multi-select, True/False) on the requested topic.
Return ONLY valid JSON matching this schema:
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": "q1",
      "type": "MCQ",
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct..."
    }
  ]
}`;

    const prompt = `Generate a ${params.difficulty} difficulty quiz for topic "${params.topic}".`;

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
        title: `${params.topic} Assessment Quiz`,
        questions: [
          {
            id: "q1",
            type: "MCQ",
            question: `What is the standard time complexity for searching in a balanced binary search tree for topic ${params.topic}?`,
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            correctAnswer: "O(log N)",
            explanation: "Balanced BSTs guarantee logarithmic height.",
          },
        ],
      };
    }

    const quizEntity = {
      id: `quiz-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      topic: params.topic,
      difficulty: params.difficulty,
      title: parsed.title || `${params.topic} Quiz`,
      questions: parsed.questions || [],
      createdAt: new Date().toISOString(),
    };

    await AIGenerationRepository.saveQuiz(quizEntity);

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(quizEntity));
    }

    return quizEntity;
  }
}
