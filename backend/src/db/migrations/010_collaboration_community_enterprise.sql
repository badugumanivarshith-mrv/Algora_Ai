-- Phase 10 Database Migration: Collaboration, Community & Enterprise Features

-- 1. Discussions & Forum System
CREATE TABLE IF NOT EXISTS discussions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(120) NOT NULL,
    author_avatar TEXT,
    problem_slug VARCHAR(128),
    contest_id VARCHAR(64),
    category VARCHAR(64) NOT NULL DEFAULT 'general', -- 'general', 'problem', 'contest', 'career', 'interview', 'algorithms'
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
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'flagged', 'hidden', 'deleted'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_problem ON discussions(problem_slug);
CREATE INDEX IF NOT EXISTS idx_discussions_contest ON discussions(contest_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_upvotes ON discussions(upvotes DESC);

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
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'flagged', 'deleted'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_disc ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_reply_id);

CREATE TABLE IF NOT EXISTS discussion_votes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(32) NOT NULL, -- 'discussion', 'reply'
    target_id VARCHAR(64) NOT NULL,
    vote_type VARCHAR(16) NOT NULL, -- 'up', 'down'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_vote UNIQUE (user_id, target_type, target_id)
);

-- 2. Peer Learning & Study Groups
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
CREATE INDEX IF NOT EXISTS idx_study_groups_slug ON study_groups(slug);
CREATE INDEX IF NOT EXISTS idx_study_groups_owner ON study_groups(owner_id);

CREATE TABLE IF NOT EXISTS study_group_members (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(32) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    contribution_score INT NOT NULL DEFAULT 0,
    problems_solved_in_group INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);

CREATE TABLE IF NOT EXISTS study_group_messages (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    avatar_url TEXT,
    message TEXT NOT NULL,
    message_type VARCHAR(32) NOT NULL DEFAULT 'text', -- 'text', 'code', 'goal_update', 'problem_share'
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_group ON study_group_messages(group_id, created_at ASC);

CREATE TABLE IF NOT EXISTS study_group_goals (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_problems_count INT NOT NULL DEFAULT 20,
    completed_problems_count INT NOT NULL DEFAULT 0,
    deadline TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_group_goals_group ON study_group_goals(group_id);

-- 3. Team Contests
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
CREATE INDEX IF NOT EXISTS idx_contest_teams_contest ON contest_teams(contest_id, rank);

CREATE TABLE IF NOT EXISTS contest_team_members (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES contest_teams(id) ON DELETE CASCADE,
    contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'member', -- 'captain', 'member'
    individual_score INT NOT NULL DEFAULT 0,
    penalty_seconds INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'accepted', -- 'accepted', 'invited'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contest_team_user UNIQUE (contest_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_contest_team_members_team ON contest_team_members(team_id);

-- 4. Mentorship System
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
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_company ON mentor_profiles(company);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON mentor_profiles(rating DESC);

CREATE TABLE IF NOT EXISTS mentorship_requests (
    id VARCHAR(64) PRIMARY KEY,
    mentor_id VARCHAR(64) NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_username VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    target_role_company VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON mentorship_requests(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_student ON mentorship_requests(student_id);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id VARCHAR(64) PRIMARY KEY,
    mentor_id VARCHAR(64) NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    meeting_link VARCHAR(255) NOT NULL DEFAULT 'https://meet.algora.ai/session',
    status VARCHAR(32) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    mentor_notes TEXT,
    student_feedback TEXT,
    rating INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentor ON mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_student ON mentorship_sessions(student_id);

-- 5. Interview Preparation Hub
CREATE TABLE IF NOT EXISTS interview_tracks (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    company_tier VARCHAR(64) NOT NULL, -- 'FAANG', 'Big Tech', 'Fintech', 'AI Frontier'
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
    type VARCHAR(32) NOT NULL DEFAULT 'coding', -- 'coding', 'system_design', 'behavioral'
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
    interview_type VARCHAR(32) NOT NULL DEFAULT 'coding', -- 'coding', 'behavioral', 'system_design'
    company_target VARCHAR(128) NOT NULL DEFAULT 'Google SWE L4',
    status VARCHAR(32) NOT NULL DEFAULT 'completed', -- 'in_progress', 'completed'
    score INT NOT NULL DEFAULT 85,
    duration_seconds INT NOT NULL DEFAULT 1800,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
    readiness_rating VARCHAR(64) NOT NULL DEFAULT 'Strong Hire',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user ON mock_interview_sessions(user_id, created_at DESC);

-- 6. Community Profiles & Activity
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
    activity_type VARCHAR(64) NOT NULL, -- 'problem_solved', 'discussion_created', 'reply_accepted', 'contest_ranked', 'achievement_earned', 'mock_interview'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    link VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_user ON activity_timeline(user_id, created_at DESC);

-- 7. Admin Moderation Tools
CREATE TABLE IF NOT EXISTS moderation_reports (
    id VARCHAR(64) PRIMARY KEY,
    reporter_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reporter_username VARCHAR(64) NOT NULL,
    target_type VARCHAR(32) NOT NULL, -- 'discussion', 'reply', 'user', 'group_chat'
    target_id VARCHAR(64) NOT NULL,
    target_title VARCHAR(255) NOT NULL,
    reason VARCHAR(64) NOT NULL, -- 'spam', 'harassment', 'cheating', 'inappropriate', 'plagiarism'
    details TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    action_taken VARCHAR(64),
    moderator_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status, created_at DESC);

CREATE TABLE IF NOT EXISTS moderated_users (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restriction_type VARCHAR(32) NOT NULL, -- 'banned', 'muted', 'warning'
    reason TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    issued_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_moderated_users_user ON moderated_users(user_id);

-- 8. Platform Community & Enterprise Analytics
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
