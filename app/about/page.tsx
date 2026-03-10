import Link from 'next/link'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — LMIA Check',
  description: 'Why we built LMIA Check, and how it helps foreign workers verify Canadian employers before paying recruitment fees.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">FAQ</Link>
            <Link href="/about" className="text-sm font-semibold text-gray-900 transition-colors">About</Link>
            <Link href="/updates" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">What's new</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-10">

        {/* Hero headline */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">
            Built for people who can&apos;t afford to be fooled.
          </h1>
          <p className="text-gray-400 text-sm font-medium">March 2026 · Free, forever</p>
        </div>

        {/* Intro */}
        <section className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
          <p>
            Moving to Canada to work is a life-changing decision. Whether you are a nurse, a caregiver, a farm worker,
            or a driver, you are putting your future into the hands of a Canadian employer.
          </p>
          <p>
            Because this is such a significant step, you deserve to know exactly who you are working with. The Canadian
            government keeps detailed records of employers — who has been approved for a Labour Market Impact Assessment
            (LMIA) and who has been flagged for failing to meet the rules of the Temporary Foreign Worker Program.
          </p>
          <p>
            The problem? That information is often buried in complex government databases and spreadsheets that are
            hard to find and even harder to navigate.
          </p>

          <div className="pt-2">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Bridging the Information Gap</h2>
            <p className="mb-4">
              LMIA Check was built to bring that data into the light. We believe that transparency shouldn&apos;t be a
              luxury. Our goal is to help you understand exactly where a potential employer stands in the eyes of the
              government before you commit to a job offer.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0">·</span>
                <span><strong className="text-gray-900">Public Data, Simplified:</strong> We take official records
                from Employment and Social Development Canada (ESDC) and make them searchable in seconds.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0">·</span>
                <span><strong className="text-gray-900">Know the Status:</strong> Quickly see if an employer has a
                history of compliance or if they&apos;ve been restricted from the program.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0">·</span>
                <span><strong className="text-gray-900">Free for Everyone:</strong> No accounts, no fees, and no
                barriers to the information you need.</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Why Transparency Matters</h2>
            <p className="mb-4">
              When an employer applies for an LMIA, they are making a commitment to the Canadian government and to
              you. By checking their public standing, you can move forward with the confidence that you are joining a
              workplace that respects the standards set by the government.
            </p>
            <p>
              Our tool is here to ensure that the &ldquo;promise of a better life&rdquo; is built on a foundation of
              clear, accessible facts. It&apos;s about giving you the power to do your due diligence, simply and quickly.
            </p>
          </div>

          {/* Callout box */}
          <div className="bg-red-50 border-l-4 border-l-red-500 rounded-r-xl px-5 py-4 mt-2">
            <p className="text-sm font-semibold text-red-800">
              🔒 If someone charges you to verify an employer — that itself is a red flag.
            </p>
            <p className="text-sm text-red-700 mt-1">
              This tool is free, and it always will be.
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
            <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-gray-900 mb-0.5">🟢 Verified</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                The employer is in government LMIA records with no flagged violations. A good sign — but always
                request a copy of the actual LMIA approval letter before paying any fees.
              </p>
            </div>
            <div className="bg-white border border-gray-200 border-l-4 border-l-amber-400 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-gray-900 mb-0.5">🟡 Verify Further</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                The employer exists but something doesn&apos;t fully match — the location may be different, all records
                may be for Permanent Residents only, or the employer was previously penalised (but is now eligible).
                Ask questions before proceeding.
              </p>
            </div>
            <div className="bg-white border border-gray-200 border-l-4 border-l-red-600 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-gray-900 mb-0.5">🔴 High Risk</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This employer is currently banned from hiring temporary foreign workers, or has an outstanding
                unpaid penalty. Any job offer is illegitimate. Do not pay fees.
              </p>
            </div>
            <div className="bg-white border border-gray-200 border-l-4 border-l-gray-400 rounded-xl px-4 py-3">
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
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-sm font-semibold text-gray-900 mb-1">Report LMIA fraud</p>
          <p className="text-sm text-gray-600">
            Contact Employment and Social Development Canada:{' '}
            <a href="tel:18003675693" className="font-bold text-red-600 hover:text-red-800">
              1-800-367-5693
            </a>
          </p>
        </div>

        {/* Back link */}
        <div className="pt-2 pb-4">
          <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1">
            ← Back to search
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
