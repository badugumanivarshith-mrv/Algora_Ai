import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export class ResearchRepository {
  // Research Operations
  public static async createResearchProject(userId: string, data: any) {
    const id = `res_${uuidv4()}`;
    const query = `
      INSERT INTO research_projects (id, owner_id, title, abstract, domain, status, visibility, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.title, data.abstract, data.domain, 
      data.status || 'Active', data.visibility || 'Public', data.metadata || {}
    ]);
    return rows[0];
  }

  public static async updateResearchProject(id: string, data: any) {
    const query = `
      UPDATE research_projects 
      SET title = COALESCE($1, title),
          abstract = COALESCE($2, abstract),
          status = COALESCE($3, status),
          visibility = COALESCE($4, visibility),
          metadata = metadata || $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      data.title, data.abstract, data.status, data.visibility, data.metadata || {}, id
    ]);
    return rows[0];
  }

  public static async getResearchProject(id: string) {
    const query = `SELECT * FROM research_projects WHERE id = $1;`;
    const { rows } = await Database.query(query, [id]);
    return rows[0];
  }

  public static async listResearchProjects(userId?: string) {
    const query = userId 
      ? `SELECT * FROM research_projects WHERE owner_id = $1 ORDER BY created_at DESC;`
      : `SELECT * FROM research_projects WHERE visibility = 'Public' ORDER BY created_at DESC;`;
    const { rows } = await Database.query(query, userId ? [userId] : []);
    return rows;
  }

  public static async saveResearchPaper(data: any) {
    const id = `paper_${uuidv4()}`;
    const query = `
      INSERT INTO research_papers (id, project_id, title, authors, publication_date, url, abstract, tags, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, data.project_id, data.title, data.authors, data.publication_date, 
      data.url, data.abstract, data.tags, data.metadata || {}
    ]);
    return rows[0];
  }

  public static async getResearchPaper(id: string) {
    const { rows } = await Database.query("SELECT * FROM research_papers WHERE id = $1;", [id]);
    return rows[0];
  }

  public static async saveLiteratureReview(userId: string, data: any) {
    const id = `lit_${uuidv4()}`;
    const query = `
      INSERT INTO literature_reviews (id, user_id, topic, summary, full_review, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.topic, data.summary, data.full_review, data.metadata || {}
    ]);
    return rows[0];
  }

  public static async getLiteratureReview(id: string) {
    const { rows } = await Database.query("SELECT * FROM literature_reviews WHERE id = $1;", [id]);
    return rows[0];
  }

  public static async saveCitation(userId: string, data: any) {
    const id = `cit_${uuidv4()}`;
    const query = `
      INSERT INTO citations (id, user_id, paper_title, citation_text, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, userId, data.paper_title, data.citation_text, data.metadata || {}]);
    return rows[0];
  }

  public static async getCitations(userId: string) {
    const { rows } = await Database.query("SELECT * FROM citations WHERE user_id = $1 ORDER BY created_at DESC;", [userId]);
    return rows;
  }

  // Open Source Operations
  public static async createOSSProject(data: any) {
    const id = `oss_${uuidv4()}`;
    const query = `
      INSERT INTO opensource_projects (id, name, repository_url, description, language, stars, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, data.name, data.repository_url, data.description, data.language, data.stars || 0, data.metadata || {}
    ]);
    return rows[0];
  }

  public static async saveContribution(userId: string, data: any) {
    const id = `cont_${uuidv4()}`;
    const query = `
      INSERT INTO opensource_contributions (id, user_id, project_id, contribution_type, description, impact_score, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.project_id, data.contribution_type, data.description, data.impact_score || 0, data.metadata || {}
    ]);
    return rows[0];
  }

  public static async savePullRequestReview(userId: string, data: any) {
    const id = `pr_${uuidv4()}`;
    const query = `
      INSERT INTO pull_request_reviews (id, user_id, project_id, pr_number, review_text, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.project_id, data.pr_number, data.review_text, data.metadata || {}
    ]);
    return rows[0];
  }

  public static async getContributionHistory(userId: string) {
    const query = `
      SELECT c.*, p.name as project_name 
      FROM opensource_contributions c
      JOIN opensource_projects p ON c.project_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC;
    `;
    const { rows } = await Database.query(query, [userId]);
    return rows;
  }

  // Innovation Operations
  public static async createStartupIdea(userId: string, data: any) {
    const id = `idea_${uuidv4()}`;
    const query = `
      INSERT INTO startup_ideas (id, user_id, title, problem_statement, solution_statement, market_size, evaluation_score, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.title, data.problem_statement, data.solution_statement, data.market_size, data.evaluation_score || 0, data.metadata || {}
    ]);
    return rows[0];
  }

  public static async createMvpRoadmap(userId: string, data: any) {
    const id = `mvp_${uuidv4()}`;
    const query = `
      INSERT INTO mvp_roadmaps (id, project_id, user_id, milestones)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, data.project_id, userId, data.milestones]);
    return rows[0];
  }

  public static async saveInnovationAnalytics(userId: string, data: any) {
    const id = `inna_${uuidv4()}`;
    const query = `
      INSERT INTO innovation_analytics (id, user_id, ideas_count, mvps_built, feasibility_avg, innovation_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        ideas_count = $3,
        mvps_built = $4,
        feasibility_avg = $5,
        innovation_score = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.ideas_count, data.mvps_built, data.feasibility_avg, data.innovation_score
    ]);
    return rows[0];
  }

  public static async getInnovationAnalytics(userId: string) {
    const { rows } = await Database.query("SELECT * FROM innovation_analytics WHERE user_id = $1;", [userId]);
    return rows[0];
  }

  // Analytics
  public static async saveResearchAnalytics(userId: string, data: any) {
    const id = `resa_${uuidv4()}`;
    const query = `
      INSERT INTO research_analytics (id, user_id, papers_read, projects_contributed, impact_factor, collaboration_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        papers_read = $3,
        projects_contributed = $4,
        impact_factor = $5,
        collaboration_score = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      id, userId, data.papers_read, data.projects_contributed, data.impact_factor, data.collaboration_score
    ]);
    return rows[0];
  }

  public static async getResearchAnalytics(userId: string) {
    const { rows } = await Database.query("SELECT * FROM research_analytics WHERE user_id = $1;", [userId]);
    return rows[0];
  }
}
