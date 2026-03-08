import Link from 'next/link'
import { verifyEmployer } from '@/lib/verify'
import { normalizeEmployerName } from '@/lib/normalize'
import RiskIndicator from '@/components/RiskIndicator'
import ViolationDetail from '@/components/ViolationDetail'
import MatchedData from '@/components/MatchedData'
import NextSteps from '@/components/NextSteps'
import EmailCapture from '@/components/EmailCapture'
import ShareComponent from '@/components/ShareComponent'
import Footer from '@/components/Footer'
import SearchForm from '@/components/SearchForm'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: {
    employer?: string
    city?: string
    province?: string
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const employer = searchParams.employer || ''
  return {
    title: employer
      ? `${employer} — LMIA Check`
      : 'Results — LMIA Check',
  }
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const employer = (searchParams.employer || '').trim()
  const city = searchParams.city || undefined
  const province = searchParams.province || undefined

  if (!employer) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-white border-b-[3px] border-red-600">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          </div>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <p className="text-gray-600">Please enter an employer name to search.</p>
          <Link href="/" className="mt-4 inline-block text-blue-700 underline">← Back to search</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const result = await verifyEmployer(employer, city, province)
  const employerNormalized = normalizeEmployerName(employer)

  const riskBorderColor = {
    GREEN: 'border-l-green-600',
    YELLOW: 'border-l-yellow-500',
    RED: 'border-l-red-600',
    GREY: 'border-l-gray-400',
  }[result.risk]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">About</Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Search summary */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Search again
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">
            Results for: <strong className="text-gray-900">{employer}</strong>
            {city && <>, {city}</>}
            {province && <>, {province}</>}
          </span>
        </div>

        {/* Risk Indicator — most prominent */}
        <RiskIndicator result={result} />

        {/* Violation details (if from violators list) */}
        {result.violatorMatches.length > 0 && (
          <ViolationDetail violators={result.violatorMatches} />
        )}

        {/* Matched government data (if from positive LMIA list) */}
        {result.positiveMatches.length > 0 && (
          <MatchedData matches={result.positiveMatches} />
        )}

        {/* Next steps */}
        <NextSteps result={result} />

        {/* Email notification capture */}
        <EmailCapture
          employerQuery={employer}
          employerNormalized={employerNormalized}
          lastResult={result.risk}
        />

        {/* Share */}
        <ShareComponent riskResult={result.risk} />

        {/* Search again — bottom CTA */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Search another employer</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <SearchForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
