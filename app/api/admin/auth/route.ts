import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ ok: false, error: 'Admin not configured' }, { status: 500 })
  }

  if (password === adminPassword) {
    // Return a simple token (base64 of password) — client stores in sessionStorage
    const token = Buffer.from(adminPassword).toString('base64')
    return NextResponse.json({ ok: true, token })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
