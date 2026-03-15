-- ============================================================
-- Migration: Add sync infrastructure for weekly violators sync
-- Run this in Supabase SQL editor (Dashboard → SQL editor)
-- ============================================================

-- 1. Add a unique constraint so upserts can update instead of duplicate.
--    We use (business_operating_name, decision_date) as the natural key.
--    NULLS NOT DISTINCT means two NULLs are treated as equal (PostgreSQL 15+,
--    which Supabase uses).
ALTER TABLE violators
  ADD CONSTRAINT violators_name_date_unique
  UNIQUE NULLS NOT DISTINCT (business_operating_name, decision_date);

-- 2. Track every automated sync run so we can audit history and skip
--    unnecessary re-syncs when the source count hasn't changed.
CREATE TABLE IF NOT EXISTS sync_logs (
  id             SERIAL PRIMARY KEY,
  synced_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source         VARCHAR(100) NOT NULL DEFAULT 'ircc_non_compliant',
  total_scraped  INTEGER,
  records_added  INTEGER,
  records_updated INTEGER,
  last_known_count INTEGER,   -- page count at time of sync (for skip logic)
  status         VARCHAR(20) NOT NULL DEFAULT 'success', -- success | skipped | error
  message        TEXT,        -- error detail or human-readable summary
  duration_secs  FLOAT
);

-- Public read-only so the admin dashboard can show sync history
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_sync_logs"
  ON sync_logs FOR SELECT
  USING (true);
