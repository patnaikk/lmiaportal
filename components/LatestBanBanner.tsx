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
    <div className="max-w-2xl mx-auto w-full px-4 pt-3 pb-1">
      <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" aria-hidden="true" />
          <p className="text-sm text-red-800 truncate">
            <span className="font-semibold">New ban:</span>{' '}
            {name}{province ? ` (${province})` : ''}
          </p>
        </div>
        <Link
          href="#recently-banned"
          className="text-xs font-semibold text-red-600 hover:text-red-800 whitespace-nowrap flex-shrink-0 transition-colors"
        >
          See all ↓
        </Link>
      </div>
    </div>
  )
}
