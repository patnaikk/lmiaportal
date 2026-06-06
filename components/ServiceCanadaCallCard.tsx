export default function ServiceCanadaCallCard() {
  return (
    <div className="mt-4 p-5 sm:p-6 bg-blue-50 border border-blue-100 rounded-2xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">Triple-check with Service Canada (5 min)</p>
          <p className="text-xs text-blue-700 mt-0.5">The only way to confirm an LMIA is 100% genuine. Free phone call.</p>
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-800 leading-relaxed italic">
        &ldquo;I am a foreign worker and I received a job offer. I want to verify that LMIA number [your number] was approved for [employer name] in [province].&rdquo;
      </div>

      <a
        href="tel:18003675693"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
        </svg>
        Call 1-800-367-5693
      </a>
      <p className="text-xs text-blue-600 text-center mt-1.5">Mon–Fri, 6:30 am – 8 pm ET</p>

      <p className="text-[11px] text-blue-600 mt-2">
        Need the full verification script?{' '}
        <a href="/verify-lmia" className="underline font-medium hover:text-blue-800">
          Step-by-step guide →
        </a>
      </p>
    </div>
  )
}
