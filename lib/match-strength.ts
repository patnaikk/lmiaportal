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
 * direction: everything distinctive the user typed is in the record ("Tim
 * Hortons" → "Tim Hortons Drive-Thru"), or everything distinctive in the record
 * is in what the user typed ("Tim Hortons Brampton" → "Tim Hortons"). The
 * contained side needs two or more distinctive words; see isStrongNameMatch. Generic words —
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

const CONNECTIVES = new Set([
  'the', 'and', 'of', 'for', 'a', 'an', 'at', 'in', 'on', 'by', 'to',
  'de', 'des', 'du', 'la', 'le', 'les', 'et', 'en',
])

function distinctiveTokens(normalized: string): string[] {
  return normalized.split(' ').filter((t) => t && !GENERIC_TOKENS.has(t))
}

/** Every word except connectives — generic words included. */
function contentTokens(normalized: string): string[] {
  return normalized.split(' ').filter((t) => t && !CONNECTIVES.has(t))
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

/** "berries" → "berry", "farms" → "farm"; leaves short words and "-ss" alone. */
function singular(w: string): string {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y'
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

/**
 * Index of the name word that `token` matches, allowing plurals and typos;
 * -1 for a match only within run-together words; null for no match. Words
 * already in `used` are skipped, so two different words can't both pair with
 * one word ("meaty meats" must not fit inside "winkler meats").
 */
function tokenInName(
  token: string,
  nameTokens: string[],
  nameCompact: string,
  used: Set<number>
): number | null {
  // Exact pairings first (singular/plural count as exact), so a fuzzy pairing
  // can't take a word an exact one needs.
  for (let i = 0; i < nameTokens.length; i++) {
    if (!used.has(i) && singular(nameTokens[i]) === singular(token)) return i
  }
  for (let i = 0; i < nameTokens.length; i++) {
    if (used.has(i)) continue
    const t = nameTokens[i]
    const shorter = Math.min(t.length, token.length)
    // Plural-sized endings only: "farm" ↔ "farms", not "health" ↔ "healthcare".
    const suffixOnly = Math.abs(t.length - token.length) <= 2
    if (shorter >= 4 && suffixOnly && (t.startsWith(token) || token.startsWith(t))) return i
    if (shorter >= 5 && withinOneEdit(t, token)) return i
  }
  // Run-together words: "mcdonalds" ↔ "mc donalds", "hortons" ↔ "timhortons".
  // Only where the hit crosses a word boundary or sits in a word not yet
  // paired — otherwise "meats" would pair with "meats" a second time.
  if (token.length < 4) return null
  for (let at = nameCompact.indexOf(token); at !== -1; at = nameCompact.indexOf(token, at + 1)) {
    const covered: number[] = []
    let offset = 0
    nameTokens.forEach((t, i) => {
      if (offset < at + token.length && offset + t.length > at) covered.push(i)
      offset += t.length
    })
    if (covered.length > 1 || (covered.length === 1 && !used.has(covered[0]))) return -1
  }
  return null
}

function allIn(tokens: string[], name: string): boolean {
  const nameTokens = name.split(' ').filter(Boolean)
  const compact = nameTokens.join('')
  const used = new Set<number>()
  return tokens.every((t) => {
    const i = tokenInName(t, nameTokens, compact, used)
    if (i === null) return false
    if (i >= 0) used.add(i)
    return true
  })
}

/** Same word, allowing only a plural ending — no typo tolerance. */
function appearsExactly(token: string, name: string): boolean {
  return name.split(' ').some((t) => singular(t) === singular(token))
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

  // Containment — one name sitting inside the other — needs the contained
  // side to carry at least two distinctive words. One word is too common to
  // identify an employer: "Ferguson Transport" reduces to "ferguson" and would
  // otherwise match "Ferguson Farms"; "Dream Logistics" reduces to "dream" and
  // would match a search for "Dream visa". Single-word names still match
  // exactly (above); anything looser is reported as a possible match.
  // The letter minimum stops initials-only names ("S S") from qualifying.
  // A company number of 6+ digits identifies an employer on its own ("773353
  // Alberta Ltd"), but only alongside other words: a bare "7666296" is far more
  // likely an LMIA number that coincides with some numbered company.
  const words = (name: string) => name.split(' ').length
  const enough = (tokens: string[]) =>
    (tokens.length >= 2 && tokens.join('').length >= 3) ||
    (tokens.length === 1 && /^\d{6,}$/.test(tokens[0]) && words(query) >= 2 && words(candidate) >= 2)
  if (enough(q) && allIn(q, candidate)) return true
  if (enough(c) && allIn(c, query)) return true

  // One distinctive word is enough when every other word of that name also
  // appears in the other one: "Odyssey Auto Services" ⊂ "Odyssey Auto Service
  // Ltd", "Canadian Tire" ⊂ "Canadian Tire Store #041". "Ferguson Transport"
  // still fails against "Ferguson Farms" — "transport" isn't there. The
  // distinctive word must match exactly (plural aside), never by typo.
  const wholeNameInside = (inner: string, distinct: string[], outer: string) => {
    const content = contentTokens(inner)
    return (
      distinct.length === 1 &&
      distinct[0].length >= 3 &&
      content.length >= 2 &&
      appearsExactly(distinct[0], outer) &&
      allIn(content, outer)
    )
  }
  if (wholeNameInside(query, q, candidate)) return true
  if (wholeNameInside(candidate, c, query)) return true
  return false
}

/**
 * True if two normalized names are word-for-word the same except for a
 * one-letter slip inside one long word ("randhawa farms" ↔ "randhava farms").
 * Used to surface a banned employer one typo away from the search, even when
 * the search also matches an approved employer exactly: the two may be the
 * same business recorded with different spellings. A different initial is a
 * different company ("ps construction" ↔ "bs construction"), so the differing
 * word must be at least five letters long.
 */
export function isNearIdenticalName(query: string, candidate: string | null | undefined): boolean {
  if (!query || !candidate) return false
  const a = query.split(' ').filter(Boolean)
  const b = candidate.split(' ').filter(Boolean)
  if (a.length !== b.length) return false
  const diffs = a.map((t, i) => [t, b[i]] as const).filter(([x, y]) => x !== y)
  if (diffs.length !== 1) return false
  const [x, y] = diffs[0]
  return Math.min(x.length, y.length) >= 5 && withinOneEdit(x, y)
}
