-- Migration 039: Performance Indexes, Composite Indexes & Database Query Optimizations
-- V5.1 Hardening & Optimization Phase

-- High-frequency lookup indexes for AI OS, Cognitive, and University Platforms
CREATE INDEX IF NOT EXISTS idx_marketplace_enrollments_user ON marketplace_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_enrollments_status ON marketplace_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_credential_verifications_cred ON credential_verifications(credential_id);
CREATE INDEX IF NOT EXISTS idx_trajectory_simulations_user ON trajectory_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_forecasts_user ON impact_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_learning_user ON meta_learning_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_compounding_user ON knowledge_compounding(user_id);
CREATE INDEX IF NOT EXISTS idx_agi_experiments_project ON agi_experiments(project_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_metrics_user_logged ON cognitive_metrics(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_cognitive_forecasts_user ON cognitive_forecasts(user_id);

-- Composite indexes for user-based filtering & ordering
CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solved_problems_user_topic ON solved_problems(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_badge ON user_achievements(user_id, badge_code);

-- Analyze database state for query planner optimization
ANALYZE;
