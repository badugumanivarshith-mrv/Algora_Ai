import { defaultAIProvider } from "./geminiProvider";
import { LearningMemoryRepository, LearningRevisionNotes } from "../../repositories/learningMemoryRepository";
import { RedisManager } from "../../redis/redisClient";

export class RevisionNotesService {
  public static async generateRevisionNotes(
    userId: string,
    topic: string,
    difficulty: string = "Medium",
    learningLevel: string = "Intermediate"
  ): Promise<LearningRevisionNotes> {
    const redisKey = `ai:notes:${userId}:${topic.toLowerCase()}:${difficulty.toLowerCase()}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const systemInstruction = `You are a Technical Lead and CS Professor. Generate high-density revision notes and a bulleted concept cheat sheet for topic "${topic}".
Return ONLY valid JSON matching this schema:
{
  "summary": "Comprehensive 3-sentence high-level summary of the topic concepts, key patterns, and space/time complexity bounds.",
  "cheatSheet": [
    "Invariant 1: Key property to remember during coding interviews.",
    "Pattern 2: Common bug to avoid and boundary checks.",
    "Optimization 3: Space or time complexity optimization trick."
  ]
}`;

    const prompt = `Topic: "${topic}". Difficulty: "${difficulty}". Learning Level: "${learningLevel}".`;

    let parsed: { summary: string; cheatSheet: string[] };
    try {
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        summary: `Essential revision principles for ${topic} covering state representation, invariant guarantees, and standard interview patterns.`,
        cheatSheet: [
          `Identify base cases and state transition relations before writing code.`,
          `Verify memory limits: keep auxiliary arrays bounded to necessary dimensions.`,
          `Edge checks: Handle zero-length inputs, single elements, and integer overflow.`,
        ],
      };
    }

    const notesEntity: LearningRevisionNotes = {
      id: `notes-${Date.now()}`,
      userId,
      topic,
      difficulty,
      learningLevel,
      summary: parsed.summary,
      cheatSheet: parsed.cheatSheet || [],
      createdAt: new Date().toISOString(),
    };

    await LearningMemoryRepository.saveRevisionNotes(userId, notesEntity);
    await RedisManager.set(redisKey, JSON.stringify(notesEntity), 3600);

    return notesEntity;
  }

  public static async getRevisionNotes(userId: string, topic?: string): Promise<LearningRevisionNotes[]> {
    return LearningMemoryRepository.getRevisionNotes(userId, topic);
  }
}
