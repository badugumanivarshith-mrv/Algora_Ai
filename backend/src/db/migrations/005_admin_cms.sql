-- Migration 005: Admin CMS & Content Management
-- Creates roles, permissions, admins, problem management, problem versions, topics, curriculum, contest registrations, system settings, and audit logs

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

-- Performance Indexes & Constraints
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
