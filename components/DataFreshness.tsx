import { supabase } from '@/lib/supabase'
import ExternalLinkIcon from '@/components/ExternalLinkIcon'
import { quarterEndMonth } from '@/lib/quarters'

interface Props {
  variant?: 'inline' | 'badge'
  className?: string
}

async function getLastSyncDate(): Promise<string | null> {
  try {
    // Try sync_logs first (richer), fall back to most recent violator ingested_at
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .select('synced_at')
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (syncLog?.synced_at) return syncLog.synced_at

    const { data: violator } = await supabase
      .from('violators')
      .select('ingested_at')
      .order('ingested_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return violator?.ingested_at || null
  } catch {
    return null
  }
}

// The two datasets age very differently: the non-compliant list is synced
// daily, while ESDC publishes approvals quarterly with a lag of a few months.
// One "Updated <date>" next to the search box implied the approvals were as
// fresh as the banned list, so each source now shows its own date.
async function getLatestApprovalQuarter(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('positive_lmia')
      .select('quarter')
      .order('quarter', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.quarter ?? null
  } catch {
    return null
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return iso
  }
}

export default async function DataFreshness({ variant = 'inline', className = '' }: Props) {
  const [date, latestQuarter] = await Promise.all([getLastSyncDate(), getLatestApprovalQuarter()])
  if (!date) return null
  const approvalsThrough = latestQuarter ? quarterEndMonth(latestQuarter) : null

  const formatted = formatDate(date)

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Banned list current as of {formatted}
        {approvalsThrough && <span className="text-green-800/70">· Approvals through {approvalsThrough}</span>}
      </div>
    )
  }

  return (
    <p className={`text-xs text-gray-500 ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
        Banned list updated {formatted}
      </span>
      {approvalsThrough && <>{' · '}Approvals through {approvalsThrough}</>}
      {' · '}
      Direct from{' '}
      <a
        href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/report/non-compliant.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-700"
      >
        canada.ca<ExternalLinkIcon />
      </a>
    </p>
  )
}
