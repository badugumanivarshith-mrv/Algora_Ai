-- ALGORA Initial PostgreSQL Migration

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password_hash" varchar(255) NOT NULL,
  "role" varchar(50) DEFAULT 'student' NOT NULL,
  "college" varchar(255) DEFAULT 'IIT Bombay',
  "avatar_url" text,
  "xp" integer DEFAULT 0 NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "streak" integer DEFAULT 1 NOT NULL,
  "target_company" varchar(100) DEFAULT 'Google',
  "daily_goal_minutes" integer DEFAULT 45 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "learning_tracks" (
  "id" varchar(100) PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "description" text,
  "category" varchar(100) NOT NULL,
  "icon" varchar(100) DEFAULT 'Code2',
  "color" varchar(50) DEFAULT '#2563eb',
  "order_index" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "topics" (
  "id" varchar(100) PRIMARY KEY,
  "track_id" varchar(100) NOT NULL REFERENCES "learning_tracks"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "order_index" integer DEFAULT 0,
  "estimated_minutes" integer DEFAULT 60,
  "concept_content" text,
  "syntax_cheatsheet" text,
  "interactive_examples" jsonb DEFAULT '[]',
  "common_mistakes" jsonb DEFAULT '[]',
  "interview_questions" jsonb DEFAULT '[]',
  "prerequisite_topic_id" varchar(100),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "problems" (
  "id" varchar(100) PRIMARY KEY,
  "topic_id" varchar(100) NOT NULL REFERENCES "topics"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "difficulty" varchar(50) NOT NULL,
  "description" text NOT NULL,
  "examples" jsonb DEFAULT '[]' NOT NULL,
  "constraints" jsonb DEFAULT '[]' NOT NULL,
  "tags" jsonb DEFAULT '[]',
  "companies" jsonb DEFAULT '[]',
  "starter_code" jsonb DEFAULT '{}' NOT NULL,
  "solution_code" jsonb DEFAULT '{}' NOT NULL,
  "test_cases" jsonb DEFAULT '[]' NOT NULL,
  "acceptance_rate" numeric(5, 2) DEFAULT '75.00',
  "learning_objectives" jsonb DEFAULT '[]',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "problem_id" varchar(100) NOT NULL REFERENCES "problems"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "language" varchar(50) NOT NULL,
  "status" varchar(50) NOT NULL,
  "execution_time_ms" integer DEFAULT 0,
  "memory_mb" numeric(5, 2) DEFAULT '0.00',
  "passed_test_cases" integer DEFAULT 0,
  "total_test_cases" integer DEFAULT 0,
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
