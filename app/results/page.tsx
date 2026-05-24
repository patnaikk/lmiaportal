import Link from 'next/link'
import QRCode from 'qrcode'
import { verifyEmployer } from '@/lib/verify'
import { normalizeEmployerName } from '@/lib/normalize'
import RiskIndicator from '@/components/RiskIndicator'
import ViolationDetail from '@/components/ViolationDetail'
import MatchedData from '@/components/MatchedData'
import NextSteps from '@/components/NextSteps'
import EmailCapture from '@/components/EmailCapture'
import ShareComponent from '@/components/ShareComponent'
import FeedbackForm from '@/components/FeedbackForm'
import MappingContribution from '@/components/MappingContribution'
import Footer from '@/components/Footer'
import SearchForm from '@/components/SearchForm'
import ScrollToTop from '@/components/ScrollToTop'
import Navigation from '@/components/Navigation'
import StickyResultHeader from '@/components/StickyResultHeader'
import ReportTemplate from '@/components/ReportTemplate'
import CICCWidget from '@/components/CICCWidget'
import ServiceCanadaCallCard from '@/components/ServiceCanadaCallCard'
import DataFreshness from '@/components/DataFreshness'
import type { Metadata } from 'next'

const VERDICT_LABEL: Record<'GREEN' | 'YELLOW' | 'RED' | 'GREY', string> = {
  GREEN: 'Verified',
  YELLOW: 'Caution',
  RED: 'Banned',
  GREY: 'Not found',
}

const SITE_URL = 'https://lmiacheck.ca'

async function generateQR(employer: string, city?: string, province?: string): Promise<string> {
  const params = new URLSearchParams({ employer })
  if (city) params.set('city', city)
  if (province) params.set('province', province)
  try {
    return await QRCode.toString(`${SITE_URL}/results?${params.toString()}`, {
      type: 'svg', margin: 1, width: 120,
      color: { dark: '#111827', light: '#ffffff' },
    })
  } catch {
    return ''
  }
}

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

  const [result, qrSvg] = await Promise.all([
    verifyEmployer(employer, city, province),
    generateQR(employer, city, province),
  ])
  const employerNormalized = normalizeEmployerName(employer)

  const riskBorderColor = {
    GREEN: 'border-l-green-600',
    YELLOW: 'border-l-yellow-500',
    RED: 'border-l-red-600',
    GREY: 'border-l-gray-400',
  }[result.risk]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      <StickyResultHeader
        risk={result.risk}
        verdict={VERDICT_LABEL[result.risk]}
        employer={employer}
      />

      <ScrollToTop query={employer} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Search summary */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
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

        {/* Ready-to-send templates — all result types */}
        {result.risk === 'RED' && (
          <ReportTemplate
            employer={employer}
            mode="red"
            banUntil={
              result.ban_end_date
                ? new Date(result.ban_end_date).toLocaleDateString('en-CA', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })
                : null
            }
          />
        )}
        {result.risk === 'GREY' && (
          <ReportTemplate employer={employer} mode="grey" />
        )}
        {result.risk === 'GREEN' && (
          <ReportTemplate employer={employer} mode="green" />
        )}

        {/* CICC consultant verification — shown on all results */}
        <CICCWidget />

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

        {/* Financial setup prompt — shown for GREEN results only */}
        {result.risk === 'GREEN' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Planning your move to Canada?
            </p>
            <p className="text-xs text-blue-700 mb-3 leading-relaxed">
              Once your employer is verified, start your financial setup — bank account,
              first budget, and a plan to send money home cheaply. All free, no signup.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://buildcreditcanada.ca/compare.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
              >
                Compare banks →
              </a>
              <a
                href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
              >
                Cheapest remittance →
              </a>
              <a
                href="https://buildcreditcanada.ca/spending-plan.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
              >
                Spending plan →
              </a>
            </div>
          </div>
        )}

        {/* LMIA number verifier prompt — shown for GREY results */}
        {result.risk === 'GREY' && (
          <div className="mt-4 p-5 card-elevated">
            <p className="text-sm font-semibold text-gray-900 mb-1">Have an LMIA number on your document?</p>
            <p className="text-xs text-gray-500 mb-3">Check whether the number format is valid and get the exact script to verify it with Service Canada in 5 minutes.</p>
            <a
              href="/verify-lmia"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Check LMIA number →
            </a>
          </div>
        )}

        {/* Crowdsource: ask user if they know another name */}
        {result.risk === 'GREY' && (
          <MappingContribution queriedName={employer} province={province} />
        )}

        {/* Numbered company hint — shown when no results found */}
        {result.risk === 'GREY' && (
          <div className="mt-4 p-5 card-elevated">
            <p className="text-sm font-semibold text-gray-900 mb-1.5">
              Is your employer a numbered company?
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Many Canadian businesses file LMIAs under a numbered legal name (e.g.{' '}
              <span className="font-mono font-semibold text-gray-700">1234567 BC Ltd.</span>) that is completely
              different from the name on your job offer. Check your T4, pay stub, or offer letter
              signature line for the legal name — then search again.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                <span className="font-semibold text-gray-500">Example:</span> &ldquo;Tim Hortons&rdquo; may file as{' '}
                <span className="font-mono font-semibold text-gray-600">9363-2891 Québec Inc.</span>
              </p>
              <p>
                <span className="font-semibold text-gray-500">Example:</span> &ldquo;Kanwar Walia Farms&rdquo; files as{' '}
                <span className="font-mono font-semibold text-gray-600">1254586 BC Ltd.</span>
              </p>
            </div>
          </div>
        )}

{/* Service Canada verification call */}
        <ServiceCanadaCallCard />

        {/* Email notification capture */}
        <EmailCapture
          employerQuery={employer}
          employerNormalized={employerNormalized}
          lastResult={result.risk}
        />

        {/* Download PDF */}
        <div className="mt-4 p-5 card-elevated">
          <p className="text-sm font-semibold text-gray-900 mb-1">Download & Print</p>
          <p className="text-xs text-gray-500 mb-3">
            Save this result as a PDF to share with family or for your records.
          </p>
          <a
            href={`/api/download-result?employer=${encodeURIComponent(employer)}${city ? `&city=${encodeURIComponent(city)}` : ''}${province ? `&province=${encodeURIComponent(province)}` : ''}`}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors"
            aria-label="Download result as PDF"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </a>
        </div>

        {/* Share */}
        <ShareComponent riskResult={result.risk} qrSvg={qrSvg} />

        {/* Feedback */}
        <FeedbackForm employerQuery={employer} />

        {/* Search again — bottom CTA */}
        <div className="mt-8">
          <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Search another employer</h2>
          <div className="card-elevated p-5">
            <SearchForm />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <DataFreshness />
            </div>
          </div>
        </div>
      </main>

      {/* Floating PDF download button — always visible on mobile */}
      <a
        href={`/api/download-result?employer=${encodeURIComponent(employer)}${city ? `&city=${encodeURIComponent(city)}` : ''}${province ? `&province=${encodeURIComponent(province)}` : ''}`}
        download
        aria-label="Download result as PDF"
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-gray-700 active:scale-95 transition-all"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Save PDF
      </a>

      <Footer />
    </div>
  )
}
