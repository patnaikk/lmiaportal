import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — LMIA Check',
  description: 'Why we built LMIA Check, and how it helps foreign workers verify Canadian employers against government records.',
  openGraph: {
    title: 'About LMIA Check',
    description: 'Why we built LMIA Check, and how it helps foreign workers verify Canadian employers against government records.',
    url: 'https://lmiacheck.ca/about',
    siteName: 'LMIA Check',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'About LMIA Check', description: 'Why we built LMIA Check and how it protects foreign workers from LMIA fraud.' },
  alternates: { canonical: 'https://lmiacheck.ca/about' },
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About LMIA Check',
    url: 'https://lmiacheck.ca/about',
    datePublished: '2026-03-01',
    dateModified: '2026-05-26',
    description: 'Why we built LMIA Check, and how it helps foreign workers verify Canadian employers against government records.',
    author: {
      '@type': 'Organization',
      name: 'LMIA Check',
      url: 'https://lmiacheck.ca',
      description: 'Free public tool built to help foreign workers verify Canadian employer legitimacy using official ESDC records.',
      knowsAbout: [
        'Labour Market Impact Assessment',
        'Temporary Foreign Worker Program',
        'ESDC employer compliance',
        'Canadian immigration fraud',
        'LMIA fraud detection',
      ],
    },
    about: {
      '@type': 'Thing',
      name: 'LMIA Fraud Prevention',
      description: 'Protecting foreign workers from fraudulent Canadian job offers by providing free access to official ESDC employer compliance data.',
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'LMIA Check',
      url: 'https://lmiacheck.ca',
      foundingDate: '2025',
      areaServed: 'CA',
      serviceType: 'Employer Verification',
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation currentPage="about" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-10">

        {/* Hero headline */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3 leading-tight text-balance">
            Built for people who can&apos;t afford to be fooled.
          </h1>
          <p className="text-gray-400 text-sm font-medium">March 2026 · Free, forever</p>
        </div>

        {/* Personal intro — human voice */}
        <section className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
          <p>
            I&apos;m Sandeep. I built this tool because I kept seeing the same story play out — workers
            saving for years, paying $20,000 to $50,000 to a recruiter for a Canadian job offer,
            and arriving to find nothing waiting for them. Or never arriving at all.
          </p>
          <p>
            The information to catch these scams exists. The Canadian government publishes a list of
            every employer banned from the Temporary Foreign Worker Program, and every employer who
            has ever received an approved LMIA. It&apos;s public data. But it&apos;s buried in government
            spreadsheets that are hard to find and harder to search.
          </p>
          <p>
            So I built a search tool. It takes those spreadsheets, loads them into a proper database,
            and lets anyone check an employer in seconds. No account. No fee. No catch.
          </p>
          <p>
            I maintain it myself, pay for the hosting myself, and publish a monthly enforcement
            update when the government releases new violation data. It will stay free.
          </p>

          {/* Callout box */}
          <div className="rounded-2xl px-5 py-4 bg-red-50 ring-1 ring-red-100">
            <p className="text-sm font-semibold text-red-800">
              🔒 If someone charges you to verify an employer — that itself is a red flag.
            </p>
            <p className="text-sm text-red-700 mt-1">
              Legitimate verification is free. Always.
            </p>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Data sources */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Where the data comes from</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-1">Positive LMIA list</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Published quarterly by Employment and Social Development Canada (ESDC). Lists employers who received
                approved LMIAs, approved positions, and the program stream.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-1">Non-compliant employer list</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Published by ESDC. Lists employers found in violation of Temporary Foreign Worker Program
                conditions — including active bans and outstanding monetary penalties.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* What results mean */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">What the results mean</h2>
          <div className="space-y-3">
            <div className="rounded-xl px-4 py-3 bg-white ring-1 ring-green-100 shadow-sm">
              <p className="text-sm font-bold text-gray-900 mb-0.5">🟢 Verified</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                The employer is in government LMIA records with no flagged violations. A good sign — but always
                request a copy of the actual LMIA approval letter and verify the employer directly with Service Canada.
              </p>
            </div>
            <div className="rounded-xl px-4 py-3 bg-white ring-1 ring-amber-100 shadow-sm">
              <p className="text-sm font-bold text-gray-900 mb-0.5">🟡 Verify Further</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                The employer exists but something doesn&apos;t fully match — the location may be different, all records
                may be for Permanent Residents only, or the employer was previously found non-compliant (but is now eligible).
                Ask questions before proceeding.
              </p>
            </div>
            <div className="rounded-xl px-4 py-3 bg-white ring-1 ring-red-100 shadow-sm">
              <p className="text-sm font-bold text-gray-900 mb-0.5">🔴 High Risk</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This employer has been found non-compliant and is currently ineligible to hire temporary foreign workers, or has an outstanding monetary penalty. Any job offer from this employer is illegitimate.
              </p>
            </div>
            <div className="rounded-xl px-4 py-3 bg-white ring-1 ring-gray-200 shadow-sm">
              <p className="text-sm font-bold text-gray-900 mb-0.5">⚪ Not Found</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                No government LMIA records for this employer. Could be a new or niche employer — or a red flag.
                Exercise maximum caution and verify independently before paying anything.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Limitations */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Limitations to know</h2>
          <ul className="space-y-2 text-sm text-gray-600 leading-relaxed list-disc list-inside">
            <li>Government data is published quarterly — it may be up to 3 months out of date</li>
            <li>A GREEN result does not guarantee a specific job offer is legitimate</li>
            <li>Legitimate employers may not appear if they only hire Canadians, or were newly approved</li>
            <li>We use fuzzy name matching — results may include similar-but-different employers</li>
            <li>Covers the Temporary Foreign Worker Program (TFWP) only — not International Mobility Program (IMP)</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* Disclaimer */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Disclaimer</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This tool is for informational purposes only and does not constitute legal or immigration advice.
            Results are based on publicly available Government of Canada data published by ESDC and may not
            reflect the current status of any employer. Always seek advice from a licensed Regulated Canadian
            Immigration Consultant (RCIC) before making immigration decisions. This portal is not affiliated with
            the Government of Canada.
          </p>
        </section>

        {/* Report fraud */}
        <div className="card-elevated p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">Report LMIA fraud</p>
          <p className="text-sm text-gray-600">
            Contact Employment and Social Development Canada:{' '}
            <a href="tel:18003675693" className="font-bold text-red-600 hover:text-red-800">
              1-800-367-5693
            </a>
          </p>
        </div>

        {/* Support section — Ko-fi */}
        <section className="p-5 bg-amber-50 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">This tool has no ads and charges nobody.</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                It costs money to run and I cover it personally. If it helped you or someone you know,
                buying me a coffee goes a long way — but no pressure either way.
              </p>
              <a
                href="https://ko-fi.com/lmiacheck"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                ☕ Buy me a coffee
              </a>
              <p className="text-xs text-amber-700 mt-2">
                Organisations using this tool regularly?{' '}
                <a href="mailto:hello@lmiacheck.ca" className="underline hover:text-amber-900">
                  Get in touch about sponsorship.
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className="pt-2 pb-4">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            ← Back to search
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
