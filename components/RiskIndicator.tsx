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
  description,
  children,
}: {
  icon: ReactNode
  iconBg: string
  iconShadow: string
  verdict: string
  verdictColor: string
  employerName: string
  description: ReactNode
  children?: ReactNode
}) {
  return (
    <>
      <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-md ${iconShadow} mb-5`} aria-hidden="true">
        {icon}
      </div>

      <h2 className={`font-bold tracking-tight ${verdictColor} mb-3 leading-none animate-verdict-in`} style={{ fontSize: 'clamp(2.5rem, 8vw, 3.75rem)' }}>
        {verdict}
      </h2>

      <p className="text-base font-semibold text-gray-900 leading-snug break-words mb-2">
        {employerName}
      </p>

      <p className="text-[15px] text-gray-500 leading-relaxed">
        {description}
      </p>

      {children}
    </>
  )
}

export default function RiskIndicator({ result }: Props) {
  const { risk, subtype, reason, ban_end_date, employerQuery } = result

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
          employerName={employerQuery}
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
      description = 'Previously penalised by the Canadian government for Temporary Foreign Worker violations but is currently eligible to hire. Proceed with caution and verify offer details independently.'
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
          employerName={employerQuery}
          description={description}
        />
      </ResultCard>
    )
  }

  if (risk === 'RED') {
    const isBannedTemporary = subtype === 'BANNED_TEMPORARY'
    const verdict = isBannedTemporary ? 'Banned' : 'Penalised'

    let description: ReactNode = ''
    if (isBannedTemporary && ban_end_date) {
      const formatted = new Date(ban_end_date).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
      description = <>Found non-compliant and <span className="font-semibold text-gray-700">banned from hiring</span> temporary foreign workers until <span className="font-semibold text-gray-700">{formatted}</span>. This ban is active.</>
    } else if (isBannedTemporary) {
      description = 'Found non-compliant and banned from hiring temporary foreign workers. This ban is active.'
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
          employerName={employerQuery}
          description={description}
        >
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
        description="Not in the LMIA database. Many legitimate employers file under a different legal or numbered company name, or are too new to appear. This does not automatically mean the offer is fraudulent — follow the steps below to verify."
      />
    </ResultCard>
  )
}
