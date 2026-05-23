import { supabase } from '@/lib/supabase'
import ExternalLinkIcon from '@/components/ExternalLinkIcon'

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
  const date = await getLastSyncDate()
  if (!date) return null

  const formatted = formatDate(date)

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Data current as of {formatted}
      </div>
    )
  }

  return (
    <p className={`text-xs text-gray-500 ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
        Updated {formatted}
      </span>
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
