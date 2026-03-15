import Link from 'next/link'
import CheckForm from '@/components/CheckForm'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Is My LMIA Real? — LMIA Check',
  description:
    'Run every checkable signal on your Canadian job offer. Cross-reference the employer, check for red flags, and get a plain-language risk assessment — free.',
}

export default function CheckPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Nav */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">FAQ</Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">About</Link>
            <Link href="/updates" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">What&apos;s new</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-red-50 text-center pt-10 pb-7 px-4">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Is my LMIA real?
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Enter your offer details and we&apos;ll run every checkable signal — employer records, red flags, fraud indicators — and give you a plain-language result.
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
          {[
            { icon: '📋', label: 'Government LMIA records', sub: '11K+ employers cross-referenced' },
            { icon: '🚫', label: 'Non-compliant list', sub: '1,262 banned employers checked' },
            { icon: '💸', label: 'Illegal fee detection', sub: 'Paying for an LMIA is a crime' },
            { icon: '🤝', label: 'Offer source', sub: 'Recruiter delivery is a red flag' },
            { icon: '📅', label: 'Duration consistency', sub: 'Offer vs. LMIA must match' },
            { icon: '🔎', label: 'Web presence', sub: 'Does a real business exist?' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
              <span className="text-lg leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-md">
          <CheckForm />
          <p className="text-center text-xs text-gray-400 mt-4">🔒 No data stored · No login required</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
