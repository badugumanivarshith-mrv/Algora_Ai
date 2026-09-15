import { defaultAIProvider } from "./geminiProvider";
import { CollaborationRepository } from "../../repositories/collaborationRepository";

export interface EnterpriseSessionRoom {
  roomId: string;
  type: "Classroom" | "Faculty-Led" | "Study Group" | "Lab Session";
  title: string;
  hostId: string;
  maxParticipants: number;
}

export class CollaborationService {
  public static async createEnterpriseRoom(params: {
    type: "Classroom" | "Faculty-Led" | "Study Group" | "Lab Session";
    title: string;
    hostId: string;
  }): Promise<EnterpriseSessionRoom> {
    const roomId = `room_ent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      roomId,
      type: params.type,
      title: params.title,
      hostId: params.hostId,
      maxParticipants: params.type === "Faculty-Led" ? 200 : 30,
    };
  }

  public static async generateAIChatResponse(params: {
    roomId: string;
    userId: string;
    userName: string;
    message: string;
    codeContext?: string;
  }) {
    const systemPrompt = `You are Algora's Live AI Collaborator in a pair programming / mock interview room.
Your goal is to guide both programmers Socratically without giving direct solution code.
Highlight invariants, edge cases, space/time complexity, and algorithmic patterns.
Be concise, helpful, and friendly.`;

    const fullPrompt = `Room Context Code:\n${params.codeContext || "No active code"}\n\nUser Question from ${params.userName}: ${params.message}`;

    let aiReply = "Let's inspect the loop boundary condition together to ensure no off-by-one errors occur.";
    try {
      aiReply = await defaultAIProvider.generateRawText(fullPrompt, systemPrompt);
    } catch (e) {
      // Socratic fallback
    }

    // Save AI response message
    await CollaborationRepository.saveMessage(
      params.roomId,
      "AI_COLLABORATOR",
      "AI Mentor",
      aiReply,
      "ai"
    );

    return {
      message: aiReply,
      sender: "AI Mentor",
      timestamp: new Date().toISOString(),
    };
  }
}
