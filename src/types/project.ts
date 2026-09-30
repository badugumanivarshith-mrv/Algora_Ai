export type ProjectLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface MilestoneTask {
  id: string;
  title: string;
  description: string;
  hints: string[];
  isCompleted: boolean;
  learningOutcome: string;
}

export interface ProjectMilestone {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  tasks: MilestoneTask[];
  deliverable: string;
  aiReviewPrompt: string;
}

export interface EvaluationRubric {
  category: string;
  maxScore: number;
  criteria: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  level: ProjectLevel;
  trackId: string;
  trackTitle: string;
  summary: string;
  overview: string;
  bannerImage: string;
  requirements: string[];
  learningGoals: string[];
  technologies: string[];
  estimatedHours: number;
  xpReward: number;
  milestones: ProjectMilestone[];
  evaluationCriteria: EvaluationRubric[];
  starterGithubRepo?: string;
  architectureDiagramNotes: string;
  recommendedNextProject?: string;
}

export interface UserProjectProgress {
  projectId: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
  completedTaskIds: string[];
  reflectionNotes: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  aiFeedbackScore?: number;
  aiMentorFeedback?: string;
  startedAt?: string;
  completedAt?: string;
}
