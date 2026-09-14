import { defaultAIProvider } from "./geminiProvider";
import { SpeechToTextService } from "./speechToTextService";
import { TextToSpeechService } from "./textToSpeechService";
import { VoiceMentorRepository } from "../../repositories/voiceMentorRepository";
import { RedisManager } from "../../redis/redisClient";

export interface VoiceChatResult {
  sessionId: string;
  transcript: string;
  aiResponse: string;
  audioUrl: string;
  language: string;
}

export interface VoiceTopicExplanation {
  concept: string;
  example: string;
  timeComplexity: string;
  spaceComplexity: string;
  useCases: string[];
  audioUrl: string;
}

export interface VoiceCodingHelpResult {
  bugAnalysis: string;
  hint: string;
  conceptualExplanation: string;
  audioUrl: string;
}

export class VoiceMentorService {
  public static async processVoiceChat(
    sessionId: string,
    audioInput: string,
    language: string = "English"
  ): Promise<VoiceChatResult> {
    const transcript = await SpeechToTextService.transcribeAudio(audioInput, language);

    const systemInstruction = `You are Algora's Voice AI Mentor speaking in ${language}. Provide direct, highly engaging, empathetic, and clear technical mentoring responses. Keep speech output concise (2-4 sentences max) suitable for audio reading.`;

    let aiResponse = "";
    try {
      aiResponse = await defaultAIProvider.generateRawText(transcript, systemInstruction);
    } catch {
      aiResponse = `I'm your AI Mentor speaking in ${language}. Let's focus on mastering data structures, algorithms, and system design today. How can I help you progress?`;
    }

    const tts = await TextToSpeechService.generateSpeech(aiResponse, language);

    // Save message to repository
    await VoiceMentorRepository.saveMessage({
      id: `vmsg-${Date.now()}`,
      sessionId,
      role: "user",
      transcript,
      aiResponse,
      createdAt: new Date().toISOString(),
    });

    // Cache session response
    await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse }), 3600);

    return {
      sessionId,
      transcript,
      aiResponse,
      audioUrl: tts.audioUrl,
      language,
    };
  }

  public static async learnTopic(
    topic: string,
    language: string = "English"
  ): Promise<VoiceTopicExplanation> {
    const systemInstruction = `You are a Senior Principal Computer Science Educator. Explain the topic in ${language}.
Return ONLY valid JSON with this exact schema:
{
  "concept": "Breadth-First Search (BFS) is a graph traversal algorithm that explores node by node layer wise using a Queue...",
  "example": "Finding the shortest path in an unweighted grid like Number of Islands or Maze routing.",
  "timeComplexity": "O(V + E)",
  "spaceComplexity": "O(V) for the Queue queue storage",
  "useCases": ["Shortest Path in Unweighted Graph", "Level Order Tree Traversal", "Peer-to-Peer Network Broadcasting"]
}`;

    let result: any;
    try {
      const rawText = await defaultAIProvider.generateRawText(`Teach topic: ${topic}`, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch {
      result = {
        concept: `${topic} is a foundational data structure/algorithm technique used in software engineering interviews.`,
        example: `Solving high-frequency interview problems on LeetCode/HackerRank.`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        useCases: ["Technical Interviewing", "Competitive Programming", "System Engineering"],
      };
    }

    const tts = await TextToSpeechService.generateSpeech(
      `Here is the breakdown for ${topic}: ${result.concept} Time complexity is ${result.timeComplexity}, and space complexity is ${result.spaceComplexity}.`,
      language
    );

    return {
      ...result,
      audioUrl: tts.audioUrl,
    };
  }

  public static async getCodingHelp(
    codeSnippet: string,
    problemContext: string,
    language: string = "English"
  ): Promise<VoiceCodingHelpResult> {
    const systemInstruction = `You are a Strict Socratic Coding Mentor. Analyze code snippets and give hints WITHOUT providing full code solutions. Return ONLY JSON matching:
{
  "bugAnalysis": "The off-by-one boundary condition in loop index leads to ArrayOutOfBounds exception.",
  "hint": "Check the termination condition while iterating through array boundary elements.",
  "conceptualExplanation": "Array indices run from 0 to length - 1. Verify your loop comparison strictly avoids reaching length."
}`;

    let result: any;
    try {
      const prompt = `Context: ${problemContext}\nCode:\n${codeSnippet}`;
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch {
      result = {
        bugAnalysis: "Array boundary condition check might overflow or fail on edge cases.",
        hint: "Dry run your loop variables with 0 and length-1 manually.",
        conceptualExplanation: "Verify loop invariants and space-time guarantees.",
      };
    }

    const tts = await TextToSpeechService.generateSpeech(
      `I analyzed your code. ${result.bugAnalysis} Here is a hint: ${result.hint}`,
      language
    );

    return {
      ...result,
      audioUrl: tts.audioUrl,
    };
  }
}
