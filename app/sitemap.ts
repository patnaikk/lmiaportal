import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { toSlug } from '@/lib/slug'

const BASE = 'https://lmiacheck.ca'

export const revalidate = 86400 // rebuild once per day

const staticRoutes = [
  { path: '/', priority: 1.0, changeFreq: 'weekly' },
  { path: '/check', priority: 0.9, changeFreq: 'weekly' },
  { path: '/results', priority: 0.8, changeFreq: 'daily' },
  { path: '/faq', priority: 0.8, changeFreq: 'monthly' },
  { path: '/bulk', priority: 0.7, changeFreq: 'monthly' },
  { path: '/banned', priority: 0.8, changeFreq: 'weekly' },
  { path: '/reports', priority: 0.7, changeFreq: 'monthly' },
  { path: '/updates', priority: 0.7, changeFreq: 'weekly' },
  { path: '/guide', priority: 0.6, changeFreq: 'monthly' },
  { path: '/reference', priority: 0.6, changeFreq: 'monthly' },
  { path: '/help', priority: 0.6, changeFreq: 'monthly' },
  { path: '/questions', priority: 0.8, changeFreq: 'monthly' },
  { path: '/spot-lmia-fraud', priority: 0.7, changeFreq: 'monthly' },
  { path: '/verify-lmia', priority: 0.7, changeFreq: 'monthly' },
  { path: '/recruiter-blacklist', priority: 0.7, changeFreq: 'weekly' },
  { path: '/owp-vw', priority: 0.6, changeFreq: 'monthly' },
]

async function getEmployerSlugs(): Promise<{ slug: string; lastMod: Date }[]> {
  try {
    // Banned employers — highest value canonical pages
    const { data: violators } = await supabase
      .from('violators')
      .select('employer_name, ingested_at')
      .not('employer_name', 'is', null)
      .order('ingested_at', { ascending: false })
      .limit(2000)

    // Approved LMIA employers
    const { data: positive } = await supabase
      .from('positive_lmia')
      .select('employer_name, ingested_at')
      .not('employer_name', 'is', null)
      .order('ingested_at', { ascending: false })
      .limit(3000)

    const seen = new Set<string>()
    const results: { slug: string; lastMod: Date }[] = []

    for (const row of [...(violators ?? []), ...(positive ?? [])]) {
      if (!row.employer_name) continue
      const slug = toSlug(row.employer_name)
      if (!slug || seen.has(slug)) continue
      seen.add(slug)
      results.push({ slug, lastMod: new Date(row.ingested_at ?? Date.now()) })
    }

    return results
  } catch {
    return []
  }
}

async function getReportMonths(): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('violators')
      .select('decision_date')
      .not('decision_date', 'is', null)
      .order('decision_date', { ascending: false })
      .limit(5000)

    if (!data) return []

    const months = new Set<string>()
    for (const row of data) {
      if (row.decision_date) {
        months.add(row.decision_date.slice(0, 7)) // YYYY-MM
      }
    }
    return Array.from(months).slice(0, 36) // max 3 years back
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [employerSlugs, reportMonths] = await Promise.all([
    getEmployerSlugs(),
    getReportMonths(),
  ])

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority, changeFreq }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: changeFreq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }))

  const employerEntries: MetadataRoute.Sitemap = employerSlugs.map(({ slug, lastMod }) => ({
    url: `${BASE}/employer/${slug}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const reportEntries: MetadataRoute.Sitemap = reportMonths.map((month) => ({
    url: `${BASE}/reports/${month}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }))

  return [...staticEntries, ...employerEntries, ...reportEntries]
}
