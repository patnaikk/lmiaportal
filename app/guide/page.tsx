import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'LMIA Guide | LMIA Check',
  description: 'Understand what LMIA is, who needs it, and how the Canadian work permit process works.',
}

export default function GuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight hover:text-red-600 transition-colors">
            🍁 LMIA Check
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/check" className="text-sm text-white bg-red-600 hover:bg-red-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">
              Verify offer
            </Link>
            <Link href="/guide" className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
              Guide
            </Link>
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
              About
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-blue-50 text-center pt-10 pb-7 px-4">
        <div className="text-4xl mb-3">📚</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          How LMIA Works<br />
          <em className="not-italic text-blue-600">A guide for foreign workers</em>
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Learn what LMIA is, who needs it, what it costs, and what to watch out for.
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        {/* What is LMIA */}
        <section className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
            <span>❓</span> What is LMIA?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            <strong>LMIA = Labour Market Impact Assessment</strong> — a Canadian government process that confirms a Canadian employer needs foreign workers because they can't find qualified local workers.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Think of it as official permission from Canada saying: "Yes, this employer genuinely needs to hire you." It gives you priority in the work permit process.
          </p>
        </section>

        {/* Who needs it */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span>👥</span> Who Needs LMIA?
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="text-2xl flex-shrink-0">✓</div>
              <div>
                <p className="font-semibold text-gray-800">You received a job offer from a Canadian employer</p>
                <p className="text-sm text-gray-500 mt-1">Via email, phone, or recruitment message</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-2xl flex-shrink-0">✓</div>
              <div>
                <p className="font-semibold text-gray-800">Your employer already applied for LMIA approval</p>
                <p className="text-sm text-gray-500 mt-1">They should have told you this, or you can ask them</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-2xl flex-shrink-0">✓</div>
              <div>
                <p className="font-semibold text-gray-800">You meet the job requirements</p>
                <p className="text-sm text-gray-500 mt-1">Education, experience, or skills they need</p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-2">
            <span>⏱️</span> The 4-Step Process
          </h2>
          <p className="text-sm text-gray-600 mb-5 font-medium">Total time: 3–6 months from job offer to arrival in Canada</p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-extrabold">1</div>
                <div className="w-1 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="pb-4">
                <h3 className="font-semibold text-gray-900">Employer gets LMIA approval</h3>
                <p className="text-sm text-gray-600 mt-1">Your employer proves they need you. <strong>No cost to you.</strong></p>
                <p className="text-xs text-gray-500 mt-2">⏱️ Takes 4–8 weeks (employer's responsibility)</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold">2</div>
                <div className="w-1 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="pb-4">
                <h3 className="font-semibold text-gray-900">You apply for a work permit</h3>
                <p className="text-sm text-gray-600 mt-1">Submit your documents + LMIA approval to Immigration Canada (IRCC).</p>
                <p className="text-xs text-gray-500 mt-2">💰 Work permit fee: $255 CAD + other costs (see below)</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold">3</div>
                <div className="w-1 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="pb-4">
                <h3 className="font-semibold text-gray-900">IRCC reviews your case</h3>
                <p className="text-sm text-gray-600 mt-1">They check your health exam, police check, and job eligibility.</p>
                <p className="text-xs text-gray-500 mt-2">⏱️ Decision in 2–4 weeks (typical)</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-extrabold">4</div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">✅ Approved! You get your work permit</h3>
                <p className="text-sm text-gray-600 mt-1">Arrange travel and move to Canada to start your job.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Costs */}
        <section className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span> What Will You Actually Pay?
          </h2>

          <div className="space-y-3 mb-5">
            <div className="flex gap-3 items-start">
              <div className="text-lg flex-shrink-0">✅</div>
              <div>
                <p className="font-semibold text-gray-800">Work permit application fee</p>
                <p className="text-sm text-gray-600">$255 CAD</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-lg flex-shrink-0">✅</div>
              <div>
                <p className="font-semibold text-gray-800">Medical exam (required)</p>
                <p className="text-sm text-gray-600">$300–$600 CAD (varies by country)</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-lg flex-shrink-0">✅</div>
              <div>
                <p className="font-semibold text-gray-800">Police clearance certificate</p>
                <p className="text-sm text-gray-600">Free to ~$100 CAD (varies by country)</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="text-lg flex-shrink-0">✅</div>
              <div>
                <p className="font-semibold text-gray-800">Translation/notarization of documents</p>
                <p className="text-sm text-gray-600">$100–$300 CAD (if needed)</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-l-4 border-red-500 p-4 rounded">
            <p className="font-semibold text-red-700 mb-2">❌ NEVER pay for:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• "LMIA application fee" to a recruiter</li>
              <li>• "Visa processing fee" before employer is verified</li>
              <li>• "Guarantee of job approval"</li>
              <li>• Any upfront money to a recruiter (except maybe for legitimate services)</li>
            </ul>
          </div>
        </section>

        {/* Red Flags */}
        <section className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span>🚩</span> Red Flags — Don't Proceed If:
          </h2>
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>Asking for upfront payment</strong> before you verify the employer</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>Lots of spelling/grammar errors</strong> in official emails</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>No company website or unclear address</strong> (Google it!)</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>Refusing to let you contact the employer directly</strong></p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>Pushing you to decide immediately</strong> ("Limited spots!")</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>Asking for personal documents (passport, ID) upfront</strong></p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-600 font-bold">•</span>
              <p className="text-gray-800"><strong>Vague about the actual job duties, location, or pay</strong></p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span>✅</span> What to Do Next
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">1. Verify the employer using LMIA Check</p>
              <Link href="/check" className="text-sm text-red-600 hover:text-red-700 font-medium">
                → Go to Verify Offer
              </Link>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">2. Contact the employer directly</p>
              <p className="text-sm text-gray-600">Call, email, or visit their website. Confirm the job offer is real and ask about LMIA status.</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">3. Contact your nearest Canadian embassy/consulate</p>
              <p className="text-sm text-gray-600">Ask about work permit requirements for your specific job and country.</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">4. Consider hiring a licensed immigration consultant</p>
              <p className="text-sm text-gray-600">Look for a Regulated Canadian Immigration Consultant (RCIC) in your country.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-700 mb-1">⚠️ Suspect fraud?</p>
              <p className="text-sm text-gray-700 mb-2">Report to Canada's Employment & Social Development Canada (ESDC):</p>
              <a href="tel:18003675693" className="text-sm font-bold text-red-600 hover:text-red-700">
                📞 1-800-367-5693
              </a>
            </div>
          </div>
        </section>

        {/* April 2026 rule changes */}
        <section className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>📋</span> April 2026 Rule Changes
            </h2>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">New</span>
          </div>
          <p className="text-sm text-gray-500 mb-5">Effective April 1, 2026 — applies to low-wage LMIA positions</p>

          {/* Table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  <th className="text-left font-semibold text-gray-700 px-3 py-2 rounded-tl-lg">Change</th>
                  <th className="text-left font-semibold text-gray-700 px-3 py-2">Before Apr 1</th>
                  <th className="text-left font-semibold text-gray-700 px-3 py-2 rounded-tr-lg">After Apr 1, 2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr className="bg-white">
                  <td className="px-3 py-2.5 text-gray-700 font-medium">Advertising duration</td>
                  <td className="px-3 py-2.5 text-gray-500">4 consecutive weeks</td>
                  <td className="px-3 py-2.5 font-semibold text-amber-800">8 consecutive weeks</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="px-3 py-2.5 text-gray-700 font-medium">Youth recruitment</td>
                  <td className="px-3 py-2.5 text-gray-500">No specific requirement</td>
                  <td className="px-3 py-2.5 font-semibold text-amber-800">Mandatory (ages 15–30)</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2.5 text-gray-700 font-medium">Rural low-wage TFW cap</td>
                  <td className="px-3 py-2.5 text-gray-500">10% of workforce</td>
                  <td className="px-3 py-2.5 font-semibold text-amber-800">Up to 15% (temp, until Mar 2027)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-1">1. Advertising period doubled: 4 weeks → 8 weeks</p>
              <p className="leading-relaxed">Employers must advertise low-wage positions for 8 consecutive weeks before submitting an LMIA — the full 8 weeks must be completed first. If someone promises you a "fast LMIA" for a low-wage position in less time, that is a red flag.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">2. Youth recruitment is now mandatory</p>
              <p className="leading-relaxed">Employers must prove they specifically targeted workers aged 15–30 — via the Job Bank youth section, youth job boards, colleges, or youth employment programs. This is in addition to existing requirements for Indigenous peoples, newcomers, persons with disabilities, and asylum seekers.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">3. Rural low-wage cap raised temporarily: 10% → 15%</p>
              <p className="leading-relaxed">Rural employers (outside census metropolitan areas) in participating provinces can employ up to 15% low-wage TFWs — up from 10% — until March 31, 2027. This requires a formal request from the province or territory and is not a blanket increase.</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Disclaimer:</strong> This guide is for informational purposes only and does not constitute legal or immigration advice. Laws and requirements change. Always verify current information on official Government of Canada websites and consult with a licensed Regulated Canadian Immigration Consultant (RCIC) before making immigration decisions.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  )
}
