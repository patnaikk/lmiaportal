import Link from 'next/link'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — LMIA Check',
  description: 'About LMIA Check: what it does, its data sources, and what the results mean.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">LMIA Check</Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">About LMIA Check</h1>
          <p className="text-gray-600 text-sm">Free tool to verify Canadian employer legitimacy before paying recruitment fees</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What this tool does</h2>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              LMIA Check searches Government of Canada databases to verify whether an employer has received a
              positive Labour Market Impact Assessment (LMIA) — the official approval required to hire temporary
              foreign workers.
            </p>
            <p>
              Foreign workers are frequently targeted by fraud. Fake recruiters charge $5,000–$20,000 CAD for job
              offers backed by fraudulent or non-existent LMIAs. This tool helps workers check employer legitimacy
              in seconds, before paying any fees.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Data sources</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Positive LMIA list</strong> — Published quarterly by Employment and Social Development Canada
              (ESDC). Lists employers who received approved LMIAs, the number of approved positions, and program stream.
            </p>
            <p>
              <strong>Non-compliant employer list</strong> — Published by ESDC. Lists employers found in violation
              of Temporary Foreign Worker Program conditions, including bans and monetary penalties.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What the results mean</h2>
          <div className="space-y-4">
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700 font-bold text-sm flex-shrink-0">GREEN — VERIFIED</span>
              <p className="text-sm text-green-900">
                This employer appears in official LMIA records and has not been flagged for violations. This is a
                positive indicator, but does not guarantee a job offer is legitimate. Always request a copy of the
                LMIA approval letter.
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-700 font-bold text-sm flex-shrink-0 whitespace-nowrap">YELLOW — VERIFY FURTHER</span>
              <p className="text-sm text-yellow-900">
                The employer was found but something doesn&apos;t fully match. This may mean the employer exists but
                the location on your offer letter is wrong, the employer previously violated program rules (but is
                now allowed to hire), or all records are for Permanent Residents only (not TFW positions).
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-700 font-bold text-sm flex-shrink-0">RED — HIGH RISK</span>
              <p className="text-sm text-red-900">
                This employer is currently banned from hiring temporary foreign workers. They either have an active
                ban with an end date, or an outstanding unpaid monetary penalty. Any job offer from this employer
                is illegitimate. Do not pay any fees.
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-700 font-bold text-sm flex-shrink-0">GREY — NOT FOUND</span>
              <p className="text-sm text-gray-800">
                This employer does not appear in any government LMIA records. This does not automatically mean
                fraud — the employer may be new, or the data may be out of date. However, it is a significant
                warning sign. Exercise maximum caution and verify independently before paying any fees.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Limitations</h2>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>Government data is published quarterly and may be up to 3 months behind</li>
            <li>A GREEN result does not guarantee a specific job offer is legitimate</li>
            <li>An employer may be legitimate but not appear in the LMIA database (e.g. they hire only Canadians, or are newly approved)</li>
            <li>Fuzzy name matching is used — search results may include similar but different employers</li>
            <li>This tool covers the Temporary Foreign Worker Program (TFWP) only — not International Mobility Program (IMP) positions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This tool is for informational purposes only and does not constitute legal or immigration advice.
            Results are based on publicly available Government of Canada data published by Employment and Social
            Development Canada (ESDC) and may not reflect the current status of any employer. A positive result
            does not guarantee a job offer is legitimate. Always seek advice from a licensed Regulated Canadian
            Immigration Consultant (RCIC) before making immigration decisions. This portal is not affiliated with
            the Government of Canada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Report fraud</h2>
          <p className="text-sm text-gray-700">
            If you believe you have been targeted by LMIA fraud, contact ESDC:{' '}
            <a href="tel:18003675693" className="font-bold text-blue-700 hover:text-blue-900">
              1-800-367-5693
            </a>
          </p>
        </section>

        <div className="pt-4">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-900 underline">
            ← Back to search
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
