export type TrackCategory = 'language' | 'cs_core' | 'interview';

export type LanguageCode = 'c' | 'cpp' | 'java' | 'python';

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  category: TrackCategory;
  language?: LanguageCode;
  icon: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalTopics: number;
  completedTopics: number;
  estimatedHours: number;
  prerequisites?: string[];
  bannerGradient: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  trackId: string;
  title: string;
  slug: string;
  order: number;
  summary: string;
  prerequisiteTopicIds: string[];
  isLocked?: boolean;
  masteryPercentage: number; // 0 to 100
  estimatedMinutes: number;
  conceptNotes: string; // Markdown/HTML
  syntaxBreakdown: {
    language: string;
    code: string;
    explanation: string;
  }[];
  interactiveExamples: {
    title: string;
    language: string;
    code: string;
    explanation: string;
    output: string;
  }[];
  commonMistakes: {
    title: string;
    badCode: string;
    goodCode: string;
    explanation: string;
  }[];
  assignment: {
    id: string;
    title: string;
    instructions: string;
    starterCode: string;
    solutionPattern: string;
    testCases: { input: string; expected: string }[];
  };
  interviewQuestions: {
    question: string;
    type: 'conceptual' | 'complexity' | 'coding';
    expectedAnswer: string;
    companyTags: string[];
  }[];
  relatedProblemIds: string[];
  relatedProjectIds: string[];
}

export interface TopicProgress {
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  completedSections: string[]; // 'concept', 'syntax', 'examples', 'mistakes', 'practice', 'assignment', 'interview'
  lastVisited: string;
  masteryScore: number;
  decayRate: number; // For spaced repetition
}
