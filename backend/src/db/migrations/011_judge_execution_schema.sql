-- Phase INF-1 Database Migration: Real Judge Sandbox & Execution Pipeline

-- 1. Execution Jobs Table (tracks run and submission tasks)
CREATE TABLE IF NOT EXISTS execution_jobs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    problem_id VARCHAR(64),
    problem_slug VARCHAR(128) NOT NULL,
    language VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    custom_input TEXT,
    job_type VARCHAR(32) NOT NULL DEFAULT 'submit', -- 'run', 'submit', 'test_case'
    status VARCHAR(32) NOT NULL DEFAULT 'queued',   -- 'queued', 'compiling', 'executing', 'completed', 'failed'
    verdict VARCHAR(64) NOT NULL DEFAULT 'Pending', -- 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Internal Error'
    execution_time_ms FLOAT NOT NULL DEFAULT 0,
    memory_mb FLOAT NOT NULL DEFAULT 0,
    compile_output TEXT,
    stdout TEXT,
    stderr TEXT,
    test_cases_total INT NOT NULL DEFAULT 0,
    test_cases_passed INT NOT NULL DEFAULT 0,
    test_case_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_execution_jobs_user ON execution_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_jobs_problem ON execution_jobs(problem_slug);
CREATE INDEX IF NOT EXISTS idx_execution_jobs_status ON execution_jobs(status);
CREATE INDEX IF NOT EXISTS idx_execution_jobs_created ON execution_jobs(created_at DESC);

-- 2. Submission Results Table (historical records of scored judge executions)
CREATE TABLE IF NOT EXISTS submission_results (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) REFERENCES execution_jobs(id) ON DELETE SET NULL,
    submission_id VARCHAR(64),
    user_id VARCHAR(64),
    problem_slug VARCHAR(128) NOT NULL,
    language VARCHAR(32) NOT NULL,
    verdict VARCHAR(64) NOT NULL,
    runtime_ms FLOAT NOT NULL DEFAULT 0,
    memory_mb FLOAT NOT NULL DEFAULT 0,
    test_cases_passed INT NOT NULL DEFAULT 0,
    test_cases_total INT NOT NULL DEFAULT 0,
    xp_awarded INT NOT NULL DEFAULT 0,
    code_size_bytes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_results_user ON submission_results(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_results_problem ON submission_results(problem_slug);
CREATE INDEX IF NOT EXISTS idx_sub_results_verdict ON submission_results(verdict);
CREATE INDEX IF NOT EXISTS idx_sub_results_created ON submission_results(created_at DESC);
