import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Spot LMIA Fraud — Red Flags in Canadian Job Offers (2026)',
  description: 'Learn how to identify fake LMIA job offers and scams targeting foreign workers. 9 red flags to watch for before accepting a Canadian job.',
  openGraph: {
    title: 'How to Spot LMIA Fraud — 9 Red Flags (2026)',
    description: 'Learn how to identify fake LMIA job offers targeting foreign workers. 9 red flags to check before accepting a Canadian job offer.',
    url: 'https://lmiacheck.ca/spot-lmia-fraud',
    siteName: 'LMIA Check',
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'How to Spot LMIA Fraud — 9 Red Flags (2026)', description: '9 red flags that reveal a fake LMIA job offer targeting foreign workers.' },
  alternates: { canonical: 'https://lmiacheck.ca/spot-lmia-fraud' },
}

export default function SpotLmiaFraudPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-50 text-center pt-10 pb-7 px-4">
        <div className="text-4xl mb-3">🚩</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance tracking-tight mb-3">
          How to Spot LMIA Fraud<br />
          <span className="text-gray-500">9 red flags in any job offer</span>
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Scammers target foreign workers with fake Canadian job offers. Employees never pay for an LMIA — the employer does. Learn to spot the warning signs.
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        <section className="card-elevated p-6 mb-8 bg-red-50/40">
          <h2 className="text-lg font-bold text-red-900 mb-2">⚠️ Golden Rule</h2>
          <p className="text-red-800 font-semibold">Legitimate Canadian employers never charge workers for an LMIA, job offer, or visa processing. If someone is asking for money upfront, it is a scam.</p>
        </section>

        <div className="space-y-6">
          {/* Red Flag 1 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">1</span>
              <h3 className="text-lg font-bold text-gray-900">Asking for upfront payment</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              "Send $500 for visa processing" or "Pay $1,000 to secure your spot." This is the #1 scam indicator. In Canada, the employer pays for the LMIA. You only pay for your work permit application ($255 CAD) directly to Immigration Canada — never to a recruiter or employer.
            </p>
          </div>

          {/* Red Flag 2 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">2</span>
              <h3 className="text-lg font-bold text-gray-900">Wages that seem too good to be true</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              "$50/hour for unskilled work" or "$100K salary for entry-level." Research typical wages for the role in Canada using Statistics Canada or Job Bank. If it's 2-3x higher than normal, it's likely bait to get you to pay.
            </p>
          </div>

          {/* Red Flag 3 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">3</span>
              <h3 className="text-lg font-bold text-gray-900">No verifiable company details</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              No real website, vague address, or phone number that doesn't exist. Try calling the company directly using a number you find independently. Don't use the number they give you. Google the company name + "scam" and see what comes up.
            </p>
          </div>

          {/* Red Flag 4 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">4</span>
              <h3 className="text-lg font-bold text-gray-900">Refusing to let you contact the employer directly</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              "You must work through me" or "Don't contact them yet." A real employer wants to interview you directly. A recruiter or middleman who blocks direct communication is a major red flag.
            </p>
          </div>

          {/* Red Flag 5 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">5</span>
              <h3 className="text-lg font-bold text-gray-900">Spelling and grammar errors in official emails</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              Scammers often use templates in broken English. Real companies proofread official correspondence. If you see poor grammar in job offer letters or contracts, be suspicious.
            </p>
          </div>

          {/* Red Flag 6 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">6</span>
              <h3 className="text-lg font-bold text-gray-900">Pressure to decide immediately</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              "Only 3 spots left!" or "You must send money by tomorrow." Real job offers give you time to think and verify. Urgency is a manipulation tactic.
            </p>
          </div>

          {/* Red Flag 7 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">7</span>
              <h3 className="text-lg font-bold text-gray-900">Asking for personal documents upfront</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              "Send me your passport and bank account details to start." Never send personal documents or banking information before you've verified the employer and had a real interview. This is identity theft waiting to happen.
            </p>
          </div>

          {/* Red Flag 8 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">8</span>
              <h3 className="text-lg font-bold text-gray-900">Vague job duties or location</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              "Work will be assigned based on need" or "Location TBD." A real job offer specifies the exact role, location, and hours. Vague offers allow scammers to bait-and-switch.
            </p>
          </div>

          {/* Red Flag 9 */}
          <div className="card-elevated p-6">
            <div className="flex gap-3 items-start mb-2">
              <span className="text-2xl font-bold text-red-600">9</span>
              <h3 className="text-lg font-bold text-gray-900">The employer is on a government ban list</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              Check the employer on <Link href="/check" className="font-semibold text-red-600 hover:text-red-800">LMIA Check</Link>. If they return a RED result, they are banned or have unpaid penalties. Do not work for them under any circumstances.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">Verify Before You Accept</h2>
          <p className="text-blue-800 mb-4">
            Use LMIA Check to instantly verify if an employer is legitimate. It only takes seconds and could protect you from fraud and exploitation.
          </p>
          <Link href="/check" className="inline-block px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
            Check Employer Now
          </Link>
        </div>

        {/* Report section */}
        <div className="mt-8 card-elevated p-6 bg-red-50/40">
          <h2 className="text-lg font-bold text-red-900 mb-2">Suspect You've Been Scammed?</h2>
          <p className="text-red-800 mb-3">Stop all communication immediately and report to Canada's Employment & Social Development Canada (ESDC):</p>
          <a href="tel:18003675693" className="inline-block px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
            📞 1-800-367-5693
          </a>
          <p className="text-sm text-red-700 mt-3">Also contact a licensed immigration consultant or your nearest Canadian embassy for additional support.</p>
        </div>

        {/* Send money safely */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">Sending Money Home Safely</h2>
          <p className="text-blue-800 text-sm leading-relaxed mb-4">
            Whether you're already in Canada or planning your move — bank wire transfers are expensive.
            Compare Wise, Remitly, Western Union, and others to find the lowest-cost option for
            sending money to your family.
          </p>
          <a
            href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=fraud-page"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Compare money transfer services →
          </a>
        </div>

      </main>

      <Footer />
    </div>
  )
}
