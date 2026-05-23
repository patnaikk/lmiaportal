'use client'

import { useState } from 'react'

interface Props {
  queriedName: string
  province?: string
}

export default function MappingContribution({ queriedName, province }: Props) {
  const [open, setOpen] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submittedName.trim().length < 2) return
    setStatus('loading')
    try {
      const res = await fetch('/api/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queried_name: queriedName,
          submitted_name: submittedName.trim(),
          province: province || null,
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-4 p-5 bg-white rounded-2xl shadow-lg shadow-gray-200/80 flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">
          Thanks! We&apos;ll review and add it to help future users.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 p-5 bg-white rounded-2xl shadow-lg shadow-gray-200/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          Do you know another name for this employer?
        </span>
        <svg
          width="16" height="16"
          className={`flex-shrink-0 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <p className="text-xs text-gray-400 leading-relaxed">
            If you know a trade name, legal name, or numbered company name for{' '}
            <span className="font-medium text-gray-600">&ldquo;{queriedName}&rdquo;</span>,
            share it below — it helps other workers find this employer.
          </p>
          <input
            type="text"
            value={submittedName}
            onChange={(e) => setSubmittedName(e.target.value)}
            placeholder="e.g. 1234567 BC Ltd. or Sunrise Senior Care"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50"
            minLength={2}
            maxLength={200}
            autoComplete="off"
          />
          {status === 'error' && (
            <p className="text-xs text-red-500">Something went wrong — please try again.</p>
          )}
          <button
            type="submit"
            disabled={submittedName.trim().length < 2 || status === 'loading'}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  )
}
