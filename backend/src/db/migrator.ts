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
];

export class Migrator {
  public static async runMigrations(): Promise<{ applied: string[]; currentVersion: string }> {
    const pool = Database.getPool();
    const applied: string[] = [];
    let currentVersion = "000";

    if (!pool) {
      Database.setMigrationVersion("005");
      return {
        applied: [
          "001_initial_schema",
          "002_indexes_and_constraints",
          "003_gamification_and_contests",
          "004_adaptive_learning",
          "005_admin_cms",
        ],
        currentVersion: "005",
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
