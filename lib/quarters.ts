/** "2026-Q1" → "Jan–Mar 2026". Returns the input unchanged if it isn't a quarter. */
export function formatQuarter(q?: string | null): string {
  if (!q) return ''
  const map: Record<string, string> = {
    Q1: 'Jan–Mar',
    Q2: 'Apr–Jun',
    Q3: 'Jul–Sep',
    Q4: 'Oct–Dec',
  }
  const m = q.match(/^(\d{4})-?(Q\d)$/i)
  if (!m) return q
  const [, year, quarter] = m
  return `${map[quarter.toUpperCase()] ?? quarter} ${year}`
}

/** "2026-Q1" → "March 2026": the last month a quarter's data covers. */
export function quarterEndMonth(q?: string | null): string {
  const m = q?.match(/^(\d{4})-?Q([1-4])$/i)
  if (!m) return q ?? ''
  const months = ['March', 'June', 'September', 'December']
  return `${months[Number(m[2]) - 1]} ${m[1]}`
}
