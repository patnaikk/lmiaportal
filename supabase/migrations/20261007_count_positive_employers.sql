-- Distinct employers on the approved-LMIA list, for the homepage stat.
--
-- positive_lmia holds one row per employer x occupation x quarter, so a plain
-- row count overstates employers (63,030 rows vs 40,853 employers across
-- 2025-Q1..2026-Q1). PostgREST can't count distinct values, hence the function.
CREATE OR REPLACE FUNCTION count_positive_employers()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT count(DISTINCT employer_normalized) FROM positive_lmia;
$$;

GRANT EXECUTE ON FUNCTION count_positive_employers() TO anon, authenticated;
