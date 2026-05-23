'use client'

import { useState } from 'react'
import type { PositiveLmia } from '@/lib/types'

interface Props {
  matches: PositiveLmia[]
}

function formatQuarter(q?: string | null): string {
  if (!q) return ''
  const map: Record<string, string> = {
    'Q1': 'Jan–Mar', 'Q2': 'Apr–Jun', 'Q3': 'Jul–Sep', 'Q4': 'Oct–Dec',
  }
  const m = q.match(/^(\d{4})-?(Q\d)$/i)
  if (!m) return q
  const [, year, quarter] = m
  return `${map[quarter] ?? quarter} ${year}`
}

const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
}

function MatchCard({ match }: { match: PositiveLmia }) {
  const [showRaw, setShowRaw] = useState(false)

  const positions = match.approved_positions
  const lmias = match.approved_lmias
  const quarter = formatQuarter(match.quarter)
  const province = match.province ? (PROVINCE_NAMES[match.province] || match.province) : null
  const stream = match.program_stream
  const occupation = match.occupation_title
  const noc = match.noc_code

  // Build a natural-language sentence
  const subject = match.employer_name
  const positionsClause = positions
    ? <>was approved to hire <span className="font-semibold text-gray-900">{positions} {positions === 1 ? 'worker' : 'workers'}</span></>
    : <>was approved by the Government of Canada</>
  const lmiaClause = lmias && lmias > 1 ? <> across <span className="font-semibold text-gray-900">{lmias} separate LMIAs</span></> : null
  const occupationClause = occupation
    ? <> as <span className="font-semibold text-gray-900">{occupation}</span>{noc ? <> (NOC <span className="font-mono">{noc}</span>)</> : null}</>
    : null
  const provinceClause = province ? <> in <span className="font-semibold text-gray-900">{province}</span></> : null
  const streamClause = stream ? <> under <span className="font-semibold text-gray-900">{stream}</span></> : null
  const quarterClause = quarter ? <> The LMIA was issued in <span className="font-semibold text-gray-900">{quarter}</span>.</> : null

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/80 overflow-hidden">
      <div className="p-6 sm:p-7">
        {/* Headline stats — kept prominent because they're the answer */}
        {(positions || lmias) && (
          <div className="flex items-baseline gap-5 mb-5 pb-5 border-b border-gray-100">
            {positions != null && (
              <div>
                <div className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{positions}</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1.5">{positions === 1 ? 'Position' : 'Positions'}</div>
              </div>
            )}
            {lmias != null && (
              <div>
                <div className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{lmias}</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1.5">{lmias === 1 ? 'LMIA' : 'LMIAs'}</div>
              </div>
            )}
            {quarter && (
              <div className="ml-auto text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Issued</div>
                <div className="text-sm text-gray-600 mt-1.5">{quarter}</div>
              </div>
            )}
          </div>
        )}

        {/* Prose summary */}
        <p className="text-[15px] text-gray-700 leading-relaxed">
          <span className="font-semibold text-gray-900">{subject}</span> {positionsClause}
          {lmiaClause}{occupationClause}{provinceClause}{streamClause}.
          {quarterClause}
        </p>

        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          Government data is published quarterly and may be up to 3 months behind.
        </p>
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
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Employer</dt>
            <dd className="text-gray-700 mt-0.5">{match.employer_name}</dd>
          </div>
          {match.address && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Address</dt>
              <dd className="text-gray-700 mt-0.5">{match.address}</dd>
            </div>
          )}
          {match.province && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Province</dt>
              <dd className="text-gray-700 mt-0.5">{PROVINCE_NAMES[match.province] || match.province}</dd>
            </div>
          )}
          {stream && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Program stream</dt>
              <dd className="text-gray-700 mt-0.5">{stream}</dd>
            </div>
          )}
          {match.incorporate_status && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Incorporation</dt>
              <dd className="text-gray-700 mt-0.5">{match.incorporate_status}</dd>
            </div>
          )}
          {(noc || occupation) && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Occupation</dt>
              <dd className="text-gray-700 mt-0.5">
                {noc && <span className="font-mono">NOC {noc}</span>}
                {noc && occupation && ' — '}
                {occupation}
              </dd>
            </div>
          )}
          {quarter && (
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Data quarter</dt>
              <dd className="text-gray-700 mt-0.5">{quarter}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  )
}

export default function MatchedData({ matches }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (!matches || matches.length === 0) return null

  const displayed = showAll ? matches : matches.slice(0, 1)

  return (
    <div className="mt-4">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {matches.length > 1
          ? `Found in government records · ${matches.length} entries`
          : 'Found in government records'}
      </h2>
      <div className="space-y-3">
        {displayed.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
      {matches.length > 1 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Show {matches.length - 1} more {matches.length - 1 === 1 ? 'record' : 'records'} →
        </button>
      )}
    </div>
  )
}
