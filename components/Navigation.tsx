import Link from 'next/link'

interface NavigationProps {
  currentPage?: 'home' | 'check' | 'guide' | 'faq' | 'about' | 'updates'
}

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 tracking-tight hover:text-gray-600 transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/canada-flag.svg" alt="Canada flag" width="28" height="14" style={{display:'block'}} />
          LMIA Check
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/check"
            className="text-sm text-white bg-gray-900 hover:bg-gray-700 font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
          >
            Verify offer
          </Link>
          <Link
            href="/guide"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'guide'
                ? 'text-gray-900 hover:text-gray-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Guide
          </Link>
          <Link
            href="/faq"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'faq'
                ? 'text-gray-900 hover:text-gray-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'about'
                ? 'text-gray-900 hover:text-gray-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            About
          </Link>
          <Link
            href="/updates"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'updates'
                ? 'text-gray-900 hover:text-gray-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            What's new
          </Link>
        </nav>
      </div>
    </header>
  )
}
