import { MetadataRoute } from 'next'

const BASE = 'https://lmiacheck.ca'

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
  { path: '/spot-lmia-fraud', priority: 0.7, changeFreq: 'monthly' },
  { path: '/verify-lmia', priority: 0.7, changeFreq: 'monthly' },
  { path: '/recruiter-blacklist', priority: 0.7, changeFreq: 'weekly' },
  { path: '/owp-vw', priority: 0.6, changeFreq: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return staticRoutes.map(({ path, priority, changeFreq }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: changeFreq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }))
}
