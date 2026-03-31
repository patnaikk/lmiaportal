import Link from 'next/link'
import { verifyEmployer } from '@/lib/verify'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: {
    employer?: string
    province?: string
    job_title?: string
    wage?: string
    wage_period?: string
    offer_months?: string
    lmia_months?: string
    fee?: string
    delivery?: string
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const employer = searchParams.employer || ''
  return {
    title: employer ? `${employer} — LMIA offer check` : 'Offer check — LMIA Check',
  }
}

// ── Scoring ────────────────────────────────────────────────────────────────

type Severity = 'red' | 'yellow' | 'green'

interface Flag {
  severity: Severity
  title: string
  detail: string
  action: string
  actionUrl?: string
}

type TrafficLight = 'red' | 'yellow' | 'green'

function computeResult(flags: Flag[]): TrafficLight {
  const reds = flags.filter((f) => f.severity === 'red').length
  const yellows = flags.filter((f) => f.severity === 'yellow').length
  if (reds > 0) return 'red'
  if (yellows >= 2) return 'red'
  if (yellows === 1) return 'yellow'
  return 'green'
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CheckResultsPage({ searchParams }: PageProps) {
  const employer = (searchParams.employer || '').trim()
  const province = searchParams.province || undefined
  const jobTitle = searchParams.job_title || ''
  const wage = searchParams.wage || ''
  const wagePeriod = searchParams.wage_period || 'hourly'
  const offerMonths = searchParams.offer_months ? parseInt(searchParams.offer_months, 10) : null
  const lmiaMonths = searchParams.lmia_months ? parseInt(searchParams.lmia_months, 10) : null
  const fee = searchParams.fee || ''
  const delivery = searchParams.delivery || ''

  if (!employer) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-white border-b-[3px] border-red-600">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          </div>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <p className="text-gray-600">Please fill in the form to run a check.</p>
          <Link href="/check" className="mt-4 inline-block text-red-600 underline font-medium">← Back to checker</Link>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Run employer database checks ─────────────────────────────────────────
  const employerResult = await verifyEmployer(employer, undefined, province)

  // ── Build flags ───────────────────────────────────────────────────────────
  const flags: Flag[] = []

  // Check 1 — Employer on non-compliant list
  if (employerResult.risk === 'RED') {
    const v = employerResult.violatorMatches?.[0]
    flags.push({
      severity: 'red',
      title: 'Employer is on the government non-compliant list',
      detail: v
        ? `${v.business_operating_name} has been found non-compliant with TFWP rules${v.compliance_status === 'INELIGIBLE_UNTIL' ? ` and is banned until ${v.ineligible_until_date}` : ''}. Reasons: ${v.reasons || 'see details below'}.`
        : 'This employer appears on the official ESDC non-compliant employer list.',
      action: 'Do not proceed. Contact IRCC or a licensed consultant before taking any steps.',
      actionUrl: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers/report-abuse.html',
    })
  }

  // Check 2 — Employer has past violation but now eligible
  if (employerResult.risk === 'YELLOW' && employerResult.reason === 'prior_violation_now_eligible') {
    flags.push({
      severity: 'yellow',
      title: 'Employer has a past violation on record',
      detail: 'This employer was previously found non-compliant but has since served their penalty and is now eligible to hire again. Proceed with extra caution.',
      action: 'Ask the employer for written confirmation of their current TFWP standing.',
    })
  }

  // Check 2b — Employer only has Permanent Resident stream LMIAs (not for TFWs)
  if (employerResult.risk === 'YELLOW' && employerResult.reason === 'pr_only_stream') {
    flags.push({
      severity: 'yellow',
      title: "Employer's LMIAs are for Permanent Residents only — not TFWs",
      detail: 'This employer was found in government records, but all their approved LMIAs are under the Permanent Resident Only stream. This type of LMIA cannot be used by temporary foreign workers. An offer claiming to be an LMIA for a TFW from this employer may be fraudulent.',
      action: 'Ask the employer to provide the LMIA number and confirm it is under the Temporary Foreign Worker Program stream, not the Permanent Resident stream.',
    })
  }

  // Check 3 — Employer not found in positive LMIA list
  if (employerResult.risk === 'GREY') {
    flags.push({
      severity: 'yellow',
      title: 'Employer not found in government LMIA records',
      detail: 'This employer does not appear in the positive LMIA dataset. This could mean the employer is new, filed under a different legal name, or has never obtained an LMIA.',
      action: 'Ask the employer to provide the legal name on their LMIA and search again. You can also try the numbered company name from your T4 or contract.',
    })
  }

  // Check 4 — Province mismatch
  if (employerResult.risk === 'YELLOW' && employerResult.reason === 'address_mismatch') {
    flags.push({
      severity: 'yellow',
      title: 'Employer province does not match LMIA records',
      detail: `This employer exists in government records, but the LMIA on file is for a different province than ${province || 'the one you specified'}. Scammers sometimes copy real employer names — verify you have the right company.`,
      action: 'Confirm the employer address directly with the company before proceeding.',
    })
  }

  // Check 5 — Fee charged (illegal)
  if (fee === 'yes') {
    flags.push({
      severity: 'red',
      title: 'A fee was charged — this is illegal',
      detail: 'Charging workers for LMIAs or job offers is illegal under Canadian law. Anyone asking you to pay for an LMIA is either scamming you or breaking the law.',
      action: 'Report this immediately to the Canadian Anti-Fraud Centre (1-888-495-8501) and IRCC.',
      actionUrl: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers/report-abuse.html',
    })
  }

  if (fee === 'unsure') {
    flags.push({
      severity: 'yellow',
      title: 'Unclear whether a fee was requested',
      detail: 'Any payment for an LMIA or job placement — whether called a "processing fee", "deposit", or "administrative cost" — is illegal.',
      action: 'If any payment was requested or implied, treat this as a serious red flag and do not pay.',
    })
  }

  // Check 6 — Delivery: received from recruiter or consultant only
  if (delivery === 'recruiter') {
    flags.push({
      severity: 'yellow',
      title: 'Offer received from a recruiter, not the employer directly',
      detail: 'Receiving an LMIA document from a recruiter without direct contact with the employer is a warning sign. Legitimate employers are the ones who apply for LMIAs — not recruiters.',
      action: 'Contact the employer directly to confirm the offer is genuine before proceeding.',
    })
  }

  if (delivery === 'consultant') {
    flags.push({
      severity: 'yellow',
      title: 'Offer received through an immigration consultant',
      detail: 'LMIAs are issued to employers, not consultants. A consultant passing you an LMIA without you being able to verify it with the employer directly is a red flag.',
      action: 'Verify the consultant is licensed (CICC registry) and confirm the offer directly with the employer.',
      actionUrl: 'https://college-ic.ca/protecting-the-public/find-an-immigration-consultant',
    })
  }

  // Check 7 — Duration mismatch
  if (offerMonths !== null && lmiaMonths !== null && offerMonths !== lmiaMonths) {
    flags.push({
      severity: 'yellow',
      title: `Duration mismatch: ${offerMonths}-month offer vs ${lmiaMonths}-month LMIA`,
      detail: 'The duration on your job offer letter differs from the duration stated on the LMIA document. These should match. Inconsistencies are a known red flag in fraudulent LMIAs.',
      action: 'Ask the employer to clarify and provide written documentation explaining the discrepancy.',
    })
  }

  // ── Overall result ────────────────────────────────────────────────────────
  const overall = computeResult(flags)

  const trafficLight: Record<TrafficLight, { emoji: string; label: string; bg: string; border: string; text: string; sub: string }> = {
    green: {
      emoji: '🟢',
      label: 'Low concern',
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      sub: 'No red flags detected. This does not confirm the LMIA is authentic — verify directly with Service Canada or your employer before submitting any application.',
    },
    yellow: {
      emoji: '🟡',
      label: 'Some concerns',
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      sub: 'One or more caution flags were found. Review each flag below before proceeding.',
    },
    red: {
      emoji: '🔴',
      label: 'Serious concerns',
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-900',
      sub: 'One or more serious red flags were detected. Do not submit any application or pay any fee until you have verified this offer through official channels.',
    },
  }

  const tl = trafficLight[overall]

  const provinceNames: Record<string, string> = {
    AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
    NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island',
    QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
  }

  const wagePeriodLabel: Record<string, string> = {
    hourly: '/hr', monthly: '/mo', annually: '/yr',
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">FAQ</Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">About</Link>
            <Link href="/updates" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">What&apos;s new</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">

        {/* Back + summary */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Link
            href="/check"
            className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Check again
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">
            <strong className="text-gray-900">{employer}</strong>
            {province && <>, {provinceNames[province] || province}</>}
            {jobTitle && <> · {jobTitle}</>}
          </span>
        </div>

        {/* Traffic light card */}
        <div className={`rounded-2xl border-2 ${tl.border} ${tl.bg} p-5 mb-5`}>
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none mt-0.5" aria-hidden="true">{tl.emoji}</span>
            <div>
              <p className={`text-xl font-extrabold ${tl.text}`}>{tl.label}</p>
              <p className={`text-sm mt-1 leading-relaxed ${tl.text} opacity-80`}>{tl.sub}</p>
            </div>
          </div>

          {/* Offer summary chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {wage && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700 font-medium">
                💰 ${wage}{wagePeriodLabel[wagePeriod] || ''}
              </span>
            )}
            {offerMonths && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700 font-medium">
                📅 {offerMonths}-month offer
              </span>
            )}
            {lmiaMonths && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700 font-medium">
                📋 {lmiaMonths}-month LMIA
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border text-xs font-medium ${
              fee === 'yes' ? 'border-red-300 text-red-700' : 'border-gray-200 text-gray-700'
            }`}>
              {fee === 'yes' ? '⚠️ Fee charged' : fee === 'no' ? '✅ No fee' : '❓ Fee unclear'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border text-xs font-medium ${
              delivery === 'employer' ? 'border-gray-200 text-gray-700' : 'border-yellow-300 text-yellow-800'
            }`}>
              {delivery === 'employer' ? '✅ From employer' :
               delivery === 'recruiter' ? '⚠️ Via recruiter' :
               delivery === 'consultant' ? '⚠️ Via consultant' : '❓ Source unclear'}
            </span>
          </div>
        </div>

        {/* Flags */}
        {flags.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
            <p className="text-sm font-semibold text-green-900 mb-1">All checks passed</p>
            <p className="text-sm text-green-800 leading-relaxed">
              No red flags were detected based on the information you provided. Remember: this tool checks publicly available records only. Always confirm your offer directly with the employer and contact Service Canada if you have any doubts.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {flags.length} flag{flags.length !== 1 ? 's' : ''} found
            </h2>
            {flags.map((flag, i) => (
              <div
                key={i}
                className={`rounded-xl border-l-4 p-4 ${
                  flag.severity === 'red'
                    ? 'border-l-red-500 bg-red-50'
                    : 'border-l-yellow-400 bg-yellow-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5" aria-hidden="true">
                    {flag.severity === 'red' ? '🔴' : '🟡'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${flag.severity === 'red' ? 'text-red-900' : 'text-yellow-900'}`}>
                      {flag.title}
                    </p>
                    <p className={`text-sm mt-1 leading-relaxed ${flag.severity === 'red' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {flag.detail}
                    </p>
                    <div className={`mt-2.5 text-xs font-semibold uppercase tracking-wide ${flag.severity === 'red' ? 'text-red-700' : 'text-yellow-700'}`}>
                      What to do
                    </div>
                    <p className={`text-sm mt-0.5 leading-relaxed ${flag.severity === 'red' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {flag.action}
                    </p>
                    {flag.actionUrl && (
                      <a
                        href={flag.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold underline ${flag.severity === 'red' ? 'text-red-700 hover:text-red-900' : 'text-yellow-700 hover:text-yellow-900'}`}
                      >
                        Official link →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employer match details (if found in positive list) */}
        {employerResult.positiveMatches.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Employer found in government records</h2>
            <div className="space-y-2">
              {employerResult.positiveMatches.slice(0, 3).map((m, i) => (
                <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-gray-800">{m.employer_name}</span>
                  {m.address && <> · {m.address}</>}
                  {m.province && <> · {m.province}</>}
                  {m.occupation_title && <> · {m.occupation_title}</>}
                  {m.program_stream && <> · <span className="text-blue-700">{m.program_stream}</span></>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google search link */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Verify employer web presence</h2>
          <p className="text-xs text-gray-500 mb-3">Does a real business come up? Look for a working website, reviews, and a physical address.</p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(employer + (province ? ' ' + province : ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search &ldquo;{employer}{province ? ` ${province}` : ''}&rdquo; on Google
          </a>
        </div>

        {/* Key resources */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Useful resources</h2>
          <div className="space-y-2 text-sm">
            <a href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/report-abuse.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline">
              <span>📞</span> Report TFWP abuse — ESDC
            </a>
            <a href="https://www.antifraudcentre-centreantifraude.ca/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline">
              <span>🚨</span> Canadian Anti-Fraud Centre (1-888-495-8501)
            </a>
            <a href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline">
              <span>🔎</span> Verify a licensed immigration consultant (CICC)
            </a>
          </div>
        </div>

        {/* Share prompt */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-center">
          <p className="text-sm font-semibold text-gray-800 mb-1">Share this result</p>
          <p className="text-xs text-gray-500 mb-3">The page URL contains your check — copy and share it with your community or a consultant.</p>
          <p className="text-xs text-gray-400 font-mono break-all">{`lmiacheck.ca/check/results?employer=${encodeURIComponent(employer)}…`}</p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Results are based on publicly available Government of Canada data and user-provided information. This tool does not access real-time ESDC systems and cannot confirm or deny the authenticity of any specific LMIA. When in doubt, contact Service Canada directly.
        </p>

      </main>

      <Footer />
    </div>
  )
}
