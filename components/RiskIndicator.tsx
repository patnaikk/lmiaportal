import type { ReactNode } from 'react'
import type { VerifyResult } from '@/lib/types'
import RedCTA from '@/components/RedCTA'

interface Props {
  result: VerifyResult
}


function ResultCard({
  role,
  ariaLabel,
  children,
}: {
  role?: string
  ariaLabel?: string
  children: ReactNode
}) {
  return (
    <div
      className="card-elevated-lg p-7 sm:p-8"
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}

function VerdictLayout({
  icon,
  iconBg,
  iconShadow,
  verdict,
  verdictColor,
  employerName,
  searchQuery,
  nameLabel = 'Matched record',
  officialStatus,
  description,
  children,
}: {
  icon: ReactNode
  iconBg: string
  iconShadow: string
  verdict: string
  verdictColor: string
  employerName: string
  searchQuery?: string
  nameLabel?: string
  officialStatus?: string
  description: ReactNode
  children?: ReactNode
}) {
  // Show the "you searched" line only when the matched record name differs
  // from what the user typed (e.g. searched "Indian" → matched "Indian Spice Ltd.").
  const showSearchLine =
    searchQuery &&
    employerName &&
    searchQuery.trim().toLowerCase() !== employerName.trim().toLowerCase()

  return (
    <>
      <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-md ${iconShadow} mb-5`} aria-hidden="true">
        {icon}
      </div>

      <h2 className={`font-bold tracking-tight ${verdictColor} mb-3 leading-tight break-words animate-verdict-in`} style={{ fontSize: 'clamp(1.6rem, 8vw, 3.75rem)' }}>
        {verdict}
      </h2>

      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {nameLabel}
      </p>
      <p className="text-xl font-bold text-gray-900 leading-snug break-words mb-1.5">
        {employerName}
      </p>

      {showSearchLine && (
        <p className="text-xs text-gray-500 mb-2.5">
          for your search &ldquo;<span className="font-medium text-gray-700">{searchQuery}</span>&rdquo;
        </p>
      )}

      {officialStatus && (
        <p className="text-xs text-gray-500 mb-3">
          Official ESDC status:{' '}
          <span className="font-semibold text-gray-700">&ldquo;{officialStatus}&rdquo;</span>
        </p>
      )}

      <p className="text-[15px] text-gray-500 leading-relaxed">
        {description}
      </p>

      {children}
    </>
  )
}

export default function RiskIndicator({ result }: Props) {
  const { risk, subtype, reason, ban_end_date, employerQuery } = result

  // The name we show in the verdict card must be the matched GOVERNMENT RECORD
  // name, not the raw search term. Searching "Indian" must not render as
  // "Indian — Penalised"; it must render the actual matched business name.
  const matchedName =
    result.violatorMatches[0]?.business_operating_name ||
    result.positiveMatches[0]?.employer_name ||
    employerQuery

  // The verbatim status string from the official ESDC record (e.g.
  // "Ineligible - unpaid monetary penalty"). Quoted and attributed under the
  // verdict so our plain-language label reads as a summary of a public record,
  // not an allegation we are making.
  const officialStatus = result.violatorMatches[0]?.status_raw?.trim() || undefined

  if (risk === 'GREEN') {
    return (
      <ResultCard role="status" ariaLabel="Verification result: Verified">
        <VerdictLayout
          verdict="Verified"
          verdictColor="text-green-600"
          iconBg="bg-green-500"
          iconShadow="shadow-green-200"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
          employerName={matchedName}
          searchQuery={employerQuery}
          description="Appears in official Canadian government LMIA records and has not been flagged for violations."
        />
      </ResultCard>
    )
  }

  if (risk === 'YELLOW') {
    let verdict = 'Caution'
    let description: ReactNode = ''

    if (reason === 'address_mismatch') {
      description = 'Found in government records, but the LMIA on file is for a different location than the one you specified. Confirm directly with the employer before proceeding.'
    } else if (reason === 'pr_only_stream') {
      verdict = 'Wrong stream'
      description = 'All approved LMIAs for this employer are under the Permanent Resident stream — not for temporary foreign workers. An offer claiming to be a TFW LMIA may not be legitimate.'
    } else {
      description = 'Previously found non-compliant with the Temporary Foreign Worker Program but is currently eligible to hire temporary foreign workers. Proceed with caution and verify offer details independently.'
    }

    return (
      <ResultCard role="status" ariaLabel="Verification result: Caution">
        <VerdictLayout
          verdict={verdict}
          verdictColor="text-amber-500"
          iconBg="bg-amber-400"
          iconShadow="shadow-amber-200"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }
          employerName={matchedName}
          searchQuery={employerQuery}
          officialStatus={officialStatus}
          description={description}
        >
          <p className="text-xs text-gray-400 leading-relaxed mt-3">
            Status shown reflects the official Government of Canada (ESDC) record as published; it is
            reproduced as-is and may not reflect the employer&rsquo;s current status. Confirm directly
            with the employer and Service Canada.
          </p>
        </VerdictLayout>
      </ResultCard>
    )
  }

  if (risk === 'RED') {
    const isBannedTemporary = subtype === 'BANNED_TEMPORARY'
    const verdict = isBannedTemporary ? 'Ineligible to Hire' : 'Non-Compliant'

    let description: ReactNode = ''
    if (isBannedTemporary && ban_end_date) {
      const formatted = new Date(ban_end_date).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
      description = <>Found non-compliant and <span className="font-semibold text-gray-700">ineligible to hire</span> temporary foreign workers until <span className="font-semibold text-gray-700">{formatted}</span>. This ineligibility is active.</>
    } else if (isBannedTemporary) {
      description = 'Found non-compliant and ineligible to hire temporary foreign workers. This ineligibility is active.'
    } else {
      description = 'Has an outstanding unpaid monetary penalty from the Canadian government and cannot hire temporary foreign workers until it is paid.'
    }

    return (
      <ResultCard role="alert" ariaLabel={`Verification result: ${verdict}`}>
        <VerdictLayout
          verdict={verdict}
          verdictColor="text-red-600"
          iconBg="bg-red-500"
          iconShadow="shadow-red-200"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          }
          employerName={matchedName}
          searchQuery={employerQuery}
          officialStatus={officialStatus}
          description={description}
        >
          <p className="text-xs text-gray-400 leading-relaxed mt-3">
            Status shown reflects the official Government of Canada (ESDC) non-compliant
            employers record as published; it is reproduced as-is and may not reflect the
            employer&rsquo;s current status. See details below.
          </p>
          <RedCTA />
        </VerdictLayout>
      </ResultCard>
    )
  }

  // GREY — not found
  return (
    <ResultCard role="status" ariaLabel="Verification result: Not Found">
      <VerdictLayout
        verdict="Not found"
        verdictColor="text-gray-400"
        iconBg="bg-gray-200"
        iconShadow="shadow-gray-200"
        icon={
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        }
        employerName={employerQuery}
        nameLabel="You searched for"
        description="Not in the LMIA database. Many legitimate employers file under a different legal or numbered company name, or are too new to appear. This does not automatically mean the offer is fraudulent — follow the steps below to verify."
      />
    </ResultCard>
  )
}
