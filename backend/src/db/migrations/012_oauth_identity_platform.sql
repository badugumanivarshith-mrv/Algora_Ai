-- ==============================================================================
-- Migration: 012_oauth_identity_platform
-- Description: Creates oauth_accounts, oauth_sessions, and oauth_audit_logs tables
-- ==============================================================================

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

-- Indexes for performance & security
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_email ON oauth_accounts(provider, email);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_state ON oauth_sessions(state);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_audit_logs_user_id ON oauth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_audit_logs_event_type ON oauth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_oauth_audit_logs_created_at ON oauth_audit_logs(created_at DESC);
