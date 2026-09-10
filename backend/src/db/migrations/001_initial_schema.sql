-- ==========================================================
-- Migration 001: Initial Schema
-- Description: Core schema for Algora platform
-- ==========================================================

-- 1. Migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  institution VARCHAR(120) NOT NULL DEFAULT '',
  github_handle VARCHAR(64),
  preferred_language VARCHAR(32) NOT NULL DEFAULT 'Python',
  rating INTEGER NOT NULL DEFAULT 1200,
  streak_days INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL,
  problem_slug VARCHAR(128) NOT NULL,
  problem_title VARCHAR(255) NOT NULL,
  language VARCHAR(32) NOT NULL,
  code TEXT NOT NULL,
  status VARCHAR(64) NOT NULL,
  runtime_ms INTEGER NOT NULL,
  memory_mb NUMERIC(6, 2) NOT NULL,
  runtime_percentile NUMERIC(5, 2) NOT NULL DEFAULT 85.0,
  memory_percentile NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
  passed_tests INTEGER NOT NULL DEFAULT 0,
  total_tests INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  compilation_error TEXT,
  test_cases_payload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Solved problems table
CREATE TABLE IF NOT EXISTS solved_problems (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL,
  problem_slug VARCHAR(128) NOT NULL,
  difficulty VARCHAR(32) NOT NULL,
  topic VARCHAR(64) NOT NULL,
  first_solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  best_runtime_ms INTEGER NOT NULL,
  best_memory_mb NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_problem UNIQUE (user_id, problem_slug)
);

-- 6. Achievements catalog table
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(64) PRIMARY KEY,
  badge_code VARCHAR(64) UNIQUE NOT NULL,
  badge_name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(64) NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  category VARCHAR(64) NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. User achievements mapping table
CREATE TABLE IF NOT EXISTS user_achievements (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(64) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  badge_code VARCHAR(64) NOT NULL,
  progress_value INTEGER NOT NULL DEFAULT 100,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_achievement UNIQUE (user_id, badge_code)
);

-- 8. Learning progress topic stats table
CREATE TABLE IF NOT EXISTS learning_progress (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(64) NOT NULL,
  mastery_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  solved_count INTEGER NOT NULL DEFAULT 0,
  accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_topic UNIQUE (user_id, topic)
);

-- 9. User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
