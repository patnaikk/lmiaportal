import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyEmployer } from '@/lib/verify'
import { alertUnsubscribeUrl, allAlertsUnsubscribeUrl } from '@/lib/unsubscribe'
import type { VerifyResult } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lmiacheck.ca'
const FROM = process.env.ALERT_FROM || process.env.NEWSLETTER_FROM || process.env.SYNC_EMAIL_FROM || 'LMIA Check <alerts@lmiacheck.ca>'

// No alert emails before this moment, whatever triggers the route. Before it, a
// live run returns without verifying, emailing or touching last_result, so the
// first November run compares against the baseline set on 2026-10-06 and reports
// whatever genuinely changed since. ?dryRun=1 still works for testing.
const ALERTS_START = Date.parse('2026-11-01T00:00:00-04:00')

// verifyEmployer makes several Supabase round-trips; run a handful at once so
// ~100 subscriptions finish well inside maxDuration.
const VERIFY_CONCURRENCY = 6

const STATUS_LABEL: Record<string, string> = {
  GREEN: 'Has approved LMIAs (Green)',
  YELLOW: 'Caution (Yellow)',
  RED: 'Flagged — Non-Compliant (Red)',
  GREY: 'Not Found (Grey)',
}

// Matching is fuzzy (trigram + substring), so a watch on "Graham" can start matching a
// different "Graham's Pizza". Every message is phrased around "a record matching your
// search" and the email names that record, so the reader can tell whether it is theirs.
const STATUS_MEANING: Record<string, string> = {
  GREEN: 'Your search now matches an employer on the government-approved LMIA list.',
  YELLOW: 'A record matching your search raises a concern — a past violation, a location mismatch, a PR-only stream, or only a loose name match. Verify carefully before proceeding.',
  RED: 'The government’s non-compliant employer list now has a record matching your search. If it is the same employer, they cannot legally hire foreign workers right now — do not pay them any fees.',
  GREY: 'Your search no longer matches any employer on the approved or non-compliant lists, so its status can’t be verified.',
}

type Subscription = {
  id: number
  email: string
  employer_query: string
  last_result: string | null
}

type Change = { sub: Subscription; newStatus: string; matched: string | null }

// The record that produced the verdict, e.g. "Graham Construction Ltd — Calgary, AB".
function describeMatch(result: VerifyResult): string | null {
  const v = result.violatorMatches[0]
  if (result.source === 'violators' && v) {
    const decided = v.decision_date ? ` (decision ${v.decision_date})` : ''
    return `${v.business_operating_name} — ${v.address || v.province}${decided}`
  }
  const p = result.positiveMatches[0]
  if (p) return `${p.employer_name} — ${[p.city, p.province].filter(Boolean).join(', ')}`
  return null
}

// Vercel Cron (see vercel.json) hits this daily. Re-verifies every active subscription
// and emails each subscriber ONE digest listing only the employers whose risk result
// changed since we last told them.
//
// Add ?dryRun=1 to see what would be sent without sending anything or updating rows.
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  if (!dryRun && Date.now() < ALERTS_START) {
    return NextResponse.json({ ok: true, skipped: 'alerts start 2026-11-01' })
  }

  const { data: subscriptions, error } = await supabaseAdmin
    .from('search_subscriptions')
    .select('id, email, employer_query, last_result')
    .is('unsubscribed_at', null)
    .order('id')

  if (error) {
    console.error('cron/notify: DB fetch error', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!dryRun && !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })
  }

  // 1. Re-verify everything, a few at a time.
  const subs = (subscriptions ?? []) as Subscription[]
  const changes: Change[] = []
  let failed = 0
  for (let i = 0; i < subs.length; i += VERIFY_CONCURRENCY) {
    const batch = subs.slice(i, i + VERIFY_CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map((sub) => verifyEmployer(sub.employer_query, undefined, undefined, 'cron'))
    )
    results.forEach((r, j) => {
      const sub = batch[j]
      if (r.status === 'rejected') {
        failed++
        console.error(`cron/notify: verify failed for subscription ${sub.id}`, r.reason)
      } else if (r.value.risk !== sub.last_result) {
        changes.push({ sub, newStatus: r.value.risk, matched: describeMatch(r.value) })
      }
    })
  }

  // 2. One email per recipient.
  const byEmail = new Map<string, Change[]>()
  for (const c of changes) {
    const list = byEmail.get(c.sub.email) ?? []
    list.push(c)
    byEmail.set(c.sub.email, list)
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      checked: subs.length,
      failed,
      recipients: byEmail.size,
      changes: changes.map((c) => ({
        id: c.sub.id,
        employer: c.sub.employer_query,
        from: c.sub.last_result,
        to: c.newStatus,
        matched: c.matched,
      })),
    })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let emailed = 0
  for (const [email, list] of Array.from(byEmail)) {
    try {
      // The header stops ALL of this person's alerts — Gmail's one-click button must not
      // silently leave 66 of 67 watches running. Each row has its own per-employer link.
      const unsubUrl = allAlertsUnsubscribeUrl(SITE_URL, email)
      const subject =
        list.length === 1
          ? `Status change: ${list[0].sub.employer_query}`
          : `Status changes for ${list.length} employers you're watching`

      const { error: sendError } = await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html: buildEmail(list, unsubUrl),
        headers: {
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      if (sendError) throw sendError

      // Only advance last_result once the subscriber has actually been told,
      // so a failed send is retried on the next run.
      for (const c of list) {
        await supabaseAdmin
          .from('search_subscriptions')
          .update({ last_result: c.newStatus })
          .eq('id', c.sub.id)
      }
      emailed++
    } catch (err) {
      console.error(`cron/notify: send failed for ${list.length} change(s)`, err)
    }
  }

  return NextResponse.json({ ok: true, checked: subs.length, failed, changed: changes.length, emailed })
}

const COLOR: Record<string, string> = { GREEN: '#16a34a', YELLOW: '#d97706', RED: '#dc2626', GREY: '#6b7280' }
const BG: Record<string, string> = { GREEN: '#f0fdf4', YELLOW: '#fffbeb', RED: '#fef2f2', GREY: '#f9fafb' }

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildChangeBlock({ sub, newStatus, matched }: Change): string {
  const name = escapeHtml(sub.employer_query)
  const oldLabel = STATUS_LABEL[sub.last_result ?? ''] ?? sub.last_result ?? 'Unknown'
  const newLabel = STATUS_LABEL[newStatus] ?? newStatus
  const statusColor = COLOR[newStatus] ?? '#6b7280'
  const statusBg = BG[newStatus] ?? '#f9fafb'
  const resultsUrl = `${SITE_URL}/results?employer=${encodeURIComponent(sub.employer_query)}`
  const unsubUrl = alertUnsubscribeUrl(SITE_URL, sub.id)

  return `
          <p style="margin:0 0 4px;color:#6b7280;font-size:13px">You are watching</p>
          <p style="margin:0 0 ${matched ? 4 : 16}px;font-size:18px;font-weight:700;color:#111827">${name}</p>
          ${matched ? `<p style="margin:0 0 16px;font-size:13px;color:#4b5563">Now matches: <strong>${escapeHtml(matched)}</strong></p>` : ''}

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
            <tr>
              <td style="background:#f9fafb;border-radius:6px;padding:12px 16px;width:48%">
                <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase">Previous status</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#6b7280">${oldLabel}</p>
              </td>
              <td style="width:4%;text-align:center;color:#9ca3af;font-size:18px">→</td>
              <td style="background:${statusBg};border:1px solid ${statusColor}33;border-radius:6px;padding:12px 16px;width:48%">
                <p style="margin:0 0 4px;font-size:11px;color:${statusColor};text-transform:uppercase;font-weight:600">New status</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:${statusColor}">${newLabel}</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">${STATUS_MEANING[newStatus] ?? ''}${matched ? ' Check the name and address match the employer you’re dealing with.' : ''}</p>

          <a href="${resultsUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">View Full Report →</a>
          <a href="${unsubUrl}" style="display:inline-block;margin-left:12px;color:#9ca3af;font-size:12px">Stop watching this employer</a>`
}

function buildEmail(list: Change[], unsubAllUrl: string): string {
  const heading = list.length === 1 ? 'Employer Status Change' : `${list.length} Employer Status Changes`
  const blocks = list
    .map((c) => `<tr><td style="padding:28px 32px;border-bottom:1px solid #f3f4f6">${buildChangeBlock(c)}</td></tr>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">

        <tr><td style="background:#1d4ed8;padding:24px 32px">
          <p style="margin:0;color:#bfdbfe;font-size:12px;text-transform:uppercase;letter-spacing:1px">LMIA Check Alert</p>
          <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:700">${heading}</h1>
        </td></tr>

        ${blocks}

        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
            You asked to be told when the status of ${list.length === 1 ? 'this employer' : 'these employers'} changes on
            <a href="${SITE_URL}" style="color:#9ca3af">lmiacheck.ca</a> — a free tool to help foreign workers verify Canadian employer legitimacy.
            Status is re-checked daily against official ESDC records.
            <br>
            <a href="${unsubAllUrl}" style="color:#9ca3af">Unsubscribe from all employer alerts</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
