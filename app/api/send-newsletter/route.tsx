import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { unsubscribeUrl } from '@/lib/unsubscribe'
import MonthlyReport from '@/emails/MonthlyReport'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lmiacheck.ca'
const FROM = process.env.NEWSLETTER_FROM || process.env.SYNC_EMAIL_FROM || 'LMIA Check <reports@lmiacheck.ca>'
const SUBJECT = 'May 2026: 18 Canadian employers banned for breaking foreign-worker rules'

/**
 * Send the monthly newsletter. Protected by ADMIN_PASSWORD.
 * Body:
 *   { password, dryRun?: true }                       -> renders + counts recipients, sends nothing
 *   { password, testEmail: "x@y.com" }                -> sends ONLY to that address
 *   { password, confirmRealSend: "SEND-TO-ALL" }      -> sends to all active subscribers
 *
 * SAFETY: the broadcast-to-all path is BLOCKED unless confirmRealSend === "SEND-TO-ALL".
 * This prevents an accidental send to real subscribers during testing.
 *
 * NOTE: report data is currently the May defaults baked into the template.
 * Computing it live from Supabase each month is a future enhancement.
 */
export async function POST(request: NextRequest) {
  let body: { password?: string; dryRun?: boolean; testEmail?: string; confirmRealSend?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resolve recipient list
  let recipients: string[]
  if (body.testEmail) {
    recipients = [body.testEmail.toLowerCase().trim()]
  } else {
    // SAFETY GUARD: broadcasting to real subscribers requires explicit confirmation.
    // A dry-run is allowed (sends nothing); an actual broadcast is not, unless confirmed.
    if (!body.dryRun && body.confirmRealSend !== 'SEND-TO-ALL') {
      return NextResponse.json(
        {
          error: 'Broadcast blocked. To send to ALL subscribers, include "confirmRealSend":"SEND-TO-ALL". For testing, use "testEmail" or "dryRun".',
        },
        { status: 403 }
      )
    }
    const { data, error } = await supabaseAdmin
      .from('monthly_subscribers')
      .select('email')
      .is('unsubscribed_at', null)
    if (error) {
      return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 })
    }
    recipients = (data ?? []).map((r) => r.email)
  }

  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No active subscribers' })
  }

  if (body.dryRun) {
    const sampleHtml = await render(
      <MonthlyReport unsubscribeUrl={unsubscribeUrl(SITE_URL, recipients[0])} />
    )
    return NextResponse.json({
      dryRun: true,
      recipientCount: recipients.length,
      recipients,
      subject: SUBJECT,
      from: FROM,
      htmlBytes: sampleHtml.length,
    })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set — add it to .env.local before a real send' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const results = await Promise.allSettled(
    recipients.map(async (email) => {
      const html = await render(<MonthlyReport unsubscribeUrl={unsubscribeUrl(SITE_URL, email)} />)
      return resend.emails.send({
        from: FROM,
        to: email,
        subject: SUBJECT,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl(SITE_URL, email)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - sent

  return NextResponse.json({ sent, failed, total: recipients.length })
}
