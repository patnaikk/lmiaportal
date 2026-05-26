export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function fromSlug(slug: string): string {
  return slug.replace(/-+/g, ' ').trim()
}
