-- Phase 6: Gamification, Contests & Leaderboards Schema

-- 1. Contests Table
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

-- 2. Contest Problems Table
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

-- 3. Contest Participants Table
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

-- 4. Contest Submissions Table
CREATE TABLE IF NOT EXISTS contest_submissions (
  id VARCHAR(64) PRIMARY KEY,
  contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  points_awarded INT NOT NULL DEFAULT 0,
  submission_time TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ratings History Table
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

-- 6. XP Transactions Table
CREATE TABLE IF NOT EXISTS xp_transactions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source VARCHAR(64) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance lookups & rankings
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_rank ON contest_participants(contest_id, rank);
CREATE INDEX IF NOT EXISTS idx_ratings_history_user_id ON ratings_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_history_recorded_at ON ratings_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at);
