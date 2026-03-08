'use client'

import { useState } from 'react'
import type { RiskResult } from '@/lib/types'

interface Props {
  employerQuery: string
  employerNormalized: string
  lastResult: RiskResult
}

export default function EmailCapture({ employerQuery, employerNormalized, lastResult }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          employer_query: employerQuery,
          employer_normalized: employerNormalized,
          last_result: lastResult,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong — please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong — please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
        <p className="text-sm text-gray-700">
          <span className="text-green-600 font-semibold">✓ Got it.</span> We&apos;ll notify you if anything changes.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-gray-500 mt-0.5" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium text-gray-800">Get notified if this employer&apos;s status changes</p>
          <p className="text-xs text-gray-500 mt-0.5">
            We&apos;ll email you when the government updates the non-compliant employer list. Free. No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
          aria-label="Email address for notifications"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[44px]"
        >
          {status === 'loading' ? 'Saving…' : 'Notify me'}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
