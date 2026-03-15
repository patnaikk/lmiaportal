import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  let body: {
    queried_name?: string
    submitted_name?: string
    province?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { queried_name, submitted_name, province } = body

  if (!queried_name || queried_name.trim().length < 2) {
    return NextResponse.json({ error: 'queried_name required' }, { status: 400 })
  }
  if (!submitted_name || submitted_name.trim().length < 2) {
    return NextResponse.json({ error: 'submitted_name required' }, { status: 400 })
  }

  const qName = queried_name.trim()
  const sName = submitted_name.trim()

  // Don't accept identical names
  if (qName.toLowerCase() === sName.toLowerCase()) {
    return NextResponse.json({ error: 'Names must be different' }, { status: 400 })
  }

  // Try upsert: if pair exists, increment count; otherwise insert
  const { error } = await supabaseAdmin.rpc('upsert_trade_mapping', {
    p_queried:  qName,
    p_submitted: sName,
    p_province: province || null,
  })

  if (error) {
    // Fallback: plain insert (if RPC not yet created)
    const { error: insertError } = await supabaseAdmin
      .from('trade_name_mappings')
      .insert({
        queried_name: qName,
        submitted_name: sName,
        province: province || null,
        confirmed: false,
        confirmation_count: 1,
        source: 'crowdsourced',
      })
      .select()

    if (insertError && !insertError.message.includes('duplicate')) {
      console.error('Mapping insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
