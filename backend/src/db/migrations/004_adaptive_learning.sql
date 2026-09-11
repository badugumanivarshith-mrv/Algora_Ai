-- Phase 7: Adaptive Learning & Personalization Schema

-- 1. Study Plans Table
CREATE TABLE IF NOT EXISTS study_plans (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  plan_type VARCHAR(64) NOT NULL DEFAULT 'DSA Mastery',
  description TEXT NOT NULL,
  target_role_company VARCHAR(128),
  difficulty VARCHAR(32) NOT NULL DEFAULT 'Intermediate',
  duration_weeks INT NOT NULL DEFAULT 6,
  daily_minutes_target INT NOT NULL DEFAULT 45,
  progress_pct INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Study Plan Topics Table
CREATE TABLE IF NOT EXISTS study_plan_topics (
  id VARCHAR(64) PRIMARY KEY,
  plan_id VARCHAR(64) NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  topic_name VARCHAR(128) NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'not_started',
  estimated_hours NUMERIC(4, 1) NOT NULL DEFAULT 4.0,
  problems_count INT NOT NULL DEFAULT 10,
  solved_count INT NOT NULL DEFAULT 0,
  milestone_title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  goal_type VARCHAR(32) NOT NULL DEFAULT 'daily',
  target_metric VARCHAR(64) NOT NULL DEFAULT 'problems_solved',
  target_value INT NOT NULL,
  current_value INT NOT NULL DEFAULT 0,
  unit VARCHAR(32) NOT NULL DEFAULT 'problems',
  status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  streak_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Goal Progress Table
CREATE TABLE IF NOT EXISTS user_goal_progress (
  id VARCHAR(64) PRIMARY KEY,
  goal_id VARCHAR(64) NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  increment_value INT NOT NULL DEFAULT 1,
  current_value INT NOT NULL,
  notes VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Recommendation History Table
CREATE TABLE IF NOT EXISTS recommendation_history (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INT NOT NULL,
  problem_slug VARCHAR(128) NOT NULL,
  problem_title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(32) NOT NULL,
  topic VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  reason TEXT NOT NULL,
  score NUMERIC(5, 2) NOT NULL DEFAULT 90.0,
  action_taken VARCHAR(32) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Readiness Scores Table
CREATE TABLE IF NOT EXISTS readiness_scores (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_type VARCHAR(32) NOT NULL,
  overall_score INT NOT NULL,
  dsa_coverage_pct INT NOT NULL DEFAULT 0,
  speed_score INT NOT NULL DEFAULT 0,
  accuracy_score INT NOT NULL DEFAULT 0,
  difficulty_handling INT NOT NULL DEFAULT 0,
  topic_coverage INT NOT NULL DEFAULT 0,
  breakdown_json JSONB NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Skill Assessments Table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(64) NOT NULL,
  mastery_score INT NOT NULL DEFAULT 50,
  accuracy_pct INT NOT NULL DEFAULT 50,
  learning_velocity NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  weak_priority VARCHAR(32) NOT NULL DEFAULT 'Medium',
  improvement_suggestion TEXT NOT NULL,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_skill_topic UNIQUE (user_id, topic)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_topics_plan_id ON study_plan_topics(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_user_goal_progress_goal_id ON user_goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_user_id ON recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_category ON recommendation_history(user_id, category);
CREATE INDEX IF NOT EXISTS idx_readiness_scores_user_type ON readiness_scores(user_id, assessment_type);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON skill_assessments(user_id);
