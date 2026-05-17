import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates — LMIA Check',
  description: 'What\'s new on LMIA Check — feature updates and data refreshes.',
}

const updates: { date: string; items: React.ReactNode[] }[] = [
  {
    date: 'May 17, 2026',
    items: [
      <>
        New: Financial tools for newcomers — LMIA Check now links to{' '}
        <a href="https://buildcreditcanada.ca" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-medium">
          buildcreditcanada.ca
        </a>
        {' '}at 7 key touchpoints across the site. Foreign workers who verify a legitimate employer
        can immediately access free, bilingual tools to set up banking, plan their first paycheque,
        build Canadian credit, and find the cheapest way to send money home.
      </>,
      <>
        New: GREEN verified results now show a &ldquo;Planning your move to Canada?&rdquo; card with chip links to{' '}
        <a href="https://buildcreditcanada.ca/compare.html" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Banking Comparator</a>,{' '}
        <a href="https://buildcreditcanada.ca/send-money.html" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Money Transfer Calculator</a>,
        {' '}and{' '}
        <a href="https://buildcreditcanada.ca/spending-plan.html" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Spending Plan</a>
        {' '}— shown on both the simple results page and as step 3 of the &ldquo;What to do next&rdquo; list.
      </>,
      <>
        New: Guide page now ends with an &ldquo;After You Arrive: Financial Setup&rdquo; section —{' '}
        <Link href="/guide" className="text-blue-700 hover:underline">4 steps covering banking, budgeting, credit building, and remittances</Link>
        {' '}for newly arrived workers.
      </>,
      <>
        New: FAQ has a new &ldquo;🏦 Life After LMIA: Financial Setup&rdquo; section —{' '}
        <Link href="/faq" className="text-blue-700 hover:underline">3 questions</Link>
        {' '}covering financial preparation, cheapest remittance options, and why your foreign
        credit score doesn&apos;t transfer to Canada.
      </>,
      'Fix: Spot LMIA Fraud page subtitle changed from "9 red flags before you pay" to "9 red flags in any job offer" — employees never pay for an LMIA, the employer does. CTA updated from "Verify Before You Pay" to "Verify Before You Accept".',
    ],
  },
  {
    date: 'May 16, 2026',
    items: [
      'New: Wage benchmarking on the full offer check — if you enter a job title and offered wage, the tool now compares it against typical Canadian rates for 17 common LMIA occupations (sourced from StatsCan Job Bank). A $12/hr "restaurant manager" offer flags RED; a wage below the typical starting rate flags YELLOW with a link to the official Job Bank wage report',
      'Improved: "Employer not found" result card now uses calm, accurate language — not being in the database is common (legal name, numbered company, new employer) and does not automatically mean the offer is fraudulent. The card directs users to the 5-step verification checklist below',
      'Improved: "Employer not found" next steps replaced with 5 specific, ordered actions: find the legal/numbered company name, ask for the LMIA number, call Service Canada directly (1-800-367-5693), check the federal business registry, and a clear reminder that any fee request is illegal',
      'New: "Have a job offer in hand?" prompt on the homepage — routes users who have received an offer into the full /check flow which analyzes fee, wage, delivery source, and duration in addition to the employer database check',
    ],
  },
  {
    date: 'May 11, 2026',
    items: [
      'Data refresh: non-compliant employers list re-synced from Canada.ca — 1,329 total records (5 new additions since May 5): Royal Paan (Surrey, BC), Cheema Agro Farms & Lands Development (Delta, BC), Les Entreprises Agricoles André Desroches Inc. (Abercorn, QC — banned until May 2027), Wildflower Greenhouse Ltd. (Surrey, BC), and AAI Canada (Trois-Rivières, QC)',
    ],
  },
  {
    date: 'May 5, 2026',
    items: [
      'Data refresh: non-compliant employers list re-synced from Canada.ca — 1,327 total records (1 new addition since May 4)',
    ],
  },
  {
    date: 'Apr 3, 2026',
    items: [
      'Data refresh: non-compliant employers list re-scraped from Canada.ca — 1,296 total records (2 new additions since Apr 1)',
      'New: Result cards now show the employer name and check date — screenshot and share directly to WhatsApp so a friend or family member can see exactly what you found',
      'New: QR code on every result page — scan or screenshot it, send via WhatsApp, and the recipient lands directly on the same result without typing anything',
      'New: "Recently Banned" feed on the homepage — shows the 5 most recently banned employers pulled live from the database, each linking directly to their result',
      'New: Latest ban callout banner between the hero and search form — shows the most recently banned employer at a glance so first-time visitors see real data immediately',
      'New: April 2026 TFWP rule changes added to the Guide — advertising period doubled to 8 weeks, mandatory youth recruitment, rural low-wage cap raised temporarily to 15%',
    ],
  },
  {
    date: 'Apr 1, 2026',
    items: [
      'Data refresh: non-compliant employers list re-scraped from Canada.ca — 1,294 total records (32 more than original load of 1,262), including 5 new additions since Mar 24: Aumeir Printing and Design Ltd. (Kelowna, BC), Lumberjacks Diner (Roddickton, NL), Marché La Gazelle (Verdun, QC), ROCKY VIEW TIRES LTD (Calgary, AB — newly banned until Mar 2027), and Singapore Trucking Inc. (Calgary, AB — banned until Aug 2035)',
    ],
  },
  {
    date: 'Mar 30, 2026',
    items: [
      'Search fix: employer names with possessives (e.g. "Tim Horton\'s", "McDonald\'s") now match correctly — the possessive \'s is stripped before matching so it no longer breaks trigram search',
      'Search fix: accented characters in employer names (é, à, â, etc.) are now normalized — "Montréal" matches "Montreal" and French employer names resolve correctly regardless of how the accent is typed',
      'Search fix: truncation fallback now applies to violator lookups as well as positive LMIA — typing "Afghan Chopan Kebab Restaurant" correctly finds "Afghan Chopan Kebab" on the non-compliant list',
      'Search fix: city comparison is now accent- and punctuation-aware — "St. John\'s" matches "St Johns" and "Montréal" matches "Montreal" in location-filtered results',
      'Search fix: employers with Permanent Resident Only stream LMIAs now correctly return a YELLOW warning (not GREEN) when province filtering is applied — previously they could bypass the PR-only stream check',
      'Fix: search activity logging was missing for violator matches — RED and YELLOW results from the non-compliant list are now recorded correctly',
      'Fix: data ingestion and sync scripts now normalize employer names identically to the search engine — possessives and diacritics are stripped at index time, ensuring stored values match what searches produce',
    ],
  },
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
      <Navigation currentPage="updates" />

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
