export interface WeakTopicDiagnostic {
  topicId: string;
  topicTitle: string;
  subtopic: string;
  errorFrequency: number;
  lastMistakePattern: string;
  suggestedAction: string;
  readinessImpactScore: number;
  priority: 'Critical' | 'Moderate' | 'Low';
}

export interface MasteryRadarPoint {
  subject: string; // e.g., 'Arrays & Hashing', 'Two Pointers', 'Trees & Graphs', 'Dynamic Programming', 'System Thinking', 'Clean Code'
  score: number; // 0 - 100
  targetBenchmark: number; // e.g. 85 for FAANG
}

export interface LearningVelocityPoint {
  date: string;
  problemsSolved: number;
  minutesSpent: number;
  xpGained: number;
}

export interface PlacementReadinessReport {
  overallScore: number; // 0 - 100
  interviewReadinessTier: 'Foundational' | 'Intermediate Contender' | 'Interview Ready' | 'Top Tier SDE Candidate';
  estimatedTimeToReadyWeeks: number;
  companyFitScores: {
    company: string;
    fitPercentage: number;
    gapTopics: string[];
  }[];
  topicMasteryDistribution: {
    mastered: number;
    inProgress: number;
    needsRevision: number;
    notStarted: number;
  };
  keyRecommendations: string[];
}
