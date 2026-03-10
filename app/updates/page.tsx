import Link from 'next/link'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates — LMIA Check',
  description: 'What\'s new on LMIA Check — feature updates and data refreshes.',
}

const updates = [
  {
    date: 'Mar 9, 2026',
    items: [
      'Added "How it works" section on home page — based on user feedback',
      'Added feedback form on results page so users can report missing employers or errors',
    ],
  },
  {
    date: 'Mar 8, 2026',
    items: [
      'Site launched at lmiacheck.ca 🎉',
      'Data loaded: 11,000+ approved employers from ESDC Q3 2025 data',
      'Data loaded: 1,262 non-compliant employers tracked',
      'GREEN / YELLOW / RED / GREY risk results live',
      'Email notification signup live',
    ],
  },
]

export default function UpdatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">FAQ</Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">About</Link>
            <Link href="/updates" className="text-sm font-semibold text-gray-900 transition-colors">What's new</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">What's new</h1>
        <p className="text-sm text-gray-500 mb-8">Feature updates and data refreshes for LMIA Check.</p>

        <div className="space-y-8">
          {updates.map((update) => (
            <div key={update.date} className="flex gap-4">
              <div className="flex-shrink-0 w-28 text-xs font-medium text-gray-400 pt-0.5">
                {update.date}
              </div>
              <ul className="flex-1 space-y-2 border-l border-gray-200 pl-4">
                {update.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
