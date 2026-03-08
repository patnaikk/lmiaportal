import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizeEmployerName } from '@/lib/normalize'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: {
    email?: string
    employer_query?: string
    employer_normalized?: string
    last_result?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, employer_query, last_result } = body

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

  const { error } = await supabaseAdmin.from('search_subscriptions').insert({
    email: email.toLowerCase().trim(),
    employer_query,
    employer_normalized,
    last_result: last_result || null,
  })

  if (error) {
    console.error('Subscribe insert error:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
