export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function fromSlug(slug: string): string {
  return slug.replace(/-+/g, ' ').trim()
}

// Display-only title casing for de-slugged names (search still uses the raw fromSlug value)
const LOWERCASE_WORDS = new Set(['of', 'and', 'the', 'du', 'de', 'la', 'le'])

export function toDisplayName(slug: string): string {
  return fromSlug(slug)
    .split(' ')
    .map((word, i) =>
      i > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}
