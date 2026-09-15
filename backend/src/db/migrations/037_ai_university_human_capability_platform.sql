-- Migration 037: AI University, Human Capability Platform & Global Impact Network
-- V5.0 Milestone

-- Degree Programs
CREATE TABLE IF NOT EXISTS degree_programs (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    degree_type VARCHAR(64) NOT NULL, -- e.g., 'Bachelor of AI Engineering', 'Master of Distributed Systems'
    domain VARCHAR(64) NOT NULL, -- e.g., 'Software Engineering', 'AI Engineering', 'ML Engineering', etc.
    total_credits INT NOT NULL DEFAULT 120,
    total_semesters INT NOT NULL DEFAULT 8,
    description TEXT,
    career_outcomes JSONB,
    capstone_requirement JSONB,
    graduation_requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Degree Courses
CREATE TABLE IF NOT EXISTS degree_courses (
    id VARCHAR(64) PRIMARY KEY,
    degree_id VARCHAR(64) REFERENCES degree_programs(id) ON DELETE CASCADE,
    course_code VARCHAR(32) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 4,
    description TEXT,
    syllabus JSONB,
    learning_outcomes JSONB,
    is_capstone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Dependencies
CREATE TABLE IF NOT EXISTS course_dependencies (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) REFERENCES degree_courses(id) ON DELETE CASCADE,
    prerequisite_course_id VARCHAR(64) REFERENCES degree_courses(id) ON DELETE CASCADE,
    dependency_type VARCHAR(32) DEFAULT 'HardPrerequisite',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Degree Enrollments & Progress
CREATE TABLE IF NOT EXISTS student_degrees (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    degree_id VARCHAR(64) REFERENCES degree_programs(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'Enrolled', -- 'Enrolled', 'InPacing', 'Graduated', 'HonorsGraduated'
    current_semester INT DEFAULT 1,
    credits_completed INT DEFAULT 0,
    gpa NUMERIC(4, 2) DEFAULT 3.85,
    completed_course_ids JSONB DEFAULT '[]'::jsonb,
    capstone_status VARCHAR(64) DEFAULT 'InDevelopment',
    graduation_readiness_pct NUMERIC(5, 2) DEFAULT 0.0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Human Capabilities
CREATE TABLE IF NOT EXISTS capabilities (
    id VARCHAR(64) PRIMARY KEY,
    domain VARCHAR(64) NOT NULL, -- 'Technical', 'Professional', 'Research', 'Entrepreneurship'
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    level VARCHAR(32) DEFAULT 'Intermediate', -- 'Foundational', 'Intermediate', 'Advanced', 'Mastery', 'Frontier'
    description TEXT,
    mastery_score NUMERIC(5, 2) DEFAULT 75.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Capability Relationships / Dependencies
CREATE TABLE IF NOT EXISTS capability_relationships (
    id VARCHAR(64) PRIMARY KEY,
    source_capability_id VARCHAR(64) REFERENCES capabilities(id) ON DELETE CASCADE,
    target_capability_id VARCHAR(64) REFERENCES capabilities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(64) NOT NULL, -- 'Prerequisite', 'Synergy', 'Unlocks', 'SpecializationOf'
    weight NUMERIC(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentor Profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    specialty VARCHAR(128) NOT NULL,
    archetype VARCHAR(64) NOT NULL, -- 'SoftwareEngineering', 'AI', 'Career', 'Research', 'Startup', 'Leadership'
    bio TEXT,
    core_principles JSONB,
    debate_personality TEXT,
    avatar_color VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentor Sessions & Debates
CREATE TABLE IF NOT EXISTS mentor_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    session_type VARCHAR(64) NOT NULL, -- 'Debate', 'ConsensusRecommendation', 'PersonalizedIntervention', 'Coaching'
    participating_mentor_ids JSONB,
    transcript JSONB,
    consensus_decision TEXT,
    action_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Marketplace Offerings
CREATE TABLE IF NOT EXISTS learning_marketplace (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    offering_type VARCHAR(64) NOT NULL, -- 'Course', 'Certification', 'Bootcamp', 'Fellowship', 'Workshop', 'ResearchProgram'
    provider VARCHAR(128) NOT NULL,
    duration_weeks INT NOT NULL,
    roi_score NUMERIC(5, 2) DEFAULT 92.0,
    completion_probability NUMERIC(5, 2) DEFAULT 88.0,
    hiring_impact_pct NUMERIC(5, 2) DEFAULT 85.0,
    skill_gain_estimate VARCHAR(128),
    cost_usd NUMERIC(10, 2) DEFAULT 0.0,
    rating NUMERIC(3, 2) DEFAULT 4.9,
    skills_covered JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Enrollments
CREATE TABLE IF NOT EXISTS marketplace_enrollments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    offering_id VARCHAR(64) REFERENCES learning_marketplace(id) ON DELETE CASCADE,
    progress_pct NUMERIC(5, 2) DEFAULT 0.0,
    status VARCHAR(32) DEFAULT 'Active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credentials & Verified Proofs
CREATE TABLE IF NOT EXISTS credentials (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    credential_type VARCHAR(64) NOT NULL, -- 'Learning', 'Contest', 'Project', 'Research', 'Leadership', 'EnterpriseSimulation'
    issuer VARCHAR(128) NOT NULL,
    verification_hash VARCHAR(128) NOT NULL,
    skills_validated JSONB,
    stackable_parent_id VARCHAR(64),
    proof_url VARCHAR(255),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credential Verifications
CREATE TABLE IF NOT EXISTS credential_verifications (
    id VARCHAR(64) PRIMARY KEY,
    credential_id VARCHAR(64) REFERENCES credentials(id) ON DELETE CASCADE,
    verifier_node VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'Valid',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievement Pathways
CREATE TABLE IF NOT EXISTS achievement_pathways (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tier VARCHAR(32) DEFAULT 'Gold',
    required_credentials JSONB,
    unlocked_rewards JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Human Potential Profiles
CREATE TABLE IF NOT EXISTS potential_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    career_potential NUMERIC(5, 2) DEFAULT 94.0,
    leadership_potential NUMERIC(5, 2) DEFAULT 88.0,
    research_potential NUMERIC(5, 2) DEFAULT 91.0,
    founder_potential NUMERIC(5, 2) DEFAULT 92.5,
    learning_velocity NUMERIC(5, 2) DEFAULT 95.0,
    long_term_growth_score NUMERIC(5, 2) DEFAULT 93.5,
    growth_drivers JSONB,
    strategic_accelerators JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Human Potential Forecasts (1yr, 3yr, 5yr, 10yr)
CREATE TABLE IF NOT EXISTS potential_forecasts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    time_horizon_years INT NOT NULL,
    projected_career_tier VARCHAR(128) NOT NULL,
    projected_compensation_usd NUMERIC(12, 2),
    projected_impact_score NUMERIC(5, 2),
    key_milestones JSONB,
    risk_factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global Impact Profiles
CREATE TABLE IF NOT EXISTS impact_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    overall_impact_score NUMERIC(5, 2) DEFAULT 86.5,
    open_source_impact NUMERIC(5, 2) DEFAULT 90.0,
    research_impact NUMERIC(5, 2) DEFAULT 85.0,
    education_impact NUMERIC(5, 2) DEFAULT 88.0,
    mentorship_impact NUMERIC(5, 2) DEFAULT 82.0,
    community_impact NUMERIC(5, 2) DEFAULT 84.0,
    entrepreneurship_impact NUMERIC(5, 2) DEFAULT 89.0,
    total_people_impacted INT DEFAULT 14250,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global Impact Events
CREATE TABLE IF NOT EXISTS impact_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    impact_area VARCHAR(64) NOT NULL, -- 'Open Source', 'Research', 'Education', 'Mentorship', 'Community Building', 'Entrepreneurship'
    title VARCHAR(255) NOT NULL,
    metrics VARCHAR(255) NOT NULL,
    reach_count INT DEFAULT 100,
    verification_source VARCHAR(255),
    event_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global Impact Forecasts
CREATE TABLE IF NOT EXISTS impact_forecasts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    target_year INT NOT NULL,
    projected_score NUMERIC(5, 2) NOT NULL,
    projected_reach INT NOT NULL,
    primary_vector VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_student_degrees_user ON student_degrees(user_id);
CREATE INDEX IF NOT EXISTS idx_degree_courses_degree ON degree_courses(degree_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_domain ON capabilities(domain);
CREATE INDEX IF NOT EXISTS idx_credentials_user ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_potential_profiles_user ON potential_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_profiles_user ON impact_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_events_user ON impact_events(user_id);
