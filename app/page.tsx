import Link from 'next/link'
import SearchForm from '@/components/SearchForm'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Nav */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</span>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">About</Link>
            <Link href="/updates" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">What's new</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-red-50 text-center pt-10 pb-7 px-4">
        <div className="text-4xl mb-3">🇨🇦</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Got a Canadian job offer?<br />
          <em className="not-italic text-red-600">Check the employer first.</em>
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Charging workers for LMIAs or job offers is illegal in Canada. Verify any employer against official government records — free, in 10 seconds.
        </p>
      </div>

      {/* Stats bar */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="grid grid-cols-3 divide-x divide-gray-200 border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <div className="py-3 text-center">
            <div className="text-xl font-extrabold text-red-600 leading-tight">11K+</div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">Employers</div>
          </div>
          <div className="py-3 text-center">
            <div className="text-xl font-extrabold text-red-600 leading-tight">1,262</div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">Violators tracked</div>
          </div>
          <div className="py-3 text-center">
            <div className="text-xl font-extrabold text-red-600 leading-tight">Free</div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">Always</div>
          </div>
        </div>
      </div>

      {/* Search card */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-md">
          <SearchForm />
          <p className="text-center text-xs text-gray-400 mt-4">🔒 No data stored · No login required</p>
        </div>
      </main>

      {/* How it works */}
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
            <div className="text-2xl flex-shrink-0">🔍</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">1. Type the employer name</p>
              <p className="text-xs text-gray-500 mt-0.5">From your job offer or recruitment message</p>
            </div>
          </div>
          <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
            <div className="text-2xl flex-shrink-0">📋</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">2. We check government records</p>
              <p className="text-xs text-gray-500 mt-0.5">Official ESDC data — updated quarterly</p>
            </div>
          </div>
          <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:text-center">
            <div className="text-2xl flex-shrink-0">🛡️</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">3. Get a clear result</p>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="text-green-600 font-medium">GREEN</span> = approved &nbsp;
                <span className="text-red-600 font-medium">RED</span> = banned &nbsp;
                <span className="text-gray-500 font-medium">GREY</span> = not found
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
          No signup. No tracking. No ads. Uses publicly available Government of Canada data.
        </p>
      </div>

      <Footer />
    </div>
  )
}
