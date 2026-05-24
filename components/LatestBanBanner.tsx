import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function LatestBanBanner() {
  let name = ''
  let province = ''

  try {
    const { data } = await supabase
      .from('violators')
      .select('business_operating_name, address')
      .in('compliance_status', ['INELIGIBLE', 'INELIGIBLE_UNTIL', 'INELIGIBLE_UNPAID'])
      .order('decision_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .single()

    if (data) {
      name = data.business_operating_name
      // Extract province abbreviation from address (last line before postal code)
      const addrLines = (data.address || '').split('\n').map((l: string) => l.trim()).filter(Boolean)
      const match = addrLines.find((l: string) => /,\s*[A-Z]{2}\s*$|,\s*[A-Z]{2}\s+[A-Z]\d[A-Z]/.test(l))
      if (match) {
        const m = match.match(/,\s*([A-Z]{2})/)
        if (m) province = m[1]
      }
    }
  } catch {
    return null
  }

  if (!name) return null

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-2 pb-0">
      <div className="flex items-center justify-between gap-3 bg-red-50/70 ring-1 ring-red-100 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <p className="text-sm text-red-900 truncate">
            <span className="font-semibold">New ban:</span>{' '}
            {name}{province ? <span className="text-red-700"> · {province}</span> : null}
          </p>
        </div>
        <Link
          href="/banned"
          className="text-xs font-semibold text-red-700 hover:text-red-900 whitespace-nowrap flex-shrink-0 transition-colors"
        >
          See all →
        </Link>
      </div>
    </div>
  )
}
