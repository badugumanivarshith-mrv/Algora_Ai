import { defaultAIProvider } from "./geminiProvider";
import { LearningMemoryRepository, LearningFlashcard } from "../../repositories/learningMemoryRepository";
import { RedisManager } from "../../redis/redisClient";

export class FlashcardService {
  public static async generateFlashcards(
    userId: string,
    topic: string,
    count: number = 3,
    difficulty: string = "Medium"
  ): Promise<LearningFlashcard[]> {
    const redisKey = `ai:flashcards:${userId}:${topic.toLowerCase()}:${difficulty.toLowerCase()}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const systemInstruction = `You are a Principal Software Engineer & CS Educator. Generate ${count} high-yield technical interview flashcards for topic "${topic}" at difficulty "${difficulty}".
Return ONLY a valid JSON array matching this schema:
[
  {
    "question": "What is the key advantage of BFS over DFS when finding shortest paths in unweighted graphs?",
    "answer": "BFS visits vertices in increasing order of distance, guaranteeing the first time a target vertex is reached, it is via the shortest path.",
    "hint": "Think about level-by-level queue expansion."
  }
]`;

    const prompt = `Topic: "${topic}". Difficulty: "${difficulty}". Count: ${count}.`;

    let cardItems: { question: string; answer: string; hint?: string }[] = [];
    try {
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      cardItems = JSON.parse(cleanJson);
    } catch {
      cardItems = [
        {
          question: `What is the core algorithmic idea behind ${topic}?`,
          answer: `Systematic decomposition of problems into subproblems while maintaining invariants and optimal state transitions.`,
          hint: `Focus on time complexity and memory space trade-offs.`,
        },
        {
          question: `How do you handle edge cases when solving ${topic} problems?`,
          answer: `Check empty inputs, single element cases, duplicate values, and out-of-bounds boundary indices.`,
          hint: `Guard conditions before main processing loops.`,
        },
      ];
    }

    const flashcardEntities: LearningFlashcard[] = cardItems.map((c, idx) => ({
      id: `fc-${Date.now()}-${idx}`,
      userId,
      topic,
      question: c.question,
      answer: c.answer,
      hint: c.hint || "Review core concept properties.",
      difficulty,
      createdAt: new Date().toISOString(),
    }));

    await LearningMemoryRepository.saveFlashcards(userId, flashcardEntities);
    await RedisManager.set(redisKey, JSON.stringify(flashcardEntities), 3600);

    return flashcardEntities;
  }

  public static async getFlashcards(userId: string, topic?: string): Promise<LearningFlashcard[]> {
    return LearningMemoryRepository.getFlashcards(userId, topic);
  }
}
