import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-token')
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!token || !adminPassword) return false
  return token === Buffer.from(adminPassword).toString('base64')
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Total subscribers (all time, not unsubscribed)
  const { count: totalSubscribers } = await supabaseAdmin
    .from('search_subscriptions')
    .select('*', { count: 'exact', head: true })
    .is('unsubscribed_at', null)

  // Subscribers this month
  const { count: monthSubscribers } = await supabaseAdmin
    .from('search_subscriptions')
    .select('*', { count: 'exact', head: true })
    .is('unsubscribed_at', null)
    .gte('subscribed_at', startOfMonth)

  // Breakdown by last_result
  const { data: resultBreakdown } = await supabaseAdmin
    .from('search_subscriptions')
    .select('last_result')
    .is('unsubscribed_at', null)

  const breakdown = { GREEN: 0, YELLOW: 0, RED: 0, GREY: 0 }
  for (const row of resultBreakdown || []) {
    const r = row.last_result as keyof typeof breakdown
    if (r in breakdown) breakdown[r]++
  }

  // Data freshness — most recent ingested_at from both tables
  const { data: positiveFreshness } = await supabaseAdmin
    .from('positive_lmia')
    .select('ingested_at')
    .order('ingested_at', { ascending: false })
    .limit(1)

  const { data: violatorFreshness } = await supabaseAdmin
    .from('violators')
    .select('ingested_at')
    .order('ingested_at', { ascending: false })
    .limit(1)

  const { count: positiveCount } = await supabaseAdmin
    .from('positive_lmia')
    .select('*', { count: 'exact', head: true })

  const { count: violatorsCount } = await supabaseAdmin
    .from('violators')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    subscribers: {
      total: totalSubscribers ?? 0,
      thisMonth: monthSubscribers ?? 0,
      breakdown,
    },
    dataFreshness: {
      positive_lmia: {
        lastIngested: positiveFreshness?.[0]?.ingested_at ?? null,
        count: positiveCount ?? 0,
      },
      violators: {
        lastIngested: violatorFreshness?.[0]?.ingested_at ?? null,
        count: violatorsCount ?? 0,
      },
    },
  })
}
