const API_BASE = "/api/collaboration";

export interface CollaborationRoom {
  id: string;
  name: string;
  room_type: string;
  host_user_id: string;
  problem_id?: string;
  company?: string;
  language: string;
  current_code: string;
  driver_user_id?: string;
  navigator_user_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  role: string;
  cursor_position?: { line: number; column: number };
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: "text" | "ai" | "system";
  created_at: string;
}

export interface CollaborationAnalyticsData {
  id: string;
  user_id: string;
  sessions_participated: number;
  time_collaborating_minutes: number;
  pair_sessions: number;
  interview_sessions: number;
  problems_solved_together: number;
  ai_interactions: number;
  updated_at: string;
}

export class CollaborationApi {
  public static async createRoom(data: {
    name: string;
    roomType: string;
    problemId?: string;
    company?: string;
    language?: string;
    initialCode?: string;
  }): Promise<{ success: boolean; room: CollaborationRoom }> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async listRooms(roomType?: string): Promise<{ success: boolean; rooms: CollaborationRoom[] }> {
    const url = roomType ? `${API_BASE}/rooms?roomType=${encodeURIComponent(roomType)}` : `${API_BASE}/rooms`;
    const res = await fetch(url);
    return await res.json();
  }

  public static async getRoom(id: string): Promise<{
    success: boolean;
    room: CollaborationRoom;
    participants: Participant[];
    messages: ChatMessage[];
    whiteboard: any;
  }> {
    const res = await fetch(`${API_BASE}/rooms/${id}`);
    return await res.json();
  }

  public static async joinRoom(id: string, role?: string): Promise<{ success: boolean; room: CollaborationRoom; participant: Participant }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    return await res.json();
  }

  public static async leaveRoom(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/leave`, {
      method: "POST",
    });
    return await res.json();
  }

  public static async syncCode(id: string, code: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return await res.json();
  }

  public static async switchRoles(id: string, driverUserId: string, navigatorUserId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverUserId, navigatorUserId }),
    });
    return await res.json();
  }

  public static async evaluateInterview(id: string, data: { company: string; code: string; transcript?: string }): Promise<{
    success: boolean;
    evaluation: {
      overallScore: number;
      technicalScore: number;
      communicationScore: number;
      strengths: string[];
      areasForImprovement: string[];
      hiringRecommendation: string;
      detailedFeedback: string;
    };
  }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/interview-eval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async sendChatMessage(id: string, message: string, codeContext?: string, isAiRequested?: boolean): Promise<{
    success: boolean;
    message: ChatMessage;
    aiMessage?: { message: string; sender: string };
  }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, codeContext, isAiRequested }),
    });
    return await res.json();
  }

  public static async syncWhiteboard(id: string, shapes: any): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/rooms/${id}/whiteboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shapes }),
    });
    return await res.json();
  }

  public static async getAnalytics(): Promise<{ success: boolean; analytics: CollaborationAnalyticsData }> {
    const res = await fetch(`${API_BASE}/analytics`);
    return await res.json();
  }
}
