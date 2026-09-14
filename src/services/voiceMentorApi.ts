const API_BASE = "/api/voice";

export interface VoiceSession {
  id: string;
  userId: string;
  sessionType: string;
  language: string;
  startedAt: string;
  durationSeconds: number;
}

export interface VoiceChatResponse {
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

export interface VoiceCodingHelpResponse {
  bugAnalysis: string;
  hint: string;
  conceptualExplanation: string;
  audioUrl: string;
}

export interface VoiceInterviewQuestion {
  sessionId: string;
  company: string;
  roundType: string;
  question: string;
  hints: string[];
  audioUrl: string;
}

export interface VoiceInterviewEvaluation {
  score: number;
  technicalScore: number;
  communicationScore: number;
  technicalFeedback: string;
  communicationFeedback: string;
  suggestedImprovements: string[];
  audioUrl: string;
}

export interface VoiceQuizQuestion {
  quizId: string;
  question: string;
  options: string[];
  correctOption: string;
  audioUrl: string;
}

export interface VoiceQuizResult {
  quizId: string;
  isCorrect: boolean;
  feedback: string;
  audioUrl: string;
}

export interface VoiceReviewResponse {
  reviewsCount: number;
  weakTopics: string[];
  guidanceText: string;
  audioUrl: string;
}

export interface VoiceAnalytics {
  id: string;
  userId: string;
  totalSessions: number;
  totalMinutes: number;
  interviewSessions: number;
  reviewSessions: number;
  learningSessions: number;
  updatedAt: string;
}

export class VoiceMentorApi {
  public static async startSession(sessionType: string = "Mentor", language: string = "English"): Promise<VoiceSession> {
    const res = await fetch(`${API_BASE}/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionType, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async endSession(sessionId: string, durationSeconds: number): Promise<VoiceSession> {
    const res = await fetch(`${API_BASE}/session/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, durationSeconds }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async voiceChat(sessionId: string, audioInput: string, language: string = "English"): Promise<VoiceChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, audioInput, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async learnTopic(topic: string, language: string = "English"): Promise<VoiceTopicExplanation> {
    const res = await fetch(`${API_BASE}/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async codeHelp(codeSnippet: string, problemContext: string, language: string = "English"): Promise<VoiceCodingHelpResponse> {
    const res = await fetch(`${API_BASE}/code-help`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeSnippet, problemContext, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async companyPrep(companyId: string, language: string = "English"): Promise<{ company: string; guidance: string; recommendedTopics: string[]; audioUrl: string }> {
    const res = await fetch(`${API_BASE}/company-prep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async startInterview(company: string, roundType: string, language: string = "English"): Promise<VoiceInterviewQuestion> {
    const res = await fetch(`${API_BASE}/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, roundType, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async answerInterview(
    sessionId: string,
    company: string,
    roundType: string,
    spokenAnswer: string,
    language: string = "English"
  ): Promise<VoiceInterviewEvaluation> {
    const res = await fetch(`${API_BASE}/interview/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, company, roundType, spokenAnswer, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async endInterview(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interview/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async startQuiz(topic: string, language: string = "English"): Promise<VoiceQuizQuestion> {
    const res = await fetch(`${API_BASE}/quiz/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async answerQuiz(quizId: string, selectedOption: string, correctOption: string, language: string = "English"): Promise<VoiceQuizResult> {
    const res = await fetch(`${API_BASE}/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, selectedOption, correctOption, language }),
    });
    const json = await res.json();
    return json.data;
  }

  public static async getReview(language: string = "English"): Promise<VoiceReviewResponse> {
    const res = await fetch(`${API_BASE}/review?language=${language}`);
    const json = await res.json();
    return json.data;
  }

  public static async getAnalytics(): Promise<VoiceAnalytics> {
    const res = await fetch(`${API_BASE}/analytics`);
    const json = await res.json();
    return json.data;
  }
}
