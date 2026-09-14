import { Database } from "./connection";
import { logger } from "../utils/logger";

export interface Migration {
  version: string;
  name: string;
  up: string;
  down: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: "001",
    name: "001_initial_schema",
    up: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(64) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'student',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS user_achievements (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id VARCHAR(64) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        badge_code VARCHAR(64) NOT NULL,
        progress_value INTEGER NOT NULL DEFAULT 100,
        unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_user_achievement UNIQUE (user_id, badge_code)
      );

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

      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        ip_address VARCHAR(64),
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
    down: `
      DROP TABLE IF EXISTS user_sessions CASCADE;
      DROP TABLE IF EXISTS learning_progress CASCADE;
      DROP TABLE IF EXISTS user_achievements CASCADE;
      DROP TABLE IF EXISTS achievements CASCADE;
      DROP TABLE IF EXISTS solved_problems CASCADE;
      DROP TABLE IF EXISTS submissions CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
    `,
  },
  {
    version: "002",
    name: "002_indexes_and_constraints",
    up: `
      CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_problem_slug ON submissions(problem_slug);
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
      CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_slug);

      CREATE INDEX IF NOT EXISTS idx_solved_problems_user_id ON solved_problems(user_id);
      CREATE INDEX IF NOT EXISTS idx_solved_problems_topic ON solved_problems(topic);

      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_code ON user_achievements(badge_code);

      CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);

      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

      CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating DESC);
      CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON profiles(total_xp DESC);
    `,
    down: `
      DROP INDEX IF EXISTS idx_profiles_total_xp;
      DROP INDEX IF EXISTS idx_profiles_rating;
      DROP INDEX IF EXISTS idx_user_sessions_expires_at;
      DROP INDEX IF EXISTS idx_user_sessions_token_hash;
      DROP INDEX IF EXISTS idx_user_sessions_user_id;
      DROP INDEX IF EXISTS idx_learning_progress_user_id;
      DROP INDEX IF EXISTS idx_user_achievements_badge_code;
      DROP INDEX IF EXISTS idx_user_achievements_user_id;
      DROP INDEX IF EXISTS idx_solved_problems_topic;
      DROP INDEX IF EXISTS idx_solved_problems_user_id;
      DROP INDEX IF EXISTS idx_submissions_user_problem;
      DROP INDEX IF EXISTS idx_submissions_created_at;
      DROP INDEX IF EXISTS idx_submissions_status;
      DROP INDEX IF EXISTS idx_submissions_problem_slug;
      DROP INDEX IF EXISTS idx_submissions_user_id;
    `,
  },
  {
    version: "003",
    name: "003_gamification_and_contests",
    up: `
      CREATE TABLE IF NOT EXISTS contests (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        contest_type VARCHAR(64) NOT NULL DEFAULT 'Weekly Contest',
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 90,
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Medium',
        participant_count INT DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'upcoming',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contest_problems (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        problem_id INT NOT NULL,
        problem_slug VARCHAR(128) NOT NULL,
        problem_title VARCHAR(255) NOT NULL,
        order_index INT NOT NULL DEFAULT 1,
        score_points INT NOT NULL DEFAULT 100,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contest_participants (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(64) NOT NULL,
        score INT NOT NULL DEFAULT 0,
        penalty_seconds INT NOT NULL DEFAULT 0,
        rank INT,
        registered_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_contest_user UNIQUE (contest_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS contest_submissions (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        problem_slug VARCHAR(128) NOT NULL,
        status VARCHAR(64) NOT NULL,
        points_awarded INT NOT NULL DEFAULT 0,
        submission_time TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ratings_history (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contest_id VARCHAR(64),
        old_rating INT NOT NULL,
        new_rating INT NOT NULL,
        rating_change INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        recorded_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS xp_transactions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount INT NOT NULL,
        source VARCHAR(64) NOT NULL,
        description VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
      CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
      CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
      CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_contest_participants_rank ON contest_participants(contest_id, rank);
      CREATE INDEX IF NOT EXISTS idx_ratings_history_user_id ON ratings_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_history_recorded_at ON ratings_history(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at);
    `,
    down: `
      DROP TABLE IF EXISTS xp_transactions CASCADE;
      DROP TABLE IF EXISTS ratings_history CASCADE;
      DROP TABLE IF EXISTS contest_submissions CASCADE;
      DROP TABLE IF EXISTS contest_participants CASCADE;
      DROP TABLE IF EXISTS contest_problems CASCADE;
      DROP TABLE IF EXISTS contests CASCADE;
    `,
  },
  {
    version: "004",
    name: "004_adaptive_learning",
    up: `
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

      CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
      CREATE INDEX IF NOT EXISTS idx_study_plan_topics_plan_id ON study_plan_topics(plan_id);
      CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(user_id, goal_type);
      CREATE INDEX IF NOT EXISTS idx_user_goal_progress_goal_id ON user_goal_progress(goal_id);
      CREATE INDEX IF NOT EXISTS idx_recommendation_history_user_id ON recommendation_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_recommendation_history_category ON recommendation_history(user_id, category);
      CREATE INDEX IF NOT EXISTS idx_readiness_scores_user_type ON readiness_scores(user_id, assessment_type);
      CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON skill_assessments(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS skill_assessments CASCADE;
      DROP TABLE IF EXISTS readiness_scores CASCADE;
      DROP TABLE IF EXISTS recommendation_history CASCADE;
      DROP TABLE IF EXISTS user_goal_progress CASCADE;
      DROP TABLE IF EXISTS user_goals CASCADE;
      DROP TABLE IF EXISTS study_plan_topics CASCADE;
      DROP TABLE IF EXISTS study_plans CASCADE;
    `,
  },
  {
    version: "005",
    name: "005_admin_cms",
    up: `
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(64) UNIQUE NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_system BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(64) PRIMARY KEY,
        key VARCHAR(128) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        module VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id VARCHAR(64) REFERENCES roles(id) ON DELETE SET NULL,
        is_super_admin BOOLEAN NOT NULL DEFAULT false,
        custom_permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS problems (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(128) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Medium',
        language VARCHAR(32) NOT NULL DEFAULT 'Python',
        topic VARCHAR(128) NOT NULL DEFAULT 'General',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        xp_reward INTEGER NOT NULL DEFAULT 100,
        acceptance VARCHAR(16) NOT NULL DEFAULT '50.0%',
        description TEXT NOT NULL DEFAULT '',
        examples JSONB NOT NULL DEFAULT '[]'::jsonb,
        constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
        hints JSONB NOT NULL DEFAULT '[]'::jsonb,
        starter_codes JSONB NOT NULL DEFAULT '{}'::jsonb,
        solution_codes JSONB NOT NULL DEFAULT '{}'::jsonb,
        test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
        hidden_test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        author_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        view_count INTEGER NOT NULL DEFAULT 0,
        submission_count INTEGER NOT NULL DEFAULT 0,
        accepted_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS problem_versions (
        id VARCHAR(64) PRIMARY KEY,
        problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(128) NOT NULL,
        difficulty VARCHAR(32) NOT NULL,
        description TEXT NOT NULL,
        test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
        hidden_test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
        starter_codes JSONB NOT NULL DEFAULT '{}'::jsonb,
        changed_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        change_summary TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS topics (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) UNIQUE NOT NULL,
        title VARCHAR(128) NOT NULL,
        language VARCHAR(32) NOT NULL DEFAULT 'General',
        description TEXT NOT NULL DEFAULT '',
        icon_name VARCHAR(64) NOT NULL DEFAULT 'BookOpen',
        order_index INTEGER NOT NULL DEFAULT 0,
        prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
        learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS curriculum_paths (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) UNIQUE NOT NULL,
        title VARCHAR(128) NOT NULL,
        language VARCHAR(32) NOT NULL DEFAULT 'General',
        description TEXT NOT NULL DEFAULT '',
        target_role VARCHAR(128) NOT NULL DEFAULT 'Software Engineer',
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Intermediate',
        estimated_hours INTEGER NOT NULL DEFAULT 40,
        icon_name VARCHAR(64) NOT NULL DEFAULT 'Compass',
        order_index INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS curriculum_modules (
        id VARCHAR(64) PRIMARY KEY,
        path_id VARCHAR(64) NOT NULL REFERENCES curriculum_paths(id) ON DELETE CASCADE,
        title VARCHAR(128) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        order_index INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS curriculum_lessons (
        id VARCHAR(64) PRIMARY KEY,
        module_id VARCHAR(64) NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
        title VARCHAR(128) NOT NULL,
        lesson_type VARCHAR(32) NOT NULL DEFAULT 'lesson',
        duration VARCHAR(32) NOT NULL DEFAULT '15 min',
        problem_slug VARCHAR(128),
        xp_reward INTEGER NOT NULL DEFAULT 25,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contest_registrations (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'registered',
        registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        score INTEGER NOT NULL DEFAULT 0,
        penalty_minutes INTEGER NOT NULL DEFAULT 0,
        rank INTEGER,
        CONSTRAINT uq_contest_user_reg UNIQUE (contest_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(128) PRIMARY KEY,
        value JSONB NOT NULL DEFAULT '{}'::jsonb,
        description TEXT NOT NULL DEFAULT '',
        category VARCHAR(64) NOT NULL DEFAULT 'general',
        is_public BOOLEAN NOT NULL DEFAULT false,
        updated_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        admin_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(128) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(128) NOT NULL,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        ip_address VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
      CREATE INDEX IF NOT EXISTS idx_admins_role_id ON admins(role_id);
      CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
      CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
      CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
      CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
      CREATE INDEX IF NOT EXISTS idx_problem_versions_problem_id ON problem_versions(problem_id);
      CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
      CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(order_index);
      CREATE INDEX IF NOT EXISTS idx_curriculum_modules_path ON curriculum_modules(path_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_module ON curriculum_lessons(module_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_contest_registrations_contest ON contest_registrations(contest_id, rank);
      CREATE INDEX IF NOT EXISTS idx_contest_registrations_user ON contest_registrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
      CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
    `,
    down: `
      DROP TABLE IF EXISTS admin_audit_logs CASCADE;
      DROP TABLE IF EXISTS system_settings CASCADE;
      DROP TABLE IF EXISTS contest_registrations CASCADE;
      DROP TABLE IF EXISTS curriculum_lessons CASCADE;
      DROP TABLE IF EXISTS curriculum_modules CASCADE;
      DROP TABLE IF EXISTS curriculum_paths CASCADE;
      DROP TABLE IF EXISTS topics CASCADE;
      DROP TABLE IF EXISTS problem_versions CASCADE;
      DROP TABLE IF EXISTS problems CASCADE;
      DROP TABLE IF EXISTS admins CASCADE;
      DROP TABLE IF EXISTS permissions CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
    `,
  },
  {
    version: "009",
    name: "009_phase9_enhancements",
    up: `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        replaced_by_token VARCHAR(64),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_verifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS uploads (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size_bytes BIGINT NOT NULL,
        category VARCHAR(50) NOT NULL,
        storage_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

      CREATE TABLE IF NOT EXISTS ai_conversations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        problem_slug VARCHAR(100),
        context_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_messages (
        id VARCHAR(64) PRIMARY KEY,
        conversation_id VARCHAR(64) NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        type VARCHAR(30) NOT NULL,
        content TEXT NOT NULL,
        language VARCHAR(30),
        token_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_reports (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL,
        readiness_score INT NOT NULL,
        readiness_tier VARCHAR(100) NOT NULL,
        summary TEXT,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recommendation_type VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        insight TEXT NOT NULL,
        actionable_step TEXT NOT NULL,
        suggested_problem_slug VARCHAR(100),
        status VARCHAR(30) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_usage_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        feature VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        prompt_tokens INT NOT NULL,
        completion_tokens INT NOT NULL,
        total_tokens INT NOT NULL,
        estimated_cost_usd NUMERIC(10, 6) NOT NULL,
        latency_ms INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_events (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        actor_email VARCHAR(255),
        event_type VARCHAR(50) NOT NULL,
        target_resource VARCHAR(100),
        action VARCHAR(50) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    down: `
      DROP TABLE IF EXISTS audit_events CASCADE;
      DROP TABLE IF EXISTS ai_usage_logs CASCADE;
      DROP TABLE IF EXISTS ai_recommendations CASCADE;
      DROP TABLE IF EXISTS ai_reports CASCADE;
      DROP TABLE IF EXISTS ai_messages CASCADE;
      DROP TABLE IF EXISTS ai_conversations CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS uploads CASCADE;
      DROP TABLE IF EXISTS email_verifications CASCADE;
      DROP TABLE IF EXISTS password_resets CASCADE;
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
    `,
  },
  {
    version: "010",
    name: "010_collaboration_community_enterprise",
    up: `
      CREATE TABLE IF NOT EXISTS discussions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(120) NOT NULL,
        author_avatar TEXT,
        problem_slug VARCHAR(128),
        contest_id VARCHAR(64),
        category VARCHAR(64) NOT NULL DEFAULT 'general',
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        upvotes INT NOT NULL DEFAULT 0,
        downvotes INT NOT NULL DEFAULT 0,
        views_count INT NOT NULL DEFAULT 0,
        reply_count INT NOT NULL DEFAULT 0,
        is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
        is_locked BOOLEAN NOT NULL DEFAULT FALSE,
        accepted_reply_id VARCHAR(64),
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discussion_replies (
        id VARCHAR(64) PRIMARY KEY,
        discussion_id VARCHAR(64) NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(120) NOT NULL,
        author_avatar TEXT,
        parent_reply_id VARCHAR(64) REFERENCES discussion_replies(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        code_snippet TEXT,
        language VARCHAR(32),
        upvotes INT NOT NULL DEFAULT 0,
        downvotes INT NOT NULL DEFAULT 0,
        is_accepted_answer BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discussion_votes (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR(32) NOT NULL,
        target_id VARCHAR(64) NOT NULL,
        vote_type VARCHAR(16) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_user_vote UNIQUE (user_id, target_type, target_id)
      );

      CREATE TABLE IF NOT EXISTS study_groups (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        slug VARCHAR(128) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        is_private BOOLEAN NOT NULL DEFAULT FALSE,
        invite_code VARCHAR(32) UNIQUE NOT NULL,
        max_members INT NOT NULL DEFAULT 50,
        member_count INT NOT NULL DEFAULT 1,
        target_topic VARCHAR(128) NOT NULL DEFAULT 'General DSA',
        target_goal VARCHAR(255) NOT NULL DEFAULT 'Solve 50 hard problems together',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS study_group_members (
        id VARCHAR(64) PRIMARY KEY,
        group_id VARCHAR(64) NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(64) NOT NULL,
        full_name VARCHAR(120) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(32) NOT NULL DEFAULT 'member',
        contribution_score INT NOT NULL DEFAULT 0,
        problems_solved_in_group INT NOT NULL DEFAULT 0,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS study_group_messages (
        id VARCHAR(64) PRIMARY KEY,
        group_id VARCHAR(64) NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(64) NOT NULL,
        avatar_url TEXT,
        message TEXT NOT NULL,
        message_type VARCHAR(32) NOT NULL DEFAULT 'text',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS study_group_goals (
        id VARCHAR(64) PRIMARY KEY,
        group_id VARCHAR(64) NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target_problems_count INT NOT NULL DEFAULT 20,
        completed_problems_count INT NOT NULL DEFAULT 0,
        deadline TIMESTAMPTZ,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contest_teams (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        team_name VARCHAR(128) NOT NULL,
        team_code VARCHAR(32) NOT NULL,
        captain_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        captain_username VARCHAR(64) NOT NULL,
        member_count INT NOT NULL DEFAULT 1,
        max_members INT NOT NULL DEFAULT 3,
        total_score INT NOT NULL DEFAULT 0,
        total_penalty_seconds INT NOT NULL DEFAULT 0,
        rank INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_contest_team_name UNIQUE (contest_id, team_name),
        CONSTRAINT uq_contest_team_code UNIQUE (contest_id, team_code)
      );

      CREATE TABLE IF NOT EXISTS contest_team_members (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES contest_teams(id) ON DELETE CASCADE,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(64) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'member',
        individual_score INT NOT NULL DEFAULT 0,
        penalty_seconds INT NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'accepted',
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_contest_team_user UNIQUE (contest_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS mentor_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        headline VARCHAR(255) NOT NULL,
        company VARCHAR(128) NOT NULL,
        years_experience INT NOT NULL DEFAULT 3,
        specialties JSONB NOT NULL DEFAULT '["System Design", "Hard Dynamic Programming", "Behavioral Interview"]'::jsonb,
        hourly_rate_credits INT NOT NULL DEFAULT 0,
        bio TEXT NOT NULL,
        rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
        review_count INT NOT NULL DEFAULT 12,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        max_active_students INT NOT NULL DEFAULT 5,
        active_students_count INT NOT NULL DEFAULT 2,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mentorship_requests (
        id VARCHAR(64) PRIMARY KEY,
        mentor_id VARCHAR(64) NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
        student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_username VARCHAR(64) NOT NULL,
        message TEXT NOT NULL,
        target_role_company VARCHAR(128),
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mentorship_sessions (
        id VARCHAR(64) PRIMARY KEY,
        mentor_id VARCHAR(64) NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
        student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        scheduled_at TIMESTAMPTZ NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 45,
        meeting_link VARCHAR(255) NOT NULL DEFAULT 'https://meet.algora.ai/session',
        status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
        mentor_notes TEXT,
        student_feedback TEXT,
        rating INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS interview_tracks (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        company_tier VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        icon_name VARCHAR(64) NOT NULL DEFAULT 'Briefcase',
        question_count INT NOT NULL DEFAULT 40,
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Hard',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS interview_questions (
        id VARCHAR(64) PRIMARY KEY,
        track_id VARCHAR(64) REFERENCES interview_tracks(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(32) NOT NULL DEFAULT 'coding',
        company_tags JSONB NOT NULL DEFAULT '["Google", "Meta"]'::jsonb,
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Medium',
        prompt TEXT NOT NULL,
        rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mock_interview_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        track_slug VARCHAR(128) NOT NULL,
        interview_type VARCHAR(32) NOT NULL DEFAULT 'coding',
        company_target VARCHAR(128) NOT NULL DEFAULT 'Google SWE L4',
        status VARCHAR(32) NOT NULL DEFAULT 'completed',
        score INT NOT NULL DEFAULT 85,
        duration_seconds INT NOT NULL DEFAULT 1800,
        transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
        ai_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
        readiness_rating VARCHAR(64) NOT NULL DEFAULT 'Strong Hire',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_reputation (
        user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        reputation_score INT NOT NULL DEFAULT 100,
        helpful_answers_count INT NOT NULL DEFAULT 0,
        articles_written INT NOT NULL DEFAULT 0,
        upvotes_received INT NOT NULL DEFAULT 0,
        social_links JSONB NOT NULL DEFAULT '{"github": "", "linkedin": "", "twitter": "", "website": ""}'::jsonb,
        featured_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS activity_timeline (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        link VARCHAR(255),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS moderation_reports (
        id VARCHAR(64) PRIMARY KEY,
        reporter_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reporter_username VARCHAR(64) NOT NULL,
        target_type VARCHAR(32) NOT NULL,
        target_id VARCHAR(64) NOT NULL,
        target_title VARCHAR(255) NOT NULL,
        reason VARCHAR(64) NOT NULL,
        details TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        action_taken VARCHAR(64),
        moderator_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS moderated_users (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        restriction_type VARCHAR(32) NOT NULL,
        reason TEXT NOT NULL,
        expires_at TIMESTAMPTZ,
        issued_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS platform_metrics_daily (
        date DATE PRIMARY KEY,
        dau INT NOT NULL DEFAULT 0,
        wau INT NOT NULL DEFAULT 0,
        mau INT NOT NULL DEFAULT 0,
        retention_rate_7d NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
        retention_rate_30d NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
        engagement_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
        contest_participation_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
        learning_completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
        ai_query_volume INT NOT NULL DEFAULT 0,
        discussions_active INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
    down: `
      DROP TABLE IF EXISTS platform_metrics_daily CASCADE;
      DROP TABLE IF EXISTS moderated_users CASCADE;
      DROP TABLE IF EXISTS moderation_reports CASCADE;
      DROP TABLE IF EXISTS activity_timeline CASCADE;
      DROP TABLE IF EXISTS user_reputation CASCADE;
      DROP TABLE IF EXISTS mock_interview_sessions CASCADE;
      DROP TABLE IF EXISTS interview_questions CASCADE;
      DROP TABLE IF EXISTS interview_tracks CASCADE;
      DROP TABLE IF EXISTS mentorship_sessions CASCADE;
      DROP TABLE IF EXISTS mentorship_requests CASCADE;
      DROP TABLE IF EXISTS mentor_profiles CASCADE;
      DROP TABLE IF EXISTS contest_team_members CASCADE;
      DROP TABLE IF EXISTS contest_teams CASCADE;
      DROP TABLE IF EXISTS study_group_goals CASCADE;
      DROP TABLE IF EXISTS study_group_messages CASCADE;
      DROP TABLE IF EXISTS study_group_members CASCADE;
      DROP TABLE IF EXISTS study_groups CASCADE;
      DROP TABLE IF EXISTS discussion_votes CASCADE;
      DROP TABLE IF EXISTS discussion_replies CASCADE;
      DROP TABLE IF EXISTS discussions CASCADE;
    `,
  },
  {
    version: "011",
    name: "011_judge_execution_schema",
    up: `
      CREATE TABLE IF NOT EXISTS execution_jobs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        problem_id INTEGER NOT NULL,
        problem_slug VARCHAR(128) NOT NULL,
        language VARCHAR(32) NOT NULL,
        code TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'queued',
        verdict VARCHAR(64),
        execution_time_ms INTEGER,
        memory_mb NUMERIC(6, 2),
        compile_output TEXT,
        stdout TEXT,
        stderr TEXT,
        test_cases_passed INTEGER DEFAULT 0,
        test_cases_total INTEGER DEFAULT 0,
        custom_input TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS submission_results (
        id VARCHAR(64) PRIMARY KEY,
        job_id VARCHAR(64) NOT NULL REFERENCES execution_jobs(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        problem_slug VARCHAR(128) NOT NULL,
        language VARCHAR(32) NOT NULL,
        verdict VARCHAR(64) NOT NULL,
        execution_time_ms INTEGER NOT NULL,
        memory_mb NUMERIC(6, 2) NOT NULL,
        test_cases_passed INTEGER NOT NULL,
        test_cases_total INTEGER NOT NULL,
        test_case_results JSONB NOT NULL DEFAULT '[]'::jsonb,
        stdout TEXT,
        stderr TEXT,
        compile_output TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_execution_jobs_user ON execution_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_execution_jobs_status ON execution_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_execution_jobs_created_at ON execution_jobs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_submission_results_job ON submission_results(job_id);
      CREATE INDEX IF NOT EXISTS idx_submission_results_user ON submission_results(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS submission_results CASCADE;
      DROP TABLE IF EXISTS execution_jobs CASCADE;
    `,
  },
  {
    version: "012",
    name: "012_oauth_identity_platform",
    up: `
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(32) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        avatar_url TEXT,
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMPTZ,
        raw_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
        linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_oauth_provider_user UNIQUE (provider, provider_user_id),
        CONSTRAINT uq_oauth_user_provider UNIQUE (user_id, provider)
      );

      CREATE TABLE IF NOT EXISTS oauth_sessions (
        id VARCHAR(64) PRIMARY KEY,
        state VARCHAR(255) UNIQUE NOT NULL,
        nonce VARCHAR(255),
        provider VARCHAR(32) NOT NULL,
        action VARCHAR(32) NOT NULL DEFAULT 'login',
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        redirect_url TEXT,
        code_verifier VARCHAR(255),
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS oauth_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        provider VARCHAR(32) NOT NULL,
        event_type VARCHAR(64) NOT NULL,
        provider_user_id VARCHAR(255),
        email VARCHAR(255),
        ip_address VARCHAR(64),
        user_agent TEXT,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_email ON oauth_accounts(provider, email);
      CREATE INDEX IF NOT EXISTS idx_oauth_sessions_state ON oauth_sessions(state);
      CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_oauth_audit_logs_user_id ON oauth_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_oauth_audit_logs_event_type ON oauth_audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_oauth_audit_logs_created_at ON oauth_audit_logs(created_at DESC);
    `,
    down: `
      DROP TABLE IF EXISTS oauth_audit_logs CASCADE;
      DROP TABLE IF EXISTS oauth_sessions CASCADE;
      DROP TABLE IF EXISTS oauth_accounts CASCADE;
    `,
  },
  {
    version: "013",
    name: "013_ai_generated_learning",
    up: `
      CREATE TABLE IF NOT EXISTS generated_problems (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        language VARCHAR(32) NOT NULL,
        topic VARCHAR(64) NOT NULL,
        difficulty VARCHAR(32) NOT NULL,
        learning_level VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        problem_statement TEXT NOT NULL,
        constraints TEXT NOT NULL,
        input_format TEXT NOT NULL,
        output_format TEXT NOT NULL,
        sample_inputs JSONB NOT NULL DEFAULT '[]'::jsonb,
        sample_outputs JSONB NOT NULL DEFAULT '[]'::jsonb,
        explanation TEXT NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        estimated_time VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS generated_quizzes (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        topic VARCHAR(64) NOT NULL,
        difficulty VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        questions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS generated_assignments (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        topic VARCHAR(64) NOT NULL,
        difficulty VARCHAR(32) NOT NULL,
        objective TEXT NOT NULL,
        requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
        tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
        evaluation_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
        expected_completion_time VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS generated_interviews (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        round_type VARCHAR(64) NOT NULL,
        difficulty VARCHAR(32) NOT NULL,
        questions JSONB NOT NULL DEFAULT '[]'::jsonb,
        evaluation_guidelines TEXT NOT NULL,
        scoring_rubric JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS generated_contests (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        problem_set JSONB NOT NULL DEFAULT '[]'::jsonb,
        difficulty_mix VARCHAR(64) NOT NULL,
        scoring_rules TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_gen_problems_user ON generated_problems(user_id);
      CREATE INDEX IF NOT EXISTS idx_gen_quizzes_user ON generated_quizzes(user_id);
      CREATE INDEX IF NOT EXISTS idx_gen_assignments_user ON generated_assignments(user_id);
      CREATE INDEX IF NOT EXISTS idx_gen_interviews_user ON generated_interviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_gen_contests_user ON generated_contests(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS generated_contests CASCADE;
      DROP TABLE IF EXISTS generated_interviews CASCADE;
      DROP TABLE IF EXISTS generated_assignments CASCADE;
      DROP TABLE IF EXISTS generated_quizzes CASCADE;
      DROP TABLE IF EXISTS generated_problems CASCADE;
    `,
  },
  {
    version: "014",
    name: "014_adaptive_ai_learning",
    up: `
      CREATE TABLE IF NOT EXISTS adaptive_skill_profiles (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        overall_skill_level VARCHAR(64) NOT NULL DEFAULT 'Intermediate',
        topic_mastery JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS adaptive_weakness_logs (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        weakness_type VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL DEFAULT 'Medium',
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS adaptive_learning_paths (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        target_goal VARCHAR(128) NOT NULL,
        weeks JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS adaptive_daily_reviews (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        item_title VARCHAR(255) NOT NULL,
        item_type VARCHAR(64) NOT NULL DEFAULT 'Problem',
        scheduled_for TIMESTAMPTZ NOT NULL,
        retention_score INTEGER NOT NULL DEFAULT 50,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        last_reviewed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS adaptive_study_plans (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        placement_goal VARCHAR(128) NOT NULL,
        available_hours_per_week INTEGER NOT NULL DEFAULT 10,
        daily_plan JSONB NOT NULL DEFAULT '[]',
        weekly_plan JSONB NOT NULL DEFAULT '[]',
        monthly_plan JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_adap_skill_user ON adaptive_skill_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_adap_weakness_user ON adaptive_weakness_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_adap_path_user ON adaptive_learning_paths(user_id);
      CREATE INDEX IF NOT EXISTS idx_adap_review_user ON adaptive_daily_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_adap_study_user ON adaptive_study_plans(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS adaptive_study_plans CASCADE;
      DROP TABLE IF EXISTS adaptive_daily_reviews CASCADE;
      DROP TABLE IF EXISTS adaptive_learning_paths CASCADE;
      DROP TABLE IF EXISTS adaptive_weakness_logs CASCADE;
      DROP TABLE IF EXISTS adaptive_skill_profiles CASCADE;
    `,
  },
  {
    version: "015",
    name: "015_learning_memory_system",
    up: `
      CREATE TABLE IF NOT EXISTS learning_memory (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        problems_solved INTEGER NOT NULL DEFAULT 0,
        problems_failed INTEGER NOT NULL DEFAULT 0,
        quiz_score INTEGER NOT NULL DEFAULT 0,
        contest_score INTEGER NOT NULL DEFAULT 0,
        interview_score INTEGER NOT NULL DEFAULT 0,
        hint_count INTEGER NOT NULL DEFAULT 0,
        ai_interactions_count INTEGER NOT NULL DEFAULT 0,
        confidence_score INTEGER NOT NULL DEFAULT 50,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_retention (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        retention_percentage INTEGER NOT NULL DEFAULT 100,
        overall_retention INTEGER NOT NULL DEFAULT 80,
        revision_completion_percentage INTEGER NOT NULL DEFAULT 0,
        last_reviewed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        next_review_date TIMESTAMPTZ NOT NULL,
        review_attempts INTEGER NOT NULL DEFAULT 0,
        success_rate INTEGER NOT NULL DEFAULT 100,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_reviews (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        item_title VARCHAR(255) NOT NULL,
        item_type VARCHAR(64) NOT NULL DEFAULT 'Revision',
        priority_score INTEGER NOT NULL DEFAULT 50,
        estimated_minutes INTEGER NOT NULL DEFAULT 15,
        reason TEXT,
        scheduled_for TIMESTAMPTZ NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS learning_flashcards (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        hint TEXT,
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Medium',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_revision_notes (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Medium',
        learning_level VARCHAR(32) NOT NULL DEFAULT 'Intermediate',
        summary TEXT NOT NULL,
        cheat_sheet JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_streaks (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        current_streak INTEGER NOT NULL DEFAULT 1,
        longest_streak INTEGER NOT NULL DEFAULT 1,
        daily_review_completed BOOLEAN NOT NULL DEFAULT false,
        weekly_review_completed BOOLEAN NOT NULL DEFAULT false,
        total_xp INTEGER NOT NULL DEFAULT 150,
        last_activity_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_mem_user ON learning_memory(user_id);
      CREATE INDEX IF NOT EXISTS idx_ret_user ON learning_retention(user_id);
      CREATE INDEX IF NOT EXISTS idx_rev_user ON learning_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_fc_user ON learning_flashcards(user_id);
      CREATE INDEX IF NOT EXISTS idx_rn_user ON learning_revision_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_strk_user ON learning_streaks(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS learning_streaks CASCADE;
      DROP TABLE IF EXISTS learning_revision_notes CASCADE;
      DROP TABLE IF EXISTS learning_flashcards CASCADE;
      DROP TABLE IF EXISTS learning_reviews CASCADE;
      DROP TABLE IF EXISTS learning_retention CASCADE;
      DROP TABLE IF EXISTS learning_memory CASCADE;
    `,
  },
  {
    version: "016",
    name: "016_company_prep_hub",
    up: `
      CREATE TABLE IF NOT EXISTS company_tracks (
        id VARCHAR(128) PRIMARY KEY,
        company_id VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'MAANG',
        overview TEXT NOT NULL,
        hiring_process JSONB NOT NULL DEFAULT '[]',
        interview_pattern JSONB NOT NULL DEFAULT '[]',
        recommended_topics JSONB NOT NULL DEFAULT '[]',
        base_difficulty VARCHAR(32) NOT NULL DEFAULT 'Hard',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_roadmaps (
        id VARCHAR(128) PRIMARY KEY,
        company_id VARCHAR(64) NOT NULL,
        week_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        topics JSONB NOT NULL DEFAULT '[]',
        estimated_hours INTEGER NOT NULL DEFAULT 10,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_problem_mappings (
        id VARCHAR(128) PRIMARY KEY,
        problem_id VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        company_id VARCHAR(64) NOT NULL,
        frequency INTEGER NOT NULL DEFAULT 80,
        importance VARCHAR(32) NOT NULL DEFAULT 'High',
        difficulty VARCHAR(32) NOT NULL DEFAULT 'Medium',
        topics JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_interview_patterns (
        id VARCHAR(128) PRIMARY KEY,
        company_id VARCHAR(64) NOT NULL,
        round_number INTEGER NOT NULL,
        round_name VARCHAR(128) NOT NULL,
        round_type VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        key_focus JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_user_readiness (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        company_id VARCHAR(64) NOT NULL,
        readiness_score INTEGER NOT NULL DEFAULT 65,
        strengths JSONB NOT NULL DEFAULT '[]',
        weaknesses JSONB NOT NULL DEFAULT '[]',
        improvement_areas JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_prep_plans (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        company_id VARCHAR(64) NOT NULL,
        target_date VARCHAR(64) NOT NULL,
        available_hours_per_week INTEGER NOT NULL DEFAULT 15,
        daily_plan JSONB NOT NULL DEFAULT '[]',
        weekly_plan JSONB NOT NULL DEFAULT '[]',
        monthly_plan JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_c_track_comp ON company_tracks(company_id);
      CREATE INDEX IF NOT EXISTS idx_c_map_comp ON company_problem_mappings(company_id);
      CREATE INDEX IF NOT EXISTS idx_c_map_prob ON company_problem_mappings(problem_id);
      CREATE INDEX IF NOT EXISTS idx_c_readiness_user ON company_user_readiness(user_id);
      CREATE INDEX IF NOT EXISTS idx_c_readiness_comp ON company_user_readiness(company_id);
      CREATE INDEX IF NOT EXISTS idx_c_plan_user ON company_prep_plans(user_id);
      CREATE INDEX IF NOT EXISTS idx_c_plan_comp ON company_prep_plans(company_id);
    `,
    down: `
      DROP TABLE IF EXISTS company_prep_plans CASCADE;
      DROP TABLE IF EXISTS company_user_readiness CASCADE;
      DROP TABLE IF EXISTS company_interview_patterns CASCADE;
      DROP TABLE IF EXISTS company_problem_mappings CASCADE;
      DROP TABLE IF EXISTS company_roadmaps CASCADE;
      DROP TABLE IF EXISTS company_tracks CASCADE;
    `,
  },
  {
    version: "017",
    name: "017_voice_ai_mentor",
    up: `
      CREATE TABLE IF NOT EXISTS voice_sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        session_type VARCHAR(64) NOT NULL DEFAULT 'Mentor',
        language VARCHAR(32) NOT NULL DEFAULT 'English',
        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMPTZ,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS voice_messages (
        id VARCHAR(128) PRIMARY KEY,
        session_id VARCHAR(128) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'user',
        transcript TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS voice_analytics (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) UNIQUE NOT NULL,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        total_minutes INTEGER NOT NULL DEFAULT 0,
        interview_sessions INTEGER NOT NULL DEFAULT 0,
        review_sessions INTEGER NOT NULL DEFAULT 0,
        learning_sessions INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS voice_interview_sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        company VARCHAR(64) NOT NULL,
        round_type VARCHAR(64) NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        communication_score INTEGER NOT NULL DEFAULT 0,
        technical_score INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS voice_learning_sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        completion_percentage INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_v_sess_user ON voice_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_v_msg_sess ON voice_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_v_an_user ON voice_analytics(user_id);
      CREATE INDEX IF NOT EXISTS idx_v_int_user ON voice_interview_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_v_lrn_user ON voice_learning_sessions(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS voice_learning_sessions CASCADE;
      DROP TABLE IF EXISTS voice_interview_sessions CASCADE;
      DROP TABLE IF EXISTS voice_analytics CASCADE;
      DROP TABLE IF EXISTS voice_messages CASCADE;
      DROP TABLE IF EXISTS voice_sessions CASCADE;
    `,
  },
  {
    version: "018",
    name: "018_live_collaboration_system",
    up: `
      CREATE TABLE IF NOT EXISTS collaboration_rooms (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(256) NOT NULL,
        room_type VARCHAR(64) NOT NULL DEFAULT 'Practice',
        host_user_id VARCHAR(128) NOT NULL,
        problem_id VARCHAR(128),
        company VARCHAR(64),
        language VARCHAR(32) NOT NULL DEFAULT 'typescript',
        current_code TEXT DEFAULT '',
        driver_user_id VARCHAR(128),
        navigator_user_id VARCHAR(128),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collaboration_participants (
        id VARCHAR(128) PRIMARY KEY,
        room_id VARCHAR(128) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        user_name VARCHAR(128) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'Participant',
        cursor_position JSONB DEFAULT '{}',
        joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collaboration_messages (
        id VARCHAR(128) PRIMARY KEY,
        room_id VARCHAR(128) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        user_name VARCHAR(128) NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(32) NOT NULL DEFAULT 'text',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collaboration_code_history (
        id VARCHAR(128) PRIMARY KEY,
        room_id VARCHAR(128) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        code_snippet TEXT NOT NULL,
        action_type VARCHAR(64) NOT NULL DEFAULT 'type',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collaboration_whiteboards (
        id VARCHAR(128) PRIMARY KEY,
        room_id VARCHAR(128) NOT NULL,
        shapes_json JSONB DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collaboration_sessions (
        id VARCHAR(128) PRIMARY KEY,
        room_id VARCHAR(128) NOT NULL,
        host_id VARCHAR(128) NOT NULL,
        duration_seconds INTEGER DEFAULT 0,
        ended_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collaboration_analytics (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) UNIQUE NOT NULL,
        sessions_participated INTEGER DEFAULT 0,
        time_collaborating_minutes INTEGER DEFAULT 0,
        pair_sessions INTEGER DEFAULT 0,
        interview_sessions INTEGER DEFAULT 0,
        problems_solved_together INTEGER DEFAULT 0,
        ai_interactions INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_collab_rooms_host ON collaboration_rooms(host_user_id);
      CREATE INDEX IF NOT EXISTS idx_collab_part_room ON collaboration_participants(room_id);
      CREATE INDEX IF NOT EXISTS idx_collab_part_user ON collaboration_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_collab_msg_room ON collaboration_messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_collab_code_room ON collaboration_code_history(room_id);
      CREATE INDEX IF NOT EXISTS idx_collab_wb_room ON collaboration_whiteboards(room_id);
      CREATE INDEX IF NOT EXISTS idx_collab_sess_room ON collaboration_sessions(room_id);
      CREATE INDEX IF NOT EXISTS idx_collab_an_user ON collaboration_analytics(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS collaboration_analytics CASCADE;
      DROP TABLE IF EXISTS collaboration_sessions CASCADE;
      DROP TABLE IF EXISTS collaboration_whiteboards CASCADE;
      DROP TABLE IF EXISTS collaboration_code_history CASCADE;
      DROP TABLE IF EXISTS collaboration_messages CASCADE;
      DROP TABLE IF EXISTS collaboration_participants CASCADE;
      DROP TABLE IF EXISTS collaboration_rooms CASCADE;
    `,
  },
];

export class Migrator {
  public static async runMigrations(): Promise<{ applied: string[]; currentVersion: string }> {
    const pool = Database.getPool();
    const applied: string[] = [];
    let currentVersion = "000";

    if (!pool) {
      Database.setMigrationVersion("017");
      return {
        applied: [
          "001_initial_schema",
          "002_indexes_and_constraints",
          "003_gamification_and_contests",
          "004_adaptive_learning",
          "005_admin_cms",
          "009_phase9_enhancements",
          "010_collaboration_community_enterprise",
          "011_judge_execution_schema",
          "012_oauth_identity_platform",
          "013_ai_generated_learning",
          "014_adaptive_ai_learning",
          "015_learning_memory_system",
          "016_company_prep_hub",
          "017_voice_ai_mentor",
        ],
        currentVersion: "017",
      };
    }


    const client = await pool.connect();

    try {
      // Ensure migration tracking table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          version VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Fetch already applied migrations
      const { rows } = await client.query<{ version: string }>(
        `SELECT version FROM schema_migrations ORDER BY version ASC;`
      );
      const appliedSet = new Set(rows.map((r) => r.version));

      for (const migration of MIGRATIONS) {
        if (!appliedSet.has(migration.version)) {
          logger.info(`[Migrator] Applying migration ${migration.name} (${migration.version})...`);
          
          await client.query("BEGIN;");
          try {
            await client.query(migration.up);
            await client.query(
              `INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, NOW());`,
              [migration.version, migration.name]
            );
            await client.query("COMMIT;");
            applied.push(migration.name);
            currentVersion = migration.version;
            logger.info(`[Migrator] Successfully applied ${migration.name}`);
          } catch (err: any) {
            await client.query("ROLLBACK;");
            logger.error(`[Migrator] Migration ${migration.name} failed: ${err.message}`);
            throw err;
          }
        } else {
          currentVersion = migration.version;
        }
      }

      Database.setMigrationVersion(currentVersion);
      return { applied, currentVersion };
    } finally {
      client.release();
    }
  }

  public static async rollbackMigration(targetVersion: string): Promise<string[]> {
    const pool = Database.getPool();
    if (!pool) return [];

    const client = await pool.connect();
    const rolledBack: string[] = [];

    try {
      const { rows } = await client.query<{ version: string; name: string }>(
        `SELECT version, name FROM schema_migrations ORDER BY version DESC;`
      );

      for (const row of rows) {
        if (row.version >= targetVersion) {
          const migrationDef = MIGRATIONS.find((m) => m.version === row.version);
          if (migrationDef && migrationDef.down) {
            logger.info(`[Migrator] Rolling back migration ${row.name}...`);
            await client.query("BEGIN;");
            try {
              await client.query(migrationDef.down);
              await client.query(`DELETE FROM schema_migrations WHERE version = $1;`, [row.version]);
              await client.query("COMMIT;");
              rolledBack.push(row.name);
            } catch (err: any) {
              await client.query("ROLLBACK;");
              throw err;
            }
          }
        }
      }

      return rolledBack;
    } finally {
      client.release();
    }
  }
}
