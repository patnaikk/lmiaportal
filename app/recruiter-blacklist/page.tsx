'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const PROVINCES = [
  { code: '', label: 'All provinces' },
  { code: 'AB', label: 'Alberta' },
  { code: 'BC', label: 'British Columbia' },
  { code: 'MB', label: 'Manitoba' },
  { code: 'NB', label: 'New Brunswick' },
  { code: 'NL', label: 'Newfoundland & Labrador' },
  { code: 'NS', label: 'Nova Scotia' },
  { code: 'NT', label: 'Northwest Territories' },
  { code: 'NU', label: 'Nunavut' },
  { code: 'ON', label: 'Ontario' },
  { code: 'PE', label: 'PEI' },
  { code: 'QC', label: 'Quebec' },
  { code: 'SK', label: 'Saskatchewan' },
  { code: 'YT', label: 'Yukon' },
]

interface Report {
  id: string
  recruiter_name: string
  phone?: string
  social_handle?: string
  province?: string
  description: string
  created_at: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}

export default function RecruiterBlacklistPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [provinceFilter, setProvinceFilter] = useState('')

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    recruiter_name: '',
    phone: '',
    email: '',
    social_handle: '',
    province: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch('/api/report-recruiter')
      .then((r) => r.json())
      .then((d) => { setReports(d.reports || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = reports.filter((r) => {
    const q = filter.toLowerCase()
    const matchesText = !q ||
      r.recruiter_name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.social_handle || '').toLowerCase().includes(q)
    const matchesProvince = !provinceFilter || r.province === provinceFilter
    return matchesText && matchesProvince
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/report-recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed')
        setSubmitState('error')
      } else {
        setSubmitState('success')
        setForm({ recruiter_name: '', phone: '', email: '', social_handle: '', province: '', description: '' })
      }
    } catch {
      setSubmitError('Network error — please try again')
      setSubmitState('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to home
        </Link>

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-semibold text-orange-700 mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Community reports — moderated
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance tracking-tight mb-3">
            Recruiter blacklist
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Names of recruiters reported by workers for charging fees, running fake job scams,
            or pressuring workers into paying for LMIAs. All entries are reviewed before publishing.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This list is community-sourced and moderated. It is not an official government record.
            If you believe an entry is incorrect, contact us.
          </p>
        </div>

        {/* Report form toggle */}
        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full mb-6 py-3 px-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50 transition-all"
          >
            + Report a recruiter who charged fees or ran a scam
          </button>
        ) : (
          <div className="mb-6 p-5 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Report a recruiter</p>
              <button onClick={() => { setFormOpen(false); setSubmitState('idle') }} className="text-xs text-gray-400 hover:text-gray-700">
                Cancel
              </button>
            </div>

            {submitState === 'success' ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Report submitted</p>
                <p className="text-xs text-gray-500">Thank you. It will be reviewed and published if verified within 48 hours.</p>
                <button
                  onClick={() => { setSubmitState('idle'); setFormOpen(false) }}
                  className="mt-4 text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Recruiter / agent name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.recruiter_name}
                    onChange={(e) => setForm({ ...form, recruiter_name: e.target.value })}
                    placeholder="e.g. Maria Santos or SkyBridge Immigration"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (416) 555-0123"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Province</label>
                    <select
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50"
                    >
                      {PROVINCES.map(({ code, label }) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Social media / WhatsApp handle</label>
                  <input
                    type="text"
                    value={form.social_handle}
                    onChange={(e) => setForm({ ...form, social_handle: e.target.value })}
                    placeholder="e.g. @mariaimmigration or facebook.com/..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    What happened? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what happened — what they asked for, how much, how you were contacted. You don't need to include personal details about yourself."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50 resize-none"
                    required
                    minLength={20}
                  />
                </div>

                {submitState === 'error' && (
                  <p className="text-xs text-red-600 font-medium">{submitError}</p>
                )}

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  By submitting you confirm this is factual to the best of your knowledge. Do not include your own name or personal information. Reports are reviewed before publishing.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Submit report'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name, handle…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            {PROVINCES.map(({ code, label }) => (
              <option key={code} value={code}>{code || 'All'}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500 font-medium mb-1">
              {reports.length === 0 ? 'No verified reports yet' : 'No reports match your search'}
            </p>
            <p className="text-xs text-gray-400">
              {reports.length === 0
                ? 'Be the first to report a fraudulent recruiter. Your report helps protect others.'
                : 'Try a different name or clear the province filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium">{filtered.length} verified report{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map((r) => (
              <div key={r.id} className="card-elevated p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{r.recruiter_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {r.province && (
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {r.province}
                        </span>
                      )}
                      {r.phone && (
                        <span className="text-[11px] text-gray-500">{r.phone}</span>
                      )}
                      {r.social_handle && (
                        <span className="text-[11px] text-gray-500 font-mono">{r.social_handle}</span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-[11px] text-gray-400">{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
