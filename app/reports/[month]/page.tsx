import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { buildMonthlyReport, monthLabel } from '@/lib/reports'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

interface Props {
  params: { month: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const label = monthLabel(params.month)
  const canonical = `https://lmiacheck.ca/reports/${params.month}`
  return {
    title: `${label} ESDC Enforcement Report — LMIA Check`,
    description: `New employer bans, province breakdown, top violation reasons, and expiring bans for ${label}. Official Government of Canada data.`,
    alternates: { canonical },
    openGraph: {
      title: `${label} ESDC Enforcement Report`,
      description: `New employer bans, province breakdown, and top TFWP violation reasons for ${label}. Official Government of Canada data.`,
      url: canonical,
      siteName: 'LMIA Check',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} ESDC Enforcement Report`,
      description: `New employer bans and TFWP violation data for ${label}.`,
    },
  }
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut',
  ON: 'Ontario', PE: 'PEI', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function ReportPage({ params }: Props) {
  // Validate format YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(params.month)) notFound()

  const report = await buildMonthlyReport(params.month)

  const nextMonthDate = new Date(params.month + '-01')
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`
  const nextMonthLabel = monthLabel(nextMonthStr)

  const trend = report.snapshot.newThisMonth - report.snapshot.newLastMonth
  const trendLabel = trend > 0 ? `+${trend} vs last month` : trend < 0 ? `${trend} vs last month` : 'same as last month'
  const trendColor = trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500'

  // Dataset JSON-LD with temporalCoverage + freshness signals. Reports are
  // time-bound slices of the official ESDC enforcement dataset; dateModified
  // tells search/AI engines this is current, which strongly affects whether
  // they cite us over a stale third party.
  const canonical = `https://lmiacheck.ca/reports/${params.month}`
  const reportSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${report.label} ESDC Enforcement Report — Canada TFWP`,
    description: `Monthly enforcement report for ${report.label}: new employer bans, province breakdown, top violation reasons, and expiring bans under Canada’s Temporary Foreign Worker Program. Sourced from Employment and Social Development Canada (ESDC).`,
    url: canonical,
    keywords: ['LMIA', 'TFWP', 'ESDC', 'employer bans', 'enforcement', 'Canada', report.label],
    temporalCoverage: params.month,
    datePublished: `${params.month}-01`,
    dateModified: new Date().toISOString().slice(0, 10),
    isAccessibleForFree: true,
    creator: {
      '@type': 'GovernmentOrganization',
      name: 'Employment and Social Development Canada',
      url: 'https://www.canada.ca/en/employment-social-development.html',
    },
    publisher: { '@type': 'Organization', name: 'LMIA Check', url: 'https://lmiacheck.ca' },
    license: 'https://open.canada.ca/en/open-government-licence-canada',
    spatialCoverage: { '@type': 'Country', name: 'Canada' },
    isBasedOn: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers/report/non-compliant.html',
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: canonical,
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportSchema) }}
      />
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/reports" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mb-4 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            All reports
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            ESDC Enforcement Report
          </h1>
          <p className="text-lg text-gray-500 mt-1 font-medium">{report.label}</p>
          <p className="text-xs text-gray-400 mt-2">Source: Employment and Social Development Canada · Government of Canada</p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-7 space-y-6">

        {/* ── Snapshot ── */}
        <div>
          <SectionHeader title="At a glance" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'New bans this month', value: report.snapshot.newThisMonth, sub: trendLabel, subColor: trendColor },
              { label: 'Currently banned', value: report.snapshot.currentlyBanned.toLocaleString(), sub: 'active bans', subColor: 'text-gray-400' },
              { label: 'Total on record', value: report.snapshot.totalBanned.toLocaleString(), sub: 'all time', subColor: 'text-gray-400' },
              { label: 'Bans expired this month', value: report.snapshot.expiringThisMonth, sub: 'now eligible again', subColor: report.snapshot.expiringThisMonth > 0 ? 'text-amber-500' : 'text-gray-400' },
              { label: 'Total fines issued', value: report.snapshot.totalPenalties > 0 ? formatMoney(report.snapshot.totalPenalties) : '—', sub: 'all time', subColor: 'text-gray-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 ring-1 ring-black/[0.04] shadow-sm">
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-1 leading-tight">{s.label}</p>
                <p className={`text-[11px] mt-0.5 ${s.subColor}`}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── New bans ── */}
        <div>
          <SectionHeader
            title={`New bans — ${report.label}`}
            sub={report.newBans.length === 0 ? 'No new bans recorded this month' : `${report.newBans.length} employer${report.newBans.length === 1 ? '' : 's'} added to the non-compliant list`}
          />
          {report.newBans.length === 0 ? (
            <div className="bg-green-50 rounded-2xl p-5 flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center mt-0.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">No new bans this month</p>
                <p className="text-xs text-green-700 mt-0.5">ESDC added no new employers to the non-compliant list in {report.label}.</p>
              </div>
            </div>
          ) : (
            <div className="card-elevated divide-y divide-gray-50">
              {report.newBans.map((ban, i) => (
                <div key={i} className="px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/results?employer=${encodeURIComponent(ban.name)}${ban.province ? `&province=${ban.province}` : ''}`}
                        className="text-sm font-semibold text-gray-900 hover:text-red-700 transition-colors leading-snug"
                      >
                        {ban.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {PROVINCE_NAMES[ban.province] ?? ban.province}
                        {ban.decisionDate ? ` · ${formatDate(ban.decisionDate)}` : ''}
                        {ban.penalty ? ` · ${ban.penalty}` : ''}
                      </p>
                      {ban.banUntil && (
                        <p className="text-xs text-amber-600 mt-0.5 font-medium">
                          Banned until {formatDate(ban.banUntil)}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 uppercase tracking-wide mt-0.5">
                      {ban.status === 'INELIGIBLE' ? 'Permanent' : ban.status === 'INELIGIBLE_UNPAID' ? 'Unpaid fine' : 'Temp ban'}
                    </span>
                  </div>
                  {ban.reasons.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {ban.reasons.slice(0, 3).map((r, j) => (
                        <li key={j} className="text-[11px] text-gray-500 flex gap-1.5 items-start">
                          <span className="text-gray-300 mt-px">›</span>
                          <span>{r}</span>
                        </li>
                      ))}
                      {ban.reasons.length > 3 && (
                        <li className="text-[11px] text-gray-400">+{ban.reasons.length - 3} more violations</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Province breakdown ── */}
        <div>
          <SectionHeader title="Province breakdown" sub="All banned employers on record, by province" />
          <div className="card-elevated overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2.5 border-b border-gray-50">
              <span>Province</span>
              <span className="text-right pr-4">New</span>
              <span className="text-right pr-4">Active</span>
              <span className="text-right">Total</span>
            </div>
            {report.provinceBreakdown.slice(0, 10).map((p, i) => {
              const maxTotal = report.provinceBreakdown[0]?.total ?? 1
              const pct = Math.round((p.total / maxTotal) * 100)
              return (
                <div key={p.province} className={`grid grid-cols-[1fr_auto_auto_auto] px-5 py-3 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} last:rounded-b-2xl`}>
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium text-gray-800">{PROVINCE_NAMES[p.province] ?? p.province}</p>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm tabular-nums text-right pr-4 font-semibold ${p.newThisMonth > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                    {p.newThisMonth > 0 ? `+${p.newThisMonth}` : '—'}
                  </span>
                  <span className="text-sm tabular-nums text-right pr-4 text-gray-700 font-medium">{p.currentlyBanned}</span>
                  <span className="text-sm tabular-nums text-right text-gray-900 font-semibold">{p.total}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Top violations ── */}
        <div>
          <SectionHeader title="What employers are being punished for" sub="Top 8 violation reasons across all banned employers" />
          <div className="space-y-2">
            {report.topViolations.map((v, i) => {
              const maxCount = report.topViolations[0]?.count ?? 1
              const pct = Math.round((v.count / maxCount) * 100)
              return (
                <div key={v.code} className="bg-white rounded-xl px-4 py-3 ring-1 ring-black/[0.04] shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="text-xs font-medium text-gray-700 leading-snug flex-1">{v.label}</p>
                    <span className="text-xs font-bold text-gray-900 tabular-nums flex-shrink-0">{v.count}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? 'bg-red-500' : i <= 2 ? 'bg-amber-400' : 'bg-gray-300'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Expiring THIS month ── */}
        <div>
          <SectionHeader
            title={`Bans that expired this month — ${report.label}`}
            sub={
              report.expiringThisMonth.length === 0
                ? `No bans expired in ${report.label}`
                : `${report.expiringThisMonth.length} employer${report.expiringThisMonth.length === 1 ? '' : 's'} became eligible to hire again this month — verify any offers from these employers carefully`
            }
          />
          {report.expiringThisMonth.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl px-5 py-4">
              <p className="text-sm text-gray-500">No bans expired in {report.label}.</p>
            </div>
          ) : (
            <>
              <div className="card-elevated divide-y divide-gray-50">
                {report.expiringThisMonth.map((ban, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3 first:rounded-t-2xl last:rounded-b-2xl">
                    <div className="min-w-0">
                      <Link
                        href={`/results?employer=${encodeURIComponent(ban.name)}${ban.province ? `&province=${ban.province}` : ''}`}
                        className="text-sm font-semibold text-gray-900 hover:text-indigo-700 transition-colors leading-snug"
                      >
                        {ban.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {PROVINCE_NAMES[ban.province] ?? ban.province}
                        {ban.penalty ? ` · ${ban.penalty}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-500">Expired</p>
                      <p className="text-xs text-gray-400">{formatDate(ban.banUntil)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-800 leading-relaxed">
                <span className="font-semibold">Heads up:</span> These employers are now technically eligible to hire again — but a past ban is a serious red flag. Always verify independently and check their full violation history before accepting any offer.
              </div>
            </>
          )}
        </div>

        {/* ── Expiring next month ── */}
        <div>
          <SectionHeader
            title={`Bans expiring in ${nextMonthLabel}`}
            sub={
              report.expiringNextMonth.length === 0
                ? `No bans are scheduled to expire in ${nextMonthLabel}`
                : `${report.expiringNextMonth.length} employer${report.expiringNextMonth.length === 1 ? '' : 's'} will become eligible to hire again — verify any new offers from these employers carefully`
            }
          />
          {report.expiringNextMonth.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl px-5 py-4">
              <p className="text-sm text-gray-500">No bans expiring in {nextMonthLabel}.</p>
            </div>
          ) : (
            <div className="card-elevated divide-y divide-gray-50">
              {report.expiringNextMonth.map((ban, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3 first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="min-w-0">
                    <Link
                      href={`/results?employer=${encodeURIComponent(ban.name)}${ban.province ? `&province=${ban.province}` : ''}`}
                      className="text-sm font-semibold text-gray-900 hover:text-amber-700 transition-colors leading-snug"
                    >
                      {ban.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {PROVINCE_NAMES[ban.province] ?? ban.province}
                      {ban.penalty ? ` · ${ban.penalty}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-amber-600">Expires</p>
                    <p className="text-xs text-gray-500">{formatDate(ban.banUntil)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {report.expiringNextMonth.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Note:</span> A ban expiring does not mean an employer is in good standing. Always verify independently before accepting any offer.
            </div>
          )}
        </div>

        {/* ── Reddit share ── */}
        <div className="bg-gray-900 rounded-2xl p-5">
          <p className="text-white text-sm font-semibold mb-1">Share this report</p>
          <p className="text-gray-400 text-xs mb-3 leading-relaxed">
            Copy the link below and paste it in your Reddit post or share directly with your community.
          </p>
          <code className="block text-xs bg-gray-800 text-green-400 rounded-lg px-3 py-2 break-all">
            https://lmiacheck.ca/reports/{params.month}
          </code>
        </div>

      </main>

      <Footer />
    </div>
  )
}
