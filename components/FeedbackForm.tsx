'use client'

import { useState } from 'react'

interface Props {
  employerQuery: string
}

export default function FeedbackForm({ employerQuery }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'missing_employer' | 'suggestion'>('missing_employer')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const placeholder = feedbackType === 'missing_employer'
    ? `e.g. "I searched for Sunrise Farms in BC — they have a valid LMIA but don't appear in results."`
    : `e.g. "It would help to show the date the LMIA was approved."`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: feedbackType,
          message: message.trim(),
          employer_query: employerQuery,
          email: email.trim() || null,
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
          <span className="text-green-600 font-semibold">✓ Thanks for your feedback.</span> We review every submission to improve data quality.
        </p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          Found an error or missing employer? Let us know
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-800">Send us feedback</p>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close feedback form"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Feedback type */}
        <div>
          <label htmlFor="feedback-type" className="block text-xs font-medium text-gray-600 mb-1">
            Type of feedback
          </label>
          <select
            id="feedback-type"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as 'missing_employer' | 'suggestion')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
          >
            <option value="missing_employer">Missing employer — should be in the database</option>
            <option value="suggestion">General suggestion or feedback</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="feedback-message" className="block text-xs font-medium text-gray-600 mb-1">
            Your feedback <span className="text-gray-400">(required)</span>
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            required
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white resize-none"
            aria-label="Your feedback"
          />
        </div>

        {/* Email (optional) */}
        <div>
          <label htmlFor="feedback-email" className="block text-xs font-medium text-gray-600 mb-1">
            Email <span className="text-gray-400">(optional — so we can follow up)</span>
          </label>
          <input
            type="email"
            id="feedback-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
            aria-label="Email address for follow-up (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || message.trim().length < 10}
          className="w-full px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {status === 'loading' ? 'Sending…' : 'Send feedback'}
        </button>

        {status === 'error' && (
          <p className="text-xs text-red-600" role="alert">{errorMsg}</p>
        )}
      </form>
    </div>
  )
}
