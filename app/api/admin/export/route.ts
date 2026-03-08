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
    .from('search_subscriptions')
    .select('email, employer_query, last_result, subscribed_at')
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }

  // Build CSV
  const headers = ['email', 'employer_query', 'last_result', 'subscribed_at']
  const rows = (data || []).map((row) => [
    `"${(row.email || '').replace(/"/g, '""')}"`,
    `"${(row.employer_query || '').replace(/"/g, '""')}"`,
    row.last_result || '',
    row.subscribed_at || '',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="lmia-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
