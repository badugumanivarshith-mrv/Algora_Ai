export type MentorMode = 'learn' | 'practice' | 'project' | 'interview';

export type SocraticStage = 
  | 'hint'         // Subtle nudge
  | 'approach'     // High-level conceptual strategy
  | 'algorithm'    // Step-by-step logic breakdown
  | 'pseudocode'   // Language-agnostic structured flow
  | 'partial_code' // Key snippet scaffold with blanks
  | 'solution';    // Complete solution (only explicitly unlocked)

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode: MentorMode;
  socraticStage?: SocraticStage;
  codeSnippet?: string;
  suggestedFollowUps?: string[];
  complexityAnalysis?: {
    time: string;
    space: string;
  };
  contextSummary?: string;
}

export interface MentorSession {
  id: string;
  mode: MentorMode;
  contextType: 'general' | 'topic' | 'problem' | 'project' | 'interview';
  contextId?: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface SocraticProgress {
  currentStage: SocraticStage;
  hintsUnlocked: number;
  totalStages: number;
}
