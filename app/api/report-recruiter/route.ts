// Run this SQL in Supabase before using this route:
//
// CREATE TABLE IF NOT EXISTS recruiter_reports (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   recruiter_name text NOT NULL,
//   phone text,
//   email text,
//   social_handle text,
//   province text,
//   description text NOT NULL,
//   status text NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE recruiter_reports ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow public insert on recruiter_reports"
//   ON recruiter_reports FOR INSERT TO anon WITH CHECK (true);
// CREATE POLICY "Allow public read of approved recruiter_reports"
//   ON recruiter_reports FOR SELECT TO anon USING (status = 'approved');

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PROVINCES = [
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT',
]

export async function POST(request: NextRequest) {
  let body: {
    recruiter_name?: string
    phone?: string
    email?: string
    social_handle?: string
    province?: string
    description?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { recruiter_name, phone, email, social_handle, province, description } = body

  if (!recruiter_name || recruiter_name.trim().length < 2) {
    return NextResponse.json({ error: 'Recruiter name is required' }, { status: 400 })
  }

  if (!description || description.trim().length < 20) {
    return NextResponse.json({ error: 'Description must be at least 20 characters' }, { status: 400 })
  }

  if (province && !PROVINCES.includes(province)) {
    return NextResponse.json({ error: 'Invalid province code' }, { status: 400 })
  }

  // Rate limit: max 3 reports per IP per hour
  const ip =
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (ip !== 'unknown') {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('recruiter_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Too many submissions — try again later' }, { status: 429 })
    }
  }

  const { error } = await supabaseAdmin.from('recruiter_reports').insert({
    recruiter_name: recruiter_name.trim(),
    phone: phone?.trim() || null,
    email: email?.trim().toLowerCase() || null,
    social_handle: social_handle?.trim() || null,
    province: province || null,
    description: description.trim(),
    status: 'pending',
  })

  if (error) {
    console.error('Recruiter report insert error:', error)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('recruiter_reports')
    .select('id, recruiter_name, phone, social_handle, province, description, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }

  return NextResponse.json({ reports: data })
}
