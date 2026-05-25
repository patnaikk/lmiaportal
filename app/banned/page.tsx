import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import DataFreshness from '@/components/DataFreshness'
import ScrollToTop from '@/components/ScrollToTop'
import { supabase } from '@/lib/supabase'
import { formatTimeAgo } from '@/lib/format-time'
import type { ComplianceStatus, ViolatorRecord } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 3600

const PAGE_SIZE = 50

interface PageProps {
  searchParams: {
    q?: string
    province?: string
    status?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = searchParams.q || ''
  const province = searchParams.province || ''
  let title = 'All banned employers — LMIA Check'
  if (q) title = `${q} — Banned employers — LMIA Check`
  else if (province) title = `Banned employers in ${province} — LMIA Check`
  return {
    title,
    description:
      'Browse every employer banned by the Canadian government from hiring temporary foreign workers. Official ESDC data, updated weekly.',
  }
}

const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
]

const PROVINCE_FULL_NAME: Record<string, string> = Object.fromEntries(
  PROVINCES.map((p) => [p.code, p.name])
)

/** Extract a 2-letter province code from an address string, falling back to null. */
function extractProvinceFromAddress(address?: string | null): string | null {
  if (!address) return null
  // Match ", XX " or ", XX\n" or ", XX," or ", XX$"
  const m = address.match(/,\s*([A-Z]{2})(?=[\s\n,]|$)/)
  if (m && PROVINCE_FULL_NAME[m[1]]) return m[1]
  // Try matching full province name
  for (const code of Object.keys(PROVINCE_FULL_NAME)) {
    if (address.includes(PROVINCE_FULL_NAME[code])) return code
  }
  return null
}

const STATUS_LABEL: Record<ComplianceStatus, string> = {
  ELIGIBLE: 'Eligible again',
  INELIGIBLE_UNTIL: 'Banned',
  INELIGIBLE_UNPAID: 'Unpaid penalty',
  INELIGIBLE: 'Ineligible',
}

function statusPillColors(status: ComplianceStatus) {
  switch (status) {
    case 'ELIGIBLE':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
    case 'INELIGIBLE_UNTIL':
    case 'INELIGIBLE_UNPAID':
    case 'INELIGIBLE':
    default:
      return 'bg-red-50 text-red-700 ring-1 ring-red-100'
  }
}

async function fetchBanned(opts: { q: string; province: string; status: string; page: number }) {
  const from = (opts.page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('violators')
    .select('id, business_operating_name, business_legal_name, province, address, decision_date, compliance_status, ineligible_until_date, penalty_amount, reasons', { count: 'exact' })
    .order('decision_date', { ascending: false, nullsFirst: false })
    .range(from, to)

  if (opts.q.trim()) {
    const q = opts.q.trim()
    // ILIKE search across operating and legal name
    query = query.or(`business_operating_name.ilike.%${q}%,business_legal_name.ilike.%${q}%`)
  }
  if (opts.province) {
    // The `province` column in violators is mostly empty — the actual province
    // is embedded in the address text (e.g. "Edmonton, AB\nT5Y 2N5").
    // PostgREST treats commas as OR-condition separators, so we must
    // double-quote any ILIKE value that contains a comma.
    const code = opts.province
    const fullName = PROVINCE_FULL_NAME[code] || code
    query = query.or(
      `address.ilike."%, ${code}%",address.ilike."%${fullName}%",province.eq.${code}`
    )
  }
  if (opts.status === 'banned') {
    query = query.in('compliance_status', ['INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID', 'INELIGIBLE'])
  } else if (opts.status === 'eligible') {
    query = query.eq('compliance_status', 'ELIGIBLE')
  }

  try {
    const { data, count } = await query
    return { rows: (data as Partial<ViolatorRecord>[]) || [], total: count ?? 0 }
  } catch {
    return { rows: [], total: 0 }
  }
}

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | null>) {
  const merged: Record<string, string> = {}
  for (const [k, v] of Object.entries(base)) if (v) merged[k] = v
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null || v === '') delete merged[k]
    else merged[k] = v
  }
  const qs = new URLSearchParams(merged).toString()
  return `/banned${qs ? '?' + qs : ''}`
}

export default async function BannedPage({ searchParams }: PageProps) {
  const q = (searchParams.q || '').trim()
  const province = searchParams.province || ''
  const status = searchParams.status || 'banned'
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1)

  const { rows, total } = await fetchBanned({ q, province, status, page })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const baseParams = { q, province, status: status === 'banned' ? undefined : status, page: page > 1 ? String(page) : undefined }
  const provinceLabel = province ? PROVINCES.find(p => p.code === province)?.name : null

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ScrollToTop query={`${q}|${province}|${status}|${page}`} />
      <Navigation />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            All banned employers
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-prose">
            Every employer the Canadian government has found non-compliant with the Temporary Foreign Worker Program. Pulled directly from ESDC and updated weekly.
          </p>
          <div className="mt-3">
            <DataFreshness />
          </div>
        </div>

        {/* Filters card */}
        <form method="get" action="/banned" className="card-elevated p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3">
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search employer name…"
                className="w-full pl-10 pr-3 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                aria-label="Search employer name"
              />
            </div>
            <select
              name="province"
              defaultValue={province}
              className="px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              aria-label="Filter by province"
            >
              <option value="">All provinces</option>
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              aria-label="Filter by status"
            >
              <option value="banned">Currently banned</option>
              <option value="eligible">Previously banned</option>
              <option value="all">All</option>
            </select>
            <button type="submit" className="px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
              Filter
            </button>
          </div>
        </form>

        {/* Result count */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700 tabular-nums">{total.toLocaleString()}</span> {total === 1 ? 'employer' : 'employers'}
            {provinceLabel && <> in <span className="font-medium text-gray-700">{provinceLabel}</span></>}
            {q && <> matching &ldquo;<span className="font-medium text-gray-700">{q}</span>&rdquo;</>}
          </p>
          {(q || province || status !== 'banned') && (
            <Link href="/banned" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Clear filters
            </Link>
          )}
        </div>

        {/* List */}
        {rows.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No employers match those filters</p>
            <p className="text-xs text-gray-500">Try a different search term, province, or clear the filters above.</p>
          </div>
        ) : (
          <div className="card-elevated divide-y divide-gray-100 overflow-hidden">
            {rows.map((r) => {
              const hasLegalName =
                r.business_legal_name &&
                r.business_legal_name.toLowerCase().trim() !== r.business_operating_name?.toLowerCase().trim()
              const cs = (r.compliance_status || 'INELIGIBLE') as ComplianceStatus
              return (
                <Link
                  key={r.id}
                  href={`/results?employer=${encodeURIComponent(r.business_operating_name || '')}`}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors leading-snug">
                      {r.business_operating_name}
                    </p>
                    {hasLegalName && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        Files as <span className="font-medium text-gray-500">{r.business_legal_name}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillColors(cs)}`}>
                        {STATUS_LABEL[cs]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.province || extractProvinceFromAddress(r.address) || 'Canada'}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(r.decision_date)}
                      </span>
                      {r.penalty_amount && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500 tabular-nums">{r.penalty_amount}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0 mt-1 group-hover:text-gray-500 transition-colors" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-gray-500 tabular-nums">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={buildHref(baseParams, { page: page - 1 === 1 ? null : String(page - 1) })}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildHref(baseParams, { page: String(page + 1) })}
                  className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Source: Employment and Social Development Canada (ESDC) — list of employers found non-compliant under the Temporary Foreign Worker Program.
        </p>
      </main>

      <Footer />
    </div>
  )
}
