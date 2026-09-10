import { Database } from "../db/connection";
import { SubmissionEntity } from "../types";
import { db } from "../services/store";

export interface SubmissionFilters {
  userId?: string;
  problemSlug?: string;
  status?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export class SubmissionRepository {
  static async findMany(filters: SubmissionFilters = {}): Promise<{ submissions: SubmissionEntity[]; total: number }> {
    const pool = Database.getPool();

    if (pool) {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (filters.userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        values.push(filters.userId);
      }
      if (filters.problemSlug) {
        conditions.push(`problem_slug = $${paramIndex++}`);
        values.push(filters.problemSlug);
      }
      if (filters.status) {
        conditions.push(`LOWER(status) = LOWER($${paramIndex++})`);
        values.push(filters.status);
      }
      if (filters.language) {
        conditions.push(`LOWER(language) = LOWER($${paramIndex++})`);
        values.push(filters.language);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countResult = await Database.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM submissions ${whereClause};`,
        values
      );
      const total = parseInt(countResult.rows[0]?.count || "0", 10);

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const queryValues = [...values, limit, offset];
      const limitOffsetClause = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", problem_id as "problemId", problem_slug as "problemSlug",
                problem_title as "problemTitle", language, code, status, runtime_ms as "runtimeMs",
                memory_mb as "memoryMb", runtime_percentile as "runtimePercentile",
                memory_percentile as "memoryPercentile", passed_tests as "passedTests",
                total_tests as "totalTests", error_message as "errorMessage",
                compilation_error as "compilationError", test_cases_payload as "testCasesPayload",
                created_at as "createdAt"
         FROM submissions
         ${whereClause}
         ORDER BY created_at DESC
         ${limitOffsetClause};`,
        queryValues
      );

      const mapped: SubmissionEntity[] = rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        problemId: Number(r.problemId),
        problemSlug: r.problemSlug,
        problemTitle: r.problemTitle,
        language: r.language,
        code: r.code,
        status: r.status,
        runtimeMs: Number(r.runtimeMs),
        memoryMb: Number(r.memoryMb),
        runtimePercentile: Number(r.runtimePercentile || 85),
        memoryPercentile: Number(r.memoryPercentile || 80),
        passedTests: Number(r.passedTests || 0),
        totalTests: Number(r.totalTests || 0),
        errorMessage: r.errorMessage,
        compilationError: r.compilationError,
        testCasesPayload: r.testCasesPayload,
        createdAt: new Date(r.createdAt).toISOString(),
      }));

      return { submissions: mapped, total };
    }

    // In-memory fallback
    let list = Array.from(db.submissions.values());
    if (filters.userId) list = list.filter((s) => s.userId === filters.userId);
    if (filters.problemSlug) list = list.filter((s) => s.problemSlug === filters.problemSlug);
    if (filters.status) list = list.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
    if (filters.language) list = list.filter((s) => s.language.toLowerCase() === filters.language?.toLowerCase());

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;

    return { submissions: list.slice(offset, offset + limit), total };
  }

  static async create(submission: SubmissionEntity): Promise<SubmissionEntity> {
    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO submissions (id, user_id, problem_id, problem_slug, problem_title, language, code, status, runtime_ms, memory_mb, runtime_percentile, memory_percentile, passed_tests, total_tests, error_message, compilation_error, test_cases_payload, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`,
        [
          submission.id,
          submission.userId,
          submission.problemId,
          submission.problemSlug,
          submission.problemTitle,
          submission.language,
          submission.code,
          submission.status,
          submission.runtimeMs,
          submission.memoryMb,
          submission.runtimePercentile,
          submission.memoryPercentile,
          submission.passedTests,
          submission.totalTests,
          submission.errorMessage || null,
          submission.compilationError || null,
          submission.testCasesPayload || null,
          submission.createdAt,
        ]
      );
    }

    db.submissions.set(submission.id, submission);
    return submission;
  }

  static async findById(id: string): Promise<SubmissionEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      const { rows } = await Database.query<any>(
        `SELECT id, user_id as "userId", problem_id as "problemId", problem_slug as "problemSlug",
                problem_title as "problemTitle", language, code, status, runtime_ms as "runtimeMs",
                memory_mb as "memoryMb", runtime_percentile as "runtimePercentile",
                memory_percentile as "memoryPercentile", passed_tests as "passedTests",
                total_tests as "totalTests", error_message as "errorMessage",
                compilation_error as "compilationError", test_cases_payload as "testCasesPayload",
                created_at as "createdAt"
         FROM submissions WHERE id = $1 LIMIT 1;`,
        [id]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.userId,
        problemId: Number(r.problemId),
        problemSlug: r.problemSlug,
        problemTitle: r.problemTitle,
        language: r.language,
        code: r.code,
        status: r.status,
        runtimeMs: Number(r.runtimeMs),
        memoryMb: Number(r.memoryMb),
        runtimePercentile: Number(r.runtimePercentile),
        memoryPercentile: Number(r.memoryPercentile),
        passedTests: Number(r.passedTests),
        totalTests: Number(r.totalTests),
        errorMessage: r.errorMessage,
        compilationError: r.compilationError,
        testCasesPayload: r.testCasesPayload,
        createdAt: new Date(r.createdAt).toISOString(),
      };
    }

    return db.submissions.get(id) || null;
  }
}
