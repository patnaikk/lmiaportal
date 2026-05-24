'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

const sections = [
  {
    id: 'checker',
    heading: 'Understanding the Checker',
    questions: [
      {
        q: 'What is an LMIA?',
        a: (
          <>
            A Labour Market Impact Assessment (LMIA) is a document that a Canadian employer must obtain from Employment
            and Social Development Canada (ESDC) before hiring a foreign worker under the Temporary Foreign Worker
            Program (TFWP). It proves there is a genuine labour shortage and that no Canadian citizen or permanent
            resident was available for the job. A positive LMIA is required before a foreign worker can apply for a
            work permit in most cases.
          </>
        ),
      },
      {
        q: 'What does this site actually check?',
        a: (
          <>
            We cross-reference the employer name you provide against two official public datasets from ESDC: the list
            of employers who have been banned or flagged for non-compliance with the TFWP, and the list of employers
            who have received approved (positive) LMIAs. It&apos;s a quick way to see whether the government has a
            record of this employer — and whether that record is clean.
          </>
        ),
      },
      {
        q: 'Does a "clean" result mean the job offer is 100% safe?',
        a: (
          <>
            No. A clean result means the employer isn&apos;t currently on a government ban list. Scammers move fast,
            and a business can be running a fraud long before the government formally sanctions them. You still need to
            watch for other red flags — like requests for money, unrealistic wages, or pressure to act quickly.
          </>
        ),
      },
      {
        q: 'What if the employer is "not found" in the checker?',
        a: (
          <>
            &ldquo;Not found&rdquo; is a neutral result. It doesn&apos;t mean the employer is fake — but it
            doesn&apos;t confirm they&apos;re legitimate either. Many small businesses, new companies, or
            &ldquo;numbered companies&rdquo; (e.g., 1234567 Ontario Inc.) may not appear in these datasets yet.
            Always verify their physical address, website, and business registration independently.
          </>
        ),
      },
    ],
  },
  {
    id: 'redflags',
    heading: 'Identifying Red Flags & Scams',
    questions: [
      {
        q: 'What does it mean if an employer is marked as "banned"?',
        a: (
          <>
            It means they&apos;ve committed serious violations — such as abusing workers or misusing the LMIA system.
            Treat any offer from a banned employer as high risk. Stop communication and consult a licensed immigration
            consultant or lawyer before proceeding.
          </>
        ),
      },
      {
        q: 'Is it legal for an employer to charge me for an LMIA?',
        a: (
          <>
            Absolutely not. In Canada, it is illegal for an employer or recruiter to charge a worker for an LMIA or a
            job offer. The employer is legally required to cover all program costs. If someone is asking you for
            thousands of dollars to &ldquo;arrange&rdquo; a job, it is a scam — period.
          </>
        ),
      },
      {
        q: 'My employer wants a "refund" on my wages or "rent" paid back in cash. Is that normal?',
        a: (
          <>
            No — this is a major form of exploitation. Some employers advertise high wages to pass government
            inspections, then force workers to pay money back under the table. This is illegal. If this is happening
            to you, document every interaction and every payment, then seek help from a licensed legal professional.
          </>
        ),
      },
      {
        q: 'The job ad says "LMIA pending" or offers huge wages for simple work. Is that a red flag?',
        a: (
          <>
            Usually, yes. Scammers often post ads with wages that seem too good to be true, and may use &ldquo;LMIA
            pending&rdquo; to create a sense of urgency. In some cases, these ads aren&apos;t meant to find a worker
            at all — they&apos;re designed to &ldquo;prove&rdquo; to the government that no Canadian was available,
            so the employer can sell the LMIA to a foreign worker.
          </>
        ),
      },
    ],
  },
  {
    id: 'rights',
    heading: 'Your Rights & Next Steps',
    questions: [
      {
        q: 'I already paid money for an LMIA. What should I do?',
        a: (
          <>
            Collect all your evidence — bank transfers, chat screenshots, and emails. Report the employer to ESDC and
            IRCC. You may also be eligible for an{' '}
            <a
              href="/owp-vw"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Open Work Permit for Vulnerable Workers
            </a>
            , which is designed to help you leave an abusive employer without losing your status in Canada.
            See our full guide:{' '}
            <a href="/help/i-paid" className="text-blue-600 hover:text-blue-800 font-medium underline">
              I already paid — what do I do now? →
            </a>
          </>
        ),
      },
      {
        q: "My employer is threatening to cancel my permit if I don't pay them. What can I do?",
        a: (
          <>
            Employers cannot legally do this. Threatening deportation or permit cancellation to extort money is a
            crime. You have rights in Canada regardless of your work status. Document the threats and report them to
            IRCC through their official{' '}
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/vulnerable-workers.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              abuse-reporting channels
            </a>
            .
          </>
        ),
      },
      {
        q: 'How do I report a suspected scam?',
        a: (
          <>
            You can use the federal{' '}
            <a
              href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/report-abuse/tool.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Service Canada fraud reporting form
            </a>{' '}
            to flag abuse confidentially. You can also report suspicious job postings directly on{' '}
            <a
              href="https://www.jobbank.gc.ca/report_abuse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Job Bank
            </a>{' '}
            to help protect others. If you are in immediate danger, contact local police.
          </>
        ),
      },
    ],
  },
  {
    id: 'financial',
    heading: 'Life After LMIA: Financial Setup',
    questions: [
      {
        q: 'My employer is verified. What should I do to prepare financially for Canada?',
        a: (
          <>
            Before your first paycheque, focus on three things: open a Canadian bank account
            (some newcomer programs waive fees for your first year), create a spending plan
            so rent and savings don&apos;t compete, and get a secured credit card to start building
            Canadian credit history from day one. Your foreign credit score doesn&apos;t transfer —
            you start from scratch.{' '}
            <a
              href="https://buildcreditcanada.ca/tools.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium underline"
            >
              Free newcomer financial tools at buildcreditcanada.ca →
            </a>
          </>
        ),
      },
      {
        q: 'What is the cheapest way to send money home from Canada?',
        a: (
          <>
            Bank wire transfers typically cost 4–6% in exchange rate markup plus flat fees — that&apos;s
            hundreds of dollars per year on regular remittances. Services like Wise, Remitly, and
            Remitbee can cut that to under 1%. The best option depends on your destination country
            and transfer amount.{' '}
            <a
              href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium underline"
            >
              Compare remittance services →
            </a>
          </>
        ),
      },
      {
        q: 'Does my credit score from my home country transfer to Canada?',
        a: (
          <>
            No. Canadian credit bureaus (Equifax and TransUnion Canada) have no access to foreign
            credit histories. You start from zero regardless of your home country score. The fastest
            path to 700+ involves a secured credit card, on-time payments, and low utilization —
            a realistic timeline is 12–18 months with consistent habits.{' '}
            <a
              href="https://buildcreditcanada.ca/credit-score-timeline.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium underline"
            >
              See the credit-building timeline →
            </a>
          </>
        ),
      },
    ],
  },
  {
    id: 'misc',
    heading: 'Privacy & Other Questions',
    questions: [
      {
        q: 'Are most LMIA job offers scams?',
        a: (
          <>
            Not all of them. Many legitimate employers use the TFWP to hire workers for genuine labour shortages.
            However, fraud is unfortunately common in certain sectors, and some recruiters treat LMIAs as a commodity
            to sell rather than a tool to fill real jobs. Verify carefully before paying anything or signing anything.
          </>
        ),
      },
      {
        q: 'Is my search private?',
        a: (
          <>
            Yes. Your searches are private — we don&apos;t store or share the names you search with employers or the
            government. This tool is meant to be a safe place to do your due diligence without fear of retaliation.
          </>
        ),
      },
    ],
  },
]

const SECTION_ICONS: Record<string, React.ReactNode> = {
  checker: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  redflags: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  rights: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  financial: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  misc: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
}

function AccordionItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className={`text-[15px] font-semibold leading-snug transition-colors ${open ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${open ? 'bg-gray-900 text-white rotate-45' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`} aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-4 pr-8">
          <p className="text-[15px] text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation currentPage="faq" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 leading-tight text-balance">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Everything you need to know about LMIA fraud, your rights, and how this tool works.
          </p>
        </div>

        {/* Jump nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setActiveSection(s.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors shadow-sm"
            >
              <span>{SECTION_ICONS[s.id]}</span>
              {s.heading}
            </a>
          ))}
        </div>

        {/* Accordion sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="card-elevated overflow-hidden">
              {/* Section header — click to expand/collapse whole section */}
              <button
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left group"
                aria-expanded={activeSection === section.id}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base" aria-hidden="true">{SECTION_ICONS[section.id]}</span>
                  <span className="text-sm font-bold text-gray-900">{section.heading}</span>
                  <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {section.questions.length}
                  </span>
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${activeSection === section.id ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Questions — shown when section is open */}
              {activeSection === section.id && (
                <div className="px-5 border-t border-gray-100">
                  {section.questions.map((item) => (
                    <AccordionItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 card-elevated p-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-900">Note:</strong> This tool is for informational purposes only and does not
            constitute legal or immigration advice. If you are in a complex or dangerous situation, please speak with a{' '}
            <a
              href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              licensed immigration consultant (RCIC)
            </a>{' '}
            or lawyer.
          </p>
        </div>

        <div className="pt-6 pb-4">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to search
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
