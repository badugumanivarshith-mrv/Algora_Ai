import { Database } from "../db/connection";
import { ExecutionJobEntity, SubmissionResultEntity, ExecutionMetrics } from "../services/execution/types";
import { logger } from "../utils/logger";

export class ExecutionJobRepository {
  private inMemoryJobs: Map<string, ExecutionJobEntity> = new Map();
  private inMemoryResults: Map<string, SubmissionResultEntity> = new Map();

  /**
   * Insert a new execution job
   */
  async createJob(job: ExecutionJobEntity): Promise<ExecutionJobEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await Database.query(
          `INSERT INTO execution_jobs 
          (id, user_id, problem_id, problem_slug, language, code, custom_input, job_type, status, verdict, execution_time_ms, memory_mb, compile_output, stdout, stderr, test_cases_total, test_cases_passed, test_case_results, error_message, created_at, started_at, completed_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          RETURNING *`,
          [
            job.id,
            job.userId || null,
            job.problemId || null,
            job.problemSlug,
            job.language,
            job.code,
            job.customInput || null,
            job.jobType,
            job.status,
            job.verdict,
            job.executionTimeMs,
            job.memoryMb,
            job.compileOutput || null,
            job.stdout || null,
            job.stderr || null,
            job.testCasesTotal,
            job.testCasesPassed,
            JSON.stringify(job.testCaseResults || []),
            job.errorMessage || null,
            job.createdAt,
            job.startedAt || null,
            job.completedAt || null,
          ]
        );
        if (res.rows.length > 0) return this.mapRow(res.rows[0]);
      } catch (err: any) {
        logger.debug(`[ExecutionJobRepository] SQL fallback for createJob: ${err?.message}`);
      }
    }

    this.inMemoryJobs.set(job.id, { ...job });
    return job;
  }

  /**
   * Update an existing job status and verdict
   */
  async updateJob(jobId: string, updates: Partial<ExecutionJobEntity>): Promise<ExecutionJobEntity | null> {
    const current = await this.getJobById(jobId);
    if (!current) return null;

    const merged: ExecutionJobEntity = { ...current, ...updates };

    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await Database.query(
          `UPDATE execution_jobs 
           SET status = $1, verdict = $2, execution_time_ms = $3, memory_mb = $4, compile_output = $5, stdout = $6, stderr = $7, test_cases_passed = $8, test_case_results = $9, error_message = $10, started_at = $11, completed_at = $12
           WHERE id = $13
           RETURNING *`,
          [
            merged.status,
            merged.verdict,
            merged.executionTimeMs,
            merged.memoryMb,
            merged.compileOutput || null,
            merged.stdout || null,
            merged.stderr || null,
            merged.testCasesPassed,
            JSON.stringify(merged.testCaseResults || []),
            merged.errorMessage || null,
            merged.startedAt || null,
            merged.completedAt || null,
            jobId,
          ]
        );
        if (res.rows.length > 0) return this.mapRow(res.rows[0]);
      } catch (err: any) {
        logger.debug(`[ExecutionJobRepository] SQL fallback for updateJob: ${err?.message}`);
      }
    }

    this.inMemoryJobs.set(jobId, merged);
    return merged;
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<ExecutionJobEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await Database.query(`SELECT * FROM execution_jobs WHERE id = $1`, [jobId]);
        if (res.rows.length > 0) return this.mapRow(res.rows[0]);
      } catch (err: any) {
        logger.debug(`[ExecutionJobRepository] SQL fallback for getJobById: ${err?.message}`);
      }
    }

    return this.inMemoryJobs.get(jobId) || null;
  }

  /**
   * Record scored submission result
   */
  async createSubmissionResult(res: SubmissionResultEntity): Promise<SubmissionResultEntity> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const qRes = await Database.query(
          `INSERT INTO submission_results 
          (id, job_id, submission_id, user_id, problem_slug, language, verdict, runtime_ms, memory_mb, test_cases_passed, test_cases_total, xp_awarded, code_size_bytes, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *`,
          [
            res.id,
            res.jobId,
            res.submissionId || null,
            res.userId || null,
            res.problemSlug,
            res.language,
            res.verdict,
            res.runtimeMs,
            res.memoryMb,
            res.testCasesPassed,
            res.testCasesTotal,
            res.xpAwarded,
            res.codeSizeBytes,
            res.createdAt,
          ]
        );
        if (qRes.rows.length > 0) return qRes.rows[0];
      } catch (err: any) {
        logger.debug(`[ExecutionJobRepository] SQL fallback for createSubmissionResult: ${err?.message}`);
      }
    }

    this.inMemoryResults.set(res.id, { ...res });
    return res;
  }

  /**
   * Get submission result by submission ID or job ID
   */
  async getSubmissionResult(idOrJobId: string): Promise<SubmissionResultEntity | null> {
    const pool = Database.getPool();
    if (pool) {
      try {
        const res = await Database.query(
          `SELECT * FROM submission_results WHERE id = $1 OR job_id = $1 OR submission_id = $1 LIMIT 1`,
          [idOrJobId]
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (err: any) {
        logger.debug(`[ExecutionJobRepository] SQL fallback for getSubmissionResult: ${err?.message}`);
      }
    }

    for (const r of this.inMemoryResults.values()) {
      if (r.id === idOrJobId || r.jobId === idOrJobId || r.submissionId === idOrJobId) {
        return r;
      }
    }
    return null;
  }

  /**
   * Get telemetry metrics for judge admin dashboard
   */
  async getMetrics(): Promise<ExecutionMetrics> {
    const jobs: ExecutionJobEntity[] = Array.from(this.inMemoryJobs.values());
    const activeJobs = jobs.filter(
      (j) => j.status === "queued" || j.status === "compiling" || j.status === "executing"
    ).length;
    const queuedJobs = jobs.filter((j) => j.status === "queued").length;
    const acceptedCount = jobs.filter((j) => j.verdict === "Accepted").length;

    const verdictBreakdown: Record<string, number> = {
      Accepted: 0,
      "Wrong Answer": 0,
      "Time Limit Exceeded": 0,
      "Memory Limit Exceeded": 0,
      "Runtime Error": 0,
      "Compilation Error": 0,
      "Internal Error": 0,
    };

    let totalTime = 0;
    jobs.forEach((j) => {
      verdictBreakdown[j.verdict] = (verdictBreakdown[j.verdict] || 0) + 1;
      if (j.executionTimeMs > 0) totalTime += j.executionTimeMs;
    });

    const total = jobs.length;
    const avgTime = total > 0 ? +(totalTime / total).toFixed(1) : 0;
    const successRate = total > 0 ? +((acceptedCount / total) * 100).toFixed(1) : 100;

    return {
      activeJobs,
      queueLength: queuedJobs,
      totalExecuted: total,
      successRate,
      avgExecutionTimeMs: avgTime,
      verdictBreakdown,
    };
  }

  private mapRow(row: any): ExecutionJobEntity {
    return {
      id: row.id,
      userId: row.user_id,
      problemId: row.problem_id,
      problemSlug: row.problem_slug,
      language: row.language,
      code: row.code,
      customInput: row.custom_input,
      jobType: row.job_type,
      status: row.status,
      verdict: row.verdict,
      executionTimeMs: parseFloat(row.execution_time_ms || 0),
      memoryMb: parseFloat(row.memory_mb || 0),
      compileOutput: row.compile_output,
      stdout: row.stdout,
      stderr: row.stderr,
      testCasesTotal: parseInt(row.test_cases_total || 0, 10),
      testCasesPassed: parseInt(row.test_cases_passed || 0, 10),
      testCaseResults:
        typeof row.test_case_results === "string"
          ? JSON.parse(row.test_case_results)
          : row.test_case_results || [],
      errorMessage: row.error_message,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    };
  }
}

export const executionJobRepository = new ExecutionJobRepository();
