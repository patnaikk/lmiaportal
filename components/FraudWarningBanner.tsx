'use client'

import { useState, useEffect } from 'react'

export default function FraudWarningBanner() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Hide on this session if user has dismissed
    if (typeof window !== 'undefined' && sessionStorage.getItem('lmia_fraud_banner_dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  if (dismissed) return null

  return (
    <div className="w-full bg-red-50 border-b border-red-100" role="alert">
      <div className="max-w-2xl mx-auto px-4 py-1 flex items-center gap-2">
        <p className="text-[11px] leading-none flex-1 text-red-600">
          <span className="font-semibold">Never pay for an LMIA.</span>{' '}
          It&apos;s illegal.{' '}
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/services/protect-fraud.html"
            className="underline hover:text-red-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report fraud ↗
          </a>
        </p>
        <button
          onClick={() => {
            setDismissed(true)
            try { sessionStorage.setItem('lmia_fraud_banner_dismissed', '1') } catch {}
          }}
          className="flex-shrink-0 text-red-300 hover:text-red-500 transition-colors"
          aria-label="Dismiss warning"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
