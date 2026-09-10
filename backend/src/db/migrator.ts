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
];

export class Migrator {
  public static async runMigrations(): Promise<{ applied: string[]; currentVersion: string }> {
    const pool = Database.getPool();
    const applied: string[] = [];
    let currentVersion = "000";

    if (!pool) {
      Database.setMigrationVersion("002");
      return { applied: ["001_initial_schema", "002_indexes_and_constraints"], currentVersion: "002" };
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
