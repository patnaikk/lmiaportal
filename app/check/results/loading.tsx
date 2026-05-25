import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ResultsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Verdict card skeleton */}
        <div className="card-elevated-lg p-7 sm:p-8">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-5" />
          <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-full bg-gray-100 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Secondary card skeleton */}
        <div className="mt-4 card-elevated p-6">
          <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-11/12 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Checking government records…
        </div>
      </main>
      <Footer />
    </div>
  )
}
