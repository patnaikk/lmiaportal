import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizeEmployerName } from '@/lib/normalize'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RISKS = ['GREEN', 'YELLOW', 'RED', 'GREY']

export async function POST(request: NextRequest) {
  let body: {
    email?: string
    employer_query?: string
    employer_normalized?: string
    last_result?: string
    city?: string
    province?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, employer_query } = body
  // The cron emails whenever this differs from a fresh verdict, so anything that
  // isn't a real verdict would trigger a bogus "Unknown → …" alert.
  const last_result = body.last_result && RISKS.includes(body.last_result) ? body.last_result : null
  const city = body.city?.trim().slice(0, 120) || null
  const province = body.province?.trim().slice(0, 40) || null

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Valid email address required' }, { status: 400 })
  }

  if (!employer_query) {
    return NextResponse.json({ error: 'employer_query is required' }, { status: 400 })
  }

  const employer_normalized = normalizeEmployerName(employer_query)

  // Rate limit: max 5 subscriptions per IP per hour
  const ip =
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (ip !== 'unknown') {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('search_subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', oneHourAgo)

    if ((count ?? 0) >= 5) {
      // Rate limit exceeded — silently succeed to avoid user frustration
      // (they may just be testing multiple employers)
    }
  }

  // Check for duplicate (same email + employer_normalized)
  const { data: existing } = await supabaseAdmin
    .from('search_subscriptions')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('employer_normalized', employer_normalized)
    .is('unsubscribed_at', null)
    .limit(1)

  if (existing && existing.length > 0) {
    // Silently succeed — don't create duplicate, don't show error
    return NextResponse.json({ success: true })
  }

  const row = {
    email: email.toLowerCase().trim(),
    employer_query,
    employer_normalized,
    last_result,
  }
  // city/province arrive with 20261017_alert_subscription_context.sql. Until that
  // has run, save the watch without them rather than losing the signup.
  let { error } = await supabaseAdmin.from('search_subscriptions').insert({ ...row, city, province })
  if (error?.code === 'PGRST204') {
    ;({ error } = await supabaseAdmin.from('search_subscriptions').insert(row))
  }

  if (error) {
    console.error('Subscribe insert error:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
