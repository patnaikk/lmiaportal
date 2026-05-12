import Link from 'next/link'

interface NavigationProps {
  currentPage?: 'home' | 'check' | 'guide' | 'faq' | 'about' | 'updates'
}

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight hover:text-red-600 transition-colors">
          🍁 LMIA Check
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/check"
            className="text-sm text-white bg-red-600 hover:bg-red-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Verify offer
          </Link>
          <Link
            href="/guide"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'guide'
                ? 'text-red-600 hover:text-red-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Guide
          </Link>
          <Link
            href="/faq"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'faq'
                ? 'text-red-600 hover:text-red-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'about'
                ? 'text-red-600 hover:text-red-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            About
          </Link>
          <Link
            href="/updates"
            className={`text-sm font-medium transition-colors ${
              currentPage === 'updates'
                ? 'text-red-600 hover:text-red-700'
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
