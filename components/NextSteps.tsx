import type { VerifyResult } from '@/lib/types'

interface Props {
  result: VerifyResult
}

interface Step {
  icon: string
  text: string | React.ReactNode
}

export default function NextSteps({ result }: Props) {
  const { risk, subtype, reason, ban_end_date } = result

  let steps: Step[] = []
  let title = 'What to do next'

  if (risk === 'GREEN') {
    steps = [
      { icon: '✓', text: 'Request a copy of the LMIA approval letter from your employer' },
      { icon: '✓', text: 'Use a licensed RCIC (Regulated Canadian Immigration Consultant) to process your application' },
      { icon: '✓', text: 'Never pay fees directly to a recruiter — fees should only go to licensed consultants' },
    ]
  } else if (risk === 'YELLOW' && reason === 'address_mismatch') {
    steps = [
      { icon: '⚠', text: 'Contact the employer directly using contact information you find independently (not from the offer letter)' },
      { icon: '⚠', text: 'Ask them to confirm their LMIA number and address match what is on your offer' },
      { icon: '⚠', text: 'Do not pay any fees until details are confirmed' },
    ]
  } else if (risk === 'YELLOW' && reason === 'prior_violation_now_eligible') {
    steps = [
      { icon: '⚠', text: 'This employer has a history of non-compliance with the Temporary Foreign Worker Program' },
      { icon: '⚠', text: 'Review the violation details shown — understand what rule they broke and when' },
      { icon: '⚠', text: 'Contact the employer directly to verify all offer details independently' },
      { icon: '⚠', text: 'Consider consulting a licensed RCIC before proceeding' },
    ]
  } else if (risk === 'YELLOW' && reason === 'pr_only_stream') {
    steps = [
      { icon: '⚠', text: 'The government records for this employer only cover Permanent Resident positions — not temporary foreign workers' },
      { icon: '⚠', text: 'Contact the employer directly using independently verified contact information' },
      { icon: '⚠', text: 'Ask them to show you their LMIA approval letter for your specific position' },
      { icon: '⚠', text: 'Do not pay any fees until the correct LMIA stream is confirmed' },
    ]
  } else if (risk === 'RED' && subtype === 'BANNED_TEMPORARY') {
    const banDate = ban_end_date
      ? new Date(ban_end_date).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'an active date'
    steps = [
      {
        icon: '✕',
        text: `This employer is BANNED from hiring temporary workers until ${banDate} — any offer is illegitimate`,
      },
      { icon: '✕', text: 'Do not pay any fees to this employer or recruiter under any circumstances' },
      {
        icon: '✕',
        text: (
          <>
            Report this offer to ESDC:{' '}
            <a href="tel:18003675693" className="font-bold underline">
              1-800-367-5693
            </a>
          </>
        ),
      },
      { icon: '✕', text: 'Contact a licensed RCIC or legal aid for advice' },
    ]
  } else if (risk === 'RED') {
    steps = [
      { icon: '✕', text: 'This employer has an outstanding government penalty and cannot legally hire temporary workers' },
      { icon: '✕', text: 'Do not pay any fees to this employer or recruiter under any circumstances' },
      {
        icon: '✕',
        text: (
          <>
            Report this offer to ESDC:{' '}
            <a href="tel:18003675693" className="font-bold underline">
              1-800-367-5693
            </a>
          </>
        ),
      },
      { icon: '✕', text: 'Contact a licensed RCIC or legal aid for advice' },
    ]
  } else {
    // GREY
    steps = [
      { icon: '?', text: 'Do not pay any fees until you have independently verified this employer exists' },
      {
        icon: '?',
        text: (
          <>
            Call ESDC at{' '}
            <a href="tel:18003675693" className="font-bold underline">
              1-800-367-5693
            </a>{' '}
            to ask them to verify the employer
          </>
        ),
      },
      { icon: '?', text: 'Search the employer name on the Canada Revenue Agency Business Registry' },
    ]
  }

  const iconColor = {
    GREEN: 'text-green-700',
    YELLOW: 'text-yellow-700',
    RED: 'text-red-700',
    GREY: 'text-gray-600',
  }[risk]

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{title}</h2>
      <ul className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${iconColor}`}
              aria-hidden="true"
            >
              {step.icon}
            </span>
            <span className="text-sm text-gray-800 leading-relaxed">{step.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
