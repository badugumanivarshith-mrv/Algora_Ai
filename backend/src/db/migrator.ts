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
  {
    version: "020",
    name: "020_ai_career_platform",
    up: `
      CREATE TABLE IF NOT EXISTS career_profiles (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) UNIQUE NOT NULL,
        career_goal VARCHAR(256),
        target_companies JSONB DEFAULT '[]',
        target_role VARCHAR(128),
        experience_level VARCHAR(64),
        preferred_tech_stack JSONB DEFAULT '[]',
        strength_areas JSONB DEFAULT '[]',
        weak_areas JSONB DEFAULT '[]',
        readiness_history JSONB DEFAULT '[]',
        learning_velocity NUMERIC DEFAULT 1.0,
        career_progression JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resume_versions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        title VARCHAR(256) NOT NULL,
        target_role VARCHAR(128) NOT NULL,
        template_id VARCHAR(64) DEFAULT 'modern',
        content_json JSONB NOT NULL DEFAULT '{}',
        ats_score NUMERIC DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resume_reviews (
        id VARCHAR(128) PRIMARY KEY,
        resume_id VARCHAR(128) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        ats_score NUMERIC DEFAULT 0,
        skill_gaps JSONB DEFAULT '[]',
        keyword_matches JSONB DEFAULT '[]',
        formatting_score NUMERIC DEFAULT 0,
        experience_quality VARCHAR(64),
        project_quality VARCHAR(64),
        achievements_score NUMERIC DEFAULT 0,
        issues JSONB DEFAULT '[]',
        suggestions JSONB DEFAULT '[]',
        improvement_plan TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS job_matches (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        company VARCHAR(128) NOT NULL,
        role VARCHAR(128) NOT NULL,
        match_percentage NUMERIC DEFAULT 0,
        skill_gaps JSONB DEFAULT '[]',
        recommended_topics JSONB DEFAULT '[]',
        recommended_problems JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS career_roadmaps (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        target_company VARCHAR(128) NOT NULL,
        target_role VARCHAR(128) NOT NULL,
        interview_date TIMESTAMPTZ,
        daily_plan JSONB DEFAULT '[]',
        weekly_plan JSONB DEFAULT '[]',
        monthly_plan JSONB DEFAULT '[]',
        revision_schedule JSONB DEFAULT '[]',
        mock_schedule JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recruiter_interviews (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        company VARCHAR(128) NOT NULL,
        interview_type VARCHAR(64) NOT NULL,
        scores_json JSONB DEFAULT '{}',
        communication_feedback TEXT,
        confidence_score NUMERIC DEFAULT 0,
        hiring_recommendation VARCHAR(64),
        transcript_json JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portfolio_analyses (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        github_username VARCHAR(128),
        portfolio_score NUMERIC DEFAULT 0,
        complexity_rating VARCHAR(64),
        tech_stack_detected JSONB DEFAULT '[]',
        architecture_score NUMERIC DEFAULT 0,
        documentation_score NUMERIC DEFAULT 0,
        strengths JSONB DEFAULT '[]',
        weaknesses JSONB DEFAULT '[]',
        recommendations JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS career_analytics (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) UNIQUE NOT NULL,
        readiness_trends JSONB DEFAULT '[]',
        learning_velocity NUMERIC DEFAULT 1.0,
        interview_performance JSONB DEFAULT '{}',
        contest_performance JSONB DEFAULT '{}',
        skill_growth JSONB DEFAULT '{}',
        company_readiness JSONB DEFAULT '{}',
        placement_probability NUMERIC DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS interview_history (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        session_id VARCHAR(128) NOT NULL,
        company VARCHAR(128) NOT NULL,
        round_type VARCHAR(64) NOT NULL,
        scores_json JSONB DEFAULT '{}',
        feedback_text TEXT,
        communication_metrics JSONB DEFAULT '{}',
        technical_metrics JSONB DEFAULT '{}',
        improvement_areas JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS placement_predictions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) UNIQUE NOT NULL,
        placement_confidence NUMERIC DEFAULT 0,
        interview_readiness NUMERIC DEFAULT 0,
        hiring_probability NUMERIC DEFAULT 0,
        company_breakdown JSONB DEFAULT '{}',
        risk_areas JSONB DEFAULT '[]',
        recommended_actions JSONB DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_career_profile_user ON career_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_resume_ver_user ON resume_versions(user_id);
      CREATE INDEX IF NOT EXISTS idx_resume_rev_resume ON resume_reviews(resume_id);
      CREATE INDEX IF NOT EXISTS idx_job_match_user ON job_matches(user_id);
      CREATE INDEX IF NOT EXISTS idx_career_map_user ON career_roadmaps(user_id);
      CREATE INDEX IF NOT EXISTS idx_recruiter_int_user ON recruiter_interviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_portfolio_an_user ON portfolio_analyses(user_id);
      CREATE INDEX IF NOT EXISTS idx_career_an_user ON career_analytics(user_id);
      CREATE INDEX IF NOT EXISTS idx_interview_hist_user ON interview_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_placement_pred_user ON placement_predictions(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS placement_predictions CASCADE;
      DROP TABLE IF EXISTS interview_history CASCADE;
      DROP TABLE IF EXISTS career_analytics CASCADE;
      DROP TABLE IF EXISTS portfolio_analyses CASCADE;
      DROP TABLE IF EXISTS recruiter_interviews CASCADE;
      DROP TABLE IF EXISTS career_roadmaps CASCADE;
      DROP TABLE IF EXISTS job_matches CASCADE;
      DROP TABLE IF EXISTS resume_reviews CASCADE;
      DROP TABLE IF EXISTS resume_versions CASCADE;
      DROP TABLE IF EXISTS career_profiles CASCADE;
    `,
  },
  {
    version: "021",
    name: "021_learning_intelligence_engine",
    up: `
      CREATE TABLE IF NOT EXISTS knowledge_nodes (
        id VARCHAR(64) PRIMARY KEY,
        topic VARCHAR(128) NOT NULL,
        subtopic VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL,
        difficulty_level VARCHAR(32) DEFAULT 'Medium',
        description TEXT,
        prerequisites JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_edges (
        id VARCHAR(64) PRIMARY KEY,
        source_node_id VARCHAR(64) NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
        target_node_id VARCHAR(64) NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
        relationship_type VARCHAR(64) DEFAULT 'prerequisite',
        weight NUMERIC DEFAULT 1.0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_paths (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        path_name VARCHAR(128) NOT NULL,
        target_goal VARCHAR(128) NOT NULL,
        node_sequence JSONB DEFAULT '[]',
        progress_percentage NUMERIC DEFAULT 0,
        current_node_id VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mastery_scores (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        topic VARCHAR(128) NOT NULL,
        subtopic VARCHAR(128) NOT NULL,
        mastery_rating NUMERIC DEFAULT 0,
        retention_score NUMERIC DEFAULT 0,
        revision_score NUMERIC DEFAULT 0,
        difficulty_score NUMERIC DEFAULT 0,
        last_practiced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic, subtopic)
      );

      CREATE TABLE IF NOT EXISTS topic_dependencies (
        id VARCHAR(64) PRIMARY KEY,
        topic VARCHAR(128) NOT NULL,
        parent_topic VARCHAR(128) NOT NULL,
        dependency_type VARCHAR(64) DEFAULT 'hard_prerequisite',
        importance_rating NUMERIC DEFAULT 5.0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_gaps (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        gap_type VARCHAR(64) NOT NULL, -- missing_prerequisite, weak_concept, repeated_mistake, interview_weakness
        topic VARCHAR(128) NOT NULL,
        subtopic VARCHAR(128),
        severity VARCHAR(32) DEFAULT 'Medium',
        detected_reason TEXT,
        remediation_action TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_predictions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        prediction_type VARCHAR(64) NOT NULL, -- topic_fail, topic_forget, interview_risk, placement_risk
        topic VARCHAR(128),
        risk_probability NUMERIC DEFAULT 0,
        prediction_reason TEXT,
        suggested_prevention TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        recommendation_type VARCHAR(64) NOT NULL, -- next_topic, revision_schedule, contest_suggestion, company_prep
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_resource VARCHAR(255),
        priority VARCHAR(32) DEFAULT 'High',
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_knodes_topic ON knowledge_nodes(topic);
      CREATE INDEX IF NOT EXISTS idx_kedges_src ON knowledge_edges(source_node_id);
      CREATE INDEX IF NOT EXISTS idx_kedges_tgt ON knowledge_edges(target_node_id);
      CREATE INDEX IF NOT EXISTS idx_lpaths_user ON learning_paths(user_id);
      CREATE INDEX IF NOT EXISTS idx_mscores_user_topic ON mastery_scores(user_id, topic);
      CREATE INDEX IF NOT EXISTS idx_kgaps_user ON knowledge_gaps(user_id);
      CREATE INDEX IF NOT EXISTS idx_kpred_user ON knowledge_predictions(user_id);
      CREATE INDEX IF NOT EXISTS idx_lrec_user ON learning_recommendations(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS learning_recommendations CASCADE;
      DROP TABLE IF EXISTS knowledge_predictions CASCADE;
      DROP TABLE IF EXISTS knowledge_gaps CASCADE;
      DROP TABLE IF EXISTS topic_dependencies CASCADE;
      DROP TABLE IF EXISTS mastery_scores CASCADE;
      DROP TABLE IF EXISTS learning_paths CASCADE;
      DROP TABLE IF EXISTS knowledge_edges CASCADE;
      DROP TABLE IF EXISTS knowledge_nodes CASCADE;
    `,
  },
  {
    version: "022",
    name: "022_contest_ecosystem",
    up: `
      CREATE TABLE IF NOT EXISTS contests (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        contest_type VARCHAR(64) NOT NULL DEFAULT 'Weekly', -- Daily, Weekly, Monthly, Team, Company, Virtual
        start_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '2 hours',
        duration_minutes INTEGER DEFAULT 120,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contest_problems (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        problem_id VARCHAR(64) NOT NULL,
        points INTEGER DEFAULT 100,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contest_participants (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        rating_before INTEGER DEFAULT 1500,
        rating_after INTEGER DEFAULT 1500,
        rank INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(contest_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS contest_submissions (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        problem_id VARCHAR(64) NOT NULL,
        verdict VARCHAR(64) NOT NULL DEFAULT 'Accepted', -- Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error
        runtime INTEGER DEFAULT 0, -- ms
        memory INTEGER DEFAULT 0, -- KB
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contest_teams (
        id VARCHAR(64) PRIMARY KEY,
        contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
        team_name VARCHAR(128) NOT NULL,
        captain_id VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contest_team_members (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES contest_teams(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS contest_analytics (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        contests_joined INTEGER DEFAULT 0,
        contests_won INTEGER DEFAULT 0,
        average_rank NUMERIC DEFAULT 0,
        rating INTEGER DEFAULT 1500,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contest_predictions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        predicted_rank INTEGER DEFAULT 0,
        predicted_rating INTEGER DEFAULT 1500,
        predicted_company_readiness NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cproblems_cid ON contest_problems(contest_id);
      CREATE INDEX IF NOT EXISTS idx_cpart_cid ON contest_participants(contest_id);
      CREATE INDEX IF NOT EXISTS idx_cpart_uid ON contest_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_csub_cid_uid ON contest_submissions(contest_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_cteam_cid ON contest_teams(contest_id);
      CREATE INDEX IF NOT EXISTS idx_canalytics_uid ON contest_analytics(user_id);
      CREATE INDEX IF NOT EXISTS idx_cpred_uid ON contest_predictions(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS contest_predictions CASCADE;
      DROP TABLE IF EXISTS contest_analytics CASCADE;
      DROP TABLE IF EXISTS contest_team_members CASCADE;
      DROP TABLE IF EXISTS contest_teams CASCADE;
      DROP TABLE IF EXISTS contest_submissions CASCADE;
      DROP TABLE IF EXISTS contest_participants CASCADE;
      DROP TABLE IF EXISTS contest_problems CASCADE;
      DROP TABLE IF EXISTS contests CASCADE;
    `,
  },
  {
    version: "023",
    name: "023_ai_hiring_assessment_platform",
    up: `
      CREATE TABLE IF NOT EXISTS assessments (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assessment_type VARCHAR(64) NOT NULL DEFAULT 'Online Assessment', -- Coding, AI Interview, MCQ, System Design
        company VARCHAR(128) NOT NULL DEFAULT 'Google',
        duration_minutes INTEGER DEFAULT 60,
        difficulty VARCHAR(32) DEFAULT 'Medium',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessment_questions (
        id VARCHAR(64) PRIMARY KEY,
        assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(64) NOT NULL DEFAULT 'Coding',
        question_content JSONB NOT NULL,
        points INTEGER DEFAULT 100
      );

      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id VARCHAR(64) PRIMARY KEY,
        assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        score INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 0,
        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS candidate_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        readiness_score NUMERIC DEFAULT 0,
        overall_rating INTEGER DEFAULT 1500,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS candidate_rankings (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        company VARCHAR(128) NOT NULL,
        ranking_score NUMERIC DEFAULT 0,
        percentile NUMERIC DEFAULT 0,
        UNIQUE(user_id, company)
      );

      CREATE TABLE IF NOT EXISTS recruiter_feedback (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL,
        company VARCHAR(128) NOT NULL,
        strengths TEXT[],
        weaknesses TEXT[],
        recommendation VARCHAR(64) DEFAULT 'Hire',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hiring_pipelines (
        id VARCHAR(64) PRIMARY KEY,
        company VARCHAR(128) NOT NULL,
        stage_name VARCHAR(128) NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS hiring_predictions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        company VARCHAR(128) NOT NULL,
        selection_probability NUMERIC DEFAULT 0,
        confidence_score NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company)
      );

      CREATE INDEX IF NOT EXISTS idx_aquestions_aid ON assessment_questions(assessment_id);
      CREATE INDEX IF NOT EXISTS idx_aattempts_aid_uid ON assessment_attempts(assessment_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_crankings_uid_comp ON candidate_rankings(user_id, company);
      CREATE INDEX IF NOT EXISTS idx_hpredictions_uid_comp ON hiring_predictions(user_id, company);
    `,
    down: `
      DROP TABLE IF EXISTS hiring_predictions CASCADE;
      DROP TABLE IF EXISTS hiring_pipelines CASCADE;
      DROP TABLE IF EXISTS recruiter_feedback CASCADE;
      DROP TABLE IF EXISTS candidate_rankings CASCADE;
      DROP TABLE IF EXISTS candidate_profiles CASCADE;
      DROP TABLE IF EXISTS assessment_attempts CASCADE;
      DROP TABLE IF EXISTS assessment_questions CASCADE;
      DROP TABLE IF EXISTS assessments CASCADE;
    `,
  },
  {
    version: "024",
    name: "024_enterprise_learning_ecosystem",
    up: `
      CREATE TABLE IF NOT EXISTS universities (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(64) UNIQUE NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(64) NOT NULL,
        head_of_department VARCHAR(128)
      );

      CREATE TABLE IF NOT EXISTS faculty_members (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
        user_id VARCHAR(64) NOT NULL,
        designation VARCHAR(128) DEFAULT 'Assistant Professor',
        email VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS student_batches (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
        batch_name VARCHAR(128) NOT NULL,
        graduation_year INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        code VARCHAR(64) NOT NULL,
        credits INTEGER DEFAULT 3,
        semester INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS course_modules (
        id VARCHAR(64) PRIMARY KEY,
        course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS module_progress (
        id VARCHAR(64) PRIMARY KEY,
        module_id VARCHAR(64) NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        status VARCHAR(64) DEFAULT 'In Progress',
        completed_at TIMESTAMPTZ,
        UNIQUE(module_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS classrooms (
        id VARCHAR(64) PRIMARY KEY,
        course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        faculty_id VARCHAR(64) REFERENCES faculty_members(id) ON DELETE SET NULL,
        room_name VARCHAR(128) NOT NULL,
        section VARCHAR(32) DEFAULT 'A'
      );

      CREATE TABLE IF NOT EXISTS classroom_members (
        id VARCHAR(64) PRIMARY KEY,
        classroom_id VARCHAR(64) NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        role VARCHAR(32) DEFAULT 'Student',
        UNIQUE(classroom_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS assignments_v2 (
        id VARCHAR(64) PRIMARY KEY,
        classroom_id VARCHAR(64) NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMPTZ,
        max_points INTEGER DEFAULT 100
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions_v2 (
        id VARCHAR(64) PRIMARY KEY,
        assignment_id VARCHAR(64) NOT NULL REFERENCES assignments_v2(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'Submitted',
        score INTEGER DEFAULT 0,
        submission_content TEXT,
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(assignment_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS attendance_records (
        id VARCHAR(64) PRIMARY KEY,
        classroom_id VARCHAR(64) NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(32) DEFAULT 'Present',
        UNIQUE(classroom_id, user_id, date)
      );

      CREATE TABLE IF NOT EXISTS placement_drives (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        company VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        min_cgpa NUMERIC DEFAULT 7.0,
        drive_date TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS placement_registrations (
        id VARCHAR(64) PRIMARY KEY,
        drive_id VARCHAR(64) NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'Registered',
        registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(drive_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS placement_results (
        id VARCHAR(64) PRIMARY KEY,
        drive_id VARCHAR(64) NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        verdict VARCHAR(64) DEFAULT 'Placed',
        package_lpa NUMERIC DEFAULT 12.0,
        UNIQUE(drive_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS university_analytics (
        id VARCHAR(64) PRIMARY KEY,
        university_id VARCHAR(64) UNIQUE NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        total_students INTEGER DEFAULT 0,
        average_placement_rate NUMERIC DEFAULT 0,
        top_skills TEXT[],
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_depts_univid ON departments(university_id);
      CREATE INDEX IF NOT EXISTS idx_fac_univid ON faculty_members(university_id);
      CREATE INDEX IF NOT EXISTS idx_courses_univid ON courses(university_id);
      CREATE INDEX IF NOT EXISTS idx_crooms_courseid ON classrooms(course_id);
      CREATE INDEX IF NOT EXISTS idx_cmembers_croomid_uid ON classroom_members(classroom_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_assign_croomid ON assignments_v2(classroom_id);
      CREATE INDEX IF NOT EXISTS idx_att_croomid_uid ON attendance_records(classroom_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_pdrives_univid ON placement_drives(university_id);
    `,
    down: `
      DROP TABLE IF EXISTS university_analytics CASCADE;
      DROP TABLE IF EXISTS placement_results CASCADE;
      DROP TABLE IF EXISTS placement_registrations CASCADE;
      DROP TABLE IF EXISTS placement_drives CASCADE;
      DROP TABLE IF EXISTS attendance_records CASCADE;
      DROP TABLE IF EXISTS assignment_submissions_v2 CASCADE;
      DROP TABLE IF EXISTS assignments_v2 CASCADE;
      DROP TABLE IF EXISTS classroom_members CASCADE;
      DROP TABLE IF EXISTS classrooms CASCADE;
      DROP TABLE IF EXISTS module_progress CASCADE;
      DROP TABLE IF EXISTS course_modules CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS student_batches CASCADE;
      DROP TABLE IF EXISTS faculty_members CASCADE;
      DROP TABLE IF EXISTS departments CASCADE;
      DROP TABLE IF EXISTS universities CASCADE;
    `,
  },
  {
    version: "025",
    name: "025_project_workspace_ecosystem",
    up: `
      CREATE TABLE IF NOT EXISTS project_workspaces (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'Active',
        repository_url VARCHAR(255),
        live_demo_url VARCHAR(255),
        tags TEXT[],
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_members (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        role VARCHAR(32) DEFAULT 'Contributor',
        joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(workspace_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS project_tasks (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to VARCHAR(64),
        status VARCHAR(32) DEFAULT 'Todo',
        priority VARCHAR(32) DEFAULT 'Medium',
        due_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_milestones (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'Pending',
        due_date TIMESTAMPTZ,
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS project_submissions (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        submission_url VARCHAR(255) NOT NULL,
        description TEXT,
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_reviews (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        reviewer_id VARCHAR(64) NOT NULL,
        architecture_score NUMERIC DEFAULT 0,
        scalability_score NUMERIC DEFAULT 0,
        maintainability_score NUMERIC DEFAULT 0,
        documentation_score NUMERIC DEFAULT 0,
        testing_score NUMERIC DEFAULT 0,
        overall_score NUMERIC DEFAULT 0,
        feedback JSONB,
        reviewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_skills (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        skill_name VARCHAR(128) NOT NULL,
        category VARCHAR(64),
        proficiency_gain NUMERIC DEFAULT 0,
        tracked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_activity_logs (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        activity_type VARCHAR(64) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS internship_programs (
        id VARCHAR(64) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        stipend VARCHAR(64),
        duration VARCHAR(64),
        location VARCHAR(128),
        tags TEXT[],
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS internship_applications (
        id VARCHAR(64) PRIMARY KEY,
        internship_id VARCHAR(64) NOT NULL REFERENCES internship_programs(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'Applied',
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(internship_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS internship_progress (
        id VARCHAR(64) PRIMARY KEY,
        internship_id VARCHAR(64) NOT NULL REFERENCES internship_programs(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        task_completed INTEGER DEFAULT 0,
        mentor_feedback TEXT,
        overall_rating NUMERIC DEFAULT 0,
        status VARCHAR(32) DEFAULT 'In-Progress',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(internship_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS project_analytics (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) UNIQUE NOT NULL REFERENCES project_workspaces(id) ON DELETE CASCADE,
        completion_rate NUMERIC DEFAULT 0,
        milestone_performance NUMERIC DEFAULT 0,
        team_productivity NUMERIC DEFAULT 0,
        quality_score NUMERIC DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_proj_work_owner ON project_workspaces(owner_id);
      CREATE INDEX IF NOT EXISTS idx_proj_mem_workid ON project_members(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_proj_mem_uid ON project_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_proj_task_workid ON project_tasks(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_proj_task_uid ON project_tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_proj_mile_workid ON project_milestones(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_proj_sub_workid ON project_submissions(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_proj_skill_uid ON project_skills(user_id);
      CREATE INDEX IF NOT EXISTS idx_int_app_iid ON internship_applications(internship_id);
      CREATE INDEX IF NOT EXISTS idx_int_app_uid ON internship_applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_int_prog_iid ON internship_progress(internship_id);
      CREATE INDEX IF NOT EXISTS idx_int_prog_uid ON internship_progress(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS project_analytics CASCADE;
      DROP TABLE IF EXISTS internship_progress CASCADE;
      DROP TABLE IF EXISTS internship_applications CASCADE;
      DROP TABLE IF EXISTS internship_programs CASCADE;
      DROP TABLE IF EXISTS project_activity_logs CASCADE;
      DROP TABLE IF EXISTS project_skills CASCADE;
      DROP TABLE IF EXISTS project_reviews CASCADE;
      DROP TABLE IF EXISTS project_submissions CASCADE;
      DROP TABLE IF EXISTS project_milestones CASCADE;
      DROP TABLE IF EXISTS project_tasks CASCADE;
      DROP TABLE IF EXISTS project_members CASCADE;
      DROP TABLE IF EXISTS project_workspaces CASCADE;
    `,
  },
  {
    version: "026",
    name: "026_research_innovation_ecosystem",
    up: `
      -- Research System
      CREATE TABLE IF NOT EXISTS research_projects (
        id VARCHAR(64) PRIMARY KEY,
        owner_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        abstract TEXT,
        domain VARCHAR(128),
        status VARCHAR(32) DEFAULT 'Active',
        visibility VARCHAR(32) DEFAULT 'Public',
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS research_papers (
        id VARCHAR(64) PRIMARY KEY,
        project_id VARCHAR(64) REFERENCES research_projects(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        authors TEXT[],
        publication_date DATE,
        url TEXT,
        abstract TEXT,
        tags TEXT[],
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS research_teams (
        id VARCHAR(64) PRIMARY KEY,
        project_id VARCHAR(64) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
        name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS research_members (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES research_teams(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        role VARCHAR(64) DEFAULT 'Researcher',
        joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS literature_reviews (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        summary TEXT,
        full_review TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS citations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        paper_title VARCHAR(255) NOT NULL,
        citation_text TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS research_analytics (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        papers_read INTEGER DEFAULT 0,
        projects_contributed INTEGER DEFAULT 0,
        impact_factor NUMERIC DEFAULT 0,
        collaboration_score NUMERIC DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Open Source System
      CREATE TABLE IF NOT EXISTS opensource_projects (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        repository_url TEXT UNIQUE NOT NULL,
        description TEXT,
        language VARCHAR(64),
        stars INTEGER DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS opensource_contributions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        project_id VARCHAR(64) REFERENCES opensource_projects(id) ON DELETE CASCADE,
        contribution_type VARCHAR(64) NOT NULL, -- Commit, PR, Issue
        description TEXT,
        impact_score NUMERIC DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pull_request_reviews (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        project_id VARCHAR(64) REFERENCES opensource_projects(id) ON DELETE CASCADE,
        pr_number INTEGER,
        review_text TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS opensource_rankings (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        rank_score NUMERIC DEFAULT 0,
        global_rank INTEGER,
        last_calculated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Innovation System
      CREATE TABLE IF NOT EXISTS innovation_projects (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(64),
        status VARCHAR(32) DEFAULT 'Draft',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS startup_ideas (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        problem_statement TEXT,
        solution_statement TEXT,
        market_size VARCHAR(128),
        evaluation_score NUMERIC DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mvp_roadmaps (
        id VARCHAR(64) PRIMARY KEY,
        project_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        milestones JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS innovation_analytics (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        ideas_count INTEGER DEFAULT 0,
        mvps_built INTEGER DEFAULT 0,
        feasibility_avg NUMERIC DEFAULT 0,
        innovation_score NUMERIC DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_res_proj_owner ON research_projects(owner_id);
      CREATE INDEX IF NOT EXISTS idx_res_paper_proj ON research_papers(project_id);
      CREATE INDEX IF NOT EXISTS idx_res_team_proj ON research_teams(project_id);
      CREATE INDEX IF NOT EXISTS idx_res_mem_team ON research_members(team_id);
      CREATE INDEX IF NOT EXISTS idx_res_mem_uid ON research_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_lit_rev_uid ON literature_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_cit_uid ON citations(user_id);
      CREATE INDEX IF NOT EXISTS idx_oss_cont_uid ON opensource_contributions(user_id);
      CREATE INDEX IF NOT EXISTS idx_oss_cont_proj ON opensource_contributions(project_id);
      CREATE INDEX IF NOT EXISTS idx_pr_rev_uid ON pull_request_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_inn_proj_uid ON innovation_projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_start_uid ON startup_ideas(user_id);
      CREATE INDEX IF NOT EXISTS idx_mvp_proj ON mvp_roadmaps(project_id);
      CREATE INDEX IF NOT EXISTS idx_mvp_uid ON mvp_roadmaps(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS innovation_analytics CASCADE;
      DROP TABLE IF EXISTS mvp_roadmaps CASCADE;
      DROP TABLE IF EXISTS startup_ideas CASCADE;
      DROP TABLE IF EXISTS innovation_projects CASCADE;
      DROP TABLE IF EXISTS opensource_rankings CASCADE;
      DROP TABLE IF EXISTS pull_request_reviews CASCADE;
      DROP TABLE IF EXISTS opensource_contributions CASCADE;
      DROP TABLE IF EXISTS opensource_projects CASCADE;
      DROP TABLE IF EXISTS research_analytics CASCADE;
      DROP TABLE IF EXISTS citations CASCADE;
      DROP TABLE IF EXISTS literature_reviews CASCADE;
      DROP TABLE IF EXISTS research_members CASCADE;
      DROP TABLE IF EXISTS research_teams CASCADE;
      DROP TABLE IF EXISTS research_papers CASCADE;
      DROP TABLE IF EXISTS research_projects CASCADE;
    `,
  },
  {
    version: "027",
    name: "027_ai_operating_system",
    up: `
      -- Agent System
      CREATE TABLE IF NOT EXISTS ai_agents (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(128) NOT NULL,
        agent_type VARCHAR(64) NOT NULL, -- Learning, Career, Research, Project, Contest, Startup
        status VARCHAR(32) DEFAULT 'Active',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_tasks (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'Pending',
        priority INTEGER DEFAULT 1,
        metadata JSONB,
        due_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_memory (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        memory_key VARCHAR(128) NOT NULL,
        memory_value TEXT,
        importance_score NUMERIC DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(agent_id, memory_key)
      );

      CREATE TABLE IF NOT EXISTS agent_workflows (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        steps JSONB NOT NULL,
        trigger_config JSONB,
        status VARCHAR(32) DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_executions (
        id VARCHAR(64) PRIMARY KEY,
        workflow_id VARCHAR(64) REFERENCES agent_workflows(id) ON DELETE SET NULL,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE SET NULL,
        user_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        input JSONB,
        output JSONB,
        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS agent_logs (
        id VARCHAR(64) PRIMARY KEY,
        execution_id VARCHAR(64) REFERENCES agent_executions(id) ON DELETE CASCADE,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE SET NULL,
        level VARCHAR(16) DEFAULT 'INFO',
        message TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Goal System
      CREATE TABLE IF NOT EXISTS user_goals (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(64), -- Career, Learning, Research, etc.
        target_date TIMESTAMPTZ,
        status VARCHAR(32) DEFAULT 'Active',
        progress NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS goal_milestones (
        id VARCHAR(64) PRIMARY KEY,
        goal_id VARCHAR(64) NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(32) DEFAULT 'Pending',
        metadata JSONB,
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS goal_predictions (
        id VARCHAR(64) PRIMARY KEY,
        goal_id VARCHAR(64) NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        probability NUMERIC DEFAULT 0,
        predicted_completion_date TIMESTAMPTZ,
        reasoning TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Automation System
      CREATE TABLE IF NOT EXISTS automations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(64), -- Schedule, Event, Manual
        action_config JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS automation_runs (
        id VARCHAR(64) PRIMARY KEY,
        automation_id VARCHAR(64) REFERENCES automations(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL,
        result JSONB,
        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMPTZ
      );

      -- Intelligence System
      CREATE TABLE IF NOT EXISTS personal_ai_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        preferences JSONB DEFAULT '{}',
        learning_style VARCHAR(64),
        career_focus TEXT[],
        research_interests TEXT[],
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_decisions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE SET NULL,
        decision_type VARCHAR(64),
        context JSONB,
        rationale TEXT,
        impact_score NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        category VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        action_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_agent_uid ON ai_agents(user_id);
      CREATE INDEX IF NOT EXISTS idx_agent_task_aid ON agent_tasks(agent_id);
      CREATE INDEX IF NOT EXISTS idx_agent_mem_aid ON agent_memory(agent_id);
      CREATE INDEX IF NOT EXISTS idx_agent_exec_wid ON agent_executions(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_goal_uid ON user_goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_goal_mile_gid ON goal_milestones(goal_id);
      CREATE INDEX IF NOT EXISTS idx_auto_uid ON automations(user_id);
      CREATE INDEX IF NOT EXISTS idx_rec_uid ON ai_recommendations(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS ai_recommendations CASCADE;
      DROP TABLE IF EXISTS ai_decisions CASCADE;
      DROP TABLE IF EXISTS personal_ai_profiles CASCADE;
      DROP TABLE IF EXISTS automation_runs CASCADE;
      DROP TABLE IF EXISTS automations CASCADE;
      DROP TABLE IF EXISTS goal_predictions CASCADE;
      DROP TABLE IF EXISTS goal_milestones CASCADE;
      DROP TABLE IF EXISTS user_goals CASCADE;
      DROP TABLE IF EXISTS agent_logs CASCADE;
      DROP TABLE IF EXISTS agent_executions CASCADE;
      DROP TABLE IF EXISTS agent_workflows CASCADE;
      DROP TABLE IF EXISTS agent_memory CASCADE;
      DROP TABLE IF EXISTS agent_tasks CASCADE;
      DROP TABLE IF EXISTS ai_agents CASCADE;
    `,
  },
  {
    version: "028",
    name: "028_agent_marketplace_and_builder",
    up: `
      CREATE TABLE IF NOT EXISTS agent_templates (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        agent_type VARCHAR(64) NOT NULL,
        instructions TEXT,
        personality JSONB,
        tools JSONB,
        memory_mode VARCHAR(32) DEFAULT 'standard',
        workflow_rules JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_workflow_steps (
        id VARCHAR(64) PRIMARY KEY,
        workflow_id VARCHAR(64) REFERENCES agent_workflows(id) ON DELETE CASCADE,
        step_type VARCHAR(64) NOT NULL, -- Trigger, Action, Condition, Decision, Loop, Memory, Agent
        config JSONB NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_marketplace (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE SET NULL,
        template_id VARCHAR(64) REFERENCES agent_templates(id) ON DELETE SET NULL,
        author_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(64),
        tags TEXT[],
        price_credits INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        install_count INTEGER DEFAULT 0,
        rating_avg NUMERIC DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_installs (
        id VARCHAR(64) PRIMARY KEY,
        marketplace_id VARCHAR(64) REFERENCES agent_marketplace(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        config_overrides JSONB,
        installed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(marketplace_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS agent_ratings (
        id VARCHAR(64) PRIMARY KEY,
        marketplace_id VARCHAR(64) REFERENCES agent_marketplace(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(marketplace_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS agent_teams (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        shared_memory_id VARCHAR(64),
        status VARCHAR(32) DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_team_members (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) REFERENCES agent_teams(id) ON DELETE CASCADE,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        role VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, agent_id)
      );

      CREATE TABLE IF NOT EXISTS agent_usage_analytics (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        agent_id VARCHAR(64),
        workflow_id VARCHAR(64),
        team_id VARCHAR(64),
        execution_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        avg_latency_ms NUMERIC,
        tokens_consumed INTEGER DEFAULT 0,
        last_executed_at TIMESTAMPTZ,
        UNIQUE(user_id, agent_id, workflow_id, team_id)
      );

      CREATE INDEX IF NOT EXISTS idx_template_type ON agent_templates(agent_type);
      CREATE INDEX IF NOT EXISTS idx_market_cat ON agent_marketplace(category);
      CREATE INDEX IF NOT EXISTS idx_market_author ON agent_marketplace(author_id);
      CREATE INDEX IF NOT EXISTS idx_install_uid ON agent_installs(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_uid ON agent_teams(user_id);
      CREATE INDEX IF NOT EXISTS idx_usage_uid ON agent_usage_analytics(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS agent_usage_analytics CASCADE;
      DROP TABLE IF EXISTS agent_team_members CASCADE;
      DROP TABLE IF EXISTS agent_teams CASCADE;
      DROP TABLE IF EXISTS agent_ratings CASCADE;
      DROP TABLE IF EXISTS agent_installs CASCADE;
      DROP TABLE IF EXISTS agent_marketplace CASCADE;
      DROP TABLE IF EXISTS agent_workflow_steps CASCADE;
      DROP TABLE IF EXISTS agent_templates CASCADE;
    `,
  },
  {
    version: "029",
    name: "029_enterprise_integrations_platform",
    up: `
      CREATE TABLE IF NOT EXISTS external_integrations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        service_name VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'Disconnected',
        permissions JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        last_synced_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, service_name)
      );

      CREATE TABLE IF NOT EXISTS integration_tokens (
        id VARCHAR(64) PRIMARY KEY,
        integration_id VARCHAR(64) REFERENCES external_integrations(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMPTZ,
        scopes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS automation_workflows (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_config JSONB NOT NULL,
        condition_config JSONB,
        action_config JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_triggered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workflow_executions (
        id VARCHAR(64) PRIMARY KEY,
        workflow_id VARCHAR(64) REFERENCES automation_workflows(id) ON DELETE CASCADE,
        status VARCHAR(32) DEFAULT 'Pending',
        input JSONB,
        output JSONB,
        error TEXT,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS workflow_logs (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(64) REFERENCES workflow_executions(id) ON DELETE CASCADE,
        level VARCHAR(16),
        message TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Update existing agent_tasks with new fields
      ALTER TABLE agent_tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
      ALTER TABLE agent_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        task_id VARCHAR(64) REFERENCES agent_tasks(id) ON DELETE CASCADE,
        cron_expression VARCHAR(64),
        next_run_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS productivity_metrics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        tasks_completed INT DEFAULT 0,
        workflows_executed INT DEFAULT 0,
        agent_actions INT DEFAULT 0,
        time_saved_seconds INT DEFAULT 0,
        success_rate DECIMAL(5,2) DEFAULT 0,
        UNIQUE(user_id, date)
      );

      CREATE TABLE IF NOT EXISTS notification_preferences (
        user_id VARCHAR(64) PRIMARY KEY,
        channels JSONB DEFAULT '{"in_app": true, "email": true, "push": false}',
        categories JSONB DEFAULT '{"workflow": true, "agent": true, "career": true, "research": true, "project": true}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_integrations_user ON external_integrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_workflows_user ON automation_workflows(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_user ON agent_tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_metrics_user_date ON productivity_metrics(user_id, date);
    `,
    down: `
      DROP TABLE IF EXISTS notification_preferences CASCADE;
      DROP TABLE IF EXISTS productivity_metrics CASCADE;
      DROP TABLE IF EXISTS scheduled_tasks CASCADE;
      DROP TABLE IF EXISTS workflow_logs CASCADE;
      DROP TABLE IF EXISTS workflow_executions CASCADE;
      DROP TABLE IF EXISTS automation_workflows CASCADE;
      DROP TABLE IF EXISTS integration_tokens CASCADE;
      DROP TABLE IF EXISTS external_integrations CASCADE;
    `,
  },
  {
    version: "030",
    name: "030_agent_operations_platform",
    up: `
      CREATE TABLE IF NOT EXISTS agent_executions (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'Running',
        input JSONB,
        output JSONB,
        error TEXT,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        duration_ms INTEGER
      );

      CREATE TABLE IF NOT EXISTS agent_execution_steps (
        id VARCHAR(64) PRIMARY KEY,
        execution_id VARCHAR(64) REFERENCES agent_executions(id) ON DELETE CASCADE,
        step_name VARCHAR(128) NOT NULL,
        status VARCHAR(32) DEFAULT 'Pending',
        input JSONB,
        output JSONB,
        error TEXT,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS workflow_events (
        id SERIAL PRIMARY KEY,
        workflow_id VARCHAR(64) REFERENCES agent_workflows(id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL,
        payload JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_health (
        agent_id VARCHAR(64) PRIMARY KEY REFERENCES ai_agents(id) ON DELETE CASCADE,
        health_score DECIMAL(5,2) DEFAULT 100,
        success_rate DECIMAL(5,2) DEFAULT 0,
        failure_rate DECIMAL(5,2) DEFAULT 0,
        avg_runtime_ms INTEGER DEFAULT 0,
        total_token_usage INTEGER DEFAULT 0,
        total_executions INTEGER DEFAULT 0,
        last_success_at TIMESTAMPTZ,
        last_failure_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_alerts (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL,
        message TEXT NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS agent_recovery_logs (
        id VARCHAR(64) PRIMARY KEY,
        execution_id VARCHAR(64) REFERENCES agent_executions(id) ON DELETE CASCADE,
        recovery_type VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        details TEXT,
        result JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS system_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(64) NOT NULL,
        metric_value DECIMAL(16,4) NOT NULL,
        labels JSONB,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS execution_metrics (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(64) REFERENCES agent_executions(id) ON DELETE CASCADE,
        metric_name VARCHAR(64) NOT NULL,
        metric_value DECIMAL(16,4) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_dependencies (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        depends_on_agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        dependency_type VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_versions (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        version_number VARCHAR(32) NOT NULL,
        config JSONB NOT NULL,
        changes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_agent_executions_user ON agent_executions(user_id);
      CREATE INDEX IF NOT EXISTS idx_workflow_events_wf ON workflow_events(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_agent_alerts_user ON agent_alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name, timestamp);
    `,
    down: `
      DROP TABLE IF EXISTS agent_versions CASCADE;
      DROP TABLE IF EXISTS agent_dependencies CASCADE;
      DROP TABLE IF EXISTS execution_metrics CASCADE;
      DROP TABLE IF EXISTS system_metrics CASCADE;
      DROP TABLE IF EXISTS agent_recovery_logs CASCADE;
      DROP TABLE IF EXISTS agent_alerts CASCADE;
      DROP TABLE IF EXISTS agent_health CASCADE;
      DROP TABLE IF EXISTS workflow_events CASCADE;
      DROP TABLE IF EXISTS agent_execution_steps CASCADE;
      DROP TABLE IF EXISTS agent_executions CASCADE;
    `,
  },
  {
    version: "031",
    name: "031_knowledge_fabric_platform",
    up: `
      CREATE TABLE IF NOT EXISTS global_entities (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        entity_type VARCHAR(64) NOT NULL, -- Topic, Skill, Company, Project, Research, Contest, Assessment, Agent
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS entity_relationships (
        id VARCHAR(64) PRIMARY KEY,
        source_id VARCHAR(64) REFERENCES global_entities(id) ON DELETE CASCADE,
        target_id VARCHAR(64) REFERENCES global_entities(id) ON DELETE CASCADE,
        relationship_type VARCHAR(64) NOT NULL, -- Prerequisite, Related, ImpactedBy, ComponentOf
        weight DECIMAL(5,2) DEFAULT 1.0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(source_id, target_id, relationship_type)
      );

      CREATE TABLE IF NOT EXISTS memory_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) REFERENCES global_entities(id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL, -- Learning, Career, Research, Project, Execution
        payload JSONB NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS knowledge_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        snapshot_data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS knowledge_embeddings (
        id VARCHAR(64) PRIMARY KEY,
        entity_id VARCHAR(64) REFERENCES global_entities(id) ON DELETE CASCADE,
        embedding_vector VECTOR(768), -- Assuming Gemini embeddings
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_intelligence_profiles (
        user_id VARCHAR(64) PRIMARY KEY,
        overall_mastery DECIMAL(5,2) DEFAULT 0,
        learning_velocity DECIMAL(5,2) DEFAULT 0,
        hiring_readiness DECIMAL(5,2) DEFAULT 0,
        career_progress DECIMAL(5,2) DEFAULT 0,
        research_impact DECIMAL(5,2) DEFAULT 0,
        project_completion_rate DECIMAL(5,2) DEFAULT 0,
        top_skills TEXT[],
        skill_distribution JSONB DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cross_domain_insights (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        insight_type VARCHAR(64) NOT NULL, -- Performance, Readiness, Gap, Optimization
        description TEXT NOT NULL,
        recommendation TEXT,
        metadata JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_memory_links (
        id VARCHAR(64) PRIMARY KEY,
        agent_id VARCHAR(64) REFERENCES ai_agents(id) ON DELETE CASCADE,
        entity_id VARCHAR(64) REFERENCES global_entities(id) ON DELETE CASCADE,
        relevance_score DECIMAL(5,2) DEFAULT 1.0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS knowledge_queries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        query_text TEXT NOT NULL,
        response_data JSONB,
        execution_time_ms INTEGER,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS knowledge_analytics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        metric_name VARCHAR(64) NOT NULL,
        metric_value DECIMAL(16,4) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_entities_type ON global_entities(entity_type);
      CREATE INDEX IF NOT EXISTS idx_relationships_source ON entity_relationships(source_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_target ON entity_relationships(target_id);
      CREATE INDEX IF NOT EXISTS idx_mem_events_user ON memory_events(user_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_insights_user ON cross_domain_insights(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_queries_user ON knowledge_queries(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS knowledge_analytics CASCADE;
      DROP TABLE IF EXISTS knowledge_queries CASCADE;
      DROP TABLE IF EXISTS agent_memory_links CASCADE;
      DROP TABLE IF EXISTS cross_domain_insights CASCADE;
      DROP TABLE IF EXISTS user_intelligence_profiles CASCADE;
      DROP TABLE IF EXISTS knowledge_embeddings CASCADE;
      DROP TABLE IF EXISTS knowledge_snapshots CASCADE;
      DROP TABLE IF EXISTS memory_events CASCADE;
      DROP TABLE IF EXISTS entity_relationships CASCADE;
      DROP TABLE IF EXISTS global_entities CASCADE;
    `,
  },
  {
    version: "032",
    name: "032_strategic_decision_engine",
    up: `
      CREATE TABLE IF NOT EXISTS strategic_goals (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        goal_type VARCHAR(64) NOT NULL,
        target_role VARCHAR(128),
        target_company VARCHAR(128),
        current_state JSONB DEFAULT '{}',
        target_state JSONB DEFAULT '{}',
        current_position TEXT,
        gap_analysis JSONB DEFAULT '[]',
        probability_score DECIMAL(5,2) DEFAULT 70.0,
        timeline_months INT DEFAULT 6,
        status VARCHAR(32) DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS strategic_plans (
        id VARCHAR(64) PRIMARY KEY,
        goal_id VARCHAR(64) REFERENCES strategic_goals(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        roadmap_milestones JSONB DEFAULT '[]',
        trade_offs JSONB DEFAULT '[]',
        bottlenecks JSONB DEFAULT '[]',
        execution_velocity DECIMAL(5,2) DEFAULT 80.0,
        status VARCHAR(32) DEFAULT 'In_Progress',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS decision_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        goal_id VARCHAR(64) REFERENCES strategic_goals(id) ON DELETE SET NULL,
        category VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        action_title VARCHAR(255),
        description TEXT,
        reasoning TEXT,
        priority VARCHAR(32) DEFAULT 'High',
        expected_impact VARCHAR(64) DEFAULT 'High',
        impact_score DECIMAL(4,2) DEFAULT 8.5,
        urgency VARCHAR(32) DEFAULT 'High',
        effort_level VARCHAR(32) DEFAULT 'Medium',
        rationale TEXT,
        tradeoff_summary TEXT,
        action_url VARCHAR(255),
        status VARCHAR(32) DEFAULT 'Pending',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS decision_history (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        decision_type VARCHAR(64) NOT NULL,
        context JSONB DEFAULT '{}',
        recommendation_id VARCHAR(64) REFERENCES decision_recommendations(id) ON DELETE SET NULL,
        user_action VARCHAR(64) NOT NULL,
        outcome_metric JSONB DEFAULT '{}',
        feedback TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS opportunity_scores (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        opportunity_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        description TEXT,
        opportunity_url VARCHAR(255),
        match_score DECIMAL(5,2) DEFAULT 80.0,
        relevance_score DECIMAL(5,2) DEFAULT 85.0,
        skill_alignment_score DECIMAL(5,2) DEFAULT 85.0,
        roi_score DECIMAL(5,2) DEFAULT 90.0,
        roi_ranking INT DEFAULT 1,
        difficulty VARCHAR(32) DEFAULT 'Medium',
        deadline TIMESTAMPTZ,
        status VARCHAR(32) DEFAULT 'Available',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS risk_assessments (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        risk_type VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        impact_domain VARCHAR(64),
        mitigation_strategy TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_mitigated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS career_strategies (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        goal_id VARCHAR(64) REFERENCES strategic_goals(id) ON DELETE CASCADE,
        strategy_data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS learning_strategies (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        goal_id VARCHAR(64) REFERENCES strategic_goals(id) ON DELETE CASCADE,
        strategy_data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_strategies (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        goal_id VARCHAR(64) REFERENCES strategic_goals(id) ON DELETE CASCADE,
        strategy_data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS executive_insights (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        insight_type VARCHAR(64) DEFAULT 'DailyBriefing',
        executive_summary TEXT NOT NULL,
        summary TEXT,
        key_bottleneck TEXT,
        primary_focus_today TEXT,
        strategic_tradeoff TEXT,
        action_plan JSONB DEFAULT '[]',
        confidence_level DECIMAL(5,2) DEFAULT 88.0,
        confidence_score DECIMAL(5,2) DEFAULT 88.0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_strategic_goals_user ON strategic_goals(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_dec_recs_user ON decision_recommendations(user_id, status, impact_score);
      CREATE INDEX IF NOT EXISTS idx_opp_scores_user ON opportunity_scores(user_id, roi_score);
      CREATE INDEX IF NOT EXISTS idx_risks_user ON risk_assessments(user_id, is_active, severity);
      CREATE INDEX IF NOT EXISTS idx_exec_insights_user ON executive_insights(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_dec_history_user ON decision_history(user_id, created_at);
    `,
    down: `
      DROP TABLE IF EXISTS executive_insights CASCADE;
      DROP TABLE IF EXISTS project_strategies CASCADE;
      DROP TABLE IF EXISTS learning_strategies CASCADE;
      DROP TABLE IF EXISTS career_strategies CASCADE;
      DROP TABLE IF EXISTS risk_assessments CASCADE;
      DROP TABLE IF EXISTS opportunity_scores CASCADE;
      DROP TABLE IF EXISTS decision_history CASCADE;
      DROP TABLE IF EXISTS decision_recommendations CASCADE;
      DROP TABLE IF EXISTS strategic_plans CASCADE;
      DROP TABLE IF EXISTS strategic_goals CASCADE;
    `,
  },
  {
    version: "033",
    name: "033_autonomous_execution_layer",
    up: `
      CREATE TABLE IF NOT EXISTS digital_twins (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        learning_progress JSONB DEFAULT '{}',
        mastery_scores JSONB DEFAULT '{}',
        contest_ratings JSONB DEFAULT '{}',
        hiring_readiness JSONB DEFAULT '{}',
        research_performance JSONB DEFAULT '{}',
        project_achievements JSONB DEFAULT '{}',
        productivity_metrics JSONB DEFAULT '{}',
        strategic_goals JSONB DEFAULT '{}',
        agent_activity JSONB DEFAULT '{}',
        growth_models JSONB DEFAULT '{}',
        risk_factors JSONB DEFAULT '[]',
        readiness_forecast JSONB DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS digital_twin_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        digital_twin_id VARCHAR(64) REFERENCES digital_twins(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        snapshot_data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS future_simulations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        goal_id VARCHAR(64),
        timeframe VARCHAR(32) NOT NULL,
        assumptions JSONB DEFAULT '{}',
        status VARCHAR(32) DEFAULT 'Completed',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS simulation_results (
        id VARCHAR(64) PRIMARY KEY,
        simulation_id VARCHAR(64) REFERENCES future_simulations(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        scenario_type VARCHAR(32) NOT NULL,
        learning_growth JSONB DEFAULT '{}',
        contest_ratings JSONB DEFAULT '{}',
        hiring_probability JSONB DEFAULT '{}',
        research_impact JSONB DEFAULT '{}',
        career_outcomes JSONB DEFAULT '{}',
        startup_potential JSONB DEFAULT '{}',
        key_milestones JSONB DEFAULT '[]',
        risk_analysis JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS autonomous_plans (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        goal_id VARCHAR(64),
        plan_type VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        roadmaps JSONB DEFAULT '{}',
        milestones JSONB DEFAULT '[]',
        status VARCHAR(32) DEFAULT 'Active',
        execution_velocity DECIMAL(5,2) DEFAULT 80.0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS execution_actions (
        id VARCHAR(64) PRIMARY KEY,
        plan_id VARCHAR(64) REFERENCES autonomous_plans(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        action_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(32) DEFAULT 'High',
        estimated_minutes INT DEFAULT 45,
        deadline TIMESTAMPTZ,
        status VARCHAR(32) DEFAULT 'Planned',
        workflow_id VARCHAR(64),
        outcome_data JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS execution_timelines (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        event_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'Success',
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS adaptive_strategy_updates (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        trigger_reason TEXT NOT NULL,
        stagnation_metrics JSONB DEFAULT '{}',
        adjustments_made JSONB DEFAULT '[]',
        recalculated_priorities JSONB DEFAULT '[]',
        recovery_workflow_id VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS opportunity_discoveries (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        opportunity_type VARCHAR(64) NOT NULL,
        source_platform VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        description TEXT,
        opportunity_url VARCHAR(255),
        match_score DECIMAL(5,2) DEFAULT 85.0,
        roi_score DECIMAL(5,2) DEFAULT 85.0,
        time_investment VARCHAR(128),
        strategic_value TEXT,
        recommended_action TEXT,
        status VARCHAR(32) DEFAULT 'Discovered',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS execution_predictions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        metric_name VARCHAR(128) NOT NULL,
        current_value DECIMAL(16,4) NOT NULL,
        predicted_value_30d DECIMAL(16,4) NOT NULL,
        predicted_value_90d DECIMAL(16,4) NOT NULL,
        confidence_level DECIMAL(5,2) DEFAULT 88.0,
        model_factors JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_digital_twins_user ON digital_twins(user_id);
      CREATE INDEX IF NOT EXISTS idx_future_sims_user ON future_simulations(user_id, timeframe);
      CREATE INDEX IF NOT EXISTS idx_sim_results_sim ON simulation_results(simulation_id, scenario_type);
      CREATE INDEX IF NOT EXISTS idx_auto_plans_user ON autonomous_plans(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_exec_actions_user ON execution_actions(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_exec_timeline_user ON execution_timelines(user_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_opp_discoveries_user ON opportunity_discoveries(user_id, roi_score);
    `,
    down: `
      DROP TABLE IF EXISTS execution_predictions CASCADE;
      DROP TABLE IF EXISTS opportunity_discoveries CASCADE;
      DROP TABLE IF EXISTS adaptive_strategy_updates CASCADE;
      DROP TABLE IF EXISTS execution_timelines CASCADE;
      DROP TABLE IF EXISTS execution_actions CASCADE;
      DROP TABLE IF EXISTS autonomous_plans CASCADE;
      DROP TABLE IF EXISTS simulation_results CASCADE;
      DROP TABLE IF EXISTS future_simulations CASCADE;
      DROP TABLE IF EXISTS digital_twin_snapshots CASCADE;
      DROP TABLE IF EXISTS digital_twins CASCADE;
    `,
  },
  {
    version: "034",
    name: "034_multi_agent_executive_council",
    up: `
      CREATE TABLE IF NOT EXISTS executive_agents (
        id VARCHAR(64) PRIMARY KEY,
        agent_type VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(128) NOT NULL,
        avatar_url VARCHAR(255),
        description TEXT,
        mandate TEXT,
        core_metrics JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_councils (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        session_name VARCHAR(255) NOT NULL,
        status VARCHAR(32) DEFAULT 'Completed',
        summary TEXT,
        consensus_score DECIMAL(5,2) DEFAULT 88.0,
        dominant_theme VARCHAR(128),
        prioritized_actions JSONB DEFAULT '[]',
        conflict_resolutions JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        council_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        agent_id VARCHAR(64) NOT NULL,
        agent_name VARCHAR(128) NOT NULL,
        agent_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        proposal TEXT NOT NULL,
        priority_score DECIMAL(5,2) NOT NULL,
        urgency VARCHAR(32) DEFAULT 'High',
        estimated_roi DECIMAL(5,2) DEFAULT 85.0,
        effort_hours DECIMAL(5,2) DEFAULT 4.0,
        status VARCHAR(32) DEFAULT 'Proposed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS executive_debates (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        challenger_agent VARCHAR(64) NOT NULL,
        defender_agent VARCHAR(64) NOT NULL,
        transcript JSONB DEFAULT '[]',
        winner_agent VARCHAR(64) NOT NULL,
        justification TEXT NOT NULL,
        opportunity_cost_analysis TEXT NOT NULL,
        expected_roi DECIMAL(5,2) NOT NULL,
        resource_allocation JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS executive_memories (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        memory_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        context TEXT,
        rationale TEXT,
        impact_score DECIMAL(5,2) DEFAULT 80.0,
        associated_agents JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS life_plans (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        horizon VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        pillars JSONB DEFAULT '{}',
        status VARCHAR(32) DEFAULT 'Active',
        completion_rate DECIMAL(5,2) DEFAULT 0.0,
        target_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS strategic_campaigns (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        campaign_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'In_Progress',
        target_company VARCHAR(128),
        success_probability DECIMAL(5,2) DEFAULT 75.0,
        weekly_objectives JSONB DEFAULT '[]',
        critical_blockers JSONB DEFAULT '[]',
        recovery_plans JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS campaign_milestones (
        id VARCHAR(64) PRIMARY KEY,
        campaign_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        milestone_index INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_week INT NOT NULL,
        status VARCHAR(32) DEFAULT 'Pending',
        deliverables JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS opportunity_rankings (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        opportunity_id VARCHAR(64) NOT NULL,
        category VARCHAR(64) NOT NULL,
        sub_category VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        match_score DECIMAL(5,2) DEFAULT 85.0,
        roi_score DECIMAL(5,2) DEFAULT 85.0,
        time_cost VARCHAR(128),
        difficulty VARCHAR(32),
        success_probability DECIMAL(5,2) DEFAULT 80.0,
        recommended_action TEXT,
        status VARCHAR(32) DEFAULT 'Active',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS executive_decisions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        decision_type VARCHAR(64) NOT NULL,
        lead_agent VARCHAR(64) NOT NULL,
        summary TEXT NOT NULL,
        tradeoffs TEXT,
        expected_roi DECIMAL(5,2) DEFAULT 85.0,
        confidence_score DECIMAL(5,2) DEFAULT 90.0,
        action_items JSONB DEFAULT '[]',
        status VARCHAR(32) DEFAULT 'Approved',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_councils_user ON agent_councils(user_id);
      CREATE INDEX IF NOT EXISTS idx_recommendations_council ON agent_recommendations(council_id, priority_score);
      CREATE INDEX IF NOT EXISTS idx_debates_user ON executive_debates(user_id);
      CREATE INDEX IF NOT EXISTS idx_exec_memories_user ON executive_memories(user_id, memory_type);
      CREATE INDEX IF NOT EXISTS idx_life_plans_user ON life_plans(user_id, horizon);
      CREATE INDEX IF NOT EXISTS idx_campaigns_user ON strategic_campaigns(user_id, campaign_type);
      CREATE INDEX IF NOT EXISTS idx_camp_milestones ON campaign_milestones(campaign_id, due_week);
      CREATE INDEX IF NOT EXISTS idx_opp_rankings_user ON opportunity_rankings(user_id, category, roi_score);
      CREATE INDEX IF NOT EXISTS idx_exec_decisions_user ON executive_decisions(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS executive_decisions CASCADE;
      DROP TABLE IF EXISTS opportunity_rankings CASCADE;
      DROP TABLE IF EXISTS campaign_milestones CASCADE;
      DROP TABLE IF EXISTS strategic_campaigns CASCADE;
      DROP TABLE IF EXISTS life_plans CASCADE;
      DROP TABLE IF EXISTS executive_memories CASCADE;
      DROP TABLE IF EXISTS executive_debates CASCADE;
      DROP TABLE IF EXISTS agent_recommendations CASCADE;
      DROP TABLE IF EXISTS agent_councils CASCADE;
      DROP TABLE IF EXISTS executive_agents CASCADE;
    `,
  },
];

export class Migrator {
  public static async runMigrations(): Promise<{ applied: string[]; currentVersion: string }> {
    const pool = Database.getPool();
    const applied: string[] = [];
    let currentVersion = "000";

    if (!pool) {
      Database.setMigrationVersion("028");
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
          "018_live_collaboration_system",
          "020_ai_career_platform",
          "021_learning_intelligence_engine",
          "022_contest_ecosystem",
          "023_ai_hiring_assessment_platform",
          "024_enterprise_learning_ecosystem",
          "025_project_workspace_ecosystem",
          "026_research_innovation_ecosystem",
          "027_ai_operating_system",
          "028_agent_marketplace_and_builder",
          "029_enterprise_integrations_platform",
          "030_agent_operations_platform",
          "031_knowledge_fabric_platform",
          "032_strategic_decision_engine",
          "033_autonomous_execution_layer",
          "034_multi_agent_executive_council",
        ],
        currentVersion: "034",
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
