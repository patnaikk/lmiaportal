const LEGAL_SUFFIXES = new Set([
  'inc',
  'ltd',
  'corp',
  'co',
  'llc',
  'limited',
  'incorporated',
  'ltee',
  'lte',
  'plc',
  'gmbh',
  'sa',
  'srl',
])

/**
 * Normalises an employer name for fuzzy matching.
 * 1. Lowercase
 * 2. Remove punctuation
 * 3. Strip common legal suffixes
 * 4. Trim and collapse whitespace
 */
export function normalizeEmployerName(name: string): string {
  if (!name) return ''
  let n = name.toLowerCase()
  // Remove punctuation (keep alphanumeric and spaces)
  n = n.replace(/[^\w\s]/g, ' ')
  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim()
  // Strip legal suffixes (only as standalone words)
  const words = n.split(' ').filter((w) => !LEGAL_SUFFIXES.has(w))
  return words.join(' ').trim()
}
