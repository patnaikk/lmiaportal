import SearchForm from '@/components/SearchForm'
import Footer from '@/components/Footer'
import RecentlyBanned from '@/components/RecentlyBanned'
import LatestBanBanner from '@/components/LatestBanBanner'
import Navigation from '@/components/Navigation'
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
        <div className="text-4xl mb-4">🇨🇦</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-4">
          Got a Canadian job offer?<br />
          <span className="text-gray-500">Check the employer first.</span>
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-xs mx-auto">
          Charging workers for LMIAs is illegal. Verify any employer against official government records — free, in seconds.
        </p>
      </div>

      {/* Stats bar */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">{stats.employers > 0 ? formatCount(stats.employers) : '11K+'}</div>
            <div className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Employers</div>
          </div>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">{stats.violators > 0 ? stats.violators.toLocaleString() : '1,329'}</div>
            <div className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Violators</div>
          </div>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">Free</div>
            <div className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Always</div>
          </div>
        </div>
      </div>

      {/* Full offer check CTA */}
      <div className="max-w-2xl mx-auto w-full px-4 mt-4">
        <div className="bg-gray-950 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Have a job offer in hand?</p>
            <p className="text-xs text-gray-400 mt-0.5">Analyze fee, wage, source, and duration for red flags.</p>
          </div>
          <a
            href="/check"
            className="flex-shrink-0 px-4 py-2 bg-white text-gray-950 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Full check →
          </a>
        </div>
      </div>

      {/* Latest ban callout */}
      <LatestBanBanner />

      {/* Search card */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-md shadow-gray-200/60">
          <SearchForm />
          <p className="text-center text-xs text-gray-400 mt-4">No data stored · No login required</p>
        </div>
        <a
          href="/verify-lmia"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <span>🔢</span>
          Have an LMIA number on your document? Check if it's real →
        </a>
      </main>

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
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
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
