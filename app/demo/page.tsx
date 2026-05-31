'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * CONCEPT DEMO — B2B agency dashboard for validation interviews only.
 * Single-tenant, sample data, no backend. Not linked from the public site.
 * Shows the two paid-tier features: Compliance Watchlist + Audit Evidence Pack.
 */

type Status = 'clear' | 'watch' | 'flagged'

interface ClientEmployer {
  id: string
  name: string
  country: 'CA' | 'UK' | 'AU'
  status: Status
  detail: string
  lastChecked: string
}

const SAMPLE_ROSTER: ClientEmployer[] = [
  { id: '1', name: 'Maple Ridge Logistics Inc.', country: 'CA', status: 'clear', detail: 'Positive LMIA on record · No compliance issues', lastChecked: 'Today, 6:00 AM' },
  { id: '2', name: 'Northern Harvest Farms Ltd.', country: 'CA', status: 'flagged', detail: 'Added to ESDC non-compliant list — penalty issued', lastChecked: 'Today, 6:00 AM' },
  { id: '3', name: 'Caledonia Care Group', country: 'UK', status: 'watch', detail: 'Sponsor licence downgraded A → B (action plan)', lastChecked: 'Today, 6:00 AM' },
  { id: '4', name: 'Thames Tech Solutions', country: 'UK', status: 'clear', detail: 'A-rated licensed sponsor · Skilled Worker route', lastChecked: 'Today, 6:00 AM' },
  { id: '5', name: 'Outback Hospitality Pty Ltd', country: 'AU', status: 'clear', detail: 'Approved work sponsor · On public register', lastChecked: 'Today, 6:00 AM' },
]

const STATUS_META: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  clear:   { label: 'Clear',   bg: 'bg-green-50',  text: 'text-green-800',  dot: 'bg-green-500' },
  watch:   { label: 'Watch',   bg: 'bg-amber-50',  text: 'text-amber-800',  dot: 'bg-amber-500' },
  flagged: { label: 'Flagged', bg: 'bg-red-50',    text: 'text-red-800',    dot: 'bg-red-500' },
}

const FLAG_EMOJI: Record<ClientEmployer['country'], string> = { CA: '🇨🇦', UK: '🇬🇧', AU: '🇦🇺' }

export default function DemoDashboard() {
  const [alertSent, setAlertSent] = useState(false)
  const [auditFor, setAuditFor] = useState<ClientEmployer | null>(null)

  const flagged = SAMPLE_ROSTER.filter((e) => e.status !== 'clear')

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Concept banner */}
      <div className="bg-indigo-600 text-white text-center text-xs py-2 px-4">
        Concept preview — sample data. This is what the paid agency dashboard would look like.
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Compliance Watchlist</h1>
            <p className="text-gray-500 text-sm mt-1">Monitoring 5 client employers across 3 countries · Auto-checked daily</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Acme Immigration Consultants</p>
            <p className="text-xs text-gray-400">Demo workspace</p>
          </div>
        </div>

        {/* Summary cards — Apple style: tinted bg + rounded-square icon, no border bands */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 bg-green-50 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-2xl font-bold text-green-900">3</p>
            <p className="text-xs text-green-700">Clear</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <p className="text-2xl font-bold text-amber-900">1</p>
            <p className="text-xs text-amber-700">Needs review</p>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <p className="text-2xl font-bold text-red-900">1</p>
            <p className="text-xs text-red-700">Flagged</p>
          </div>
        </div>

        {/* Alert simulation */}
        <div className="card-elevated rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Automated alerts</p>
              <p className="text-xs text-gray-500 mt-0.5">When any employer on your roster is downgraded, revoked, or added to a non-compliant list, you get an email the same day.</p>
              {alertSent ? (
                <div className="mt-3 bg-indigo-50 rounded-xl px-4 py-3 text-xs text-indigo-900 animate-verdict-in">
                  <p className="font-semibold">📧 Alert sent to you@acmeimmigration.ca</p>
                  <p className="mt-1 text-indigo-700">“⚠️ Northern Harvest Farms Ltd. was added to the ESDC non-compliant list today. You have 1 active client placed with this employer. View details →”</p>
                </div>
              ) : (
                <button onClick={() => setAlertSent(true)} className="mt-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3.5 py-2 transition-colors">
                  Simulate today’s alert
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Roster table */}
        <div className="card-elevated rounded-2xl overflow-hidden mb-8">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Client roster</p>
            <span className="text-xs text-gray-400">5 employers</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {SAMPLE_ROSTER.map((e) => {
              const meta = STATUS_META[e.status]
              return (
                <li key={e.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                  <span className="text-lg" aria-hidden>{FLAG_EMOJI[e.country]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.name}</p>
                    <p className="text-xs text-gray-500 truncate">{e.detail}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 ${meta.bg} ${meta.text} text-xs font-semibold rounded-full px-2.5 py-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <button onClick={() => setAuditFor(e)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap">
                    Evidence pack
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Why agencies pay */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-5 bg-indigo-50 rounded-2xl">
            <p className="text-sm font-semibold text-indigo-900">Never miss a downgrade</p>
            <p className="text-xs text-indigo-700 mt-1">The register changes daily. We diff it for you and alert the same day — across Canada, the UK, and Australia.</p>
          </div>
          <div className="p-5 bg-green-50 rounded-2xl">
            <p className="text-sm font-semibold text-green-900">Prove your due diligence</p>
            <p className="text-xs text-green-700 mt-1">Timestamped evidence packs show a regulator exactly what the official record said on the day you advised.</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Concept demo for validation · <Link href="/" className="underline">Back to lmiacheck.ca</Link>
        </p>
      </div>

      {/* Audit Evidence Pack modal */}
      {auditFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setAuditFor(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-verdict-in" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.24"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Audit Evidence Pack</p>
                <p className="text-xs text-gray-500">{auditFor.name}</p>
              </div>
            </div>
            <dl className="text-xs space-y-2.5 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between"><dt className="text-gray-500">Country</dt><dd className="font-medium text-gray-900">{FLAG_EMOJI[auditFor.country]} {auditFor.country}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Status as of today</dt><dd className="font-medium text-gray-900">{STATUS_META[auditFor.status].label}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Official record</dt><dd className="font-medium text-gray-900 text-right">{auditFor.detail}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Snapshot taken</dt><dd className="font-medium text-gray-900">{auditFor.lastChecked}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Source</dt><dd className="font-medium text-indigo-700">Official government register</dd></div>
            </dl>
            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">This pack certifies what the official record showed on the date above — your proof of due diligence for {auditFor.name}.</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-2.5 transition-colors">Download PDF</button>
              <button onClick={() => setAuditFor(null)} className="text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg px-3 py-2.5">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
