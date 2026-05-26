import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Work Permit for Vulnerable Workers (OWP-VW) | LMIA Check',
  description:
    'If you are a temporary foreign worker in a vulnerable or abusive situation in Canada, you may qualify for a free Open Work Permit that lets you leave your employer immediately.',
  openGraph: {
    title: 'Open Work Permit for Vulnerable Workers (OWP-VW)',
    description: 'Temporary foreign workers in abusive situations in Canada may qualify for a free Open Work Permit to leave their employer immediately.',
    url: 'https://lmiacheck.ca/owp-vw',
    siteName: 'LMIA Check',
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'Open Work Permit for Vulnerable Workers (OWP-VW)', description: 'Are you being exploited by your Canadian employer? You may qualify for a free Open Work Permit.' },
  alternates: { canonical: 'https://lmiacheck.ca/owp-vw' },
}

const ELIGIBLE_SITUATIONS = [
  'You are being abused or at risk of abuse by your employer (physical, sexual, psychological, financial)',
  'Your employer threatened to deport you, have you arrested, or harm your family if you leave',
  'Your employer confiscated your passport or immigration documents',
  'Your employer is not paying you or is paying far below what your work permit says',
  'You were charged recruitment fees for your Canadian job (illegal under IRPA)',
  'Your living conditions are unsafe or controlled by your employer',
  'You are afraid to leave your job because of your immigration status',
]

export default function OwpVwPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Open Work Permit for Vulnerable Workers (OWP-VW) — Eligibility & How to Apply',
    url: 'https://lmiacheck.ca/owp-vw',
    datePublished: '2026-03-01',
    dateModified: '2026-05-26',
    author: { '@type': 'Organization', name: 'LMIA Check', url: 'https://lmiacheck.ca' },
    publisher: { '@type': 'Organization', name: 'LMIA Check', url: 'https://lmiacheck.ca', logo: { '@type': 'ImageObject', url: 'https://lmiacheck.ca/favicon.svg' } },
    description: 'If you are a temporary foreign worker in a vulnerable or abusive situation in Canada, you may qualify for a free Open Work Permit that lets you leave your employer immediately.',
    about: { '@type': 'Thing', name: 'Open Work Permit for Vulnerable Workers', description: 'Canadian immigration pathway allowing exploited temporary foreign workers to change employers without a new job offer.' },
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'LMIA Check', url: 'https://lmiacheck.ca' },
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to home
        </Link>

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Worker protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance tracking-tight mb-3">
            Open Work Permit<br />for Vulnerable Workers
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-4">
            If you are a temporary foreign worker being abused, threatened, or exploited by your employer,
            you can apply for a special open work permit that lets you{' '}
            <span className="font-semibold text-gray-800">leave immediately and work for any employer in Canada</span> — without needing your employer&apos;s cooperation.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Free — no application fee
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              5 business days to first contact
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Work for any employer
            </div>
          </div>
        </div>

        {/* Am I eligible? */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <h2 className="text-base font-bold text-gray-900 mb-3">Am I eligible?</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            You may qualify if you are currently in Canada on a work permit and are in any of these situations:
          </p>
          <ul className="space-y-2.5">
            {ELIGIBLE_SITUATIONS.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Note:</span> You do not need to prove abuse happened — only that you have a reasonable belief you are at risk. IRCC case officers are trained to handle these applications sensitively.
            </p>
          </div>
        </section>

        {/* What it gets you */}
        <section className="mb-6 p-5 sm:p-6 card-elevated border-l-4 border-l-blue-500">
          <h2 className="text-base font-bold text-gray-900 mb-3">What the OWP-VW gets you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Work for any employer', desc: 'No employer-specific restrictions — you choose where to work.' },
              { title: 'Leave immediately', desc: 'You can leave your current employer before your permit is approved.' },
              { title: 'Stay in Canada legally', desc: 'Your status is maintained while the application is processed.' },
              { title: 'No employer cooperation needed', desc: 'Your current employer cannot block or interfere with your application.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to apply */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <h2 className="text-base font-bold text-gray-900 mb-4">How to apply — step by step</h2>
          <ol className="space-y-4">
            {[
              {
                n: '1',
                title: 'Make sure you are safe first',
                body: 'If you are in immediate danger, call 911. If you need help escaping a controlled situation, contact the Victim Services hotline in your province or a shelter — they can help you leave safely.',
              },
              {
                n: '2',
                title: 'Gather any evidence you have',
                body: 'Messages, photos, pay stubs, your work permit, any documents your employer gave you. Evidence helps but is not required — IRCC understands it may be difficult to collect.',
              },
              {
                n: '3',
                title: 'Apply online through IRCC',
                body: 'Use the IRCC Applicant Portal. Select "Apply to change the conditions on your permit" → "Open work permit for vulnerable workers (no fee)." Fill in your personal details and describe your situation briefly.',
              },
              {
                n: '4',
                title: 'Get free legal help if you need it',
                body: 'Legal Aid organizations can help you complete the application. Many have experience with TFW cases. Your immigration status does not prevent you from accessing legal aid.',
              },
              {
                n: '5',
                title: 'Wait for first contact (typically 5 business days)',
                body: 'An IRCC officer will reach out within 5 business days. They will not contact your employer. In many cases, interim authorization to work is granted before the final decision.',
              },
            ].map(({ n, title, body }) => (
              <li key={n} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center mt-0.5">{n}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Primary CTA */}
        <div className="mb-6 p-5 sm:p-6 bg-blue-600 rounded-2xl">
          <p className="text-white font-bold text-base mb-1">Ready to apply?</p>
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            The application is free and processed through the official IRCC Applicant Portal.
          </p>
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/vulnerable-workers.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Apply for OWP-VW on canada.ca →
          </a>
        </div>

        {/* Help line */}
        <div className="mb-6 p-5 card-elevated">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Need help now?</h2>
          <div className="space-y-2">
            {[
              { label: 'IRCC Immigration Enquiries', number: '1-888-242-2100', sub: 'Mon–Fri, 8 am – 4 pm local time' },
              { label: 'Canadian Anti-Fraud Centre', number: '1-888-495-8501', sub: 'If you paid fees or were defrauded' },
              { label: 'Service Canada (ESDC)', number: '1-800-367-5693', sub: 'To report illegal fee charging or abuse' },
            ].map(({ label, number, sub }) => (
              <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs font-semibold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
                <a
                  href={`tel:${number.replace(/[^0-9]/g, '')}`}
                  className="flex-shrink-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Also see */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/help/i-paid"
            className="flex-1 p-4 card-elevated hover:ring-red-100 transition-all group"
          >
            <p className="text-xs font-semibold text-gray-900 group-hover:text-red-700">I already paid fees →</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Step-by-step guide for fraud victims</p>
          </Link>
          <Link
            href="/faq"
            className="flex-1 p-4 card-elevated hover:ring-gray-100 transition-all group"
          >
            <p className="text-xs font-semibold text-gray-900">LMIA FAQ →</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Common questions about verification and fraud</p>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  )
}
