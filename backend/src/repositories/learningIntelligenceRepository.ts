import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface KnowledgeNodeEntity {
  id: string;
  topic: string;
  subtopic: string;
  category: string;
  difficulty_level: string;
  description: string;
  prerequisites: string[];
  created_at: Date;
}

export interface KnowledgeEdgeEntity {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  weight: number;
  created_at: Date;
}

export interface LearningPathEntity {
  id: string;
  user_id: string;
  path_name: string;
  target_goal: string;
  node_sequence: any[];
  progress_percentage: number;
  current_node_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MasteryScoreEntity {
  id: string;
  user_id: string;
  topic: string;
  subtopic: string;
  mastery_rating: number;
  retention_score: number;
  revision_score: number;
  difficulty_score: number;
  last_practiced_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TopicDependencyEntity {
  id: string;
  topic: string;
  parent_topic: string;
  dependency_type: string;
  importance_rating: number;
  created_at: Date;
}

export interface KnowledgeGapEntity {
  id: string;
  user_id: string;
  gap_type: string; // missing_prerequisite, weak_concept, repeated_mistake, interview_weakness
  topic: string;
  subtopic?: string;
  severity: string;
  detected_reason: string;
  remediation_action: string;
  is_resolved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface KnowledgePredictionEntity {
  id: string;
  user_id: string;
  prediction_type: string; // topic_fail, topic_forget, interview_risk, placement_risk
  topic?: string;
  risk_probability: number;
  prediction_reason: string;
  suggested_prevention: string;
  created_at: Date;
}

export interface LearningRecommendationEntity {
  id: string;
  user_id: string;
  recommendation_type: string; // next_topic, revision_schedule, contest_suggestion, company_prep
  title: string;
  description: string;
  target_resource?: string;
  priority: string;
  is_completed: boolean;
  created_at: Date;
}

export class LearningIntelligenceRepository {
  public static async upsertKnowledgeNode(node: {
    id: string;
    topic: string;
    subtopic: string;
    category: string;
    difficulty_level?: string;
    description?: string;
    prerequisites?: string[];
  }): Promise<KnowledgeNodeEntity> {
    const res = await Database.query(
      `INSERT INTO knowledge_nodes (id, topic, subtopic, category, difficulty_level, description, prerequisites)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         topic = EXCLUDED.topic,
         subtopic = EXCLUDED.subtopic,
         category = EXCLUDED.category,
         difficulty_level = EXCLUDED.difficulty_level,
         description = EXCLUDED.description,
         prerequisites = EXCLUDED.prerequisites
       RETURNING *;`,
      [
        node.id,
        node.topic,
        node.subtopic,
        node.category,
        node.difficulty_level || "Medium",
        node.description || "",
        JSON.stringify(node.prerequisites || []),
      ]
    );
    return res.rows[0];
  }

  public static async getKnowledgeNodes(): Promise<KnowledgeNodeEntity[]> {
    const res = await Database.query(`SELECT * FROM knowledge_nodes ORDER BY category, topic;`);
    return res.rows;
  }

  public static async upsertKnowledgeEdge(edge: {
    id: string;
    source_node_id: string;
    target_node_id: string;
    relationship_type?: string;
    weight?: number;
  }): Promise<KnowledgeEdgeEntity> {
    const res = await Database.query(
      `INSERT INTO knowledge_edges (id, source_node_id, target_node_id, relationship_type, weight)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         relationship_type = EXCLUDED.relationship_type,
         weight = EXCLUDED.weight
       RETURNING *;`,
      [
        edge.id,
        edge.source_node_id,
        edge.target_node_id,
        edge.relationship_type || "prerequisite",
        edge.weight || 1.0,
      ]
    );
    return res.rows[0];
  }

  public static async getKnowledgeEdges(): Promise<KnowledgeEdgeEntity[]> {
    const res = await Database.query(`SELECT * FROM knowledge_edges;`);
    return res.rows;
  }

  public static async saveLearningPath(path: {
    userId: string;
    pathName: string;
    targetGoal: string;
    nodeSequence: any[];
    progressPercentage?: number;
    currentNodeId?: string;
  }): Promise<LearningPathEntity> {
    const id = `lp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO learning_paths (id, user_id, path_name, target_goal, node_sequence, progress_percentage, current_node_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        id,
        path.userId,
        path.pathName,
        path.targetGoal,
        JSON.stringify(path.nodeSequence || []),
        path.progressPercentage || 0,
        path.currentNodeId || null,
      ]
    );
    return res.rows[0];
  }

  public static async getLearningPaths(userId: string): Promise<LearningPathEntity[]> {
    const res = await Database.query(
      `SELECT * FROM learning_paths WHERE user_id = $1 ORDER BY updated_at DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async upsertMasteryScore(score: {
    userId: string;
    topic: string;
    subtopic: string;
    masteryRating: number;
    retentionScore: number;
    revisionScore: number;
    difficultyScore: number;
  }): Promise<MasteryScoreEntity> {
    const id = `ms_${score.userId}_${score.topic.replace(/\s+/g, "_")}_${score.subtopic.replace(/\s+/g, "_")}`;
    const res = await Database.query(
      `INSERT INTO mastery_scores (id, user_id, topic, subtopic, mastery_rating, retention_score, revision_score, difficulty_score, last_practiced_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, topic, subtopic) DO UPDATE SET
         mastery_rating = EXCLUDED.mastery_rating,
         retention_score = EXCLUDED.retention_score,
         revision_score = EXCLUDED.revision_score,
         difficulty_score = EXCLUDED.difficulty_score,
         last_practiced_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        id,
        score.userId,
        score.topic,
        score.subtopic,
        score.masteryRating,
        score.retentionScore,
        score.revisionScore,
        score.difficultyScore,
      ]
    );
    return res.rows[0];
  }

  public static async getMasteryScores(userId: string): Promise<MasteryScoreEntity[]> {
    const res = await Database.query(
      `SELECT * FROM mastery_scores WHERE user_id = $1 ORDER BY mastery_rating DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async upsertDependency(dep: {
    id: string;
    topic: string;
    parentTopic: string;
    dependencyType?: string;
    importanceRating?: number;
  }): Promise<TopicDependencyEntity> {
    const res = await Database.query(
      `INSERT INTO topic_dependencies (id, topic, parent_topic, dependency_type, importance_rating)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         dependency_type = EXCLUDED.dependency_type,
         importance_rating = EXCLUDED.importance_rating
       RETURNING *;`,
      [
        dep.id,
        dep.topic,
        dep.parentTopic,
        dep.dependencyType || "hard_prerequisite",
        dep.importanceRating || 5.0,
      ]
    );
    return res.rows[0];
  }

  public static async getTopicDependencies(): Promise<TopicDependencyEntity[]> {
    const res = await Database.query(`SELECT * FROM topic_dependencies;`);
    return res.rows;
  }

  public static async saveKnowledgeGap(gap: {
    userId: string;
    gapType: string;
    topic: string;
    subtopic?: string;
    severity?: string;
    detectedReason: string;
    remediationAction: string;
  }): Promise<KnowledgeGapEntity> {
    const id = `kg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO knowledge_gaps (id, user_id, gap_type, topic, subtopic, severity, detected_reason, remediation_action)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [
        id,
        gap.userId,
        gap.gapType,
        gap.topic,
        gap.subtopic || null,
        gap.severity || "Medium",
        gap.detectedReason,
        gap.remediationAction,
      ]
    );
    return res.rows[0];
  }

  public static async getKnowledgeGaps(userId: string): Promise<KnowledgeGapEntity[]> {
    const res = await Database.query(
      `SELECT * FROM knowledge_gaps WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async saveKnowledgePrediction(pred: {
    userId: string;
    predictionType: string;
    topic?: string;
    riskProbability: number;
    predictionReason: string;
    suggestedPrevention: string;
  }): Promise<KnowledgePredictionEntity> {
    const id = `kp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO knowledge_predictions (id, user_id, prediction_type, topic, risk_probability, prediction_reason, suggested_prevention)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        id,
        pred.userId,
        pred.predictionType,
        pred.topic || null,
        pred.riskProbability,
        pred.predictionReason,
        pred.suggestedPrevention,
      ]
    );
    return res.rows[0];
  }

  public static async getKnowledgePredictions(userId: string): Promise<KnowledgePredictionEntity[]> {
    const res = await Database.query(
      `SELECT * FROM knowledge_predictions WHERE user_id = $1 ORDER BY risk_probability DESC;`,
      [userId]
    );
    return res.rows;
  }

  public static async saveRecommendation(rec: {
    userId: string;
    recommendationType: string;
    title: string;
    description: string;
    targetResource?: string;
    priority?: string;
  }): Promise<LearningRecommendationEntity> {
    const id = `lr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await Database.query(
      `INSERT INTO learning_recommendations (id, user_id, recommendation_type, title, description, target_resource, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        id,
        rec.userId,
        rec.recommendationType,
        rec.title,
        rec.description,
        rec.targetResource || null,
        rec.priority || "High",
      ]
    );
    return res.rows[0];
  }

  public static async getRecommendations(userId: string): Promise<LearningRecommendationEntity[]> {
    const res = await Database.query(
      `SELECT * FROM learning_recommendations WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }
}
