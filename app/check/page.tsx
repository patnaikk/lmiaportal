import CheckForm from '@/components/CheckForm'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Full Offer Check — LMIA Check',
  description:
    'Paste your Canadian job offer details and get a complete red-flag analysis — employer records, fee detection, wage benchmarks, duration consistency, and more. Free, no login.',
}

export default function CheckPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation currentPage="check" />

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-50 text-center pt-10 pb-7 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 mb-4" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
          Got a job offer? Check it now.
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Enter your offer details and we&apos;ll run every checkable signal — employer records, fee requests, wage benchmarks, fraud indicators — and give you a plain-language result.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-2">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Important:</span> This tool cannot confirm an LMIA is authentic — only a Service Canada officer can do that. It checks every publicly verifiable signal to help you identify red flags before making any decision.
        </div>
      </div>

      {/* What we check strip */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              ),
              label: 'Government LMIA records', sub: '11K+ employers cross-referenced',
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              ),
              label: 'Non-compliant list', sub: '1,262 banned employers checked',
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              ),
              label: 'Illegal fee detection', sub: 'Paying for an LMIA is a crime',
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
              label: 'Offer source', sub: 'Recruiter delivery is a red flag',
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              ),
              label: 'Duration consistency', sub: 'Offer vs. LMIA must match',
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              ),
              label: 'Web presence', sub: 'Does a real business exist?',
            },
          ] as const).map((item) => (
            <div key={item.label} className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
              <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{item.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <div className="card-elevated p-5 sm:p-6">
          <CheckForm />
          <p className="text-center text-xs text-gray-400 mt-4">🔒 No data stored · No login required</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
