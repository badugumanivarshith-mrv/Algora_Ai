import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export class AIGenerationRepository {
  private static memoryStore: {
    problems: any[];
    quizzes: any[];
    assignments: any[];
    interviews: any[];
    contests: any[];
  } = {
    problems: [],
    quizzes: [],
    assignments: [],
    interviews: [],
    contests: [],
  };

  public static async saveProblem(data: any): Promise<any> {
    const pool = Database.getPool();
    if (!pool) {
      this.memoryStore.problems.unshift(data);
      return data;
    }
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO generated_problems (id, user_id, language, topic, difficulty, learning_level, title, problem_statement, constraints, input_format, output_format, sample_inputs, sample_outputs, explanation, tags, estimated_time, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO NOTHING;`,
        [
          data.id, data.userId || null, data.language, data.topic, data.difficulty, data.learningLevel,
          data.title, data.problemStatement, data.constraints, data.inputFormat, data.outputFormat,
          JSON.stringify(data.sampleInputs || []), JSON.stringify(data.sampleOutputs || []),
          data.explanation, JSON.stringify(data.tags || []), data.estimatedTime, data.createdAt || new Date().toISOString()
        ]
      );
      return data;
    } catch (err: any) {
      logger.error(`[AIGenerationRepository] saveProblem error: ${err.message}`);
      this.memoryStore.problems.unshift(data);
      return data;
    } finally {
      client.release();
    }
  }

  public static async saveQuiz(data: any): Promise<any> {
    const pool = Database.getPool();
    if (!pool) {
      this.memoryStore.quizzes.unshift(data);
      return data;
    }
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO generated_quizzes (id, user_id, topic, difficulty, title, questions, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING;`,
        [data.id, data.userId || null, data.topic, data.difficulty, data.title, JSON.stringify(data.questions || []), data.createdAt || new Date().toISOString()]
      );
      return data;
    } catch (err: any) {
      logger.error(`[AIGenerationRepository] saveQuiz error: ${err.message}`);
      this.memoryStore.quizzes.unshift(data);
      return data;
    } finally {
      client.release();
    }
  }

  public static async saveAssignment(data: any): Promise<any> {
    const pool = Database.getPool();
    if (!pool) {
      this.memoryStore.assignments.unshift(data);
      return data;
    }
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO generated_assignments (id, user_id, topic, difficulty, objective, requirements, tasks, evaluation_criteria, expected_completion_time, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [
          data.id, data.userId || null, data.topic, data.difficulty, data.objective,
          JSON.stringify(data.requirements || []), JSON.stringify(data.tasks || []),
          JSON.stringify(data.evaluationCriteria || []), data.expectedCompletionTime, data.createdAt || new Date().toISOString()
        ]
      );
      return data;
    } catch (err: any) {
      logger.error(`[AIGenerationRepository] saveAssignment error: ${err.message}`);
      this.memoryStore.assignments.unshift(data);
      return data;
    } finally {
      client.release();
    }
  }

  public static async saveInterview(data: any): Promise<any> {
    const pool = Database.getPool();
    if (!pool) {
      this.memoryStore.interviews.unshift(data);
      return data;
    }
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO generated_interviews (id, user_id, round_type, difficulty, questions, evaluation_guidelines, scoring_rubric, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING;`,
        [
          data.id, data.userId || null, data.roundType, data.difficulty,
          JSON.stringify(data.questions || []), data.evaluationGuidelines,
          JSON.stringify(data.scoringRubric || []), data.createdAt || new Date().toISOString()
        ]
      );
      return data;
    } catch (err: any) {
      logger.error(`[AIGenerationRepository] saveInterview error: ${err.message}`);
      this.memoryStore.interviews.unshift(data);
      return data;
    } finally {
      client.release();
    }
  }

  public static async saveContest(data: any): Promise<any> {
    const pool = Database.getPool();
    if (!pool) {
      this.memoryStore.contests.unshift(data);
      return data;
    }
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO generated_contests (id, user_id, name, description, duration_minutes, problem_set, difficulty_mix, scoring_rules, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [
          data.id, data.userId || null, data.name, data.description, data.durationMinutes,
          JSON.stringify(data.problemSet || []), data.difficultyMix, data.scoringRules, data.createdAt || new Date().toISOString()
        ]
      );
      return data;
    } catch (err: any) {
      logger.error(`[AIGenerationRepository] saveContest error: ${err.message}`);
      this.memoryStore.contests.unshift(data);
      return data;
    } finally {
      client.release();
    }
  }

  public static async getRecentProblems(limit = 10): Promise<any[]> {
    const pool = Database.getPool();
    if (!pool) return this.memoryStore.problems.slice(0, limit);
    const client = await pool.connect();
    try {
      const { rows } = await client.query(`SELECT * FROM generated_problems ORDER BY created_at DESC LIMIT $1;`, [limit]);
      return rows;
    } catch {
      return this.memoryStore.problems.slice(0, limit);
    } finally {
      client.release();
    }
  }

  public static async getRecentQuizzes(limit = 10): Promise<any[]> {
    const pool = Database.getPool();
    if (!pool) return this.memoryStore.quizzes.slice(0, limit);
    const client = await pool.connect();
    try {
      const { rows } = await client.query(`SELECT * FROM generated_quizzes ORDER BY created_at DESC LIMIT $1;`, [limit]);
      return rows;
    } catch {
      return this.memoryStore.quizzes.slice(0, limit);
    } finally {
      client.release();
    }
  }
}
