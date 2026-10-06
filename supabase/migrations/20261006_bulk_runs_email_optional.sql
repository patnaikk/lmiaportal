-- The bulk page lets people run a check without giving an email (it is only
-- required to download the CSV), but this column was NOT NULL. Every
-- anonymous run's insert failed silently, so those runs were never recorded
-- and never counted toward the 3-runs-per-IP daily limit.
ALTER TABLE bulk_search_runs ALTER COLUMN email DROP NOT NULL;
