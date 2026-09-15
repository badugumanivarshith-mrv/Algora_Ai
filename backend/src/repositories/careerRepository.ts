import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface CareerProfileEntity {
  id: string;
  user_id: string;
  career_goal?: string;
  target_companies: string[];
  target_role?: string;
  experience_level?: string;
  preferred_tech_stack: string[];
  strength_areas: string[];
  weak_areas: string[];
  readiness_history: any[];
  learning_velocity: number;
  career_progression: any;
  created_at: string;
  updated_at: string;
}

export interface ResumeVersionEntity {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  template_id: string;
  content_json: any;
  ats_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeReviewEntity {
  id: string;
  resume_id: string;
  user_id: string;
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
  created_at: string;
}

export interface JobMatchEntity {
  id: string;
  user_id: string;
  company: string;
  role: string;
  match_percentage: number;
  skill_gaps: string[];
  recommended_topics: string[];
  recommended_problems: string[];
  created_at: string;
}

export interface CareerRoadmapEntity {
  id: string;
  user_id: string;
  target_company: string;
  target_role: string;
  interview_date?: string;
  daily_plan: any[];
  weekly_plan: any[];
  monthly_plan: any[];
  revision_schedule: any[];
  mock_schedule: any[];
  created_at: string;
}

export interface RecruiterInterviewEntity {
  id: string;
  user_id: string;
  company: string;
  interview_type: string;
  scores_json: any;
  communication_feedback: string;
  confidence_score: number;
  hiring_recommendation: string;
  transcript_json: any[];
  created_at: string;
}

export interface PortfolioAnalysisEntity {
  id: string;
  user_id: string;
  github_username?: string;
  portfolio_score: number;
  complexity_rating: string;
  tech_stack_detected: string[];
  architecture_score: number;
  documentation_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  created_at: string;
}

export interface CareerAnalyticsEntity {
  id: string;
  user_id: string;
  readiness_trends: any[];
  learning_velocity: number;
  interview_performance: any;
  contest_performance: any;
  skill_growth: any;
  company_readiness: any;
  placement_probability: number;
  updated_at: string;
}

export interface InterviewHistoryEntity {
  id: string;
  user_id: string;
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

export interface PlacementPredictionEntity {
  id: string;
  user_id: string;
  placement_confidence: number;
  interview_readiness: number;
  hiring_probability: number;
  company_breakdown: any;
  risk_areas: string[];
  recommended_actions: string[];
  updated_at: string;
}

export class CareerRepository {
  public static async upsertProfile(data: {
    userId: string;
    careerGoal?: string;
    targetCompanies?: string[];
    targetRole?: string;
    experienceLevel?: string;
    preferredTechStack?: string[];
    strengthAreas?: string[];
    weakAreas?: string[];
    learningVelocity?: number;
    careerProgression?: any;
  }): Promise<CareerProfileEntity> {
    const id = `cp_${data.userId}`;
    const res = await Database.query<CareerProfileEntity>(
      `INSERT INTO career_profiles 
        (id, user_id, career_goal, target_companies, target_role, experience_level, preferred_tech_stack, strength_areas, weak_areas, learning_velocity, career_progression, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
        career_goal = EXCLUDED.career_goal,
        target_companies = EXCLUDED.target_companies,
        target_role = EXCLUDED.target_role,
        experience_level = EXCLUDED.experience_level,
        preferred_tech_stack = EXCLUDED.preferred_tech_stack,
        strength_areas = EXCLUDED.strength_areas,
        weak_areas = EXCLUDED.weak_areas,
        learning_velocity = EXCLUDED.learning_velocity,
        career_progression = EXCLUDED.career_progression,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        id,
        data.userId,
        data.careerGoal || "Software Engineer",
        JSON.stringify(data.targetCompanies || ["Amazon", "Google"]),
        data.targetRole || "Backend Engineer",
        data.experienceLevel || "Mid-Level",
        JSON.stringify(data.preferredTechStack || ["TypeScript", "Node.js", "PostgreSQL"]),
        JSON.stringify(data.strengthAreas || ["Data Structures", "System Design"]),
        JSON.stringify(data.weakAreas || ["Dynamic Programming", "Graph Algorithms"]),
        data.learningVelocity || 1.2,
        JSON.stringify(data.careerProgression || { level: "L4", years: 2 }),
      ]
    );
    return res.rows[0];
  }

  public static async getProfile(userId: string): Promise<CareerProfileEntity | null> {
    const res = await Database.query<CareerProfileEntity>(
      `SELECT * FROM career_profiles WHERE user_id = $1 LIMIT 1;`,
      [userId]
    );
    return res.rows[0] || null;
  }

  public static async createResumeVersion(data: {
    userId: string;
    title: string;
    targetRole: string;
    templateId?: string;
    contentJson: any;
    atsScore?: number;
  }): Promise<ResumeVersionEntity> {
    const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<ResumeVersionEntity>(
      `INSERT INTO resume_versions 
        (id, user_id, title, target_role, template_id, content_json, ats_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        id,
        data.userId,
        data.title,
        data.targetRole,
        data.templateId || "modern",
        JSON.stringify(data.contentJson),
        data.atsScore || 85,
      ]
    );
    return res.rows[0];
  }

  public static async getResumeVersions(userId: string): Promise<ResumeVersionEntity[]> {
    const res = await Database.query<ResumeVersionEntity>(
      `SELECT * FROM resume_versions WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async saveResumeReview(data: {
    resumeId: string;
    userId: string;
    atsScore: number;
    skillGaps: string[];
    keywordMatches: string[];
    formattingScore: number;
    experienceQuality: string;
    projectQuality: string;
    achievementsScore: number;
    issues: string[];
    suggestions: string[];
    improvementPlan: string;
  }): Promise<ResumeReviewEntity> {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<ResumeReviewEntity>(
      `INSERT INTO resume_reviews 
        (id, resume_id, user_id, ats_score, skill_gaps, keyword_matches, formatting_score, experience_quality, project_quality, achievements_score, issues, suggestions, improvement_plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *;`,
      [
        id,
        data.resumeId,
        data.userId,
        data.atsScore,
        JSON.stringify(data.skillGaps),
        JSON.stringify(data.keywordMatches),
        data.formattingScore,
        data.experienceQuality,
        data.projectQuality,
        data.achievementsScore,
        JSON.stringify(data.issues),
        JSON.stringify(data.suggestions),
        data.improvementPlan,
      ]
    );
    return res.rows[0];
  }

  public static async getResumeReviews(resumeId: string): Promise<ResumeReviewEntity[]> {
    const res = await Database.query<ResumeReviewEntity>(
      `SELECT * FROM resume_reviews WHERE resume_id = $1 ORDER BY created_at DESC;`,
      [resumeId]
    );
    return res.rows;
  }

  public static async saveJobMatch(data: {
    userId: string;
    company: string;
    role: string;
    matchPercentage: number;
    skillGaps: string[];
    recommendedTopics: string[];
    recommendedProblems: string[];
  }): Promise<JobMatchEntity> {
    const id = `jm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<JobMatchEntity>(
      `INSERT INTO job_matches
        (id, user_id, company, role, match_percentage, skill_gaps, recommended_topics, recommended_problems)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [
        id,
        data.userId,
        data.company,
        data.role,
        data.matchPercentage,
        JSON.stringify(data.skillGaps),
        JSON.stringify(data.recommendedTopics),
        JSON.stringify(data.recommendedProblems),
      ]
    );
    return res.rows[0];
  }

  public static async getJobMatches(userId: string): Promise<JobMatchEntity[]> {
    const res = await Database.query<JobMatchEntity>(
      `SELECT * FROM job_matches WHERE user_id = $1 ORDER BY match_percentage DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async saveRoadmap(data: {
    userId: string;
    targetCompany: string;
    targetRole: string;
    interviewDate?: string;
    dailyPlan: any[];
    weeklyPlan: any[];
    monthlyPlan: any[];
    revisionSchedule: any[];
    mockSchedule: any[];
  }): Promise<CareerRoadmapEntity> {
    const id = `rm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<CareerRoadmapEntity>(
      `INSERT INTO career_roadmaps
        (id, user_id, target_company, target_role, interview_date, daily_plan, weekly_plan, monthly_plan, revision_schedule, mock_schedule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *;`,
      [
        id,
        data.userId,
        data.targetCompany,
        data.targetRole,
        data.interviewDate || null,
        JSON.stringify(data.dailyPlan),
        JSON.stringify(data.weeklyPlan),
        JSON.stringify(data.monthlyPlan),
        JSON.stringify(data.revisionSchedule),
        JSON.stringify(data.mockSchedule),
      ]
    );
    return res.rows[0];
  }

  public static async getRoadmap(userId: string): Promise<CareerRoadmapEntity | null> {
    const res = await Database.query<CareerRoadmapEntity>(
      `SELECT * FROM career_roadmaps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;`,
      [userId]
    );
    return res.rows[0] || null;
  }

  public static async saveRecruiterInterview(data: {
    userId: string;
    company: string;
    interviewType: string;
    scoresJson: any;
    communicationFeedback: string;
    confidenceScore: number;
    hiringRecommendation: string;
    transcriptJson: any[];
  }): Promise<RecruiterInterviewEntity> {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<RecruiterInterviewEntity>(
      `INSERT INTO recruiter_interviews
        (id, user_id, company, interview_type, scores_json, communication_feedback, confidence_score, hiring_recommendation, transcript_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        id,
        data.userId,
        data.company,
        data.interviewType,
        JSON.stringify(data.scoresJson),
        data.communicationFeedback,
        data.confidenceScore,
        data.hiringRecommendation,
        JSON.stringify(data.transcriptJson),
      ]
    );
    return res.rows[0];
  }

  public static async getRecruiterInterviews(userId: string): Promise<RecruiterInterviewEntity[]> {
    const res = await Database.query<RecruiterInterviewEntity>(
      `SELECT * FROM recruiter_interviews WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async savePortfolioAnalysis(data: {
    userId: string;
    githubUsername?: string;
    portfolioScore: number;
    complexityRating: string;
    techStackDetected: string[];
    architectureScore: number;
    documentationScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }): Promise<PortfolioAnalysisEntity> {
    const id = `pa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<PortfolioAnalysisEntity>(
      `INSERT INTO portfolio_analyses
        (id, user_id, github_username, portfolio_score, complexity_rating, tech_stack_detected, architecture_score, documentation_score, strengths, weaknesses, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *;`,
      [
        id,
        data.userId,
        data.githubUsername || null,
        data.portfolioScore,
        data.complexityRating,
        JSON.stringify(data.techStackDetected),
        data.architectureScore,
        data.documentationScore,
        JSON.stringify(data.strengths),
        JSON.stringify(data.weaknesses),
        JSON.stringify(data.recommendations),
      ]
    );
    return res.rows[0];
  }

  public static async getPortfolioAnalyses(userId: string): Promise<PortfolioAnalysisEntity[]> {
    const res = await Database.query<PortfolioAnalysisEntity>(
      `SELECT * FROM portfolio_analyses WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async upsertAnalytics(data: {
    userId: string;
    readinessTrends: any[];
    learningVelocity: number;
    interviewPerformance: any;
    contestPerformance: any;
    skillGrowth: any;
    companyReadiness: any;
    placementProbability: number;
  }): Promise<CareerAnalyticsEntity> {
    const id = `ca_${data.userId}`;
    const res = await Database.query<CareerAnalyticsEntity>(
      `INSERT INTO career_analytics
        (id, user_id, readiness_trends, learning_velocity, interview_performance, contest_performance, skill_growth, company_readiness, placement_probability, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
        readiness_trends = EXCLUDED.readiness_trends,
        learning_velocity = EXCLUDED.learning_velocity,
        interview_performance = EXCLUDED.interview_performance,
        contest_performance = EXCLUDED.contest_performance,
        skill_growth = EXCLUDED.skill_growth,
        company_readiness = EXCLUDED.company_readiness,
        placement_probability = EXCLUDED.placement_probability,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        id,
        data.userId,
        JSON.stringify(data.readinessTrends),
        data.learningVelocity,
        JSON.stringify(data.interviewPerformance),
        JSON.stringify(data.contestPerformance),
        JSON.stringify(data.skillGrowth),
        JSON.stringify(data.companyReadiness),
        data.placementProbability,
      ]
    );
    return res.rows[0];
  }

  public static async getAnalytics(userId: string): Promise<CareerAnalyticsEntity | null> {
    const res = await Database.query<CareerAnalyticsEntity>(
      `SELECT * FROM career_analytics WHERE user_id = $1 LIMIT 1;`,
      [userId]
    );
    return res.rows[0] || null;
  }

  public static async saveInterviewHistory(data: {
    userId: string;
    sessionId: string;
    company: string;
    roundType: string;
    scoresJson: any;
    feedbackText: string;
    communicationMetrics: any;
    technicalMetrics: any;
    improvementAreas: string[];
  }): Promise<InterviewHistoryEntity> {
    const id = `ih_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await Database.query<InterviewHistoryEntity>(
      `INSERT INTO interview_history
        (id, user_id, session_id, company, round_type, scores_json, feedback_text, communication_metrics, technical_metrics, improvement_areas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *;`,
      [
        id,
        data.userId,
        data.sessionId,
        data.company,
        data.roundType,
        JSON.stringify(data.scoresJson),
        data.feedbackText,
        JSON.stringify(data.communicationMetrics),
        JSON.stringify(data.technicalMetrics),
        JSON.stringify(data.improvementAreas),
      ]
    );
    return res.rows[0];
  }

  public static async getInterviewHistory(userId: string): Promise<InterviewHistoryEntity[]> {
    const res = await Database.query<InterviewHistoryEntity>(
      `SELECT * FROM interview_history WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async upsertPlacementPrediction(data: {
    userId: string;
    placementConfidence: number;
    interviewReadiness: number;
    hiringProbability: number;
    companyBreakdown: any;
    riskAreas: string[];
    recommendedActions: string[];
  }): Promise<PlacementPredictionEntity> {
    const id = `pp_${data.userId}`;
    const res = await Database.query<PlacementPredictionEntity>(
      `INSERT INTO placement_predictions
        (id, user_id, placement_confidence, interview_readiness, hiring_probability, company_breakdown, risk_areas, recommended_actions, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
        placement_confidence = EXCLUDED.placement_confidence,
        interview_readiness = EXCLUDED.interview_readiness,
        hiring_probability = EXCLUDED.hiring_probability,
        company_breakdown = EXCLUDED.company_breakdown,
        risk_areas = EXCLUDED.risk_areas,
        recommended_actions = EXCLUDED.recommended_actions,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        id,
        data.userId,
        data.placementConfidence,
        data.interviewReadiness,
        data.hiringProbability,
        JSON.stringify(data.companyBreakdown),
        JSON.stringify(data.riskAreas),
        JSON.stringify(data.recommendedActions),
      ]
    );
    return res.rows[0];
  }

  public static async getPlacementPrediction(userId: string): Promise<PlacementPredictionEntity | null> {
    const res = await Database.query<PlacementPredictionEntity>(
      `SELECT * FROM placement_predictions WHERE user_id = $1 LIMIT 1;`,
      [userId]
    );
    return res.rows[0] || null;
  }
}
