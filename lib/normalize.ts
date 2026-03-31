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
  // Strip possessive 's (Tim Horton's → Tim Horton, McDonald's → McDonald).
  // Must run before punctuation removal, otherwise the apostrophe becomes a space
  // and 's becomes a phantom standalone word that breaks trigram matching.
  n = n.replace(/[\u2019']s\b/g, '')
  // Strip diacritics (é→e, à→a, â→a, etc.) so French names match regardless of accent input.
  // Must run before punctuation removal so accented chars don't become spaces.
  n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // Remove punctuation (keep alphanumeric and spaces)
  n = n.replace(/[^\w\s]/g, ' ')
  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim()
  // Strip legal suffixes (only as standalone words)
  const words = n.split(' ').filter((w) => !LEGAL_SUFFIXES.has(w))
  return words.join(' ').trim()
}
