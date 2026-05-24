import Link from 'next/link'

export default function CICCWidget() {
  return (
    <div className="mt-4 p-5 sm:p-6 card-elevated">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Is your consultant licensed?</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Only regulated consultants (RCICs) and lawyers can legally charge fees for immigration help in Canada.
            Unlicensed "consultants" are a top fraud vector.
          </p>
        </div>
      </div>

      {/* How-to steps */}
      <ol className="space-y-2 mb-4">
        {[
          { n: '1', text: 'Ask your consultant for their RCIC registration number (format: R###### or 6 digits).' },
          { n: '2', text: 'Open the CICC public registry below and search by name or registration number.' },
          { n: '3', text: 'If they don\'t appear — or refuse to give a number — stop all contact immediately.' },
        ].map(({ n, text }) => (
          <li key={n} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
              {n}
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
          </li>
        ))}
      </ol>

      <a
        href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors"
      >
        Search CICC registry (official) →
      </a>

      <p className="text-[11px] text-gray-400 mt-3">
        Licensed representatives also include immigration lawyers — verify them at{' '}
        <a
          href="https://lso.ca/public-resources/finding-a-lawyer-or-paralegal"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Law Society of Ontario
        </a>{' '}
        or your province&apos;s law society.
      </p>
    </div>
  )
}
