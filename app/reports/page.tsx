import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getReportMonths } from '@/lib/reports'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Monthly Enforcement Reports — LMIA Check',
  description: 'Month-by-month breakdown of ESDC employer bans, violation reasons, provincial hotspots, and upcoming expiries. Free, sourced from official Government of Canada data.',
}

export default async function ReportsIndexPage() {
  const months = await getReportMonths()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 text-center pt-10 pb-7 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance mb-3">
          ESDC Enforcement Reports
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Monthly analysis of employer bans, violation patterns, and provincial hotspots — sourced from official Government of Canada data.
        </p>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-3">

        {months.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <p className="text-gray-500 text-sm">Reports will appear here once data is loaded.</p>
          </div>
        ) : (
          <>
            {/* Latest — featured */}
            <Link
              href={`/reports/${months[0].month}`}
              className="group block bg-red-600 rounded-2xl p-5 hover:bg-red-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-1">Latest report</p>
                  <p className="text-white text-2xl font-bold">{months[0].label}</p>
                  <p className="text-red-200 text-sm mt-1">
                    {months[0].count} new {months[0].count === 1 ? 'ban' : 'bans'} this month
                  </p>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:translate-x-1 transition-transform" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </Link>

            {/* Past reports */}
            {months.slice(1).length > 0 && (
              <div className="card-elevated divide-y divide-gray-50">
                {months.slice(1).map((m) => (
                  <Link
                    key={m.month}
                    href={`/reports/${m.month}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.count} new {m.count === 1 ? 'ban' : 'bans'}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-gray-600 transition-colors" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Reddit CTA */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-3 mt-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900">Posted monthly to the community</p>
            <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
              We share these reports on Reddit every month end — new bans, expiring bans, province breakdown, and what employers are actually being punished for.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
