-- ============================================================
-- LMIA Check — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- Enable trigram fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Table: positive_lmia
-- Employers who received approved LMIAs (from ESDC quarterly Excel)
-- ============================================================
CREATE TABLE IF NOT EXISTS positive_lmia (
  id                   SERIAL PRIMARY KEY,
  province             VARCHAR(100),
  program_stream       VARCHAR(100),
  employer_name        VARCHAR(255),
  employer_normalized  VARCHAR(255),
  address              VARCHAR(500),
  city                 VARCHAR(100),
  noc_code             VARCHAR(10),
  occupation_title     VARCHAR(255),
  incorporate_status   VARCHAR(50),
  approved_lmias       INTEGER,
  approved_positions   INTEGER,
  postal_code          VARCHAR(10),
  quarter              VARCHAR(20),
  ingested_at          TIMESTAMP DEFAULT NOW()
);

-- GIN trigram index for fast fuzzy search
CREATE INDEX IF NOT EXISTS idx_employer_trgm
  ON positive_lmia
  USING GIN (employer_normalized gin_trgm_ops);

-- ============================================================
-- Table: violators
-- Non-compliant employers (from ESDC non-compliant list)
-- ============================================================
CREATE TABLE IF NOT EXISTS violators (
  id                      SERIAL PRIMARY KEY,
  business_operating_name VARCHAR(255),
  business_legal_name     VARCHAR(255),
  employer_normalized     VARCHAR(255),
  address                 VARCHAR(500),
  province                VARCHAR(100),
  reasons                 TEXT,
  decision_date           DATE,
  penalty_raw             VARCHAR(255),
  penalty_amount          VARCHAR(100),
  ban_duration            VARCHAR(50),
  status_raw              VARCHAR(255),
  compliance_status       VARCHAR(30),  -- ELIGIBLE | INELIGIBLE_UNTIL | INELIGIBLE_UNPAID | INELIGIBLE
  ineligible_until_date   DATE,
  ingested_at             TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violators_trgm
  ON violators
  USING GIN (employer_normalized gin_trgm_ops);

-- ============================================================
-- Table: search_logs (anonymous analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS search_logs (
  id                   SERIAL PRIMARY KEY,
  employer_query       VARCHAR(255),
  city_query           VARCHAR(100),
  province_query       VARCHAR(100),
  risk_result          VARCHAR(10),
  match_score          FLOAT,
  searched_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Table: search_subscriptions (email notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS search_subscriptions (
  id                   SERIAL PRIMARY KEY,
  email                VARCHAR(255) NOT NULL,
  employer_query       VARCHAR(255) NOT NULL,
  employer_normalized  VARCHAR(255),
  last_result          VARCHAR(10),
  subscribed_at        TIMESTAMP DEFAULT NOW(),
  unsubscribed_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sub_email
  ON search_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_sub_normalized
  ON search_subscriptions(employer_normalized);

-- ============================================================
-- RPC Functions for trigram similarity search
-- These are called from the Next.js app via supabase.rpc()
-- ============================================================

-- Search violators by similarity
CREATE OR REPLACE FUNCTION search_violators(
  query_normalized TEXT,
  sim_threshold    FLOAT DEFAULT 0.65
)
RETURNS SETOF violators
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM violators
  WHERE similarity(employer_normalized, query_normalized) >= sim_threshold
  ORDER BY similarity(employer_normalized, query_normalized) DESC
  LIMIT 10;
$$;

-- Search positive LMIA by similarity
CREATE OR REPLACE FUNCTION search_positive_lmia(
  query_normalized TEXT,
  sim_threshold    FLOAT DEFAULT 0.55
)
RETURNS SETOF positive_lmia
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM positive_lmia
  WHERE similarity(employer_normalized, query_normalized) >= sim_threshold
  ORDER BY
    similarity(employer_normalized, query_normalized) DESC,
    quarter DESC
  LIMIT 50;
$$;

-- ============================================================
-- Row Level Security (RLS) Policies
-- These allow the server-side anon key to work without
-- requiring the service role key for basic operations.
-- Adjust to your security requirements.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE positive_lmia       ENABLE ROW LEVEL SECURITY;
ALTER TABLE violators           ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_subscriptions ENABLE ROW LEVEL SECURITY;

-- positive_lmia: allow public read (anon)
CREATE POLICY "Allow public read on positive_lmia"
  ON positive_lmia FOR SELECT
  TO anon
  USING (true);

-- violators: allow public read (anon)
CREATE POLICY "Allow public read on violators"
  ON violators FOR SELECT
  TO anon
  USING (true);

-- search_logs: allow server-side inserts (anon — server only)
CREATE POLICY "Allow insert on search_logs"
  ON search_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- search_subscriptions: allow insert (anon — server only)
CREATE POLICY "Allow insert on search_subscriptions"
  ON search_subscriptions FOR INSERT
  TO anon
  WITH CHECK (true);

-- search_subscriptions: allow read for duplicate check (anon)
CREATE POLICY "Allow select on search_subscriptions"
  ON search_subscriptions FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- Feedback table — user-submitted data quality reports
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id              SERIAL PRIMARY KEY,
  feedback_type   VARCHAR(30) NOT NULL,  -- 'missing_employer' | 'suggestion'
  message         TEXT NOT NULL,
  employer_query  VARCHAR(255),          -- pre-filled from the search that triggered feedback
  email           VARCHAR(255),          -- optional, for follow-up
  created_at      TIMESTAMP DEFAULT NOW()
);

-- RLS for feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert on feedback"
  ON feedback FOR INSERT
  TO anon
  WITH CHECK (true);

-- Note: If you set SUPABASE_SERVICE_KEY in your .env.local, the above
-- RLS policies are bypassed and you don't need to worry about them.
-- Service role key is recommended for write operations in production.
