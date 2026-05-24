'use client'

import { useState } from 'react'

export default function MonthlySignupWidget() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/monthly-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong')
        setState('error')
      } else {
        setState('done')
      }
    } catch {
      setErrorMsg('Network error — please try again')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-green-50 rounded-2xl p-5 flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-900">You&apos;re on the list</p>
          <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
            We&apos;ll email you each month with the latest enforcement report — new bans, expiring bans, and provincial trends.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-indigo-50 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">Get the monthly report in your inbox</p>
          <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
            New bans, expiring bans, and provincial trends — delivered once a month, free.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state === 'loading'}
          className="flex-1 min-w-0 text-sm px-3 py-2 rounded-xl border border-indigo-200 bg-white placeholder-indigo-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {state === 'loading' ? 'Saving…' : 'Notify me'}
        </button>
      </form>

      {state === 'error' && (
        <p className="text-xs text-red-600 mt-2">{errorMsg}</p>
      )}
    </div>
  )
}
