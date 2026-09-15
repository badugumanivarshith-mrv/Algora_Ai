import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export class KnowledgeFabricRepository {
  // Entity Management
  public static async upsertEntity(entity: {
    id?: string;
    name: string;
    entityType: string;
    description?: string;
    metadata?: any;
  }) {
    const id = entity.id || `ent_${uuidv4()}`;
    const query = `
      INSERT INTO global_entities (id, name, entity_type, description, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        metadata = global_entities.metadata || EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, entity.name, entity.entityType, entity.description, entity.metadata || {}]);
    return rows[0];
  }

  public static async getEntities(type?: string) {
    const query = type 
      ? `SELECT * FROM global_entities WHERE entity_type = $1 ORDER BY name ASC;`
      : `SELECT * FROM global_entities ORDER BY name ASC;`;
    const { rows } = await Database.query(query, type ? [type] : []);
    return rows;
  }

  // Relationship Management
  public static async upsertRelationship(rel: {
    sourceId: string;
    targetId: string;
    relationshipType: string;
    weight?: number;
    metadata?: any;
  }) {
    const id = `rel_${uuidv4()}`;
    const query = `
      INSERT INTO entity_relationships (id, source_id, target_id, relationship_type, weight, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (source_id, target_id, relationship_type) DO UPDATE SET
        weight = EXCLUDED.weight,
        metadata = entity_relationships.metadata || EXCLUDED.metadata
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, rel.sourceId, rel.targetId, rel.relationshipType, rel.weight || 1.0, rel.metadata || {}]);
    return rows[0];
  }

  public static async getRelationships(entityId?: string) {
    const query = entityId
      ? `SELECT * FROM entity_relationships WHERE source_id = $1 OR target_id = $1;`
      : `SELECT * FROM entity_relationships;`;
    const { rows } = await Database.query(query, entityId ? [entityId] : []);
    return rows;
  }

  // Intelligence Profile
  public static async updateIntelligenceProfile(userId: string, data: any) {
    const query = `
      INSERT INTO user_intelligence_profiles (
        user_id, overall_mastery, learning_velocity, hiring_readiness, 
        career_progress, research_impact, project_completion_rate, 
        top_skills, skill_distribution, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        overall_mastery = EXCLUDED.overall_mastery,
        learning_velocity = EXCLUDED.learning_velocity,
        hiring_readiness = EXCLUDED.hiring_readiness,
        career_progress = EXCLUDED.career_progress,
        research_impact = EXCLUDED.research_impact,
        project_completion_rate = EXCLUDED.project_completion_rate,
        top_skills = EXCLUDED.top_skills,
        skill_distribution = EXCLUDED.skill_distribution,
        updated_at = NOW()
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      userId, 
      data.overallMastery || 0,
      data.learningVelocity || 0,
      data.hiringReadiness || 0,
      data.careerProgress || 0,
      data.researchImpact || 0,
      data.projectCompletionRate || 0,
      data.topSkills || [],
      data.skillDistribution || {}
    ]);
    return rows[0];
  }

  public static async getIntelligenceProfile(userId: string) {
    const { rows } = await Database.query(`SELECT * FROM user_intelligence_profiles WHERE user_id = $1;`, [userId]);
    return rows[0];
  }

  // Cross-Domain Insights
  public static async createInsight(userId: string, insight: {
    title: string;
    insightType: string;
    description: string;
    recommendation?: string;
    metadata?: any;
  }) {
    const id = `ins_${uuidv4()}`;
    const query = `
      INSERT INTO cross_domain_insights (id, user_id, title, insight_type, description, recommendation, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, insight.title, insight.insightType, insight.description, insight.recommendation, insight.metadata || {}
    ]);
    return rows[0];
  }

  public static async getInsights(userId: string) {
    const { rows } = await Database.query(
      `SELECT * FROM cross_domain_insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20;`,
      [userId]
    );
    return rows;
  }

  // Memory Events
  public static async logMemoryEvent(userId: string, entityId: string | null, eventType: string, payload: any) {
    const query = `
      INSERT INTO memory_events (user_id, entity_id, event_type, payload)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [userId, entityId, eventType, payload]);
    return rows[0];
  }

  public static async getRecentEvents(userId: string, limit: number = 50) {
    const query = `
      SELECT e.*, g.name as entity_name 
      FROM memory_events e
      LEFT JOIN global_entities g ON e.entity_id = g.id
      WHERE e.user_id = $1
      ORDER BY e.timestamp DESC
      LIMIT $2;
    `;
    const { rows } = await Database.query(query, [userId, limit]);
    return rows;
  }
}
