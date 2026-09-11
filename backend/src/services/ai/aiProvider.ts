export interface AIMessageInput {
  role: "user" | "ai" | "system";
  content: string;
}

export interface AIChatOptions {
  userId?: string;
  topic?: string;
  problemSlug?: string;
  problemTitle?: string;
  problemDescription?: string;
  userCode?: string;
  language?: string;
  isContestMode?: boolean;
  history?: AIMessageInput[];
  systemPromptOverride?: string;
  temperature?: number;
}

export interface AIChatResult {
  text: string;
  type: "text" | "code" | "insight" | "hint" | "remediation";
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  latencyMs: number;
  provider: string;
}

export interface HintOptions {
  problemTitle: string;
  problemDescription: string;
  userCode?: string;
  language?: string;
  hintLevel: 1 | 2 | 3;
  isContestMode?: boolean;
}

export interface CodeReviewOptions {
  problemTitle?: string;
  code: string;
  language: string;
  verdict?: string;
}

export interface CodeReviewResult {
  overview: string;
  strengths: string[];
  improvements: string[];
  edgeCases: string[];
  idiomaticTips: string[];
  timeComplexityEstimate: string;
  spaceComplexityEstimate: string;
}

export interface ComplexityAnalysisResult {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  bottlenecks: string[];
  optimizationTips: string[];
}

export interface IAIProvider {
  name: string;
  isAvailable(): boolean;
  generateMentorResponse(prompt: string, options?: AIChatOptions): Promise<AIChatResult>;
  generateProgressiveHint(options: HintOptions): Promise<{ hint: string; level: number; followUpQuestion: string }>;
  generateCodeReview(options: CodeReviewOptions): Promise<CodeReviewResult>;
  generateComplexityAnalysis(code: string, language: string, problemContext?: string): Promise<ComplexityAnalysisResult>;
}
