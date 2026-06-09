import { supabase } from '@/lib/supabase'
import { formatTimeAgo } from '@/lib/format-time'

export const revalidate = 600 // refresh ticker every 10 min

interface Activity {
  newBansThisWeek: number
  checksThisWeek: number
  lastDataUpdate: string | null
}

async function fetchActivity(): Promise<Activity> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [newBans, checks, lastSync] = await Promise.all([
      // New bans this week: any violator with a decision_date >= 7 days ago that is ineligible
      supabase
        .from('violators')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo)
        .in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID']),
      // Worker checks this week (from search_logs)
      supabase
        .from('search_logs')
        .select('id', { count: 'exact', head: true })
        .gte('searched_at', oneWeekAgo),
      // Most recent sync timestamp
      supabase
        .from('sync_logs')
        .select('synced_at')
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    return {
      newBansThisWeek: newBans.count ?? 0,
      checksThisWeek: checks.count ?? 0,
      lastDataUpdate: lastSync.data?.synced_at ?? null,
    }
  } catch {
    return { newBansThisWeek: 0, checksThisWeek: 0, lastDataUpdate: null }
  }
}

function PulseDot({ color }: { color: 'red' | 'green' | 'gray' }) {
  const dotColor = color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-green-500' : 'bg-gray-400'
  const haloColor = color === 'red' ? 'bg-red-400' : color === 'green' ? 'bg-green-400' : 'bg-gray-300'
  return (
    <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${haloColor} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
    </span>
  )
}

export default async function ActivityTicker() {
  const data = await fetchActivity()

  // Don't render at all if nothing meaningful
  if (!data.newBansThisWeek && !data.checksThisWeek && !data.lastDataUpdate) return null

  return (
    <div className="max-w-2xl mx-auto w-full px-4 mt-4">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs">
        {/* New bans this week */}
        {data.newBansThisWeek > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50/70 ring-1 ring-red-100 rounded-full">
            <PulseDot color="red" />
            <span className="text-red-800">
              <span className="font-semibold tabular-nums">{data.newBansThisWeek}</span>{' '}
              {data.newBansThisWeek === 1 ? 'new ban' : 'new bans'} this week
            </span>
          </div>
        )}

        {/* Worker checks this week */}
        {data.checksThisWeek > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 ring-1 ring-gray-100 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-gray-700">
              <span className="font-semibold tabular-nums">{data.checksThisWeek.toLocaleString()}</span> {data.checksThisWeek === 1 ? 'worker check' : 'worker checks'} this week
            </span>
          </div>
        )}

        {/* Last data update */}
        {data.lastDataUpdate && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50/70 ring-1 ring-green-100 rounded-full">
            <PulseDot color="green" />
            <span className="text-green-800">
              Updated <span className="font-medium">{formatTimeAgo(data.lastDataUpdate)}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
