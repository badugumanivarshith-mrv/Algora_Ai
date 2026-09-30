export type CompanyTier = 'tier1' | 'tier2' | 'tier3';

export interface CompanyTrack {
  id: string;
  name: string;
  logoBadge: string;
  category: string;
  accentColor: string;
  description: string;
  hiringFocus: string[];
  frequentlyAskedTopics: {
    topic: string;
    frequencyPercentage: number;
    importance: 'High' | 'Critical' | 'Medium';
    topQuestionIds: string[];
  }[];
  codingPatterns: {
    name: string;
    description: string;
    exampleProblems: string[];
  }[];
  interviewStages: {
    stage: string;
    format: string;
    focusAreas: string[];
    tips: string[];
  }[];
  preparationRoadmapWeeks: {
    week: number;
    title: string;
    goals: string[];
    recommendedProblemIds: string[];
  }[];
}

export interface MockInterviewSession {
  id: string;
  companyName: string;
  role: string;
  difficulty: 'Junior SDE' | 'SDE I' | 'SDE II';
  topic: string;
  problemId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  durationSeconds: number;
  date: string;
  messages: {
    role: 'interviewer' | 'candidate';
    content: string;
    timestamp: string;
  }[];
  scores?: {
    overall: number; // 0 - 100
    problemSolving: number;
    codeQuality: number;
    communication: number;
    timeComplexity: number;
  };
  feedbackSummary?: string;
  strengths?: string[];
  areasOfImprovement?: string[];
}

export interface ResumeSection {
  title: string;
  content: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  targetRole: string;
  targetCompany: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  atsCompatibility: {
    formattingScore: number;
    actionVerbsScore: number;
    impactMetricsScore: number;
  };
}
