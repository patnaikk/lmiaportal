export default function FraudWarningBanner() {
  return (
    <div
      className="w-full bg-red-800 text-white"
      role="alert"
    >
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-start gap-2">
        <span className="flex-shrink-0 text-base" aria-hidden="true">🚨</span>
        <p className="text-xs leading-relaxed">
          <span className="font-bold">LMIA Fraud Warning:</span> Legitimate employers never charge
          workers for an LMIA or job offer. If you paid for your LMIA,{' '}
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/services/protect-fraud.html"
            className="underline font-semibold hover:text-red-200 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            report it to IRCC
          </a>{' '}
          and contact a regulated immigration consultant immediately.
        </p>
      </div>
    </div>
  )
}
