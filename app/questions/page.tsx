import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'
import { GEO_FAQ } from '@/lib/geo-faq'

export const metadata: Metadata = {
  title: 'Canadian Job Offer & LMIA Questions, Answered (2026) | LMIA Check',
  description:
    'Clear answers to the most common questions about verifying Canadian employers and avoiding LMIA fraud: is it legal to pay for an LMIA, how to check an employer, recruitment fees, and what to do if you were asked to pay for a job.',
  openGraph: {
    title: 'Canadian Job Offer & LMIA Questions, Answered (2026)',
    description:
      'Is it legal to pay for an LMIA? How do I check if a Canadian employer can hire foreign workers? Clear, sourced answers for foreign workers.',
    url: 'https://lmiacheck.ca/questions',
    siteName: 'LMIA Check',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canadian Job Offer & LMIA Questions, Answered',
    description: 'Clear, sourced answers to the most common LMIA and Canadian job-offer questions.',
  },
  alternates: { canonical: 'https://lmiacheck.ca/questions' },
}

export default function QuestionsPage() {
  // FAQPage structured data — this is what AI assistants and search engines parse to cite answers.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'LMIA Check', url: 'https://lmiacheck.ca' },
    mainEntity: GEO_FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navigation />

      {/* Hero */}
      <div className="text-center pt-10 pb-7 px-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Questions &amp; Answers</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance tracking-tight mb-3">
          Canadian job offers &amp; LMIA,<br />
          <span className="text-gray-500">answered clearly</span>
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-md mx-auto">
          Straight answers to the questions foreign workers ask most about verifying a Canadian
          employer and avoiding job-offer fraud. Sourced from official Government of Canada data.
        </p>
      </div>

      {/* Q&A list */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="space-y-3">
          {GEO_FAQ.map(({ q, a }, i) => (
            <section key={i} className="card-elevated rounded-2xl p-5 sm:p-6">
              <h2 className="text-[17px] sm:text-lg font-bold text-gray-900 tracking-tight mb-2 leading-snug">{q}</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed">{a}</p>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 bg-indigo-50 rounded-2xl text-center">
          <p className="text-sm font-semibold text-indigo-900 mb-1">Check an employer before you sign</p>
          <p className="text-xs text-indigo-700 mb-4 max-w-sm mx-auto">
            Search any Canadian employer against the official Government of Canada records — free, no signup.
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5 py-2.5 transition-colors"
          >
            Check an employer free
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
