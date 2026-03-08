import type { VerifyResult } from '@/lib/types'

interface Props {
  result: VerifyResult
}

function EsdcContact() {
  return (
    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs text-gray-600 leading-relaxed">
        If you believe you have been targeted by LMIA fraud, contact ESDC:{' '}
        <a href="tel:18003675693" className="font-bold text-red-600 hover:text-red-800 whitespace-nowrap">
          1-800-367-5693
        </a>
      </p>
    </div>
  )
}

export default function RiskIndicator({ result }: Props) {
  const { risk, subtype, reason, ban_end_date } = result

  if (risk === 'GREEN') {
    return (
      <div
        className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-500 p-5 shadow-sm"
        role="status"
        aria-label="Verification result: Verified"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
            Verified
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1.5">Legitimate employer</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          This employer appears in official Canadian government LMIA records and has not been flagged for violations.
        </p>
      </div>
    )
  }

  if (risk === 'YELLOW') {
    let title = 'Review carefully'
    let message = ''

    if (reason === 'address_mismatch') {
      title = 'Location details don\'t match'
      message =
        'This employer was found in government records but some details do not match your offer. Ask your employer to clarify before paying any fees.'
    } else if (reason === 'pr_only_stream') {
      title = 'Not a TFW position'
      message =
        'This employer was found in government records, but all approved positions are under the Permanent Resident Only stream — not for temporary foreign workers. This offer may not be legitimate for your situation.'
    } else {
      title = 'Previously penalised — now eligible'
      message =
        'This employer was previously penalised by the Canadian government for Temporary Foreign Worker violations but is currently eligible to hire. Proceed with caution and verify all offer details independently.'
    }

    return (
      <div
        className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-400 p-5 shadow-sm"
        role="status"
        aria-label="Verification result: Verify Further"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" aria-hidden="true" />
            Verify Further
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>
    )
  }

  if (risk === 'RED') {
    const isBannedTemporary = subtype === 'BANNED_TEMPORARY'
    const title = isBannedTemporary ? 'Currently banned from hiring' : 'Outstanding unpaid penalty'

    let message = ''
    if (isBannedTemporary && ban_end_date) {
      const formatted = new Date(ban_end_date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      message = `This employer has been found non-compliant by the Canadian government and is BANNED from hiring temporary foreign workers until ${formatted}. Do not pay any fees — this ban is active.`
    } else if (isBannedTemporary) {
      message =
        'This employer has been found non-compliant by the Canadian government and is BANNED from hiring temporary foreign workers. Do not pay any fees. This ban is active.'
    } else {
      message =
        'This employer has an outstanding unpaid monetary penalty issued by the Canadian government and cannot hire temporary foreign workers until it is paid. Do not pay any fees.'
    }

    return (
      <div
        className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-red-600 p-5 shadow-sm"
        role="alert"
        aria-label={`Verification result: ${title}`}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" aria-hidden="true" />
            High Risk
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <EsdcContact />
      </div>
    )
  }

  // GREY — not found
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-400 p-5 shadow-sm"
      role="status"
      aria-label="Verification result: Not Found"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" aria-hidden="true" />
          Not Found
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">No government records found</h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        This employer does not appear in any government LMIA records. This may mean the job offer is fraudulent. Exercise maximum caution and verify independently before paying any fees.
      </p>
      <EsdcContact />
    </div>
  )
}
