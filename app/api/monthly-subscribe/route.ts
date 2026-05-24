import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: { email?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = body.email?.toLowerCase().trim()

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Valid email address required' }, { status: 400 })
  }

  // Silently succeed on duplicate — don't reveal whether email exists
  const { data: existing } = await supabaseAdmin
    .from('monthly_subscribers')
    .select('id')
    .eq('email', email)
    .is('unsubscribed_at', null)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ success: true })
  }

  const { error } = await supabaseAdmin.from('monthly_subscribers').insert({ email })

  if (error) {
    console.error('monthly_subscribers insert error:', error)
    return NextResponse.json({ error: 'Failed to save — please try again' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
