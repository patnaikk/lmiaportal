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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance tracking-tight mb-3">
          Got a job offer? Check it now.
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Enter your offer details and we&apos;ll run every checkable signal — employer records, fee requests, wage benchmarks, fraud indicators — and give you a plain-language result.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-2">
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span><span className="font-semibold">Important:</span> This tool cannot confirm an LMIA is authentic — only a Service Canada officer can do that. It checks every publicly verifiable signal to help you identify red flags before making any decision.</span>
        </div>
      </div>

      {/* What we check strip */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-2">
        <div className="grid grid-cols-2 gap-2">
          {([
            {
              bg: 'bg-blue-50', iconBg: 'bg-blue-100', stroke: '#2563EB',
              icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>,
              icon2: <><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
              label: 'LMIA records', sub: '11K+ employers',
              textColor: 'text-blue-900', subColor: 'text-blue-600',
            },
            {
              bg: 'bg-red-50', iconBg: 'bg-red-100', stroke: '#DC2626',
              icon: <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>,
              icon2: null,
              label: 'Banned employers', sub: '1,262 on record',
              textColor: 'text-red-900', subColor: 'text-red-500',
            },
            {
              bg: 'bg-amber-50', iconBg: 'bg-amber-100', stroke: '#D97706',
              icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
              icon2: null,
              label: 'Fee detection', sub: 'Paying is a crime',
              textColor: 'text-amber-900', subColor: 'text-amber-600',
            },
            {
              bg: 'bg-purple-50', iconBg: 'bg-purple-100', stroke: '#7C3AED',
              icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
              icon2: null,
              label: 'Offer source', sub: 'Recruiter = red flag',
              textColor: 'text-purple-900', subColor: 'text-purple-600',
            },
            {
              bg: 'bg-gray-50', iconBg: 'bg-gray-200', stroke: '#374151',
              icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
              icon2: null,
              label: 'Duration match', sub: 'Offer vs. LMIA',
              textColor: 'text-gray-900', subColor: 'text-gray-500',
            },
            {
              bg: 'bg-green-50', iconBg: 'bg-green-100', stroke: '#16A34A',
              icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
              icon2: null,
              label: 'Web presence', sub: 'Real business check',
              textColor: 'text-green-900', subColor: 'text-green-600',
            },
          ] as const).map((item) => (
            <div key={item.label} className={`${item.bg} rounded-2xl p-3.5 flex items-start gap-3`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={item.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {item.icon}{item.icon2}
                </svg>
              </div>
              <div>
                <p className={`text-xs font-semibold leading-tight ${item.textColor}`}>{item.label}</p>
                <p className={`text-[11px] mt-0.5 leading-tight ${item.subColor}`}>{item.sub}</p>
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
