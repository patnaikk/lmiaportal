import Link from 'next/link'
import SearchForm from '@/components/SearchForm'
import Footer from '@/components/Footer'
import LatestBanBanner from '@/components/LatestBanBanner'
import Navigation from '@/components/Navigation'
import DataFreshness from '@/components/DataFreshness'
import ActivityTicker from '@/components/ActivityTicker'
import { supabase } from '@/lib/supabase'
import HomeSignupWidget from '@/components/HomeSignupWidget'
import { getLatestReportPreview } from '@/lib/reports'

export const revalidate = 3600 // refresh stats every hour

async function fetchStats() {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [{ count: employerCount }, { count: violatorCount }, { count: searchCount }] =
      await Promise.all([
        supabase.from('positive_lmia').select('*', { count: 'exact', head: true }),
        supabase.from('violators').select('*', { count: 'exact', head: true }),
        supabase.from('search_logs').select('*', { count: 'exact', head: true }).gte('searched_at', oneWeekAgo),
      ])

    return {
      employers: employerCount ?? 0,
      violators: violatorCount ?? 0,
      searches: searchCount ?? 0,
    }
  } catch {
    return { employers: 0, violators: 0, searches: 0 }
  }
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`
  return n.toString()
}

export default async function HomePage() {
  const [stats, reportPreview] = await Promise.all([fetchStats(), getLatestReportPreview()])

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to verify a Canadian employer before accepting an LMIA job offer',
    description: 'Use LMIA Check to verify whether a Canadian employer is legitimate and approved under the Temporary Foreign Worker Program before paying any recruitment fees.',
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter the employer name',
        text: 'Type the employer name exactly as it appears on your job offer or recruitment message into the search box at lmiacheck.ca.',
        url: 'https://lmiacheck.ca/#search',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'We check official government records',
        text: 'LMIA Check instantly cross-references the name against two official ESDC datasets: the non-compliant employer ban list and the approved positive LMIA employer list. Data is updated quarterly.',
        url: 'https://lmiacheck.ca/#search',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Get a clear verdict',
        text: 'You receive one of four verdicts: Verified (approved LMIA on record), Banned (employer is on the ESDC non-compliant list), Caution (partial match requiring review), or Not found (no record in either dataset).',
        url: 'https://lmiacheck.ca/results',
      },
    ],
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
    />
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation currentPage="home" />

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-50 to-white text-center pt-12 pb-8 px-4">
        {/* Canada flag */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/canada-flag.svg" alt="Canada flag" width="72" height="36" className="mx-auto mb-5 rounded-sm shadow-sm" />
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-4 text-balance">
          Got a Canadian job offer?<br />
          <span className="text-gray-500">Check the employer first.</span>
        </h1>
        <p className="text-gray-500 text-[15px] sm:text-base leading-relaxed max-w-sm mx-auto">
          Charging workers for LMIAs is illegal. Verify any employer against official government records — free, in seconds.
        </p>
      </div>

      {/* Live activity ticker — proves the site is current and working */}
      <ActivityTicker />

      {/* Latest ban callout — above the fold, before the search */}
      <LatestBanBanner />

      {/* Search card — moved up so the primary action is immediate */}
      <main className="max-w-2xl mx-auto w-full px-4 pt-2 pb-5">
        <div className="card-elevated p-5 sm:p-6">
          <SearchForm />
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <DataFreshness />
            <p className="text-xs text-gray-400">No data stored · No login required</p>
          </div>
        </div>
        <a
          href="/verify-lmia"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <line x1="9" y1="9" x2="9" y2="9.01"/>
            <line x1="15" y1="9" x2="15" y2="9.01"/>
            <line x1="9" y1="13" x2="9" y2="13.01"/>
            <line x1="15" y1="13" x2="15" y2="13.01"/>
            <line x1="9" y1="17" x2="15" y2="17"/>
          </svg>
          Have an LMIA number on your document? Check if it&apos;s real →
        </a>

        {/* — OR — divider */}
        <div className="flex items-center gap-3 my-3 max-w-xs mx-auto">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Browse all banned — prominent secondary path */}
        <Link
          href="/banned"
          className="group block card-elevated p-5 sm:p-6 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-12px_rgba(220,38,38,0.15)] hover:ring-red-100 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-50 flex items-center justify-center" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
                <circle cx="6" cy="6" r="1.5" fill="#DC2626"/>
                <circle cx="6" cy="12" r="1.5" fill="#DC2626"/>
                <circle cx="6" cy="18" r="1.5" fill="#DC2626"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight tabular-nums">
                  {stats.violators > 0 ? stats.violators.toLocaleString() : '1,336'}
                </span>
                <span className="text-sm font-semibold text-gray-700">banned employers</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 leading-snug">
                Browse the full government list — searchable by name, filterable by province.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </Link>
      </main>

      {/* Stats bar — reassurance after the two main paths */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-white ring-1 ring-black/[0.04] overflow-hidden shadow-sm">
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight tabular-nums">{stats.employers > 0 ? formatCount(stats.employers) : '11K+'}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Employers</div>
          </div>
          <Link href="/banned" className="py-4 text-center hover:bg-gray-50 transition-colors group">
            <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight tabular-nums">{stats.violators > 0 ? stats.violators.toLocaleString() : '1,329'}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Banned</div>
          </Link>
          <div className="py-4 text-center">
            {stats.searches > 0 ? (
              <>
                <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight tabular-nums">{formatCount(stats.searches)}</div>
                <div className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">This week</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">Free</div>
                <div className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Always</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full offer check */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-4">
        <Link
          href="/check"
          className="group block card-elevated p-5 sm:p-6 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-12px_rgba(99,102,241,0.15)] hover:ring-indigo-100 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 mb-0.5">Got a message about a job?</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">Full offer check</p>
              <p className="text-sm text-gray-500 mt-1 leading-snug">
                Paste your offer details — fee, wage, duration, source. We flag every red flag.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* How it works */}
      <div className="max-w-2xl mx-auto w-full px-4 py-8">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-6">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { n: '1', label: 'Enter the employer name', sub: 'From your job offer or recruitment message' },
            { n: '2', label: 'We check government records', sub: 'Official ESDC data, updated quarterly' },
            { n: '3', label: 'Get a clear result', sub: 'Verified · Caution · Not found · Banned' },
          ].map(({ n, label, sub }) => (
            <div key={n} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-3 sm:text-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-600">{n}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6 pt-5 border-t border-gray-100">
          No signup · No tracking · No ads · Government of Canada data
        </p>
      </div>

      {/* Monthly enforcement report — data-rich card */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-4">
        <div className="card-elevated overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-red-200 text-[11px] font-semibold uppercase tracking-widest mb-0.5">Latest enforcement report</p>
              <p className="text-white text-xl font-bold leading-tight">
                {reportPreview ? reportPreview.label : 'Monthly ESDC Report'}
              </p>
            </div>
            <Link
              href={reportPreview ? `/reports/${reportPreview.month}` : '/reports'}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold transition-colors"
            >
              Full report
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="py-3.5 px-4 text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
                {reportPreview ? reportPreview.newBansCount : '—'}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">New bans</p>
            </div>
            <div className="py-3.5 px-4 text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
                {reportPreview?.topProvince ?? '—'}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">Top province</p>
            </div>
            <div className="py-3.5 px-4 text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
                {reportPreview ? reportPreview.expiringCount : '—'}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">Expiring</p>
            </div>
          </div>

          {/* Preview names */}
          {reportPreview && reportPreview.previewNames.length > 0 && (
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Newly banned</p>
              <ul className="space-y-1.5">
                {reportPreview.previewNames.map((name) => (
                  <li key={name} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" aria-hidden="true" />
                    <Link
                      href={`/employer/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                      className="text-sm text-gray-700 hover:text-red-600 font-medium truncate transition-colors"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
                {reportPreview.newBansCount > reportPreview.previewNames.length && (
                  <li className="text-xs text-gray-400 pl-3.5">
                    +{reportPreview.newBansCount - reportPreview.previewNames.length} more in this report
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Signup widget */}
          <div className="px-5 py-4">
            <HomeSignupWidget />
          </div>
        </div>
      </div>

      {/* Browse all employers — replaces recently-banned list */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-6">
        <Link
          href="/banned"
          className="group block card-elevated p-5 sm:p-6 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-12px_rgba(220,38,38,0.15)] hover:ring-red-100 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-0.5">Full directory of banned employers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                Browse all {stats.violators > 0 ? stats.violators.toLocaleString() : '1,345'} non-compliant employers
              </p>
              <p className="text-sm text-gray-500 mt-1 leading-snug">
                Searchable by name, filterable by province. Official ESDC data.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </Link>
      </div>

      <Footer />
    </div>
    </>
  )
}
