-- Bulk search runs: one row per batch submitted (free or future Pro)
CREATE TABLE IF NOT EXISTS bulk_search_runs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL, -- null until Phase 2 auth
  tier            text        NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  employer_count  int,
  results_json    jsonb,
  ip_address      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Individual results within each run (enables saved history in Pro tier)
CREATE TABLE IF NOT EXISTS bulk_search_results (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid        NOT NULL REFERENCES bulk_search_runs(id) ON DELETE CASCADE,
  employer_name text        NOT NULL,
  risk          text        NOT NULL,  -- RED | YELLOW | GREEN | GREY
  summary       text,
  position      int         NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Rate limiting: fast lookup by IP + date
CREATE INDEX IF NOT EXISTS bulk_runs_ip_date  ON bulk_search_runs (ip_address, created_at);
-- Phase 2: link historical runs to authenticated user by email
CREATE INDEX IF NOT EXISTS bulk_runs_email    ON bulk_search_runs (email);

-- RLS: service role writes only (no user auth yet)
ALTER TABLE bulk_search_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_search_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_runs"    ON bulk_search_runs    USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only_results" ON bulk_search_results USING (auth.role() = 'service_role');
