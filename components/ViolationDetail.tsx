import type { ViolatorRecord } from '@/lib/types'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

interface Props {
  violators: ViolatorRecord[]
}

export default function ViolationDetail({ violators }: Props) {
  if (!violators || violators.length === 0) return null

  const v = violators[0]
  const reasonCodes = expandViolationReasons(v.reasons)
  const hasReason9 = reasonCodes.includes(9)

  const statusLabel = () => {
    switch (v.compliance_status) {
      case 'ELIGIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold border border-yellow-300">
            <span aria-hidden="true">🟡</span> ELIGIBLE (previously penalised, now allowed to hire)
          </span>
        )
      case 'INELIGIBLE_UNTIL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold border border-red-300">
            <span aria-hidden="true">🔴</span>{' '}
            INELIGIBLE UNTIL{' '}
            {v.ineligible_until_date
              ? new Date(v.ineligible_until_date).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '(date not specified)'}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold border border-red-300">
            <span aria-hidden="true">🔴</span> INELIGIBLE — UNPAID PENALTY
          </span>
        )
    }
  }

  const hasDistinctLegalName =
    v.business_legal_name &&
    v.business_legal_name.toLowerCase().trim() !== v.business_operating_name?.toLowerCase().trim()

  return (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Government Violation Record
        </h2>
      </div>
      <div className="p-5 space-y-4">
        {/* Employer name — always shown first so user can confirm which record was matched */}
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Matched Employer</span>
          <p className="text-base font-bold text-gray-900 leading-snug">
            {v.business_operating_name}
          </p>
          {hasDistinctLegalName && (
            <p className="text-sm text-gray-500 mt-0.5">
              Legal: <span className="font-medium text-gray-700">{v.business_legal_name}</span>
              {v.province && <span className="text-gray-400"> · {v.province}</span>}
            </p>
          )}
          {!hasDistinctLegalName && v.province && (
            <p className="text-sm text-gray-400 mt-0.5">{v.province}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Compliance Status</span>
          {statusLabel()}
        </div>

        {/* Decision date */}
        {v.decision_date && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Date of Government Decision</span>
            <span className="text-sm text-gray-900">
              {new Date(v.decision_date).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Penalty */}
        {v.penalty_amount && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Monetary Penalty</span>
            <span className="text-lg font-bold text-gray-900">{v.penalty_amount}</span>
            {v.ban_duration && (
              <span className="ml-2 text-sm text-gray-600">+ {v.ban_duration}</span>
            )}
          </div>
        )}

        {/* Active ban date */}
        {v.compliance_status === 'INELIGIBLE_UNTIL' && v.ineligible_until_date && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm font-bold text-red-800">
              Banned until:{' '}
              {new Date(v.ineligible_until_date).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Reason 9 callout */}
        {hasReason9 && (
          <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg">
            <p className="text-sm font-semibold text-orange-900">
              ⚠ This employer was specifically found to have misrepresented pay or working conditions. This is one of the most common violations affecting foreign workers directly.
            </p>
          </div>
        )}

        {/* Violation reasons */}
        {reasonCodes.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Violations Found</span>
            <ol className="space-y-2">
              {reasonCodes.map((code) => (
                <li key={code} className="flex gap-2 text-sm text-gray-800">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                    {code}
                  </span>
                  <span className="leading-relaxed">{VIOLATION_CODES[code] ?? `Violation code ${code}`}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
