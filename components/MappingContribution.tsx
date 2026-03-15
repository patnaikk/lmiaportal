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
      <div className="mt-3 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5">
        <svg className="flex-shrink-0 w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-green-800">
          Thanks! We&apos;ll review and add it to help future users.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Do you know another name for this employer?
        </span>
        <svg
          width="16" height="16"
          className={`flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
          <p className="text-xs text-gray-500 leading-relaxed">
            If you know a trade name, legal name, or numbered company name for{' '}
            <span className="font-medium text-gray-700">&ldquo;{queriedName}&rdquo;</span>,
            share it below — it helps other workers find this employer.
          </p>
          <input
            type="text"
            value={submittedName}
            onChange={(e) => setSubmittedName(e.target.value)}
            placeholder="e.g. 1234567 BC Ltd. or Sunrise Senior Care"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            minLength={2}
            maxLength={200}
            autoComplete="off"
          />
          {status === 'error' && (
            <p className="text-xs text-red-600">Something went wrong — please try again.</p>
          )}
          <button
            type="submit"
            disabled={submittedName.trim().length < 2 || status === 'loading'}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  )
}
