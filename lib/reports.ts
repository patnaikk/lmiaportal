import { supabase } from '@/lib/supabase'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

export interface MonthlyReport {
  month: string           // e.g. "2026-05"
  label: string           // e.g. "May 2026"
  newBans: NewBan[]
  provinceBreakdown: ProvinceStat[]
  topViolations: ViolationStat[]
  expiringNextMonth: ExpiringBan[]
  snapshot: Snapshot
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
  expiringNextMonth: number
  totalPenalties: number
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

const INELIGIBLE_STATUSES = ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID']

export async function buildMonthlyReport(yearMonth: string): Promise<MonthlyReport> {
  const { start, end } = monthRange(yearMonth)
  const prev = prevMonth(yearMonth)
  const next = nextMonth(yearMonth)
  const { start: prevStart, end: prevEnd } = monthRange(prev)
  const { start: nextStart, end: nextEnd } = monthRange(next)

  // 1. New bans this month
  const { data: newBansRaw } = await supabase
    .from('violators')
    .select('business_operating_name, province, decision_date, penalty_amount, ineligible_until_date, compliance_status, reasons')
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

  // 2. Province breakdown
  const { data: allViolators } = await supabase
    .from('violators')
    .select('province, compliance_status, decision_date')
    .in('compliance_status', INELIGIBLE_STATUSES)

  const provinceMap: Record<string, { total: number; newThisMonth: number; currentlyBanned: number }> = {}
  for (const row of allViolators ?? []) {
    const prov = row.province ?? 'Unknown'
    if (!provinceMap[prov]) provinceMap[prov] = { total: 0, newThisMonth: 0, currentlyBanned: 0 }
    provinceMap[prov].total++
    if (row.decision_date >= start && row.decision_date <= end) provinceMap[prov].newThisMonth++
    if (row.compliance_status === 'INELIGIBLE' || row.compliance_status === 'INELIGIBLE_UNTIL') provinceMap[prov].currentlyBanned++
  }
  const provinceBreakdown: ProvinceStat[] = Object.entries(provinceMap)
    .map(([province, stats]) => ({ province, ...stats }))
    .sort((a, b) => b.total - a.total)

  // 3. Top violation reasons (all time, weighted by frequency)
  const { data: reasonsRaw } = await supabase
    .from('violators')
    .select('reasons')
    .in('compliance_status', INELIGIBLE_STATUSES)
    .not('reasons', 'is', null)

  const codeCount: Record<number, number> = {}
  for (const row of reasonsRaw ?? []) {
    for (const code of expandViolationReasons(row.reasons ?? '')) {
      codeCount[code] = (codeCount[code] ?? 0) + 1
    }
  }
  const topViolations: ViolationStat[] = Object.entries(codeCount)
    .map(([code, count]) => ({ code: Number(code), label: VIOLATION_CODES[Number(code)] ?? `Code ${code}`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // 4. Bans expiring next month
  const { data: expiringRaw } = await supabase
    .from('violators')
    .select('business_operating_name, province, ineligible_until_date, penalty_amount')
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
    { count: expiringCount },
  ] = await Promise.all([
    supabase.from('violators').select('*', { count: 'exact', head: true }).in('compliance_status', INELIGIBLE_STATUSES),
    supabase.from('violators').select('*', { count: 'exact', head: true }).in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL']),
    supabase.from('violators').select('*', { count: 'exact', head: true }).in('compliance_status', INELIGIBLE_STATUSES).gte('decision_date', start).lte('decision_date', end),
    supabase.from('violators').select('*', { count: 'exact', head: true }).in('compliance_status', INELIGIBLE_STATUSES).gte('decision_date', prevStart).lte('decision_date', prevEnd),
    supabase.from('violators').select('*', { count: 'exact', head: true }).eq('compliance_status', 'INELIGIBLE_UNTIL').gte('ineligible_until_date', nextStart).lte('ineligible_until_date', nextEnd),
  ])

  // Total penalties (sum of penalty_amount where parseable)
  const { data: penaltyRows } = await supabase
    .from('violators')
    .select('penalty_amount')
    .in('compliance_status', INELIGIBLE_STATUSES)
    .not('penalty_amount', 'is', null)

  let totalPenalties = 0
  for (const row of penaltyRows ?? []) {
    const n = parseFloat((row.penalty_amount ?? '').replace(/[$,]/g, ''))
    if (!isNaN(n)) totalPenalties += n
  }

  return {
    month: yearMonth,
    label: monthLabel(yearMonth),
    newBans,
    provinceBreakdown,
    topViolations,
    expiringNextMonth,
    snapshot: {
      totalBanned: totalBanned ?? 0,
      currentlyBanned: currentlyBanned ?? 0,
      newThisMonth: newThisMonth ?? 0,
      newLastMonth: newLastMonth ?? 0,
      expiringNextMonth: expiringCount ?? 0,
      totalPenalties,
    },
  }
}

// Returns list of months that have at least one new ban, for index page
export async function getReportMonths(): Promise<{ month: string; label: string; count: number }[]> {
  const { data } = await supabase
    .from('violators')
    .select('decision_date')
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
