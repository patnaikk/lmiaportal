import Link from 'next/link'
import SearchForm from '@/components/SearchForm'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">LMIA Check</h1>
            <p className="text-xs text-gray-500 mt-0.5">Verify a Canadian employer before you pay</p>
          </div>
          <nav>
            <Link
              href="/about"
              className="text-sm text-blue-700 hover:text-blue-900 underline"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Brief explanation */}
        <div className="mb-8">
          <p className="text-gray-700 text-base leading-relaxed mb-2">
            Foreign workers are targeted by fraud — fake recruiters charge $5,000–$20,000 CAD for job offers that don&apos;t exist.
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-2">
            This tool checks the Canadian government&apos;s official database to verify whether an employer has a legitimate LMIA — the approval required to hire foreign workers.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            Enter the employer name from your job offer below. The check is free and takes seconds.
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SearchForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
