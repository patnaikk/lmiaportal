import Link from 'next/link'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LMIA FAQ 2026 — Common Questions About Verification & Fraud',
  description: 'FAQ on LMIA scams, how to spot fake job offers, employer verification, banned employers, and your rights as a foreign worker in Canada.',
}

const sections = [
  {
    heading: '🔍 Understanding the Checker',
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
    heading: '🚩 Identifying Red Flags & Scams',
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
    heading: '🛡️ Your Rights & Next Steps',
    questions: [
      {
        q: 'I already paid money for an LMIA. What should I do?',
        a: (
          <>
            Collect all your evidence — bank transfers, chat screenshots, and emails. Report the employer to ESDC and
            IRCC. You may also be eligible for an{' '}
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/vulnerable-workers.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800 font-medium underline"
            >
              Open Work Permit for Vulnerable Workers
            </a>
            , which is designed to help you leave an abusive employer without losing your status in Canada.
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
              className="text-red-600 hover:text-red-800 font-medium underline"
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
              className="text-red-600 hover:text-red-800 font-medium underline"
            >
              Service Canada fraud reporting form
            </a>{' '}
            to flag abuse confidentially. You can also report suspicious job postings directly on{' '}
            <a
              href="https://www.jobbank.gc.ca/report_abuse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800 font-medium underline"
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
    heading: '💡 Final Thoughts',
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

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b-[3px] border-red-600 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">🍁 LMIA Check</Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-sm font-semibold text-gray-900 transition-colors">FAQ</Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">About</Link>
            <Link href="/updates" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">What&apos;s new</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-10">

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Everything you need to know about LMIA fraud, your rights, and how this tool works.
          </p>
        </div>

        {sections.map((section) => (
          <section key={section.heading} className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">{section.heading}</h2>
            <div className="space-y-6">
              {section.questions.map((item) => (
                <div key={item.q}>
                  <p className="font-semibold text-gray-900 mb-1.5 text-[15px]">{item.q}</p>
                  <p className="text-[15px] text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <hr className="border-gray-100" />

        {/* Disclaimer */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Note:</strong> This tool is for informational purposes only and does not
            constitute legal or immigration advice. If you are in a complex or dangerous situation, please speak with a{' '}
            <a
              href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800 font-medium underline"
            >
              licensed immigration consultant (RCIC)
            </a>{' '}
            or lawyer.
          </p>
        </div>

        {/* Back link */}
        <div className="pt-2 pb-4">
          <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1">
            ← Back to search
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
