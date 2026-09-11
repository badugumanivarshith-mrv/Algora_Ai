import { defaultAIProvider } from "./geminiProvider";
import { AIRepository, AIConversationEntity, AIMessageEntity } from "../../repositories/aiRepository";
import { AIChatOptions, CodeReviewOptions, ComplexityAnalysisResult, CodeReviewResult } from "./aiProvider";
import { ProblemCmsRepository } from "../../repositories";

export interface SendMentorMessageParams {
  userId: string;
  conversationId?: string;
  topic?: string;
  problemSlug?: string;
  userCode?: string;
  language?: string;
  message: string;
  isContestMode?: boolean;
}

export class AIMentorService {
  static async getOrCreateConversation(
    userId: string,
    conversationId?: string,
    topic?: string,
    problemSlug?: string
  ): Promise<AIConversationEntity> {
    if (conversationId) {
      const existing = await AIRepository.getConversationById(conversationId);
      if (existing) return existing;
    }

    const newId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const title = topic ? `Session: ${topic}` : problemSlug ? `Problem Discussion: ${problemSlug}` : "Algorithm Mentorship";

    const conv: AIConversationEntity = {
      id: newId,
      userId,
      topic: topic || "Data Structures & Algorithms",
      title,
      problemSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await AIRepository.saveConversation(conv);
    return conv;
  }

  static async sendMessage(params: SendMentorMessageParams): Promise<{
    conversation: AIConversationEntity;
    userMessage: AIMessageEntity;
    aiMessage: AIMessageEntity;
  }> {
    const conv = await this.getOrCreateConversation(
      params.userId,
      params.conversationId,
      params.topic,
      params.problemSlug
    );

    // Fetch conversation history
    const existingMessages = await AIRepository.getMessagesByConversationId(conv.id);

    // Save User message
    const userMsg: AIMessageEntity = {
      id: `msg-${Date.now()}-u`,
      conversationId: conv.id,
      role: "user",
      type: "text",
      content: params.message,
      language: params.language,
      createdAt: new Date().toISOString(),
    };
    await AIRepository.saveMessage(userMsg);

    // Retrieve problem context if slug provided
    let problemTitle: string | undefined;
    let problemDescription: string | undefined;
    if (params.problemSlug) {
      const prob = await ProblemCmsRepository.findBySlug(params.problemSlug);
      if (prob) {
        problemTitle = prob.title;
        problemDescription = prob.description;
      }
    }

    const chatOptions: AIChatOptions = {
      userId: params.userId,
      topic: params.topic || conv.topic,
      problemSlug: params.problemSlug || conv.problemSlug,
      problemTitle,
      problemDescription,
      userCode: params.userCode,
      language: params.language,
      isContestMode: params.isContestMode,
      history: existingMessages.slice(-6).map((m) => ({
        role: m.role as "user" | "ai",
        content: m.content,
      })),
    };

    // Call Real AI provider (with lazy Gemini & pedagogical fallbacks)
    const aiResult = await defaultAIProvider.generateMentorResponse(params.message, chatOptions);

    const aiMsg: AIMessageEntity = {
      id: `msg-${Date.now()}-ai`,
      conversationId: conv.id,
      role: "ai",
      type: aiResult.type,
      content: aiResult.text,
      language: params.language,
      tokenCount: aiResult.totalTokens,
      createdAt: new Date().toISOString(),
    };
    await AIRepository.saveMessage(aiMsg);

    // Update conversation timestamp
    conv.updatedAt = new Date().toISOString();
    await AIRepository.saveConversation(conv);

    return {
      conversation: conv,
      userMessage: userMsg,
      aiMessage: aiMsg,
    };
  }

  static async getProgressiveHint(params: {
    problemSlug: string;
    hintLevel: 1 | 2 | 3;
    userCode?: string;
    language?: string;
    isContestMode?: boolean;
  }) {
    const prob = await ProblemCmsRepository.findBySlug(params.problemSlug);
    const problemTitle = prob?.title || params.problemSlug;
    const problemDescription = prob?.description || "Algorithmic challenge";

    return defaultAIProvider.generateProgressiveHint({
      problemTitle,
      problemDescription,
      userCode: params.userCode,
      language: params.language,
      hintLevel: params.hintLevel,
      isContestMode: params.isContestMode,
    });
  }

  static async reviewCode(options: CodeReviewOptions): Promise<CodeReviewResult> {
    return defaultAIProvider.generateCodeReview(options);
  }

  static async analyzeComplexity(code: string, language: string, context?: string): Promise<ComplexityAnalysisResult> {
    return defaultAIProvider.generateComplexityAnalysis(code, language, context);
  }

  static async getUserConversations(userId: string): Promise<AIConversationEntity[]> {
    return AIRepository.getConversationsByUserId(userId);
  }

  static async getConversationMessages(conversationId: string): Promise<AIMessageEntity[]> {
    return AIRepository.getMessagesByConversationId(conversationId);
  }
}
