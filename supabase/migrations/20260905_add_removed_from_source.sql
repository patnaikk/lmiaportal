-- ============================================================
-- Track records ESDC has RETRACTED from the non-compliant feed.
--
-- Background: ESDC does not only backfill decisions late, it also removes
-- them. Records loaded from the March 2026 bulk file have since disappeared
-- from the published list entirely. Our sync only ever upserts, so a retracted
-- employer stayed on the site accused of a penalty the government no longer
-- publishes.
--
-- REVISED 2026-09-13: an earlier version of this migration also flagged
-- The Party People Catering Co and Rock Solid Cleaning. That was wrong. Both
-- are still published by ESDC today. They only appeared to vanish because our
-- change check was reading `non_compliant_new.json`, which ESDC froze on
-- 2026-07-15 after moving the table to `non_compliant.json` — so every record
-- published after that date, these two included, was missing from the file we
-- were comparing against. Flagging them would have suppressed two genuine
-- penalties. Verified against the live feed before removing them here.
--
-- We flag rather than delete: workers who followed a link from an older
-- newsletter or search result need the page to EXPLAIN what happened, and
-- the retraction is itself part of the record.
-- ============================================================

ALTER TABLE violators
  ADD COLUMN IF NOT EXISTS removed_from_source DATE;

COMMENT ON COLUMN violators.removed_from_source IS
  'Date we first observed this record absent from the ESDC feed. NULL = still published by ESDC. Non-NULL rows must never drive a RED/YELLOW verdict.';

-- Partial index: every read path filters on "still published", so index that case.
CREATE INDEX IF NOT EXISTS idx_violators_not_removed
  ON violators (compliance_status)
  WHERE removed_from_source IS NULL;

-- Backfill the confirmed retractions. Both were re-verified absent from the
-- LIVE feed (non_compliant.json, 1401 records) on 2026-09-13, under every
-- spelling, legal name, address and date.
--
-- These came in with the original March 2026 bulk load and left the government
-- list at some unknown point since, so we date them to the day we detected it.
-- Binli's Foods matters most: it was serving an INELIGIBLE_UNPAID status, i.e.
-- the site showed it as RED/banned on a withdrawn record.
UPDATE violators
   SET removed_from_source = '2026-09-05'
 WHERE business_operating_name IN ('Binli''s Foods Ltd.', 'Khams Holdings Ltd.')
   AND removed_from_source IS NULL;

-- ============================================================
-- Let the sync detect content changes, not just count changes.
--
-- The sync's fast path compares only the feed's RECORD COUNT against the last
-- run, and an equal-sized add+remove is invisible to a count check by
-- construction. Store a fingerprint of the feed's contents so any substantive
-- change forces a full scrape. (Note: the specific month-long stall in
-- Aug-Sep 2026 was caused by a stale feed URL, not by a count collision —
-- fixed separately in sync_violators.py — but a count check is too weak
-- either way.)
-- ============================================================

ALTER TABLE sync_logs
  ADD COLUMN IF NOT EXISTS feed_fingerprint VARCHAR(64);

COMMENT ON COLUMN sync_logs.feed_fingerprint IS
  'SHA-256 over the ESDC feed rows (name, date, penalty, status). Skip the scrape only when this is unchanged — record count alone cannot see an add+remove.';
