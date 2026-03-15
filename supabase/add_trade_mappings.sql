-- ============================================================
-- Migration: Add trade_name_mappings for crowdsourced name pairs
-- Run in Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS trade_name_mappings (
  id                  SERIAL PRIMARY KEY,
  queried_name        TEXT NOT NULL,       -- what the user searched (as typed)
  submitted_name      TEXT NOT NULL,       -- the other name they know it by
  province            VARCHAR(10),
  confirmed           BOOLEAN DEFAULT false,
  confirmation_count  INTEGER DEFAULT 1,
  source              VARCHAR(20) DEFAULT 'crowdsourced',  -- 'seed' | 'crowdsourced'
  submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique on the name pair (case-insensitive) so we can upsert + increment count
CREATE UNIQUE INDEX IF NOT EXISTS trade_mappings_pair_unique
  ON trade_name_mappings (lower(queried_name), lower(submitted_name));

-- Public read for confirmed mappings only
ALTER TABLE trade_name_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_confirmed_mappings"
  ON trade_name_mappings FOR SELECT
  USING (confirmed = true);

-- Allow anyone to insert (crowdsourcing)
CREATE POLICY "public_insert_mappings"
  ON trade_name_mappings FOR INSERT
  WITH CHECK (true);

-- Seed the 25 known pairs from lib/trade-legal-mappings.ts
INSERT INTO trade_name_mappings (queried_name, submitted_name, province, confirmed, source) VALUES
  ('Red Robin', 'Infinity RRGB Ventures Inc.', 'BC', true, 'seed'),
  ('Barcelos Flame Grilled Chicken', 'SHK Holdings Ltd.', 'AB', true, 'seed'),
  ('CEFA Systems ULC', '1545854 B.C. Unlimited Liability Company', 'BC', true, 'seed'),
  ('Fraser River Lodge', 'Eurocan Management Ltd.', 'BC', true, 'seed'),
  ('Little Town Restaurant', 'Admirals Steakhouse Inc.', 'SK', true, 'seed'),
  ('Burger Factory', '2771482 Ontario Inc.', 'ON', true, 'seed'),
  ('Franklin Education Group', '2740215 Ontario Ltd.', 'ON', true, 'seed'),
  ('Goldmine Farms', 'Goldmine Properties Ltd.', 'BC', true, 'seed'),
  ('Kanwar Walia Farms', '1254586 BC Ltd.', 'BC', true, 'seed'),
  ('Stone Mill Estates Retirement Residence', '2652366 Ontario Inc.', 'ON', true, 'seed'),
  ('Beseda Kitchen', '2316870 Alberta Ltd.', 'AB', true, 'seed'),
  ('Fresh Produce Farm', '1339772 BC Ltd.', 'BC', true, 'seed'),
  ('The Snack', '5514 Nunavut Inc.', 'NU', true, 'seed'),
  ('Arora Technologies', 'Arora Comfortechs Ltd.', 'BC', true, 'seed'),
  ('Versailles Modernscape Ltd.', '2410193 Alberta Ltd.', 'AB', true, 'seed'),
  ('Tim Hortons', '9363-2891 Québec Inc.', 'QC', true, 'seed'),
  ('Power Kitchen', 'District 28 Company Ltd.', 'ON', true, 'seed'),
  ('Anna''s Cleaning Services', 'Anna Ordon', 'ON', true, 'seed'),
  ('Onoway Petro Canada', '1877413 Alberta Ltd.', 'AB', true, 'seed'),
  ('The New Sun Design Group', 'The New Sun Design Group Ltd.', 'BC', true, 'seed'),
  ('African Grill', '2648197 Ontario Inc.', 'ON', true, 'seed'),
  ('BlackLab Computers', 'BlackLab Computers Ltd.', 'BC', true, 'seed'),
  ('Emmanuel Villa Personal Care Home', 'Goshen Professional Care Inc.', 'SK', true, 'seed'),
  ('Freddie''s Pizza', 'Amherst Pizza and Donair Limited', 'NS', true, 'seed'),
  ('Résidence Le Coulongeois', '9003-4729 Québec Inc.', 'QC', true, 'seed')
ON CONFLICT (lower(queried_name), lower(submitted_name)) DO NOTHING;

-- RPC: upsert a mapping — inserts new or increments confirmation_count if pair exists
CREATE OR REPLACE FUNCTION upsert_trade_mapping(
  p_queried   TEXT,
  p_submitted TEXT,
  p_province  TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO trade_name_mappings (queried_name, submitted_name, province, confirmed, confirmation_count, source)
  VALUES (p_queried, p_submitted, p_province, false, 1, 'crowdsourced')
  ON CONFLICT (lower(queried_name), lower(submitted_name))
  DO UPDATE SET confirmation_count = trade_name_mappings.confirmation_count + 1;
END;
$$;
