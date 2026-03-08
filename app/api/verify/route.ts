import { NextRequest, NextResponse } from 'next/server'
import { verifyEmployer } from '@/lib/verify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const employer = searchParams.get('employer') || ''
  const city = searchParams.get('city') || undefined
  const province = searchParams.get('province') || undefined

  if (!employer || employer.trim().length < 2) {
    return NextResponse.json({ error: 'Employer name is required (min 2 characters)' }, { status: 400 })
  }

  try {
    const result = await verifyEmployer(employer.trim(), city, province)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
