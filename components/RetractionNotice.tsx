import type { ViolatorRecord } from '@/lib/types'

interface Props {
  retracted: ViolatorRecord[]
}

function formatLongDate(iso?: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return null
  }
}

/**
 * Shown when ESDC has WITHDRAWN a record we previously held for this employer.
 *
 * The verdict above deliberately ignores these rows — we must not keep
 * accusing an employer the government no longer lists. We still show the
 * withdrawal because people arrive here from older search results, saved
 * links and past newsletters, and a silently vanished penalty reads as a bug.
 * The correction has to be legible as a correction.
 */
export default function RetractionNotice({ retracted }: Props) {
  if (!retracted || retracted.length === 0) return null

  return (
    <div className="mt-4 p-5 bg-gray-50 rounded-2xl">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="9" y1="11" x2="15" y2="17" />
            <line x1="15" y1="11" x2="9" y2="17" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            A previous record for this employer was withdrawn by the government
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {retracted.length === 1 ? 'This record was' : 'These records were'} published on the
            official ESDC non-compliant employer list and later removed from it. Removal usually
            means the decision was rescinded, successfully appealed, or published in error.
            {' '}<strong className="font-semibold text-gray-800">It does not count against this employer</strong>,
            and it is not part of the result above. We show it only because it may have appeared in
            an earlier search or newsletter.
          </p>
          <ul className="mt-3 space-y-2">
            {retracted.map((v) => {
              const decided = formatLongDate(v.decision_date)
              const removed = formatLongDate(v.removed_from_source)
              return (
                <li key={v.id} className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{v.business_operating_name}</span>
                  {v.penalty_amount ? <> · {v.penalty_amount}</> : null}
                  {decided ? <> · decision dated {decided}</> : null}
                  {removed ? <> · withdrawn from the government list by {removed}</> : null}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
