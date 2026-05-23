import Link from 'next/link'

interface NavigationProps {
  currentPage?: 'home' | 'check' | 'guide' | 'faq' | 'about' | 'updates'
}

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 tracking-tight hover:text-gray-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#DC2626" aria-hidden="true">
            <path d="M14.7 17.2L17 18l-.6-3.1 4.4-3.8-2.2-.9.7-2.8-3.9 1 .1-3.2L13 7l-1-5-1 5-2.5-1.8.1 3.2-3.9-1 .7 2.8-2.2.9 4.4 3.8L7 18l2.3-.8L9 22h1l1.5-3 .5 4 .5-4 1.5 3h1l-.3-4.8z"/>
          </svg>
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
