import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'I Already Paid — What Do I Do Now? | LMIA Check',
  description:
    'If you paid fees for a Canadian job offer or LMIA and suspect fraud: immediate steps, how to recover funds, free legal aid, and how to apply for an Open Work Permit.',
  openGraph: {
    title: 'I Already Paid for an LMIA — What Do I Do Now?',
    description: 'Immediate steps to take if you paid fees for a Canadian job offer or LMIA: how to recover funds, free legal aid, and how to apply for an Open Work Permit.',
    url: 'https://lmiacheck.ca/help/i-paid',
    siteName: 'LMIA Check',
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'I Already Paid for an LMIA — What Do I Do?', description: 'Immediate steps if you paid fees for a Canadian job offer: recover funds, free legal aid, Open Work Permit.' },
  alternates: { canonical: 'https://lmiacheck.ca/help/i-paid' },
}

const LEGAL_AID = [
  { province: 'British Columbia', org: 'Legal Aid BC', url: 'https://legalaid.bc.ca', phone: '1-866-577-2525' },
  { province: 'Alberta', org: 'Legal Aid Alberta', url: 'https://www.legalaid.ab.ca', phone: '1-866-845-3425' },
  { province: 'Ontario', org: 'Legal Aid Ontario', url: 'https://www.legalaid.on.ca', phone: '1-800-668-8258' },
  { province: 'Quebec', org: 'Commission des services juridiques', url: 'https://www.csj.qc.ca', phone: '514-873-3562' },
  { province: 'Manitoba', org: 'Legal Aid Manitoba', url: 'https://www.legalaid.mb.ca', phone: '204-985-8500' },
  { province: 'Saskatchewan', org: 'Legal Aid Saskatchewan', url: 'https://www.legalaid.sk.ca', phone: '306-787-6419' },
  { province: 'Nova Scotia', org: 'Nova Scotia Legal Aid', url: 'https://www.nslegalaid.ca', phone: '902-420-6573' },
  { province: 'New Brunswick', org: 'NB Legal Aid Services Commission', url: 'https://www.legalaid.nb.ca', phone: '506-444-2776' },
]

export default function IPaidPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">

        {/* Back */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-700 mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Emergency guidance
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance tracking-tight mb-3">
            I already paid.<br />What do I do now?
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            You are not alone. An estimated{' '}
            <span className="font-semibold text-gray-700">$30 million</span> is lost to LMIA fraud
            in Canada every year — mostly by people who trusted what looked like a real offer.
            Here is what to do, step by step.
          </p>
        </div>

        {/* Step 1 */}
        <section className="mb-6 p-5 sm:p-6 card-elevated border-l-4 border-l-red-500">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center justify-center">1</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Stop all further payments — right now</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Do not pay any "processing fees," "insurance," "bond," or any other amount — even if they threaten
                to cancel your application. Fraudsters escalate requests after the first payment.
                Block the number / email and do not send anything more.
              </p>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">2</span>
            <div className="w-full">
              <h2 className="text-base font-bold text-gray-900 mb-1">Save every piece of evidence</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Before blocking anyone, screenshot everything. Investigators need this.
              </p>
              <ul className="space-y-1.5">
                {[
                  'WhatsApp / Messenger / email conversations',
                  'Bank transfer receipts or e-transfer confirmation emails',
                  'Any documents you were sent (fake LMIA, offer letter, passport copy request)',
                  'The recruiter\'s phone number, email, social media profile URL',
                  'Any website or company name they used',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Step 3 — OWP-VW */}
        <section className="mb-6 p-5 sm:p-6 card-elevated border-l-4 border-l-blue-500">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">3</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Apply for an Open Work Permit — it&apos;s free and takes 5 days to first contact
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                If you are in Canada and in a vulnerable situation (paid fees, abuse, threats),
                you may qualify for an{' '}
                <span className="font-semibold text-gray-800">Open Work Permit for Vulnerable Workers (OWP-VW)</span>.
                This lets you work for any employer in Canada while your situation is sorted out.
                It is free and you do not need the fraudulent employer&apos;s cooperation to apply.
              </p>
              <a
                href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/vulnerable-workers.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                How to apply for OWP-VW (canada.ca) →
              </a>
            </div>
          </div>
        </section>

        {/* Step 4 — Anti-Fraud Centre */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">4</span>
            <div className="w-full">
              <h2 className="text-base font-bold text-gray-900 mb-1">Call the Canadian Anti-Fraud Centre</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Report the fraud. This creates an official record and helps investigators shut down the scam.
                Even if you can&apos;t recover the money, your report protects the next person.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">When you call, have ready:</p>
                <ul className="space-y-1">
                  {[
                    'Recruiter\'s name / phone / email',
                    'Amount paid and how (e-transfer, wire, crypto, gift cards)',
                    'Date of payment',
                    'Company or "employer" name used in the offer',
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="tel:18884958501"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
                1-888-495-8501 (Anti-Fraud Centre)
              </a>
              <p className="text-xs text-gray-400 mt-2">
                Also report online at{' '}
                <a href="https://www.antifraudcentre-centreantifraude.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  antifraudcentre-centreantifraude.ca
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Step 5 — Service Canada */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">5</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Report to Service Canada (ESDC)</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                If a fraudulent LMIA or employer name was used in the scam, Service Canada (ESDC)
                can investigate whether a real LMIA was abused.
              </p>
              <a
                href="tel:18003675693"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
                1-800-367-5693 (Service Canada)
              </a>
            </div>
          </div>
        </section>

        {/* Step 6 — Try to recover funds */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">6</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Try to recover your money</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <div>
                  <p className="font-semibold text-gray-800">If you paid by e-transfer or bank transfer:</p>
                  <p>Call your bank immediately and ask them to attempt a recall. Banks can sometimes reverse transfers made within the last 24–72 hours if the receiving account hasn&apos;t been cleared. File a fraud report with your bank at the same time.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">If you paid by credit card:</p>
                  <p>Request a chargeback. Explain it was an unauthorized / fraudulent transaction. Success rates vary but it is worth trying.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">If you paid by cryptocurrency or gift cards:</p>
                  <p>Recovery is very unlikely, but still report it. The Anti-Fraud Centre tracks patterns even when funds are not recovered.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free legal aid */}
        <section className="mb-6 p-5 sm:p-6 card-elevated">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center">7</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Get free legal help</h2>
              <p className="text-sm text-gray-500">
                You may be entitled to free legal aid regardless of your immigration status.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Province</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {LEGAL_AID.map(({ province, org, url, phone }) => (
                  <tr key={province} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-gray-600 font-medium">{province}</td>
                    <td className="px-3 py-2.5">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">
                        {org}
                      </a>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Don&apos;t see your province? Search{' '}
            <a
              href="https://www.legalaid.qc.ca/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              legal aid organizations near you
            </a>{' '}
            or contact a local newcomer settlement service.
          </p>
        </section>

        {/* Reassurance / footer CTA */}
        <div className="p-5 sm:p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            This is not your fault.
          </p>
          <p className="text-xs text-blue-700 leading-relaxed mb-4 max-w-sm mx-auto">
            These scams are sophisticated and target people with legitimate dreams. The people running them are
            criminals. You did nothing wrong by trusting what looked like a real opportunity.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Check another employer →
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  )
}
