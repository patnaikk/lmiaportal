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
      { icon: '✓', text: 'Use a licensed RCIC (Regulated Canadian Immigration Consultant) or immigration lawyer for your application' },
    ]
  } else if (risk === 'YELLOW' && reason === 'address_mismatch') {
    steps = [
      { icon: '⚠', text: 'Contact the employer directly using contact information you find independently (not from the offer letter)' },
      { icon: '⚠', text: 'Ask them to confirm their LMIA number and address match what is on your offer' },
      { icon: '⚠', text: 'Confirm all offer details before proceeding with your application' },
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
      { icon: '⚠', text: 'Ask them to show you their LMIA approval letter confirming the correct stream for your position' },
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
    title = 'Employer not found — here\'s what to do'
    steps = [
      {
        icon: '1',
        text: (
          <>
            <strong>Search by legal name.</strong> Your offer letter may use a trade name, but the LMIA is filed under the legal name. Check your T4, pay stub, or the signature line of your contract for a numbered company name (e.g.{' '}
            <span className="font-mono text-xs bg-gray-100 px-1 rounded">1234567 BC Ltd.</span>) and search again.
          </>
        ),
      },
      {
        icon: '2',
        text: (
          <>
            <strong>Ask the employer for their LMIA number.</strong> A legitimate employer will provide this immediately — it looks like{' '}
            <span className="font-mono text-xs bg-gray-100 px-1 rounded">123456-A</span>. If they hesitate or refuse, that is a serious red flag.
          </>
        ),
      },
      {
        icon: '3',
        text: (
          <>
            <strong>Call Service Canada to verify directly.</strong>{' '}
            <a href="tel:18003675693" className="font-bold underline text-blue-700">
              1-800-367-5693
            </a>{' '}
            — ask them to confirm whether an LMIA was approved for this employer and your specific job. This is free and takes a few minutes.
          </>
        ),
      },
      {
        icon: '4',
        text: (
          <>
            <strong>Check if the business is registered.</strong>{' '}
            <a
              href="https://www.ic.gc.ca/app/scr/cc/CorporationsCanada/fdrlCrpSrch.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-blue-700"
            >
              Search the federal business registry →
            </a>{' '}
            A real Canadian employer will appear here or in their province&apos;s registry.
          </>
        ),
      },
      {
        icon: '5',
        text: (
          <>
            <strong>If Service Canada cannot confirm the LMIA exists</strong> for this employer and job, stop all contact and report it to the{' '}
            <a href="tel:18884958501" className="font-bold underline text-blue-700">Canadian Anti-Fraud Centre (1-888-495-8501)</a>.
          </>
        ),
      },
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
