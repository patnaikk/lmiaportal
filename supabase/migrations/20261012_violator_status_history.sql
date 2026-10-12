-- ============================================================
-- Status history for the non-compliant employer list.
--
-- Background: the sync overwrites `violators` in place, so the database only
-- knows what ESDC says TODAY. In September 2026 that cost us twice:
--   * 15 of August's 29 fined employers moved to "Ineligible - unpaid monetary
--     penalty" and we could not say when;
--   * Kowalski Accounting and Rock Rover Transport reached the end of their
--     ban terms but stayed ineligible (unpaid), and we had already told readers
--     they would be free to hire.
-- The employer alerts (/api/cron/notify) also compare only the RED/YELLOW/GREEN
-- colour, so a RED → RED change of kind (banned-until-date → unpaid) is silent.
--
-- One row per observed event. Written by scripts/sync_violators.py:
--   baseline    — state on the day history began (this migration)
--   first_seen  — record appeared in the ESDC feed for the first time
--   changed     — status, ban end date or penalty differs from the last sync
--   withdrawn   — record disappeared from the ESDC feed
--   restored    — a withdrawn record reappeared
--
-- `observed_at` is when OUR sync saw it, not when ESDC changed it. The sync
-- runs weekly, so a change is dated to within about a week. Nothing before
-- the baseline can be recovered.
-- ============================================================

CREATE TABLE IF NOT EXISTS violator_status_history (
  id                          BIGSERIAL PRIMARY KEY,
  violator_id                 INTEGER REFERENCES violators(id) ON DELETE SET NULL,
  business_operating_name     VARCHAR(255) NOT NULL,
  decision_date               DATE,
  event                       VARCHAR(20) NOT NULL
                              CHECK (event IN ('baseline', 'first_seen', 'changed', 'withdrawn', 'restored')),
  observed_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  compliance_status           VARCHAR(30),
  ineligible_until_date       DATE,
  penalty_amount              VARCHAR(100),
  status_raw                  VARCHAR(255),

  -- Previous values, set on 'changed' only.
  prev_compliance_status      VARCHAR(30),
  prev_ineligible_until_date  DATE,
  prev_penalty_amount         VARCHAR(100),
  prev_status_raw             VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_vsh_violator    ON violator_status_history (violator_id, observed_at);
CREATE INDEX IF NOT EXISTS idx_vsh_observed_at ON violator_status_history (observed_at);
CREATE INDEX IF NOT EXISTS idx_vsh_event       ON violator_status_history (event) WHERE event <> 'baseline';

-- Service role only for now (sync writes, scripts read). No public policy:
-- add one deliberately if employer pages ever show a timeline.
ALTER TABLE violator_status_history ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE violator_status_history IS
  'Observed changes to ESDC non-compliant records. observed_at = when our weekly sync saw the change, not when ESDC made it.';

-- Baseline: today's state of every record, so the first real change has
-- something to be compared against in reports. Runs once (guarded).
INSERT INTO violator_status_history (
  violator_id, business_operating_name, decision_date, event, observed_at,
  compliance_status, ineligible_until_date, penalty_amount, status_raw
)
SELECT v.id, v.business_operating_name, v.decision_date,
       CASE WHEN v.removed_from_source IS NULL THEN 'baseline' ELSE 'withdrawn' END,
       COALESCE(v.removed_from_source::timestamptz, NOW()),
       v.compliance_status, v.ineligible_until_date, v.penalty_amount, v.status_raw
  FROM violators v
 WHERE v.business_operating_name IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM violator_status_history);
