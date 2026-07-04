import Link from 'next/link'
import { toSlug } from '@/lib/slug'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ResultsContent from './ResultsContent'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: {
    employer?: string
    city?: string
    province?: string
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const employer = (searchParams.employer || '').trim()
  if (!employer) return { title: 'Results — LMIA Check' }
  const slug = toSlug(employer)
  const canonicalUrl = `https://lmiacheck.ca/employer/${slug}`
  return {
    title: `${employer} — LMIA Check`,
    description: `Check whether ${employer} is approved or banned under Canada's Temporary Foreign Worker Program. Verified against official ESDC records.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${employer} — LMIA Status`,
      description: `Is ${employer} a legitimate LMIA employer? See their official ESDC status on lmiacheck.ca.`,
      url: canonicalUrl,
    },
  }
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const employer = (searchParams.employer || '').trim()
  const city = searchParams.city || undefined
  const province = searchParams.province || undefined

  if (!employer) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
          <div className="card-elevated p-8 sm:p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">No employer to check</h1>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Enter an employer name on the search page to verify them against the official Canadian government LMIA records.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Go to search
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return <ResultsContent employer={employer} city={city} province={province} />
}
