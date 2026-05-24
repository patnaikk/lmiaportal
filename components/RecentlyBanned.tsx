import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatTimeAgo } from '@/lib/format-time'

interface BannedRow {
  business_operating_name: string
  province: string
  decision_date: string | null
  compliance_status: string
}

export default async function RecentlyBanned() {
  let rows: BannedRow[] = []

  try {
    const { data } = await supabase
      .from('violators')
      .select('business_operating_name, province, decision_date, compliance_status')
      .in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID'])
      .order('decision_date', { ascending: false, nullsFirst: false })
      .limit(5)

    rows = (data as BannedRow[]) || []
  } catch {
    // If DB not available, silently skip
    return null
  }

  if (rows.length === 0) return null

  return (
    <div id="recently-banned" className="max-w-2xl mx-auto w-full px-4 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recently banned employers</h2>
        <Link href="/banned" className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
          See all →
        </Link>
      </div>
      <div className="rounded-2xl overflow-hidden bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] divide-y divide-gray-100">
        {rows.map((row, i) => (
          <Link
            key={i}
            href={`/results?employer=${encodeURIComponent(row.business_operating_name)}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
          >
            {/* Red dot */}
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" aria-hidden="true" />

            {/* Name + province */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                {row.business_operating_name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {row.province || 'Canada'} · Banned {formatTimeAgo(row.decision_date)}
              </p>
            </div>

            {/* Chevron */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-center">
        Source: ESDC — Employment and Social Development Canada
      </p>
    </div>
  )
}
