/**
 * Format a date as human-friendly relative time, the way iOS Mail or Messages does:
 *   - today / yesterday
 *   - N days ago (up to 6)
 *   - N weeks ago (up to ~5 weeks)
 *   - "Mar 12" (this year)
 *   - "Mar 12, 2024" (older)
 */
export function formatTimeAgo(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return 'Date unknown'
  let d: Date
  try {
    d = new Date(iso)
    if (isNaN(d.getTime())) return 'Date unknown'
  } catch {
    return 'Date unknown'
  }

  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (sec < 60) return 'just now'
  if (sec < 60 * 60) {
    const m = Math.floor(sec / 60)
    return `${m} minute${m === 1 ? '' : 's'} ago`
  }
  if (sec < 60 * 60 * 24) {
    const h = Math.floor(sec / 3600)
    return `${h} hour${h === 1 ? '' : 's'} ago`
  }

  // Days
  const days = Math.floor(sec / (60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`

  // Weeks (up to ~5)
  if (days < 35) {
    const w = Math.floor(days / 7)
    return `${w} week${w === 1 ? '' : 's'} ago`
  }

  // Same year — show "Mar 12"
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
  }

  // Older — full date
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}
