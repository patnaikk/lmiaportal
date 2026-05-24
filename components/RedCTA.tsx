'use client'

import { useState } from 'react'

export default function RedCTA() {
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null)

  if (answer === null) {
    return (
      <div className="mt-6 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3 text-center">
          Did you receive a job offer from this employer?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAnswer('yes')}
            className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            Yes, I got an offer
          </button>
          <button
            onClick={() => setAnswer('no')}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            No, just checking
          </button>
        </div>
      </div>
    )
  }

  if (answer === 'yes') {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-xs text-gray-500 text-center">
          Do not respond to this offer. Report it to Service Canada — it&apos;s free and confidential.
        </p>
        <a
          href="tel:18003675693"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Report to ESDC · 1-800-367-5693
        </a>
      </div>
    )
  }

  // answer === 'no'
  return (
    <div className="mt-6 bg-green-50 rounded-2xl p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center mt-0.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-green-900 leading-snug">You&apos;re protected</p>
        <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
          Good instinct checking first. Avoid any offer from this employer — they cannot legally hire temporary foreign workers.
        </p>
      </div>
    </div>
  )
}
