import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* ESDC tip line */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>Report LMIA fraud to ESDC:</strong>{' '}
            <a href="tel:18003675693" className="font-bold text-blue-700 hover:text-blue-900">
              1-800-367-5693
            </a>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 leading-relaxed">
          This tool is for informational purposes only and does not constitute legal or immigration advice.
          Results are based on publicly available Government of Canada data published by Employment and Social
          Development Canada (ESDC) and may not reflect the current status of any employer. A positive result
          does not guarantee a job offer is legitimate. Always seek advice from a licensed Regulated Canadian
          Immigration Consultant (RCIC) before making immigration decisions. This portal is not affiliated with
          the Government of Canada.
        </p>

        {/* Attribution + links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
          <span>
            Data:{' '}
            <a
              href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/reports/employers.html"
              className="underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              ESDC Positive LMIA List
            </a>
            {' '}·{' '}
            <a
              href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/report/non-compliant.html"
              className="underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Non-Compliant Employers
            </a>
          </span>
          <Link href="/about" className="underline hover:text-gray-600">
            About
          </Link>
          <Link href="/updates" className="underline hover:text-gray-600">
            What's new
          </Link>
        </div>
      </div>
    </footer>
  )
}
