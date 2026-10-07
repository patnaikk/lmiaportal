/**
 * Decides whether a fuzzy search hit is strong enough to issue a verdict on.
 *
 * verifyEmployer() finds candidates three loose ways: trigram similarity,
 * ILIKE %query%, and retrying with trailing words dropped. On their own these
 * produced confident verdicts for unrelated companies:
 *   "Ideal Ventures"              → GREEN via "MAL Ventures Inc."   (trigram)
 *   "CANADA"                      → RED   via "10353264 Canada"     (ILIKE)
 *   "Service Canada Center #5093" → GREEN via "EXL Service Canada"  (word-dropping)
 *
 * A hit is strong when the names agree on their distinctive words, in either
 * direction: everything distinctive the user typed is in the record ("amazon"
 * → "Amazon Canada Fulfillment"), or everything distinctive in the record is in
 * what the user typed ("Tim Hortons Brampton" → "Tim Hortons"). Generic words —
 * "canada", "services", "ventures", province names — never count, so two names
 * that only share those are not the same employer. An exact normalized match is
 * always strong, so a record whose whole name is generic still matches itself.
 *
 * Two spelling variants are also exact matches: spacing ("6am" ↔ "6 AM",
 * "GK" ↔ "G K") and accented letters lost before the query reached us — logs
 * show "panash caf" for "Panash Café" and "r sidence" for "Résidence". The
 * latter is checked against the record's original name with its non-ASCII
 * letters deleted, not by tolerating any missing letter, which would equate
 * "AB Construction" with "ABC Construction".
 */

import { normalizeEmployerName } from './normalize'

const GENERIC_TOKENS = new Set([
  // connectives (English + French)
  'the', 'and', 'of', 'for', 'a', 'an', 'at', 'in', 'on', 'by', 'to',
  'de', 'des', 'du', 'la', 'le', 'les', 'et', 'en',
  // country, provinces, territories and their codes
  'canada', 'canadian', 'ontario', 'quebec', 'alberta', 'manitoba',
  'saskatchewan', 'british', 'columbia', 'nova', 'scotia', 'new', 'brunswick',
  'newfoundland', 'labrador', 'prince', 'edward', 'island', 'yukon',
  'northwest', 'territories', 'nunavut',
  // (two-letter province codes are deliberately absent: "AB Construction"
  // must not reduce to "construction" and match "ABC Construction")
  // corporate descriptors that normalizeEmployerName doesn't already strip
  'company', 'corporation', 'enterprise', 'enterprises', 'group', 'groupe',
  'holding', 'holdings', 'international', 'venture', 'ventures', 'partners',
  'associates', 'solution', 'solutions', 'service', 'services', 'management',
  'industries', 'center', 'centre', 'national', 'global',
  // trades and business types: shared by thousands of unrelated employers, so
  // "PCL Construction" vs "PS Construction" must be decided on "pcl" vs "ps"
  'restaurant', 'restaurants', 'cafe', 'farm', 'farms', 'ferme', 'store', 'stores',
  'construction', 'constructions', 'contracting', 'contractors', 'builders',
  'trucking', 'transport', 'transportation', 'logistics', 'freight',
  'welding', 'fabrication', 'fabricating', 'manufacturing', 'products',
  'technologies', 'technology', 'consulting', 'staffing', 'cleaning',
  'foods', 'food', 'auto', 'roofing', 'painting', 'landscaping', 'homes',
])

function distinctiveTokens(normalized: string): string[] {
  return normalized.split(' ').filter((t) => t && !GENERIC_TOKENS.has(t))
}

/** Single-edit distance check, for typos like "hortans" ↔ "hortons". */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

/** Does `token` appear in a name, allowing plurals, typos and run-together words? */
function tokenInName(token: string, nameTokens: string[], nameCompact: string): boolean {
  for (const t of nameTokens) {
    if (t === token) return true
    const shorter = Math.min(t.length, token.length)
    if (shorter >= 4 && (t.startsWith(token) || token.startsWith(t))) return true
    if (shorter >= 5 && withinOneEdit(t, token)) return true
  }
  // "mcdonalds" ↔ "mc donalds", "hortons" ↔ "timhortons"
  return token.length >= 4 && nameCompact.includes(token)
}

function allIn(tokens: string[], name: string): boolean {
  const nameTokens = name.split(' ').filter(Boolean)
  const compact = nameTokens.join('')
  return tokens.every((t) => tokenInName(t, nameTokens, compact))
}

const compact = (s: string) => s.replace(/ /g, '')

/**
 * True if `candidate` (a normalized record name) is a strong match for
 * `query` (the normalized search). Both must come from normalizeEmployerName;
 * `candidateRaw` is the record's original, un-normalized name.
 */
export function isStrongNameMatch(
  query: string,
  candidate: string | null | undefined,
  candidateRaw?: string | null
): boolean {
  if (!query || !candidate) return false
  if (query === candidate || compact(query) === compact(candidate)) return true
  if (candidateRaw) {
    const accentsLost = normalizeEmployerName(candidateRaw.replace(/[^\x00-\x7F]/g, ''))
    if (accentsLost && compact(accentsLost) === compact(query)) return true
  }

  const q = distinctiveTokens(query)
  const c = distinctiveTokens(candidate)

  // Containment needs a few distinctive letters to stand on: "S Construction"
  // reduces to just "s", which appears in countless other names.
  const enough = (tokens: string[]) => tokens.join('').length >= 3
  if (enough(q) && allIn(q, candidate)) return true
  if (enough(c) && allIn(c, query)) return true
  return false
}
