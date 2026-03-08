import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_TYPES = ['missing_employer', 'suggestion']

export async function POST(request: NextRequest) {
  let body: {
    feedback_type?: string
    message?: string
    employer_query?: string
    email?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { feedback_type, message, employer_query, email } = body

  if (!feedback_type || !VALID_TYPES.includes(feedback_type)) {
    return NextResponse.json({ error: 'Valid feedback type required' }, { status: 400 })
  }

  if (!message || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
  }

  if (email && !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Rate limit: max 3 feedback submissions per IP per hour
  const ip =
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (ip !== 'unknown') {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Too many submissions — please try again later' }, { status: 429 })
    }
  }

  const { error } = await supabaseAdmin.from('feedback').insert({
    feedback_type,
    message: message.trim(),
    employer_query: employer_query || null,
    email: email ? email.toLowerCase().trim() : null,
  })

  if (error) {
    console.error('Feedback insert error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
