import { Database } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export interface ProjectWorkspaceEntity {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  status: string;
  repository_url?: string;
  live_demo_url?: string;
  tags?: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ProjectTaskEntity {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: string;
  priority: string;
  due_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface InternshipProgramEntity {
  id: string;
  company_name: string;
  title: string;
  description?: string;
  stipend?: string;
  duration?: string;
  location?: string;
  tags?: string[];
  created_at?: Date;
}

export class ProjectWorkspaceRepository {
  // Workspace Management
  public static async createWorkspace(data: Partial<ProjectWorkspaceEntity>): Promise<ProjectWorkspaceEntity> {
    const id = data.id || `pw_${uuidv4()}`;
    const query = `
      INSERT INTO project_workspaces (id, name, description, owner_id, status, repository_url, live_demo_url, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query<ProjectWorkspaceEntity>(query, [
      id,
      data.name,
      data.description,
      data.owner_id,
      data.status || 'Active',
      data.repository_url,
      data.live_demo_url,
      data.tags || []
    ]);
    return rows[0];
  }

  public static async updateWorkspace(id: string, data: Partial<ProjectWorkspaceEntity>): Promise<ProjectWorkspaceEntity> {
    const query = `
      UPDATE project_workspaces
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          repository_url = COALESCE($4, repository_url),
          live_demo_url = COALESCE($5, live_demo_url),
          tags = COALESCE($6, tags),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const { rows } = await Database.query<ProjectWorkspaceEntity>(query, [
      data.name,
      data.description,
      data.status,
      data.repository_url,
      data.live_demo_url,
      data.tags,
      id
    ]);
    return rows[0];
  }

  public static async deleteWorkspace(id: string): Promise<void> {
    await Database.query("DELETE FROM project_workspaces WHERE id = $1;", [id]);
  }

  public static async getWorkspace(id: string): Promise<ProjectWorkspaceEntity | null> {
    const { rows } = await Database.query<ProjectWorkspaceEntity>("SELECT * FROM project_workspaces WHERE id = $1;", [id]);
    return rows[0] || null;
  }

  public static async listWorkspaces(userId: string): Promise<ProjectWorkspaceEntity[]> {
    const query = `
      SELECT pw.* FROM project_workspaces pw
      LEFT JOIN project_members pm ON pw.id = pm.workspace_id
      WHERE pw.owner_id = $1 OR pm.user_id = $1
      ORDER BY pw.updated_at DESC;
    `;
    const { rows } = await Database.query<ProjectWorkspaceEntity>(query, [userId]);
    return rows;
  }

  // Task Management
  public static async createTask(data: Partial<ProjectTaskEntity>): Promise<ProjectTaskEntity> {
    const id = data.id || `pt_${uuidv4()}`;
    const query = `
      INSERT INTO project_tasks (id, workspace_id, title, description, assigned_to, status, priority, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query<ProjectTaskEntity>(query, [
      id,
      data.workspace_id,
      data.title,
      data.description,
      data.assigned_to,
      data.status || 'Todo',
      data.priority || 'Medium',
      data.due_date
    ]);
    return rows[0];
  }

  public static async updateTask(id: string, data: Partial<ProjectTaskEntity>): Promise<ProjectTaskEntity> {
    const query = `
      UPDATE project_tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          assigned_to = COALESCE($3, assigned_to),
          status = COALESCE($4, status),
          priority = COALESCE($5, priority),
          due_date = COALESCE($6, due_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const { rows } = await Database.query<ProjectTaskEntity>(query, [
      data.title,
      data.description,
      data.assigned_to,
      data.status,
      data.priority,
      data.due_date,
      id
    ]);
    return rows[0];
  }

  public static async getTasks(workspaceId: string): Promise<ProjectTaskEntity[]> {
    const { rows } = await Database.query<ProjectTaskEntity>("SELECT * FROM project_tasks WHERE workspace_id = $1 ORDER BY created_at ASC;", [workspaceId]);
    return rows;
  }

  // Milestone Management
  public static async createMilestone(data: any): Promise<any> {
    const id = `pmil_${uuidv4()}`;
    const query = `
      INSERT INTO project_milestones (id, workspace_id, title, description, status, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, data.workspace_id, data.title, data.description, data.status || 'Pending', data.due_date]);
    return rows[0];
  }

  public static async getMilestones(workspaceId: string): Promise<any[]> {
    const { rows } = await Database.query("SELECT * FROM project_milestones WHERE workspace_id = $1 ORDER BY due_date ASC;", [workspaceId]);
    return rows;
  }

  // Internship Management
  public static async createInternship(data: any): Promise<any> {
    const id = `int_${uuidv4()}`;
    const query = `
      INSERT INTO internship_programs (id, company_name, title, description, stipend, duration, location, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, data.company_name, data.title, data.description, data.stipend, data.duration, data.location, data.tags || []]);
    return rows[0];
  }

  public static async listInternships(): Promise<any[]> {
    const { rows } = await Database.query("SELECT * FROM internship_programs ORDER BY created_at DESC;");
    return rows;
  }

  public static async applyInternship(internshipId: string, userId: string): Promise<any> {
    const id = `ia_${uuidv4()}`;
    const query = `
      INSERT INTO internship_applications (id, internship_id, user_id, status)
      VALUES ($1, $2, $3, 'Applied')
      ON CONFLICT (internship_id, user_id) DO UPDATE SET status = 'Applied'
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [id, internshipId, userId]);
    return rows[0];
  }

  public static async updateInternshipProgress(internshipId: string, userId: string, data: any): Promise<any> {
    const query = `
      INSERT INTO internship_progress (id, internship_id, user_id, task_completed, mentor_feedback, overall_rating, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (internship_id, user_id) DO UPDATE
      SET task_completed = COALESCE($4, internship_progress.task_completed),
          mentor_feedback = COALESCE($5, internship_progress.mentor_feedback),
          overall_rating = COALESCE($6, internship_progress.overall_rating),
          status = COALESCE($7, internship_progress.status),
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      `ip_${uuidv4()}`,
      internshipId,
      userId,
      data.task_completed,
      data.mentor_feedback,
      data.overall_rating,
      data.status
    ]);
    return rows[0];
  }

  // Analytics
  public static async saveAnalytics(workspaceId: string, data: any): Promise<any> {
    const query = `
      INSERT INTO project_analytics (id, workspace_id, completion_rate, milestone_performance, team_productivity, quality_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (workspace_id) DO UPDATE
      SET completion_rate = $3,
          milestone_performance = $4,
          team_productivity = $5,
          quality_score = $6,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await Database.query(query, [
      `pa_${uuidv4()}`,
      workspaceId,
      data.completion_rate,
      data.milestone_performance,
      data.team_productivity,
      data.quality_score
    ]);
    return rows[0];
  }

  public static async getAnalytics(workspaceId: string): Promise<any | null> {
    const { rows } = await Database.query("SELECT * FROM project_analytics WHERE workspace_id = $1;", [workspaceId]);
    return rows[0] || null;
  }

  // Skill Tracking
  public static async saveSkillProgress(workspaceId: string, userId: string, skills: any[]): Promise<void> {
    for (const skill of skills) {
      const query = `
        INSERT INTO project_skills (id, workspace_id, user_id, skill_name, category, proficiency_gain)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await Database.query(query, [
        `ps_${uuidv4()}`,
        workspaceId,
        userId,
        skill.name,
        skill.category,
        skill.gain || 1
      ]);
    }
  }

  public static async getSkillProgress(userId: string): Promise<any[]> {
    const query = `
      SELECT skill_name, category, SUM(proficiency_gain) as total_gain
      FROM project_skills
      WHERE user_id = $1
      GROUP BY skill_name, category
      ORDER BY total_gain DESC;
    `;
    const { rows } = await Database.query(query, [userId]);
    return rows;
  }
}
