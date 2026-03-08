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

  const { data, error } = await supabaseAdmin
    .from('search_logs')
    .select('employer_query, risk_result, searched_at')
    .order('searched_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 })
  }

  return NextResponse.json({ searches: data })
}
