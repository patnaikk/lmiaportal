-- Employer status-change alerts (app/api/cron/notify).
--
-- city / province: the location the subscriber searched with. A search with a
-- city can be YELLOW (location mismatch) while the same name without one is
-- GREEN, so the cron must re-ask the same question or it reports a change that
-- never happened.
--
-- last_checked_at: the cron re-verifies the least recently checked watches
-- first within a fixed time budget, so a growing list rotates through instead
-- of timing out and sending nothing.
ALTER TABLE search_subscriptions ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE search_subscriptions ADD COLUMN IF NOT EXISTS province VARCHAR(40);
ALTER TABLE search_subscriptions ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sub_active_checked
  ON search_subscriptions (last_checked_at NULLS FIRST, id)
  WHERE unsubscribed_at IS NULL;
