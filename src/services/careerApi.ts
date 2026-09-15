const API_BASE = "/api/career";

export interface CareerProfile {
  id: string;
  user_id: string;
  career_goal: string;
  target_companies: string[];
  target_role: string;
  experience_level: string;
  preferred_tech_stack: string[];
  strength_areas: string[];
  weak_areas: string[];
  learning_velocity: number;
  career_progression: any;
}

export interface ResumeVersion {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  template_id: string;
  content_json: any;
  ats_score: number;
  created_at: string;
}

export interface ResumeReview {
  id: string;
  resume_id: string;
  ats_score: number;
  skill_gaps: string[];
  keyword_matches: string[];
  formatting_score: number;
  experience_quality: string;
  project_quality: string;
  achievements_score: number;
  issues: string[];
  suggestions: string[];
  improvement_plan: string;
}

export interface JobMatch {
  id: string;
  company: string;
  role: string;
  match_percentage: number;
  skill_gaps: string[];
  recommended_topics: string[];
  recommended_problems: string[];
}

export interface CareerRoadmap {
  id: string;
  target_company: string;
  target_role: string;
  interview_date?: string;
  daily_plan: any[];
  weekly_plan: any[];
  monthly_plan: any[];
  revision_schedule: any[];
  mock_schedule: any[];
}

export interface RecruiterInterview {
  id: string;
  company: string;
  interview_type: string;
  scores_json: any;
  communication_feedback: string;
  confidence_score: number;
  hiring_recommendation: string;
  created_at: string;
}

export interface PortfolioAnalysis {
  id: string;
  github_username?: string;
  portfolio_score: number;
  complexity_rating: string;
  tech_stack_detected: string[];
  architecture_score: number;
  documentation_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CareerAnalyticsData {
  id: string;
  readiness_trends: any[];
  learning_velocity: number;
  interview_performance: any;
  contest_performance: any;
  skill_growth: any;
  company_readiness: any;
  placement_probability: number;
}

export interface InterviewHistoryItem {
  id: string;
  session_id: string;
  company: string;
  round_type: string;
  scores_json: any;
  feedback_text: string;
  communication_metrics: any;
  technical_metrics: any;
  improvement_areas: string[];
  created_at: string;
}

export interface PlacementPrediction {
  id: string;
  placement_confidence: number;
  interview_readiness: number;
  hiring_probability: number;
  company_breakdown: any;
  risk_areas: string[];
  recommended_actions: string[];
}

export class CareerApi {
  public static async getProfile(): Promise<{ success: boolean; profile: CareerProfile }> {
    const res = await fetch(`${API_BASE}/profile`);
    return await res.json();
  }

  public static async updateProfile(data: any): Promise<{ success: boolean; profile: CareerProfile }> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async generateResume(data: {
    title?: string;
    targetRole: string;
    experienceLevel?: string;
    existingSkills?: string[];
    projects?: any[];
  }): Promise<{ success: boolean; resume: ResumeVersion }> {
    const res = await fetch(`${API_BASE}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getResumes(): Promise<{ success: boolean; resumes: ResumeVersion[] }> {
    const res = await fetch(`${API_BASE}/resume`);
    return await res.json();
  }

  public static async reviewResume(data: {
    resumeId?: string;
    resumeText: string;
    targetRole?: string;
  }): Promise<{ success: boolean; review: ResumeReview }> {
    const res = await fetch(`${API_BASE}/resume/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getJobs(targetRole?: string): Promise<{ success: boolean; matches: JobMatch[] }> {
    const url = targetRole ? `${API_BASE}/jobs?targetRole=${encodeURIComponent(targetRole)}` : `${API_BASE}/jobs`;
    const res = await fetch(url);
    return await res.json();
  }

  public static async generateRoadmap(data: {
    targetCompany: string;
    targetRole: string;
    interviewDate?: string;
    availableHoursPerDay?: number;
  }): Promise<{ success: boolean; roadmap: CareerRoadmap }> {
    const res = await fetch(`${API_BASE}/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getRoadmap(): Promise<{ success: boolean; roadmap: CareerRoadmap }> {
    const res = await fetch(`${API_BASE}/roadmap`);
    return await res.json();
  }

  public static async simulateRecruiter(data: {
    company: string;
    interviewType: string;
    candidateAnswer?: string;
    transcript?: any[];
  }): Promise<{
    success: boolean;
    aiQuestion: string;
    evaluation?: any;
    interviewRecord?: RecruiterInterview;
  }> {
    const res = await fetch(`${API_BASE}/recruiter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async analyzePortfolio(data: {
    githubUsername?: string;
    projectDescriptions?: string[];
  }): Promise<{ success: boolean; analysis: PortfolioAnalysis }> {
    const res = await fetch(`${API_BASE}/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  public static async getAnalytics(): Promise<{ success: boolean; analytics: CareerAnalyticsData }> {
    const res = await fetch(`${API_BASE}/analytics`);
    return await res.json();
  }

  public static async getInterviews(): Promise<{ success: boolean; interviews: InterviewHistoryItem[] }> {
    const res = await fetch(`${API_BASE}/interviews`);
    return await res.json();
  }

  public static async getPredictions(): Promise<{ success: boolean; prediction: PlacementPrediction }> {
    const res = await fetch(`${API_BASE}/predictions`);
    return await res.json();
  }

  public static async askCoach(data: {
    userQuery: string;
    topic?: string;
    targetCompany?: string;
    targetRole?: string;
  }): Promise<{
    success: boolean;
    advice: string;
    actionableSteps: string[];
    recommendedResources: string[];
  }> {
    const res = await fetch(`${API_BASE}/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  }
}
