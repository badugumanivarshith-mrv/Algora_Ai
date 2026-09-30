-- ============================================================================
-- ALGORA PRODUCTION POSTGRESQL SCHEMA
-- Comprehensive Database Schema for AI-Powered Coding Education Platform
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'faculty')),
    college VARCHAR(255) DEFAULT 'IIT Bombay',
    avatar_url TEXT,
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    streak INTEGER DEFAULT 1 CHECK (streak >= 0),
    target_company VARCHAR(100) DEFAULT 'Google',
    daily_goal_minutes INTEGER DEFAULT 45 CHECK (daily_goal_minutes > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. REFRESH TOKENS TABLE (JWT Sessions)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 3. PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reset_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(reset_token);

-- 4. LEARNING TRACKS TABLE
CREATE TABLE IF NOT EXISTS learning_tracks (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('languages', 'cs-core', 'interview-prep')),
    icon VARCHAR(100) DEFAULT 'Code2',
    color VARCHAR(50) DEFAULT '#2563eb',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TOPICS TABLE (8-Stage Progression)
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(100) PRIMARY KEY,
    track_id VARCHAR(100) NOT NULL REFERENCES learning_tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    estimated_minutes INTEGER DEFAULT 60,
    concept_content TEXT,
    syntax_cheatsheet TEXT,
    interactive_examples JSONB DEFAULT '[]'::jsonb,
    common_mistakes JSONB DEFAULT '[]'::jsonb,
    interview_questions JSONB DEFAULT '[]'::jsonb,
    prerequisite_topic_id VARCHAR(100) REFERENCES topics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_track ON topics(track_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(track_id, order_index);

-- 6. USER TOPIC PROGRESS (Enforced 8-Stage Progression)
CREATE TABLE IF NOT EXISTS user_topic_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id VARCHAR(100) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')),
    concept_completed BOOLEAN DEFAULT FALSE,
    syntax_completed BOOLEAN DEFAULT FALSE,
    examples_completed BOOLEAN DEFAULT FALSE,
    mistakes_completed BOOLEAN DEFAULT FALSE,
    problems_completed_count INTEGER DEFAULT 0,
    assignment_completed BOOLEAN DEFAULT FALSE,
    project_completed BOOLEAN DEFAULT FALSE,
    interview_completed BOOLEAN DEFAULT FALSE,
    mastery_score INTEGER DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
    last_studied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_topic UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_user_topic_prog ON user_topic_progress(user_id, topic_id);

-- 7. PROBLEMS TABLE (20-30 Easy, Medium, Hard per topic)
CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(100) PRIMARY KEY,
    topic_id VARCHAR(100) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    description TEXT NOT NULL,
    examples JSONB NOT NULL DEFAULT '[]'::jsonb,
    constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    companies TEXT[] DEFAULT ARRAY[]::TEXT[],
    starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    solution_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    acceptance_rate NUMERIC(5,2) DEFAULT 75.0,
    learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON problems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_problems_companies ON problems USING GIN(companies);

-- 8. PROBLEM HINTS (Socratic Ladder Hints)
CREATE TABLE IF NOT EXISTS problem_hints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id VARCHAR(100) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tier_level VARCHAR(50) NOT NULL CHECK (tier_level IN ('hint', 'approach', 'algorithm', 'pseudocode', 'partial_code', 'solution')),
    order_index INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hints_problem ON problem_hints(problem_id, order_index);

-- 9. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id VARCHAR(100) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL CHECK (language IN ('python', 'cpp', 'java', 'c')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error')),
    execution_time_ms INTEGER DEFAULT 0,
    memory_mb NUMERIC(5,2) DEFAULT 0.0,
    passed_test_cases INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);

-- 10. PROJECTS TABLE (Separate from problems, Level-based)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    overview TEXT NOT NULL,
    architecture_overview TEXT,
    estimated_hours INTEGER DEFAULT 10,
    learning_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
    prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    evaluation_criteria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON projects(difficulty);

-- 11. PROJECT MILESTONES & TASKS
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_milestones ON project_milestones(project_id, milestone_number);

-- 12. USER PROJECT ENROLLMENTS & PROGRESS
CREATE TABLE IF NOT EXISTS user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
    completed_task_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    reflection_notes TEXT DEFAULT '',
    repo_url TEXT,
    demo_url TEXT,
    ai_feedback TEXT,
    score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_project UNIQUE(user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_user_projects ON user_projects(user_id, project_id);

-- 13. DAILY REVIEWS (SM-2 Spaced Repetition Engine)
CREATE TABLE IF NOT EXISTS daily_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('problem', 'concept', 'mistake_card')),
    item_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtopic VARCHAR(100) NOT NULL,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    easiness_factor NUMERIC(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetition_number INTEGER DEFAULT 0,
    next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_reviews_queue ON daily_reviews(user_id, next_review_date);

-- 14. AI CONVERSATIONS & MESSAGES (Socratic Mentor Sessions)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('learn', 'practice', 'project', 'interview')),
    context_topic VARCHAR(100),
    context_problem_id VARCHAR(100),
    title VARCHAR(255) DEFAULT 'Mentorship Session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'code', 'insight', 'hint_tier')),
    tier_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id, created_at);

-- 15. ANALYTICS & LEARNING MEMORY SNAPSHOTS
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    radar_mastery JSONB NOT NULL DEFAULT '{}'::jsonb,
    weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    retention_rate NUMERIC(5,2) DEFAULT 80.0,
    placement_readiness_score INTEGER DEFAULT 45,
    velocity_problems_per_week NUMERIC(5,2) DEFAULT 12.5,
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_analytics UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_analytics ON user_analytics(user_id);
