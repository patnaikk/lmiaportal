'use client'

import { useState } from 'react'
import type { ViolatorRecord } from '@/lib/types'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

interface Props {
  violators: ViolatorRecord[]
}

function formatLongDate(iso?: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return null
  }
}

export default function ViolationDetail({ violators }: Props) {
  const [showRaw, setShowRaw] = useState(false)
  if (!violators || violators.length === 0) return null

  const v = violators[0]
  const reasonCodes = expandViolationReasons(v.reasons)
  const hasReason9 = reasonCodes.includes(9)

  const decisionDate = formatLongDate(v.decision_date)
  const banUntil = formatLongDate(v.ineligible_until_date)
  const hasDistinctLegalName =
    v.business_legal_name &&
    v.business_legal_name.toLowerCase().trim() !== v.business_operating_name?.toLowerCase().trim()

  // Build the prose summary
  const employerName = v.business_operating_name
  const isBanned = v.compliance_status === 'INELIGIBLE_UNTIL' && banUntil
  const hasUnpaidPenalty = v.compliance_status === 'INELIGIBLE_UNPAID' || v.compliance_status === 'INELIGIBLE'

  return (
    <div className="mt-4 bg-white rounded-2xl shadow-lg shadow-gray-200/80 overflow-hidden">
      {/* Prose summary */}
      <div className="p-6 sm:p-7">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Why this employer was banned</h2>

        <p className="text-[15px] text-gray-700 leading-relaxed">
          {decisionDate ? <>On <span className="font-semibold text-gray-900">{decisionDate}</span>, the </> : 'The '}
          Government of Canada found <span className="font-semibold text-gray-900">{employerName}</span>{' '}
          non-compliant with the Temporary Foreign Worker Program.
          {isBanned && (
            <> They are <span className="font-semibold text-red-600">banned from hiring</span> temporary foreign workers until <span className="font-semibold text-gray-900">{banUntil}</span>.</>
          )}
          {hasUnpaidPenalty && (
            <> They have an <span className="font-semibold text-red-600">unpaid monetary penalty</span> and cannot hire temporary foreign workers until it is paid.</>
          )}
          {v.penalty_amount && (
            <> A fine of <span className="font-semibold text-gray-900">{v.penalty_amount}</span>{v.ban_duration ? <> and a <span className="font-semibold text-gray-900">{v.ban_duration}</span> hiring ban</> : ''} was issued.</>
          )}
        </p>

        {hasReason9 && (
          <div className="mt-4 px-4 py-3 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold">Especially relevant for foreign workers:</span> this employer was found to have misrepresented pay or working conditions — one of the most common violations affecting workers directly.
            </p>
          </div>
        )}

        {/* Violation reasons — clean numbered list */}
        {reasonCodes.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              What they did wrong
            </p>
            <ul className="space-y-2.5">
              {reasonCodes.map((code) => (
                <li key={code} className="flex gap-3 text-[15px] text-gray-700 leading-relaxed">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {code}
                  </span>
                  <span>{VIOLATION_CODES[code] ?? `Violation code ${code}`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Collapsible raw record */}
      <button
        type="button"
        onClick={() => setShowRaw((s) => !s)}
        className="w-full px-6 py-3 border-t border-gray-100 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        aria-expanded={showRaw}
      >
        <span className="text-xs font-medium text-gray-500">
          {showRaw ? 'Hide raw government record' : 'View raw government record'}
        </span>
        <svg
          width="14" height="14"
          className={`text-gray-400 transition-transform ${showRaw ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showRaw && (
        <dl className="px-6 pb-6 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Operating name</dt>
            <dd className="text-gray-700 mt-0.5">{v.business_operating_name}</dd>
          </div>
          {hasDistinctLegalName && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Legal name</dt>
              <dd className="text-gray-700 mt-0.5">{v.business_legal_name}</dd>
            </div>
          )}
          {v.province && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Province</dt>
              <dd className="text-gray-700 mt-0.5">{v.province}</dd>
            </div>
          )}
          {decisionDate && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Decision date</dt>
              <dd className="text-gray-700 mt-0.5">{decisionDate}</dd>
            </div>
          )}
          {v.penalty_amount && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Penalty</dt>
              <dd className="text-gray-700 mt-0.5">{v.penalty_amount}{v.ban_duration ? <> · {v.ban_duration}</> : ''}</dd>
            </div>
          )}
          {banUntil && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Ban ends</dt>
              <dd className="text-gray-700 mt-0.5">{banUntil}</dd>
            </div>
          )}
          {v.reasons && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Violation codes (raw)</dt>
              <dd className="text-gray-500 mt-0.5 font-mono text-xs">{v.reasons}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  )
}
