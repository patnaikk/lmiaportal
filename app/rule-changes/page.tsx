import Link from 'next/link'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import {
  POLICY_CHANGES,
  WAGE_THRESHOLDS_2026_07_17,
  RESTRICTED_CMAS_TO_2026_10_09,
  RESTRICTED_CMAS_VALID_UNTIL,
  formatPolicyDate,
  type PolicyImpact,
} from '@/lib/policy-changes'

const LAST_VERIFIED = '2026-08-15'

export const metadata: Metadata = {
  title: 'LMIA Rule Changes 2026 — What Changed and What It Means',
  description:
    'Every change to Canada\'s Temporary Foreign Worker Program in 2026 — wage thresholds, restricted cities, penalties and processing times — explained for foreign workers.',
  openGraph: {
    title: 'LMIA Rule Changes 2026 — LMIA Check',
    description:
      'Wage thresholds, the 26 cities closed to low-wage LMIAs, doubled penalties and rising processing times. Plain-language explanations with official sources.',
    url: 'https://lmiacheck.ca/rule-changes',
    siteName: 'LMIA Check',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LMIA Rule Changes 2026 — LMIA Check',
    description: 'What changed in Canada\'s Temporary Foreign Worker Program, and what it means for your job offer.',
  },
  alternates: { canonical: 'https://lmiacheck.ca/rule-changes' },
}

const IMPACT_STYLE: Record<PolicyImpact, { card: string; chipBg: string; chip: string; label: string }> = {
  critical:  { card: 'bg-red-50',   chipBg: 'bg-red-100',   chip: 'text-red-800',   label: 'Affects your offer' },
  important: { card: 'bg-amber-50', chipBg: 'bg-amber-100', chip: 'text-amber-800', label: 'Worth knowing' },
  context:   { card: 'bg-gray-50',  chipBg: 'bg-gray-200',  chip: 'text-gray-700',  label: 'Background' },
}

export default function RuleChangesPage() {
  const sorted = [...POLICY_CHANGES].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation currentPage="rule-changes" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 sm:py-12">
        <header className="mb-8">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Government policy tracker
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance mb-3">
            What changed in Canada&rsquo;s LMIA rules
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            The rules that decide whether a job offer can be real keep moving. This page tracks every
            change, what it means in plain language, and the official source — so you can check a claim
            yourself instead of taking a recruiter&rsquo;s word for it.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Last verified {formatPolicyDate(LAST_VERIFIED)} against Government of Canada sources.
          </p>
        </header>

        {/* Timeline */}
        <ol className="space-y-4 list-none p-0">
          {sorted.map((change) => {
            const s = IMPACT_STYLE[change.impact]
            return (
              <li key={change.date + change.title} className={`p-5 sm:p-6 rounded-2xl ${s.card}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <time dateTime={change.date} className="text-xs font-semibold text-gray-600 tabular-nums">
                    {formatPolicyDate(change.date)}
                  </time>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.chipBg} ${s.chip}`}>
                    {s.label}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2 text-balance">
                  {change.title}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{change.meaning}</p>

                {change.fraudAngle && (
                  <div className="mt-3 flex items-start gap-3 bg-white/70 rounded-xl p-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.04]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 9v4"/><path d="M12 17h.01"/>
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">What this means for your offer</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{change.fraudAngle}</p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <a
                    href={change.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    {change.sourceLabel} &rarr;
                  </a>
                  {change.nextReview && (
                    <span className="text-xs text-gray-500">
                      Next government update: {formatPolicyDate(change.nextReview)}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        {/* Wage threshold reference */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
            High-wage vs low-wage, by province
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            An offer below your province&rsquo;s threshold is a <strong>low-wage</strong> position, which carries
            more restrictions — including the city rules below. Effective July 17, 2026.
          </p>
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th scope="col" className="px-4 py-2.5 font-semibold text-gray-700">Province / Territory</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-gray-700 text-right whitespace-nowrap">Threshold</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-gray-500 text-right whitespace-nowrap">Was</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {WAGE_THRESHOLDS_2026_07_17.map((w) => (
                    <tr key={w.province}>
                      <td className="px-4 py-2.5 text-gray-800">{w.province}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        ${w.current.toFixed(2)}/hr
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums whitespace-nowrap">
                        {w.current === w.previous ? 'unchanged' : `$${w.previous.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Restricted cities */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
            Cities closed to low-wage LMIAs right now
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            ESDC will not process a low-wage LMIA application in these {RESTRICTED_CMAS_TO_2026_10_09.length} areas
            until {formatPolicyDate(RESTRICTED_CMAS_VALID_UNTIL)}. If you are being offered a low-wage job in one of
            them, an LMIA cannot be issued for it.
          </p>
          <div className="p-5 bg-red-50 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
                  <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <p className="text-sm text-red-900 leading-relaxed">
                This list changes every three months. It is accurate as of {formatPolicyDate(LAST_VERIFIED)} and the
                government reviews it again on {formatPolicyDate(RESTRICTED_CMAS_VALID_UNTIL)}.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 list-none p-0">
              {RESTRICTED_CMAS_TO_2026_10_09.map((cma) => (
                <li key={cma} className="text-sm text-red-800">{cma}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next step */}
        <section className="mt-10">
          <Link
            href="/check"
            className="group block card-elevated p-5 sm:p-6 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-12px_rgba(99,102,241,0.15)] hover:ring-indigo-100 transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-0.5">Rules are one half of the answer</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  Check your actual job offer
                </p>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  We check the employer against government records and flag what does not add up. Free.
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </Link>
        </section>

        <p className="text-xs text-gray-500 leading-relaxed mt-8">
          We summarise official Government of Canada announcements and link to each source. This is not legal
          advice. For your specific situation, contact Service Canada or a licensed immigration representative.
        </p>
      </main>

      <Footer />
    </div>
  )
}
