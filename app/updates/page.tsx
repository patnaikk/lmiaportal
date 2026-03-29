import Link from 'next/link'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates — LMIA Check',
  description: 'What\'s new on LMIA Check — feature updates and data refreshes.',
}

const updates = [
  {
    date: 'Mar 27, 2026',
    items: [
      'Data refresh: non-compliant employers list re-synced live from Canada.ca — 1,294 records (5 newly added), including 1 newly banned employer: Rocky View Tires Ltd. (Calgary, AB — banned until Mar 2027)',
      'Search fix: province filtering now works correctly — the DB stores full province names and the search was comparing against 2-letter codes, causing all province-filtered searches to incorrectly return a location mismatch warning',
      'Search fix: compliant employer (positive LMIA) fallback search now checks both operating name and legal name — numbered companies like "1234567 Ontario Inc" are now found in both violators and positive LMIA lookups',
      'Search fix: when multiple violation records match an employer, the most serious compliance status now takes precedence — previously only the first match was evaluated',
      'Search fix: violation record shown on results page now always displays the most serious match first',
      'Fix: address mismatch warning now clearly explains that a scammer may be impersonating a real employer rather than implying the employer simply doesn\'t exist in a given province',
      'Fix: navigating to a search result now always scrolls to the top of the page — previously the browser would restore the previous scroll position, hiding the risk result',
    ],
  },
  {
    date: 'Mar 24, 2026',
    items: [
      'Data refresh: non-compliant employers list re-scraped from Canada.ca — 1,289 records confirmed current (no new additions since Mar 21)',
    ],
  },
  {
    date: 'Mar 21, 2026',
    items: [
      'Data refresh: non-compliant employers list re-scraped from Canada.ca — 1,289 records confirmed current (no new additions since Mar 18)',
    ],
  },
  {
    date: 'Mar 18, 2026',
    items: [
      'Data refresh: non-compliant employers list updated — 1,289 total records (27 new since Mar 7), including 3 newly banned employers: Clearport International Inc. (Calgary, AB), Sameet Kaur Gill Professional Corporation (Calgary, AB — 5-year ban until Mar 2031), and NPP Pleasant Software Producer Inc (North Vancouver, BC — banned until Mar 2027)',
      'Removed employer trust checklist from results page',
    ],
  },
  {
    date: 'Mar 17, 2026',
    items: [
      'New: LMIA Guide at /guide — comprehensive educational resource explaining what LMIA is, who needs it, the 4-step work permit process (3–6 months), legitimate costs in CAD, and red flags to watch for. Helps foreign workers understand the journey from job offer to arrival in Canada.',
    ],
  },
  {
    date: 'Mar 15, 2026',
    items: [
      'New: "Is my LMIA real?" checker at /check — runs 7 checks on your job offer including employer records, fee detection, delivery source, and duration mismatch, with a plain-language traffic light result and shareable URL',
    ],
  },
  {
    date: 'Mar 14, 2026',
    items: [
      'Non-compliant employers list now syncs automatically every Monday — data stays current without manual intervention',
      'Search now checks both trade name and legal name simultaneously — typing "2771482 Ontario Inc" finds the employer even if you only know the numbered company name',
      'Violation records now show the matched employer name and legal name together on every result card',
      'Added "Where do I find the name?" collapsible help tip on the search form — explains where to find the right employer name (offer letter, T4, pay stub) and how numbered companies work',
      'Added crowdsourced name mapping: when a search returns no results, users can submit an alternate name they know for that employer — contributions are reviewed before going live',
    ],
  },
  {
    date: 'Mar 10, 2026',
    items: [
      'Fixed search returning "not found" for valid employers — partial name matching now works',
      'Added smart autocomplete: typing a trade name (e.g. "Tim Hortons") now suggests the registered legal name',
      'Added fraud warning banner on every page',
      'Added employer trust checklist with 6 checks and a trust score meter on results page',
      'Added numbered company guide on "not found" results',
    ],
  },
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
            <Link href="/check" className="text-sm text-white bg-red-600 hover:bg-red-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">Verify offer</Link>
            <Link href="/guide" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">Guide</Link>
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
