import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { VIOLATION_CODES } from '@/lib/violation-codes'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Consultant Reference Guide — LMIA Check',
  description:
    'Quick-reference for immigration consultants and paralegals: expiring bans, all 30 ESDC violation codes, red flags, penalty scale, and official government links.',
}

const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland & Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'PEI', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
}

function offsetMonth(base: Date, delta: number): { year: number; month: number } {
  const d = new Date(base)
  d.setMonth(d.getMonth() + delta)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function monthKey(y: number, m: number) {
  return `${y}-${String(m).padStart(2, '0')}`
}

function monthLabel(y: number, m: number) {
  return new Date(y, m - 1, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
}

function lastDay(y: number, m: number) {
  return new Date(y, m, 0).getDate()
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface ExpiringBan {
  name: string
  province: string
  banUntil: string
  penalty: string | null
}

async function fetchExpiringByMonth(): Promise<{ key: string; label: string; bans: ExpiringBan[] }[]> {
  const now = new Date()
  const months = [0, 1, 2].map((d) => offsetMonth(now, d))

  const results = await Promise.all(
    months.map(async ({ year, month }) => {
      const start = `${monthKey(year, month)}-01`
      const end = `${monthKey(year, month)}-${String(lastDay(year, month)).padStart(2, '0')}`
      const { data } = await supabase
        .from('violators')
        .select('business_operating_name, province, address, ineligible_until_date, penalty_amount')
        .gte('ineligible_until_date', start)
        .lte('ineligible_until_date', end)
        .order('ineligible_until_date', { ascending: true })
      return {
        key: monthKey(year, month),
        label: monthLabel(year, month),
        bans: (data || []).map((r: Record<string, string | null>) => {
          // Extract province from address if column is empty
          let prov = r.province as string | null
          if (!prov && r.address) {
            const m = (r.address as string).match(/,\s*([A-Z]{2})(?=[\s\n,]|$)/)
            if (m && PROVINCE_NAMES[m[1]]) prov = m[1]
          }
          return {
            name: r.business_operating_name as string,
            province: prov || '',
            banUntil: r.ineligible_until_date as string,
            penalty: r.penalty_amount as string | null,
          }
        }),
      }
    })
  )
  return results
}

async function fetchProvinceCounts(): Promise<{ province: string; total: number; active: number }[]> {
  const { data } = await supabase
    .from('violators')
    .select('province, address, compliance_status')
  if (!data) return []

  const map: Record<string, { total: number; active: number }> = {}
  for (const r of data as Record<string, string | null>[]) {
    let prov = r.province as string | null
    if (!prov && r.address) {
      const m = (r.address as string).match(/,\s*([A-Z]{2})(?=[\s\n,]|$)/)
      if (m && PROVINCE_NAMES[m[1]]) prov = m[1]
    }
    if (!prov) prov = 'Unknown'
    if (!map[prov]) map[prov] = { total: 0, active: 0 }
    map[prov].total++
    if (['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID'].includes(r.compliance_status || '')) {
      map[prov].active++
    }
  }
  return Object.entries(map)
    .filter(([p]) => p !== 'Unknown' && PROVINCE_NAMES[p])
    .map(([province, counts]) => ({ province, ...counts }))
    .sort((a, b) => b.total - a.total)
}

const VIOLATION_CATEGORIES = [
  {
    label: 'Record-keeping & Compliance',
    color: 'amber',
    codes: [1, 2, 4, 5, 6, 7],
  },
  {
    label: 'Working Conditions & Pay',
    color: 'red',
    codes: [3, 8, 9, 11, 12, 13, 14, 15],
  },
  {
    label: 'Housing & Accommodation',
    color: 'orange',
    codes: [10, 16, 21, 22, 23, 24],
  },
  {
    label: 'Worker Rights & Safety',
    color: 'purple',
    codes: [17, 18, 19, 20, 25, 26, 27],
  },
  {
    label: 'Recruitment Fees',
    color: 'rose',
    codes: [28, 29, 30],
  },
]

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; label: string; dot: string }> = {
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  label: 'text-amber-900',  dot: 'bg-amber-400' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    label: 'text-red-900',    dot: 'bg-red-400' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100', label: 'text-orange-900', dot: 'bg-orange-400' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', label: 'text-purple-900', dot: 'bg-purple-400' },
  rose:   { bg: 'bg-rose-50',   icon: 'bg-rose-100',   label: 'text-rose-900',   dot: 'bg-rose-400' },
}

const RED_FLAGS = [
  { flag: 'Employer asks you to pay any fee', detail: 'Illegal under TFWP rules. Employers must not charge workers recruitment fees.' },
  { flag: 'Offer letter has no LMIA number', detail: 'Every work permit supported by an LMIA should reference the LMIA number on the offer letter.' },
  { flag: 'Job description is vague or keeps changing', detail: 'LMIA jobs must match the approved NOC code and duties. Last-minute changes are a red flag.' },
  { flag: 'Employer appears on the banned list', detail: 'Check this site first. Even previously-banned employers who are now "eligible" carry elevated risk.' },
  { flag: 'Accommodation is tied to employment', detail: 'Housing provided by an employer creates coercion risk — if you lose the job, you lose housing.' },
  { flag: 'Wage offered is below provincial minimum or NOC median', detail: 'LMIA conditions require wages that meet or exceed provincial prevailing wages for the occupation.' },
  { flag: 'Recruiter claims to "guarantee" a work permit', detail: 'No recruiter can guarantee approval. Any guarantee claim signals a likely scam.' },
  { flag: 'You are asked to sign a blank or incomplete contract', detail: 'Never sign incomplete documents. The contract must match what was submitted with the LMIA.' },
]

const PENALTY_SCALE = [
  { tier: 'Minor', range: '$500 – $5,000', description: 'Record-keeping failures, missed inspector meetings, minor documentation gaps', color: 'bg-yellow-50 text-yellow-800 ring-yellow-200' },
  { tier: 'Moderate', range: '$5,001 – $50,000', description: 'Wage or condition violations, failure to cooperate with inspections, inadequate housing', color: 'bg-orange-50 text-orange-800 ring-orange-200' },
  { tier: 'Serious', range: '$50,001 – $100,000', description: 'Abuse, exploitation, failure to provide health care access, severe condition violations', color: 'bg-red-50 text-red-800 ring-red-200' },
  { tier: 'Maximum', range: 'Up to $1,000,000', description: 'Repeat offenders or egregious violations — may also result in permanent ineligibility', color: 'bg-rose-50 text-rose-800 ring-rose-200' },
]

const ESDC_LINKS = [
  { label: 'ESDC Non-Compliant Employers List', url: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers/report/non-compliant.html', desc: 'Official source for all employer bans' },
  { label: 'LMIA Positive List (Open Data)', url: 'https://open.canada.ca/data/en/dataset/90fed587-1364-4f33-a9ee-208181dc0b97', desc: 'Quarterly dataset of positive LMIA decisions' },
  { label: 'IRCC Work Permit Check', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/work-permit.html', desc: 'IRCC temporary work permit guidance' },
  { label: 'Report Suspected Fraud', url: 'https://www.canada.ca/en/employment-social-development/programs/foreign-workers/report-violations.html', desc: 'Tip line for reporting TFWP violations' },
  { label: 'NOC 2021 Job Search Tool', url: 'https://www.canada.ca/en/services/jobs/opportunities/government/noc.html', desc: 'Look up National Occupational Classification codes' },
  { label: 'Provincial Labour Standards', url: 'https://www.canada.ca/en/employment-social-development/programs/employment-standards.html', desc: 'Links to each province\'s employment standards' },
]

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function ReferencePage() {
  const [expiringMonths, provinceCounts] = await Promise.all([
    fetchExpiringByMonth(),
    fetchProvinceCounts(),
  ])

  const totalActive = provinceCounts.reduce((s, p) => s + p.active, 0)
  const totalAll = provinceCounts.reduce((s, p) => s + p.total, 0)
  const topProvince = provinceCounts[0]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation currentPage="reports" />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 text-center pt-10 pb-7 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance mb-3">
          Consultant Reference Guide
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Everything you need in one place — expiring bans, violation codes, red flags, and official links. Bookmark this page.
        </p>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-10">

        {/* ── Live snapshot ── */}
        <div>
          <SectionHeader title="Live snapshot" sub="Current ban counts from the database" />
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-2xl p-4 ring-1 ring-black/[0.04] shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalActive.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">Currently banned</p>
            </div>
            <div className="bg-white rounded-2xl p-4 ring-1 ring-black/[0.04] shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalAll.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">All time on record</p>
            </div>
            <div className="bg-white rounded-2xl p-4 ring-1 ring-black/[0.04] shadow-sm text-center">
              <p className="text-lg font-bold text-gray-900 tabular-nums">{topProvince ? PROVINCE_NAMES[topProvince.province] ?? topProvince.province : '—'}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">Most bans</p>
            </div>
          </div>
        </div>

        {/* ── Expiring bans — 3 months ── */}
        <div>
          <SectionHeader
            title="Bans expiring — next 3 months"
            sub="Employers becoming eligible to hire again. Verify before advising clients."
          />
          <div className="space-y-4">
            {expiringMonths.map(({ key, label, bans }, mi) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${mi === 0 ? 'bg-amber-100 text-amber-800' : mi === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                    {mi === 0 ? 'This month' : mi === 1 ? 'Next month' : 'In 2 months'}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400">({bans.length} {bans.length === 1 ? 'employer' : 'employers'})</span>
                </div>
                {bans.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400">No bans expiring this month.</p>
                  </div>
                ) : (
                  <div className="card-elevated divide-y divide-gray-50">
                    {bans.map((ban, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 first:rounded-t-2xl last:rounded-b-2xl">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{ban.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {PROVINCE_NAMES[ban.province] ?? (ban.province || 'Canada')}
                            {ban.penalty ? ` · ${ban.penalty}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-semibold text-amber-600">Expires</p>
                          <p className="text-xs text-gray-500">{fmt(ban.banUntil)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 p-4 bg-amber-50 rounded-xl">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Important:</span> A ban expiring does not mean the employer is in good standing. Past violations remain on record. Always verify independently and check the full violation history before advising a client to accept any offer.
            </p>
          </div>
        </div>

        {/* ── Province breakdown ── */}
        <div>
          <SectionHeader title="Province breakdown" sub="Total employers on record and currently banned, by province" />
          <div className="card-elevated overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2.5 border-b border-gray-50">
              <span>Province</span>
              <span className="text-right pr-5">Active bans</span>
              <span className="text-right">All time</span>
            </div>
            {provinceCounts.map((p, i) => {
              const maxTotal = provinceCounts[0]?.total ?? 1
              const pct = Math.round((p.total / maxTotal) * 100)
              return (
                <div key={p.province} className={`grid grid-cols-[1fr_auto_auto] px-5 py-3 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} last:rounded-b-2xl`}>
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium text-gray-800">{PROVINCE_NAMES[p.province] ?? p.province}</p>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm tabular-nums text-right pr-5 font-semibold ${p.active > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                    {p.active > 0 ? p.active : '—'}
                  </span>
                  <span className="text-sm tabular-nums text-right text-gray-900 font-semibold">{p.total}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Red flags checklist ── */}
        <div>
          <SectionHeader title="Red flags checklist" sub="Signs a job offer may be fraudulent or non-compliant — advise clients to watch for these" />
          <div className="space-y-2">
            {RED_FLAGS.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl ring-1 ring-black/[0.04] shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.flag}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Violation codes ── */}
        <div>
          <SectionHeader title="All 30 ESDC violation codes" sub="Full reference table — codes used in all ESDC enforcement decisions" />
          <div className="space-y-4">
            {VIOLATION_CATEGORIES.map((cat) => {
              const c = CATEGORY_COLORS[cat.color]
              return (
                <div key={cat.label} className={`rounded-2xl p-4 ${c.bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <p className={`text-xs font-semibold uppercase tracking-wider ${c.label}`}>{cat.label}</p>
                  </div>
                  <div className="space-y-2">
                    {cat.codes.map((code) => (
                      <div key={code} className="flex items-start gap-2.5">
                        <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${c.icon} ${c.label} flex-shrink-0 mt-0.5 min-w-[26px] text-center`}>
                          {code}
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">{VIOLATION_CODES[code]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Penalty scale ── */}
        <div>
          <SectionHeader title="Penalty scale" sub="Approximate fine ranges under the Immigration and Refugee Protection Act" />
          <div className="space-y-2">
            {PENALTY_SCALE.map((tier) => (
              <div key={tier.tier} className={`p-4 rounded-2xl ring-1 ${tier.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{tier.tier}</p>
                  <p className="text-sm font-bold tabular-nums">{tier.range}</p>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{tier.description}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 px-1">
            Note: Multiple violations can result in compounding penalties. Repeat offenders face up to $1M per violation category per year.
          </p>
        </div>

        {/* ── Official links ── */}
        <div>
          <SectionHeader title="Official government links" sub="Bookmark these — useful for verification and client advice" />
          <div className="card-elevated divide-y divide-gray-100 overflow-hidden">
            {ESDC_LINKS.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors leading-snug">{link.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0 mt-1 group-hover:text-indigo-400 transition-colors" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">
          Data sourced from Employment and Social Development Canada (ESDC). Updated hourly.
        </p>
      </main>

      <Footer />
    </div>
  )
}
