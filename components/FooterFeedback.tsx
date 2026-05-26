'use client'

import { useState } from 'react'

export default function FooterFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'missing_employer'>('suggestion')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
      <div className="p-4 bg-white rounded-2xl shadow-sm shadow-gray-200/60 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-green-600">Thanks!</span> We read every submission.
        </p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          Have a suggestion or feature request? Send feedback
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm shadow-gray-200/60">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Send feedback</p>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="footer-feedback-type" className="block text-xs font-medium text-gray-500 mb-1.5">
            Type
          </label>
          <select
            id="footer-feedback-type"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as 'suggestion' | 'missing_employer')}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            <option value="suggestion">Feature request or general feedback</option>
            <option value="missing_employer">Missing employer in the database</option>
          </select>
        </div>

        <div>
          <label htmlFor="footer-feedback-message" className="block text-xs font-medium text-gray-500 mb-1.5">
            Message <span className="text-gray-400">(required)</span>
          </label>
          <textarea
            id="footer-feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you'd like to see…"
            required
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        <div>
          <label htmlFor="footer-feedback-email" className="block text-xs font-medium text-gray-500 mb-1.5">
            Email <span className="text-gray-400">(optional — if you want a reply)</span>
          </label>
          <input
            type="email"
            id="footer-feedback-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || message.trim().length < 10}
          className="w-full px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Sending…' : 'Send feedback'}
        </button>

        {status === 'error' && (
          <p className="text-xs text-red-500" role="alert">{errorMsg}</p>
        )}
      </form>
    </div>
  )
}
