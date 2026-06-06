'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

export default function HomeSignupWidget() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')

    try {
      const res = await fetch('/api/monthly-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) track('monthly_signup', { location: 'home_widget' })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-xs text-green-700 font-medium">You&apos;re on the list — we&apos;ll email you each month.</p>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state === 'loading'}
          className="flex-1 min-w-0 text-sm px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email.trim()}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {state === 'loading' ? '…' : 'Notify me'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-xs text-red-500 mt-1.5">Something went wrong — please try again.</p>
      )}
    </div>
  )
}
