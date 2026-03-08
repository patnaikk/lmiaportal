import type { VerifyResult } from '@/lib/types'

interface Props {
  result: VerifyResult
}

export default function RiskIndicator({ result }: Props) {
  const { risk, subtype, reason, ban_end_date } = result

  if (risk === 'GREEN') {
    return (
      <div
        className="rounded-xl p-6 bg-green-50 border-2 border-green-600"
        role="status"
        aria-label="Verification result: Verified"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-green-600 flex-shrink-0" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </span>
          <span className="text-2xl font-bold text-green-700 tracking-wide">VERIFIED</span>
        </div>
        <p className="text-green-800 text-base leading-relaxed">
          This employer appears in official Canadian government LMIA records and has not been flagged for violations.
        </p>
      </div>
    )
  }

  if (risk === 'YELLOW') {
    let message = ''
    if (reason === 'address_mismatch') {
      message =
        'This employer was found in government records but some details do not match your offer. Ask your employer to clarify before paying any fees.'
    } else if (reason === 'pr_only_stream') {
      message =
        'This employer was found in government records, but all approved positions are under the Permanent Resident Only stream — not for temporary foreign workers. This offer may not be legitimate for your situation.'
    } else {
      // prior_violation_now_eligible
      message =
        'This employer was previously penalised by the Canadian government for Temporary Foreign Worker violations but is currently eligible to hire. Proceed with caution and verify all offer details independently.'
    }

    return (
      <div
        className="rounded-xl p-6 bg-yellow-50 border-2 border-yellow-500"
        role="status"
        aria-label="Verification result: Verify Further"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-yellow-600 flex-shrink-0" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <span className="text-2xl font-bold text-yellow-700 tracking-wide">VERIFY FURTHER</span>
        </div>
        <p className="text-yellow-900 text-base leading-relaxed">{message}</p>
      </div>
    )
  }

  if (risk === 'RED') {
    const isBannedTemporary = subtype === 'BANNED_TEMPORARY'
    const title = isBannedTemporary ? 'HIGH RISK — CURRENTLY BANNED' : 'HIGH RISK — OUTSTANDING PENALTY'

    let message = ''
    if (isBannedTemporary && ban_end_date) {
      const formatted = new Date(ban_end_date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      message = `This employer has been found non-compliant by the Canadian government and is BANNED from hiring temporary foreign workers until ${formatted}. Do not pay any fees. This ban is active.`
    } else if (isBannedTemporary) {
      message =
        'This employer has been found non-compliant by the Canadian government and is BANNED from hiring temporary foreign workers. Do not pay any fees. This ban is active.'
    } else {
      message =
        'This employer has an outstanding unpaid monetary penalty issued by the Canadian government and cannot hire temporary foreign workers until it is paid. Do not pay any fees.'
    }

    return (
      <div
        className="rounded-xl p-6 bg-red-50 border-2 border-red-600"
        role="alert"
        aria-label={`Verification result: ${title}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-red-600 flex-shrink-0" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </span>
          <span className="text-2xl font-bold text-red-700 tracking-wide">{title}</span>
        </div>
        <p className="text-red-900 text-base leading-relaxed mb-3">{message}</p>
        {isBannedTemporary && ban_end_date && (
          <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
            Banned until:{' '}
            {new Date(ban_end_date).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        )}
        <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
          <p className="text-red-900 text-sm font-medium">
            If you believe you have been targeted by LMIA fraud, contact ESDC:{' '}
            <a href="tel:18003675693" className="underline font-bold whitespace-nowrap">
              1-800-367-5693
            </a>
          </p>
        </div>
      </div>
    )
  }

  // GREY — not found
  return (
    <div
      className="rounded-xl p-6 bg-gray-50 border-2 border-gray-400"
      role="status"
      aria-label="Verification result: Not Found"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-gray-500 flex-shrink-0" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        <span className="text-2xl font-bold text-gray-700 tracking-wide">NOT FOUND</span>
      </div>
      <p className="text-gray-800 text-base leading-relaxed mb-3">
        This employer does not appear in any government LMIA records. This may mean the offer is fraudulent. Exercise maximum caution.
      </p>
      <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-gray-800 text-sm font-medium">
          If you believe you have been targeted by LMIA fraud, contact ESDC:{' '}
          <a href="tel:18003675693" className="underline font-bold whitespace-nowrap">
            1-800-367-5693
          </a>
        </p>
      </div>
    </div>
  )
}
