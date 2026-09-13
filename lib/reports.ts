import { supabase } from '@/lib/supabase'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

const PROVINCE_CODES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut',
  ON: 'Ontario', PE: 'PEI', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
}

function extractProvinceFromAddress(address?: string | null): string | null {
  if (!address) return null
  const m = address.match(/,\s*([A-Z]{2})(?=[\s\n,]|$)/)
  if (m && PROVINCE_CODES[m[1]]) return m[1]
  for (const code of Object.keys(PROVINCE_CODES)) {
    if (address.includes(PROVINCE_CODES[code])) return code
  }
  return null
}

export interface MonthlyReport {
  month: string           // e.g. "2026-05"
  label: string           // e.g. "May 2026"
  newBans: NewBan[]
  /**
   * Employers penalised this month WITHOUT a hiring ban (compliance_status
   * ELIGIBLE). ESDC reserves a ban for the most serious or repeated
   * violations, so in most months these are the majority of enforcement —
   * August 2026 was 29 fines totalling $627,750 and not one ban. Reporting
   * only bans made that month render as "no new employers", which was false.
   */
  finesThisMonth: Fine[]
  provinceBreakdown: ProvinceStat[]
  topViolations: ViolationStat[]
  expiringThisMonth: ExpiringBan[]
  expiringNextMonth: ExpiringBan[]
  snapshot: Snapshot
}

export interface Fine {
  name: string
  province: string
  decisionDate: string
  penalty: string | null
  penaltyAmount: number
  reasons: string[]
}

export interface NewBan {
  name: string
  province: string
  decisionDate: string
  penalty: string | null
  banUntil: string | null
  status: string
  reasons: string[]
}

export interface ProvinceStat {
  province: string
  total: number
  newThisMonth: number
  currentlyBanned: number
}

export interface ViolationStat {
  code: number
  label: string
  count: number
}

export interface ExpiringBan {
  name: string
  province: string
  banUntil: string
  penalty: string | null
}

export interface Snapshot {
  totalBanned: number
  currentlyBanned: number
  newThisMonth: number
  newLastMonth: number
  expiringThisMonth: number
  expiringNextMonth: number
  totalPenalties: number
  /** Employers fined this month without a hiring ban. */
  finedThisMonth: number
  /** Sum of every penalty dated this month, banned and fined alike. */
  penaltiesThisMonth: number
}

function monthRange(yearMonth: string): { start: string; end: string } {
  const [y, m] = yearMonth.split('-').map(Number)
  const start = `${y}-${String(m).padStart(2, '0')}-01`
  const endDate = new Date(y, m, 0) // last day of month
  const end = `${y}-${String(m).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  return { start, end }
}

function prevMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
}

// Every figure below describes what ESDC *currently* publishes: each violators
// query filters out rows the government has withdrawn from its feed. Counting a
// retracted penalty would overstate enforcement and keep an employer in a report
// they are no longer on. See supabase/migrations/20260905_add_removed_from_source.sql.
const INELIGIBLE_STATUSES = ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID']

// penalty_amount is free text off the government feed: "$40,000", and for banned
// employers "$40,000 and a 2-year ban". Anchor on the leading currency figure so
// the trailing ban text can never be concatenated into the number.
/**
 * Read every matching row, not just the first page.
 *
 * PostgREST caps a response at 1000 rows and reports no error when it
 * truncates — an aggregate built on the capped page just comes back quietly
 * wrong. `violators` is already past 1400 rows, so any query here that is not
 * narrowed to a single month has to page.
 */
async function fetchAllRows<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
): Promise<T[]> {
  const PAGE = 1000
  const out: T[] = []
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await build(offset, offset + PAGE - 1)
    if (data?.length) out.push(...data)
    if (!data || data.length < PAGE) return out
  }
}

function parseMoney(raw: string | null | undefined): number {
  const m = /^\s*\$?([0-9,]+(?:\.[0-9]+)?)/.exec(raw ?? '')
  if (!m) return 0
  const n = parseFloat(m[1].replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

export async function buildMonthlyReport(yearMonth: string): Promise<MonthlyReport> {
  const { start, end } = monthRange(yearMonth)
  const prev = prevMonth(yearMonth)
  const next = nextMonth(yearMonth)
  const { start: prevStart, end: prevEnd } = monthRange(prev)
  const { start: nextStart, end: nextEnd } = monthRange(next)

  // 1. New bans this month
  const { data: newBansRaw } = await supabase.from('violators')
    .select('business_operating_name, province, decision_date, penalty_amount, ineligible_until_date, compliance_status, reasons')
    .is('removed_from_source', null)
    .gte('decision_date', start)
    .lte('decision_date', end)
    .in('compliance_status', INELIGIBLE_STATUSES)
    .order('decision_date', { ascending: false })

  const newBans: NewBan[] = (newBansRaw ?? []).map((r) => ({
    name: r.business_operating_name ?? 'Unknown',
    province: r.province ?? '',
    decisionDate: r.decision_date ?? '',
    penalty: r.penalty_amount ?? null,
    banUntil: r.ineligible_until_date ?? null,
    status: r.compliance_status ?? '',
    reasons: expandViolationReasons(r.reasons ?? '').map((c) => VIOLATION_CODES[c] ?? `Code ${c}`),
  }))

  // 1b. Fined this month, but NOT banned.
  const { data: finesRaw } = await supabase.from('violators')
    .select('business_operating_name, province, address, decision_date, penalty_amount, reasons')
    .is('removed_from_source', null)
    .gte('decision_date', start)
    .lte('decision_date', end)
    .eq('compliance_status', 'ELIGIBLE')
    .order('decision_date', { ascending: false })

  const finesThisMonth: Fine[] = (finesRaw ?? [])
    .map((r) => ({
      name: r.business_operating_name ?? 'Unknown',
      province: r.province || extractProvinceFromAddress(r.address) || '',
      decisionDate: r.decision_date ?? '',
      penalty: r.penalty_amount ?? null,
      penaltyAmount: parseMoney(r.penalty_amount),
      reasons: expandViolationReasons(r.reasons ?? '').map((c) => VIOLATION_CODES[c] ?? `Code ${c}`),
    }))
    // Heaviest first: the $180,000 matters more to a reader than the $500.
    .sort((a, b) => b.penaltyAmount - a.penaltyAmount)

  // 2. Province breakdown
  // `province` is unpopulated on essentially every row (1 of 1402 as of
  // 2026-09), so without the address fallback this table renders one blank
  // bucket holding everything. Resolve it the same way the preview does.
  const allViolators = await fetchAllRows<{ province: string | null; address: string | null; compliance_status: string; decision_date: string }>(
    (from, to) => supabase.from('violators')
      .select('province, address, compliance_status, decision_date')
      .is('removed_from_source', null)
      .in('compliance_status', INELIGIBLE_STATUSES)
      .order('id', { ascending: true })
      .range(from, to),
  )

  const provinceMap: Record<string, { total: number; newThisMonth: number; currentlyBanned: number }> = {}
  for (const row of allViolators) {
    const prov = row.province || extractProvinceFromAddress(row.address) || 'Unknown'
    if (!provinceMap[prov]) provinceMap[prov] = { total: 0, newThisMonth: 0, currentlyBanned: 0 }
    provinceMap[prov].total++
    if (row.decision_date >= start && row.decision_date <= end) provinceMap[prov].newThisMonth++
    if (row.compliance_status === 'INELIGIBLE' || row.compliance_status === 'INELIGIBLE_UNTIL') provinceMap[prov].currentlyBanned++
  }
  const provinceBreakdown: ProvinceStat[] = Object.entries(provinceMap)
    .map(([province, stats]) => ({ province, ...stats }))
    .sort((a, b) => b.total - a.total)

  // 3. Top violation reasons (all time, weighted by frequency)
  const reasonsRaw = await fetchAllRows<{ reasons: string | null }>(
    (from, to) => supabase.from('violators')
      .select('reasons')
      .is('removed_from_source', null)
      .in('compliance_status', INELIGIBLE_STATUSES)
      .not('reasons', 'is', null)
      .order('id', { ascending: true })
      .range(from, to),
  )

  const codeCount: Record<number, number> = {}
  for (const row of reasonsRaw) {
    for (const code of expandViolationReasons(row.reasons ?? '')) {
      codeCount[code] = (codeCount[code] ?? 0) + 1
    }
  }
  const topViolations: ViolationStat[] = Object.entries(codeCount)
    .map(([code, count]) => ({ code: Number(code), label: VIOLATION_CODES[Number(code)] ?? `Code ${code}`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // 4a. Bans expiring THIS month
  const { data: expiringThisRaw } = await supabase.from('violators')
    .select('business_operating_name, province, ineligible_until_date, penalty_amount')
    .is('removed_from_source', null)
    .eq('compliance_status', 'INELIGIBLE_UNTIL')
    .gte('ineligible_until_date', start)
    .lte('ineligible_until_date', end)
    .order('ineligible_until_date', { ascending: true })

  const expiringThisMonth: ExpiringBan[] = (expiringThisRaw ?? []).map((r) => ({
    name: r.business_operating_name ?? 'Unknown',
    province: r.province ?? '',
    banUntil: r.ineligible_until_date ?? '',
    penalty: r.penalty_amount ?? null,
  }))

  // 4b. Bans expiring next month
  const { data: expiringRaw } = await supabase.from('violators')
    .select('business_operating_name, province, ineligible_until_date, penalty_amount')
    .is('removed_from_source', null)
    .eq('compliance_status', 'INELIGIBLE_UNTIL')
    .gte('ineligible_until_date', nextStart)
    .lte('ineligible_until_date', nextEnd)
    .order('ineligible_until_date', { ascending: true })

  const expiringNextMonth: ExpiringBan[] = (expiringRaw ?? []).map((r) => ({
    name: r.business_operating_name ?? 'Unknown',
    province: r.province ?? '',
    banUntil: r.ineligible_until_date ?? '',
    penalty: r.penalty_amount ?? null,
  }))

  // 5. Snapshot numbers
  const [
    { count: totalBanned },
    { count: currentlyBanned },
    { count: newThisMonth },
    { count: newLastMonth },
    { count: expiringThisCount },
    { count: expiringNextCount },
  ] = await Promise.all([
    supabase.from('violators').select('*', { count: 'exact', head: true }).is('removed_from_source', null).in('compliance_status', INELIGIBLE_STATUSES),
    supabase.from('violators').select('*', { count: 'exact', head: true }).is('removed_from_source', null).in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL']),
    supabase.from('violators').select('*', { count: 'exact', head: true }).is('removed_from_source', null).in('compliance_status', INELIGIBLE_STATUSES).gte('decision_date', start).lte('decision_date', end),
    supabase.from('violators').select('*', { count: 'exact', head: true }).is('removed_from_source', null).in('compliance_status', INELIGIBLE_STATUSES).gte('decision_date', prevStart).lte('decision_date', prevEnd),
    supabase.from('violators').select('*', { count: 'exact', head: true }).is('removed_from_source', null).eq('compliance_status', 'INELIGIBLE_UNTIL').gte('ineligible_until_date', start).lte('ineligible_until_date', end),
    supabase.from('violators').select('*', { count: 'exact', head: true }).is('removed_from_source', null).eq('compliance_status', 'INELIGIBLE_UNTIL').gte('ineligible_until_date', nextStart).lte('ineligible_until_date', nextEnd),
  ])

  // Total penalties, all time. Deliberately NOT restricted to banned employers:
  // the tile says "total fines issued", and most fines never carry a ban, so the
  // old ineligible-only filter understated the real figure by ~$4.6M.
  //
  // Paginated on purpose. PostgREST caps a response at 1000 rows, and dropping
  // the ineligible-only filter pushed this query past that: the unpaginated
  // version silently summed the first 1000 of ~1400 rows and reported $13.1M
  // against a true $27.6M. A truncated SUM looks like a plausible number, which
  // is exactly what makes it dangerous.
  const penaltyRows = await fetchAllRows<{ penalty_amount: string | null; decision_date: string | null }>(
    (from, to) => supabase.from('violators')
      .select('penalty_amount, decision_date')
      .is('removed_from_source', null)
      .not('penalty_amount', 'is', null)
      .order('id', { ascending: true })
      .range(from, to),
  )

  let totalPenalties = 0
  let penaltiesThisMonth = 0
  for (const row of penaltyRows) {
    const n = parseMoney(row.penalty_amount)
    totalPenalties += n
    const d = row.decision_date ?? ''
    if (d >= start && d <= end) penaltiesThisMonth += n
  }

  return {
    month: yearMonth,
    label: monthLabel(yearMonth),
    newBans,
    finesThisMonth,
    provinceBreakdown,
    topViolations,
    expiringThisMonth,
    expiringNextMonth,
    snapshot: {
      totalBanned: totalBanned ?? 0,
      currentlyBanned: currentlyBanned ?? 0,
      newThisMonth: newThisMonth ?? 0,
      newLastMonth: newLastMonth ?? 0,
      expiringThisMonth: expiringThisCount ?? 0,
      expiringNextMonth: expiringNextCount ?? 0,
      totalPenalties,
      finedThisMonth: finesThisMonth.length,
      penaltiesThisMonth,
    },
  }
}

export interface LatestReportPreview {
  month: string
  label: string
  newBansCount: number
  topProvince: string | null
  expiringCount: number
  previewNames: string[]   // first 3 new ban employer names
}

// Lightweight query for homepage — avoids the full buildMonthlyReport cost
export async function getLatestReportPreview(): Promise<LatestReportPreview | null> {
  try {
    // Find the most recent month with bans
    const { data: dateRows } = await supabase.from('violators')
      .select('decision_date')
      .is('removed_from_source', null)
      .in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID'])
      .not('decision_date', 'is', null)
      .order('decision_date', { ascending: false })
      .limit(200)

    if (!dateRows?.length) return null

    // Find the latest month that has bans
    const monthCount: Record<string, number> = {}
    for (const r of dateRows) {
      const m = (r.decision_date as string).slice(0, 7)
      monthCount[m] = (monthCount[m] ?? 0) + 1
    }
    const latestMonth = Object.keys(monthCount).sort((a, b) => b.localeCompare(a))[0]
    const { start, end } = (() => {
      const [y, mo] = latestMonth.split('-').map(Number)
      const endDate = new Date(y, mo, 0)
      return {
        start: `${latestMonth}-01`,
        end: `${latestMonth}-${String(endDate.getDate()).padStart(2, '0')}`,
      }
    })()

    // New bans this month + preview names + province
    const { data: newBans } = await supabase.from('violators')
      .select('business_operating_name, province, address')
      .is('removed_from_source', null)
      .in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID'])
      .gte('decision_date', start)
      .lte('decision_date', end)
      .order('decision_date', { ascending: false })
      .limit(50)

    // Top province — use province column, fall back to extracting from address
    const provCount: Record<string, number> = {}
    for (const r of newBans ?? []) {
      const prov = r.province || extractProvinceFromAddress(r.address)
      if (prov) provCount[prov] = (provCount[prov] ?? 0) + 1
    }
    const topProvince = Object.entries(provCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    // Expiring this month
    const { count: expiringCount } = await supabase.from('violators')
      .select('*', { count: 'exact', head: true })
      .is('removed_from_source', null)
      .eq('compliance_status', 'INELIGIBLE_UNTIL')
      .gte('ineligible_until_date', start)
      .lte('ineligible_until_date', end)

    return {
      month: latestMonth,
      label: monthLabel(latestMonth),
      newBansCount: newBans?.length ?? 0,
      topProvince,
      expiringCount: expiringCount ?? 0,
      previewNames: (newBans ?? []).slice(0, 3).map((r) => r.business_operating_name ?? '').filter(Boolean),
    }
  } catch {
    return null
  }
}

// Returns list of months that have at least one new ban, for index page
export async function getReportMonths(): Promise<{ month: string; label: string; count: number }[]> {
  const { data } = await supabase.from('violators')
    .select('decision_date')
    .is('removed_from_source', null)
    .in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID'])
    .not('decision_date', 'is', null)
    .order('decision_date', { ascending: false })

  const monthCount: Record<string, number> = {}
  for (const row of data ?? []) {
    const m = (row.decision_date as string).slice(0, 7)
    monthCount[m] = (monthCount[m] ?? 0) + 1
  }

  return Object.entries(monthCount)
    .map(([month, count]) => ({ month, label: monthLabel(month), count }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 24) // last 2 years
}
