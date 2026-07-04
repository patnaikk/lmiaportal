'use client'

import { useState } from 'react'
import type { RiskResult } from '@/lib/types'
import { track } from '@/lib/analytics'

interface Props {
  employerQuery: string
  employerNormalized: string
  lastResult: RiskResult
}

export default function EmailCapture({ employerQuery, employerNormalized, lastResult }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'dismissed'>('idle')

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
        track('watch_employer_signup', { result: lastResult })
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

  async function handleNewsletterOptIn() {
    if (newsletterStatus === 'loading') return
    setNewsletterStatus('loading')

    try {
      const res = await fetch('/api/monthly-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (res.ok) {
        track('monthly_signup', { location: 'email_capture_upsell' })
        setNewsletterStatus('done')
      } else {
        setNewsletterStatus('error')
      }
    } catch {
      setNewsletterStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-4 p-5 card-elevated">
        <p className="text-sm text-gray-700">
          <span className="text-green-600 font-semibold">✓ Got it.</span> We&apos;ll notify you if anything changes.
        </p>

        {newsletterStatus === 'idle' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <p className="text-xs text-gray-500 flex-1">
              Also want the monthly enforcement digest — new bans, expiring bans, and provincial trends?
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleNewsletterOptIn}
                className="px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1 whitespace-nowrap"
              >
                Yes, sign me up
              </button>
              <button
                type="button"
                onClick={() => setNewsletterStatus('dismissed')}
                className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                No thanks
              </button>
            </div>
          </div>
        )}

        {newsletterStatus === 'loading' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Saving…</p>
          </div>
        )}

        {newsletterStatus === 'done' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-green-700 font-medium">✓ You&apos;re on the list — we&apos;ll email you each month.</p>
          </div>
        )}

        {newsletterStatus === 'error' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <p className="text-xs text-red-600" role="alert">Something went wrong.</p>
            <button
              type="button"
              onClick={handleNewsletterOptIn}
              className="text-xs text-gray-600 underline hover:text-gray-800"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    )
  }

  const isGrey = lastResult === 'GREY'
  const heading = isGrey
    ? 'Not found — want us to keep watching?'
    : lastResult === 'RED'
      ? 'Get alerted if this ban status changes'
      : 'Get notified if this employer’s status changes'
  const body = isGrey
    ? 'We couldn’t find this employer in the government records yet. Leave your email and we’ll alert you if they’re ever added to the banned list — or receive an approved LMIA.'
    : 'We’ll email you when the government updates the official employer records. Free. No spam. Unsubscribe anytime.'

  return (
    <div className={`mt-4 p-5 rounded-2xl ${isGrey ? 'bg-indigo-50' : 'card-elevated'}`}>
      <div className="flex items-start gap-2.5 mb-3">
        <span className={`mt-0.5 ${isGrey ? 'text-indigo-500' : 'text-gray-500'}`} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </span>
        <div>
          <p className={`text-sm font-semibold ${isGrey ? 'text-indigo-900' : 'text-gray-800'}`}>{heading}</p>
          <p className={`text-xs mt-0.5 ${isGrey ? 'text-indigo-700' : 'text-gray-500'}`}>{body}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 px-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
          aria-label="Email address for notifications"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="w-full sm:w-auto px-5 py-3 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
