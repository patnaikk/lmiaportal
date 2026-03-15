-- ============================================================
-- Migration: Add legal_name_normalized for dual-name search
-- Run in Supabase SQL editor AFTER add_sync_logs.sql
-- ============================================================

-- 1. Add the column
ALTER TABLE violators
  ADD COLUMN IF NOT EXISTS legal_name_normalized VARCHAR(255);

-- 2. GIN trigram index for fast fuzzy search on legal name
CREATE INDEX IF NOT EXISTS idx_violators_legal_trgm
  ON violators
  USING GIN (legal_name_normalized gin_trgm_ops);

-- 3. Backfill existing rows: lowercase + remove punctuation
--    (Python ingest will use the full normaliser for future rows)
UPDATE violators
SET legal_name_normalized = trim(
  regexp_replace(
    regexp_replace(lower(COALESCE(business_legal_name, '')), '[^a-z0-9\s]', ' ', 'g'),
    '\s+', ' ', 'g'
  )
)
WHERE legal_name_normalized IS NULL;

-- 4. Update search_violators to search BOTH normalized name columns.
--    Uses GREATEST() so results are ranked by whichever name scored higher.
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
  WHERE
    similarity(employer_normalized, query_normalized) >= sim_threshold
    OR similarity(COALESCE(legal_name_normalized, ''), query_normalized) >= sim_threshold
  ORDER BY
    GREATEST(
      similarity(employer_normalized, query_normalized),
      similarity(COALESCE(legal_name_normalized, ''), query_normalized)
    ) DESC
  LIMIT 10;
$$;
