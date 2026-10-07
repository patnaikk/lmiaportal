import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Stateless unsubscribe tokens — HMAC(email, secret).
 * No extra DB column needed; the token can only be produced by us, so a
 * recipient can one-click unsubscribe but nobody can unsubscribe others by guessing.
 */
function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_PASSWORD || 'dev-only-insecure-secret'
}

export function makeUnsubscribeToken(email: string): string {
  return createHmac('sha256', secret()).update(email.toLowerCase().trim()).digest('hex').slice(0, 32)
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = makeUnsubscribeToken(email)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export function unsubscribeUrl(baseUrl: string, email: string): string {
  const e = encodeURIComponent(email.toLowerCase().trim())
  const t = makeUnsubscribeToken(email)
  return `${baseUrl}/unsubscribe?e=${e}&t=${t}`
}

// Per-subscription tokens for employer status-change alerts (search_subscriptions.id).
// Signed over a distinct namespace so these links can't be confused with the email-based ones above.
export function makeAlertUnsubscribeToken(id: number): string {
  return createHmac('sha256', secret()).update(`alert:${id}`).digest('hex').slice(0, 32)
}

export function verifyAlertUnsubscribeToken(id: number, token: string): boolean {
  const expected = makeAlertUnsubscribeToken(id)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export function alertUnsubscribeUrl(baseUrl: string, id: number): string {
  const t = makeAlertUnsubscribeToken(id)
  return `${baseUrl}/unsubscribe?k=alert&id=${id}&t=${t}`
}

// Every employer alert for one email address. A digest can cover dozens of employers,
// so its List-Unsubscribe must stop all of them, not just the first.
export function makeAllAlertsUnsubscribeToken(email: string): string {
  return createHmac('sha256', secret()).update(`alerts-all:${email.toLowerCase().trim()}`).digest('hex').slice(0, 32)
}

export function verifyAllAlertsUnsubscribeToken(email: string, token: string): boolean {
  const expected = makeAllAlertsUnsubscribeToken(email)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export function allAlertsUnsubscribeUrl(baseUrl: string, email: string): string {
  const e = encodeURIComponent(email.toLowerCase().trim())
  const t = makeAllAlertsUnsubscribeToken(email)
  return `${baseUrl}/unsubscribe?k=alerts&e=${e}&t=${t}`
}
