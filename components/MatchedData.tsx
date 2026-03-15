'use client'

import { useState } from 'react'
import type { PositiveLmia } from '@/lib/types'

interface Props {
  matches: PositiveLmia[]
}

function formatQuarter(q: string): string {
  // e.g. "2025-Q3" → "Q3 2025 (Jul–Sep 2025)"
  const map: Record<string, string> = {
    'Q1': 'Jan–Mar',
    'Q2': 'Apr–Jun',
    'Q3': 'Jul–Sep',
    'Q4': 'Oct–Dec',
  }
  const match = q.match(/^(\d{4})-?(Q\d)$/i)
  if (!match) return q
  const [, year, quarter] = match
  return `${quarter} ${year} (${map[quarter] ?? quarter} ${year})`
}

function MatchCard({ match }: { match: PositiveLmia }) {
  return (
    <div className="p-5 border border-gray-200 rounded-xl bg-white">
      {/* Employer name */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{match.employer_name}</h3>
        {match.province && (
          <p className="text-sm text-gray-500 mt-0.5">{match.province}</p>
        )}
      </div>

      {/* Approved positions — most important number */}
      <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-green-50 rounded-lg border border-green-200">
        <div>
          <span className="text-xs text-green-700 uppercase tracking-wide block">Approved Positions</span>
          <span className="text-3xl font-bold text-green-800">{match.approved_positions ?? '—'}</span>
          <span className="text-xs text-green-600 block mt-0.5">Workers approved to hire</span>
        </div>
        <div>
          <span className="text-xs text-green-700 uppercase tracking-wide block">Approved LMIAs</span>
          <span className="text-3xl font-bold text-green-800">{match.approved_lmias ?? '—'}</span>
          <span className="text-xs text-green-600 block mt-0.5">Approved applications</span>
        </div>
      </div>

      {/* Details grid */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <dt className="text-xs text-gray-500 uppercase tracking-wide">Address</dt>
          <dd className="text-sm text-gray-900 mt-0.5">{match.address || '—'}</dd>
        </div>

        <div>
          <dt className="text-xs text-gray-500 uppercase tracking-wide">Province / Territory</dt>
          <dd className="text-sm text-gray-900 mt-0.5">{match.province || '—'}</dd>
        </div>

        <div>
          <dt className="text-xs text-gray-500 uppercase tracking-wide">Program Stream</dt>
          <dd className="text-sm text-gray-900 mt-0.5">{match.program_stream || '—'}</dd>
        </div>

        <div>
          <dt className="text-xs text-gray-500 uppercase tracking-wide">Incorporation Status</dt>
          <dd className="text-sm text-gray-900 mt-0.5">{match.incorporate_status || '—'}</dd>
        </div>

        {/* NOC Code + Occupation — always show both */}
        <div className="sm:col-span-2">
          <dt className="text-xs text-gray-500 uppercase tracking-wide">
            National Occupational Classification (NOC Code)
          </dt>
          <dd className="text-sm text-gray-900 mt-0.5">
            {match.noc_code ? (
              <>
                <span className="font-mono font-semibold">NOC {match.noc_code}</span>
                {match.occupation_title && (
                  <span className="text-gray-600"> — {match.occupation_title}</span>
                )}
              </>
            ) : (
              match.occupation_title || '—'
            )}
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs text-gray-500 uppercase tracking-wide">Data Quarter</dt>
          <dd className="text-sm text-gray-700 mt-0.5">
            {match.quarter ? formatQuarter(match.quarter) : '—'}
            <span className="text-gray-400 ml-2">
              — Government data is published quarterly and may be up to 3 months behind.
            </span>
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default function MatchedData({ matches }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (!matches || matches.length === 0) return null

  const displayed = showAll ? matches : matches.slice(0, 1)

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Government Record{matches.length > 1 ? `s (${matches.length} found)` : ''}
      </h2>
      <div className="space-y-3">
        {displayed.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
      {matches.length > 1 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-blue-700 hover:text-blue-900 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
        >
          Show all records ({matches.length - 1} more)
        </button>
      )}
    </div>
  )
}
