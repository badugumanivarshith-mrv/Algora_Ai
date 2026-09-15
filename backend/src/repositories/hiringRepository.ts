import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface AssessmentEntity {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  company: string;
  duration_minutes: number;
  difficulty: string;
  created_at: Date;
}

export interface AssessmentQuestionEntity {
  id: string;
  assessment_id: string;
  question_type: string;
  question_content: any;
  points: number;
}

export interface AssessmentAttemptEntity {
  id: string;
  assessment_id: string;
  user_id: string;
  score: number;
  rank: number;
  started_at: Date;
  completed_at?: Date;
}

export interface CandidateProfileEntity {
  id: string;
  user_id: string;
  readiness_score: number;
  overall_rating: number;
  updated_at: Date;
}

export interface CandidateRankingEntity {
  id: string;
  user_id: string;
  company: string;
  ranking_score: number;
  percentile: number;
}

export interface RecruiterFeedbackEntity {
  id: string;
  candidate_id: string;
  company: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  created_at: Date;
}

export interface HiringPipelineEntity {
  id: string;
  company: string;
  stage_name: string;
  description: string;
}

export interface HiringPredictionEntity {
  id: string;
  user_id: string;
  company: string;
  selection_probability: number;
  confidence_score: number;
  created_at: Date;
}

export class HiringRepository {
  public static async createAssessment(assessment: {
    title: string;
    description: string;
    assessmentType?: string;
    company?: string;
    durationMinutes?: number;
    difficulty?: string;
  }): Promise<AssessmentEntity> {
    const id = `asm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO assessments (id, title, description, assessment_type, company, duration_minutes, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        id,
        assessment.title,
        assessment.description,
        assessment.assessmentType || "Online Assessment",
        assessment.company || "Google",
        assessment.durationMinutes || 60,
        assessment.difficulty || "Medium",
      ]
    );
    return res.rows[0];
  }

  public static async getAssessments(company?: string): Promise<AssessmentEntity[]> {
    if (company) {
      const res = await Database.query(`SELECT * FROM assessments WHERE company = $1 ORDER BY created_at DESC;`, [company]);
      return res.rows;
    }
    const res = await Database.query(`SELECT * FROM assessments ORDER BY created_at DESC;`);
    return res.rows;
  }

  public static async getAssessmentById(id: string): Promise<AssessmentEntity | null> {
    const res = await Database.query(`SELECT * FROM assessments WHERE id = $1;`, [id]);
    return res.rows[0] || null;
  }

  public static async addQuestion(question: {
    assessmentId: string;
    questionType?: string;
    questionContent: any;
    points?: number;
  }): Promise<AssessmentQuestionEntity> {
    const id = `aq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO assessment_questions (id, assessment_id, question_type, question_content, points)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [id, question.assessmentId, question.questionType || "Coding", JSON.stringify(question.questionContent), question.points || 100]
    );
    return res.rows[0];
  }

  public static async getQuestions(assessmentId: string): Promise<AssessmentQuestionEntity[]> {
    const res = await Database.query(`SELECT * FROM assessment_questions WHERE assessment_id = $1;`, [assessmentId]);
    return res.rows;
  }

  public static async recordAttempt(attempt: {
    assessmentId: string;
    userId: string;
    score: number;
    rank?: number;
  }): Promise<AssessmentAttemptEntity> {
    const id = `aat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO assessment_attempts (id, assessment_id, user_id, score, rank, completed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [id, attempt.assessmentId, attempt.userId, attempt.score, attempt.rank || 1]
    );
    return res.rows[0];
  }

  public static async getAttempts(userId: string): Promise<AssessmentAttemptEntity[]> {
    const res = await Database.query(`SELECT * FROM assessment_attempts WHERE user_id = $1 ORDER BY started_at DESC;`, [userId]);
    return res.rows;
  }

  public static async upsertCandidateProfile(profile: {
    userId: string;
    readinessScore: number;
    overallRating: number;
  }): Promise<CandidateProfileEntity> {
    const id = `cp_${profile.userId}`;
    const res = await Database.query(
      `INSERT INTO candidate_profiles (id, user_id, readiness_score, overall_rating, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         readiness_score = EXCLUDED.readiness_score,
         overall_rating = EXCLUDED.overall_rating,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [id, profile.userId, profile.readinessScore, profile.overallRating]
    );
    return res.rows[0];
  }

  public static async getCandidateProfile(userId: string): Promise<CandidateProfileEntity | null> {
    const res = await Database.query(`SELECT * FROM candidate_profiles WHERE user_id = $1;`, [userId]);
    return res.rows[0] || null;
  }

  public static async upsertCandidateRanking(ranking: {
    userId: string;
    company: string;
    rankingScore: number;
    percentile: number;
  }): Promise<CandidateRankingEntity> {
    const id = `cr_${ranking.userId}_${ranking.company}`;
    const res = await Database.query(
      `INSERT INTO candidate_rankings (id, user_id, company, ranking_score, percentile)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, company) DO UPDATE SET
         ranking_score = EXCLUDED.ranking_score,
         percentile = EXCLUDED.percentile
       RETURNING *;`,
      [id, ranking.userId, ranking.company, ranking.rankingScore, ranking.percentile]
    );
    return res.rows[0];
  }

  public static async getCandidateRankings(userId: string): Promise<CandidateRankingEntity[]> {
    const res = await Database.query(`SELECT * FROM candidate_rankings WHERE user_id = $1;`, [userId]);
    return res.rows;
  }

  public static async saveRecruiterFeedback(feedback: {
    candidateId: string;
    company: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  }): Promise<RecruiterFeedbackEntity> {
    const id = `rf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO recruiter_feedback (id, candidate_id, company, strengths, weaknesses, recommendation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [id, feedback.candidateId, feedback.company, feedback.strengths, feedback.weaknesses, feedback.recommendation]
    );
    return res.rows[0];
  }

  public static async getRecruiterFeedback(candidateId: string): Promise<RecruiterFeedbackEntity[]> {
    const res = await Database.query(`SELECT * FROM recruiter_feedback WHERE candidate_id = $1 ORDER BY created_at DESC;`, [candidateId]);
    return res.rows;
  }

  public static async createHiringPipeline(pipeline: {
    company: string;
    stageName: string;
    description: string;
  }): Promise<HiringPipelineEntity> {
    const id = `hp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO hiring_pipelines (id, company, stage_name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [id, pipeline.company, pipeline.stageName, pipeline.description]
    );
    return res.rows[0];
  }

  public static async getHiringPipelines(company: string): Promise<HiringPipelineEntity[]> {
    const res = await Database.query(`SELECT * FROM hiring_pipelines WHERE company = $1;`, [company]);
    return res.rows;
  }

  public static async upsertHiringPrediction(pred: {
    userId: string;
    company: string;
    selectionProbability: number;
    confidenceScore: number;
  }): Promise<HiringPredictionEntity> {
    const id = `hpred_${pred.userId}_${pred.company}`;
    const res = await Database.query(
      `INSERT INTO hiring_predictions (id, user_id, company, selection_probability, confidence_score)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, company) DO UPDATE SET
         selection_probability = EXCLUDED.selection_probability,
         confidence_score = EXCLUDED.confidence_score,
         created_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [id, pred.userId, pred.company, pred.selectionProbability, pred.confidenceScore]
    );
    return res.rows[0];
  }

  public static async getHiringPredictions(userId: string): Promise<HiringPredictionEntity[]> {
    const res = await Database.query(`SELECT * FROM hiring_predictions WHERE user_id = $1;`, [userId]);
    return res.rows;
  }
}
