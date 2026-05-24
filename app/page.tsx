import Link from 'next/link'
import SearchForm from '@/components/SearchForm'
import Footer from '@/components/Footer'
import RecentlyBanned from '@/components/RecentlyBanned'
import LatestBanBanner from '@/components/LatestBanBanner'
import Navigation from '@/components/Navigation'
import DataFreshness from '@/components/DataFreshness'
import ActivityTicker from '@/components/ActivityTicker'
import { supabase } from '@/lib/supabase'

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
  const stats = await fetchStats()

  return (
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
        <div className="flex items-center gap-3 my-5 max-w-xs mx-auto">
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

      {/* Stats bar — trust signals after the action */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-white ring-1 ring-black/[0.04] overflow-hidden shadow-sm">
          <Link href="/" className="py-4 text-center hover:bg-gray-50/50 transition-colors">
            <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight tabular-nums">{stats.employers > 0 ? formatCount(stats.employers) : '11K+'}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Employers</div>
          </Link>
          <Link href="/banned" className="py-4 text-center hover:bg-gray-50/50 transition-colors">
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

      {/* 3rd path — full offer check */}
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

      {/* Monthly reports promo */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-4">
        <Link
          href="/reports"
          className="group block card-elevated p-5 sm:p-6 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-12px_rgba(220,38,38,0.12)] hover:ring-red-100 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-50 flex items-center justify-center" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 mb-0.5">Updated every month</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">Enforcement reports</p>
              <p className="text-sm text-gray-500 mt-1 leading-snug">
                New bans, expiring bans, province hotspots, top violations — sourced from official ESDC data.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
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

      <RecentlyBanned />

      <Footer />
    </div>
  )
}
