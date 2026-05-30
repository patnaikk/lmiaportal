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
