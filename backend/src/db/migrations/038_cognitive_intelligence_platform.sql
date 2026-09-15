-- Migration 038: Cognitive Intelligence Platform & Personal AGI Research Lab
-- V5.1 Milestone

-- Cognitive Profiles
CREATE TABLE IF NOT EXISTS cognitive_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    working_memory_score NUMERIC(5, 2) DEFAULT 88.5,
    long_term_memory_score NUMERIC(5, 2) DEFAULT 92.0,
    retrieval_ability_score NUMERIC(5, 2) DEFAULT 87.5,
    problem_solving_score NUMERIC(5, 2) DEFAULT 94.0,
    reasoning_score NUMERIC(5, 2) DEFAULT 93.5,
    pattern_recognition_score NUMERIC(5, 2) DEFAULT 95.0,
    abstraction_score NUMERIC(5, 2) DEFAULT 91.5,
    learning_velocity_score NUMERIC(5, 2) DEFAULT 96.0,
    focus_capacity_score NUMERIC(5, 2) DEFAULT 89.0,
    knowledge_transfer_score NUMERIC(5, 2) DEFAULT 92.5,
    adaptability_score NUMERIC(5, 2) DEFAULT 90.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning DNA Profiles
CREATE TABLE IF NOT EXISTS learning_dna_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    archetype VARCHAR(64) NOT NULL DEFAULT 'Builder', -- 'Builder', 'Researcher', 'Competitor', 'Entrepreneur', 'Engineer', 'Innovator', 'Hybrid'
    preferred_learning_mode VARCHAR(64) NOT DEFAULT 'ProjectDriven',
    retention_rate_pct NUMERIC(5, 2) DEFAULT 91.5,
    practice_effectiveness NUMERIC(5, 2) DEFAULT 94.0,
    reading_effectiveness NUMERIC(5, 2) DEFAULT 88.0,
    video_effectiveness NUMERIC(5, 2) DEFAULT 82.0,
    project_effectiveness NUMERIC(5, 2) DEFAULT 96.5,
    dominant_traits JSONB DEFAULT '[]'::jsonb,
    learning_superpowers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cognitive Metrics Log
CREATE TABLE IF NOT EXISTS cognitive_metrics (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    metric_name VARCHAR(128) NOT NULL,
    score_value NUMERIC(5, 2) NOT NULL,
    context_task VARCHAR(255),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meta Learning Patterns
CREATE TABLE IF NOT EXISTS meta_learning_patterns (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    optimal_study_window VARCHAR(128) DEFAULT '08:00 - 11:30 & 19:00 - 21:30',
    revision_cycle_days INT DEFAULT 3,
    ideal_project_cadence_weeks INT DEFAULT 2,
    contest_frequency_per_month INT DEFAULT 4,
    research_cadence_hours_per_week INT DEFAULT 12,
    synthesis_recommendations JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cognitive Bottlenecks
CREATE TABLE IF NOT EXISTS cognitive_bottlenecks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    bottleneck_type VARCHAR(64) NOT NULL, -- 'WeakFundamentals', 'KnowledgeFragmentation', 'RetrievalIssues', 'PracticeGaps', 'PatternRecognitionGaps', 'AbstractionWeaknesses', 'InterviewBottlenecks'
    severity VARCHAR(32) DEFAULT 'Moderate', -- 'Low', 'Moderate', 'High', 'Critical'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact_area VARCHAR(128),
    recovery_plan JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'Active', -- 'Active', 'Mitigated', 'Resolved'
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Knowledge Compounding Graph Records
CREATE TABLE IF NOT EXISTS knowledge_compounding (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    source_domain VARCHAR(128) NOT NULL,
    target_impact_area VARCHAR(128) NOT NULL, -- 'Hiring Readiness', 'Research Capability', 'Startup Capability', 'Project Execution', 'System Design Ability'
    multiplier NUMERIC(4, 2) DEFAULT 1.45,
    synergy_description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal AGI Research Projects
CREATE TABLE IF NOT EXISTS agi_research_projects (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(64) NOT NULL, -- 'LLM Systems', 'Agents', 'Multi-Agent Systems', 'RAG', 'AI Evaluation', 'AI Safety', 'AI Alignment', 'Cognitive Systems', 'Reasoning Systems'
    objective TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'InResearch', -- 'Proposed', 'InResearch', 'Experimentation', 'Completed', 'Published'
    research_plan JSONB,
    reading_sequence JSONB,
    evaluation_framework JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AGI Experiments
CREATE TABLE IF NOT EXISTS agi_experiments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES agi_research_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    hypothesis TEXT NOT NULL,
    metrics_json JSONB,
    findings TEXT,
    status VARCHAR(32) DEFAULT 'Running',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal Superintelligence Simulations
CREATE TABLE IF NOT EXISTS superintelligence_simulations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    simulation_name VARCHAR(255) NOT NULL,
    time_horizon_years INT NOT NULL, -- 1, 3, 5, 10
    skill_evolution JSONB,
    research_impact JSONB,
    career_outcomes JSONB,
    startup_probability NUMERIC(5, 2),
    leadership_growth NUMERIC(5, 2),
    technical_depth NUMERIC(5, 2),
    ai_synthesis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cognitive Forecasts
CREATE TABLE IF NOT EXISTS cognitive_forecasts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    target_month VARCHAR(32) NOT NULL,
    projected_cognitive_index NUMERIC(5, 2) NOT NULL,
    primary_acceleration_driver VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for cognitive intelligence platform
CREATE INDEX IF NOT EXISTS idx_cognitive_profiles_user ON cognitive_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_dna_user ON learning_dna_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_bottlenecks_user ON cognitive_bottlenecks(user_id);
CREATE INDEX IF NOT EXISTS idx_agi_research_user ON agi_research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_superintel_sims_user ON superintelligence_simulations(user_id);
