-- Separate real user searches from page renders and background jobs.
--
-- Until now every /employer/[slug] page view called verifyEmployer(), which
-- logs a row — so search_logs counted crawler traffic on ~1,000 employer pages
-- alongside genuine searches. 93% of rows read RED because most employer pages
-- are violators. This column makes the two distinguishable.
--
-- 'search'        — homepage / SearchForm (a real person typed a name)
-- 'employer_page' — /employer/[slug] render, largely crawlers
-- 'check'         — /check offer analysis flow
-- 'api'           — direct /api/verify call
-- 'bulk'          — bulk upload
-- 'download'      — result download
-- 'cron'          — background watchlist re-check

ALTER TABLE search_logs
  ADD COLUMN IF NOT EXISTS origin VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_search_logs_origin_time
  ON search_logs (origin, searched_at DESC);

-- Existing rows predate the split and cannot be attributed retroactively.
COMMENT ON COLUMN search_logs.origin IS
  'Traffic source. NULL = logged before 2026-08-15, source unknown — exclude from usage metrics.';
