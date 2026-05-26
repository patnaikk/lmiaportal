import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — LMIA Check',
  description: 'Answers to common questions about LMIA fraud, employer verification, your rights as a foreign worker, and how the LMIA Check tool works.',
  openGraph: {
    title: 'FAQ — LMIA Check',
    description: 'Answers to common questions about LMIA fraud, employer verification, and foreign worker rights in Canada.',
    url: 'https://lmiacheck.ca/faq',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an LMIA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Labour Market Impact Assessment (LMIA) is a document that a Canadian employer must obtain from Employment and Social Development Canada (ESDC) before hiring a foreign worker under the Temporary Foreign Worker Program (TFWP). A positive LMIA is required before a foreign worker can apply for a work permit in most cases.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the LMIA Check tool actually check?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LMIA Check cross-references employer names against two official public datasets from ESDC: the list of employers banned or flagged for non-compliance with the TFWP, and the list of employers who have received approved (positive) LMIAs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is it legal for an employer to charge me for an LMIA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. In Canada, it is illegal for an employer or recruiter to charge a worker for an LMIA or a job offer. The employer is legally required to cover all program costs. If someone is asking you for money to arrange a job, it is a scam.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does it mean if an employer is marked as "banned"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It means the employer has committed serious violations of the Temporary Foreign Worker Program — such as abusing workers or misusing the LMIA system. Any offer from a banned employer should be treated as high risk.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if the employer is "not found" in the checker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '"Not found" is a neutral result. It does not mean the employer is fake — but it does not confirm they are legitimate either. Always verify their physical address, website, and business registration independently.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I report a suspected LMIA scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can use the federal Service Canada fraud reporting form at canada.ca to flag abuse confidentially. You can also report suspicious job postings on Job Bank to help protect others.',
      },
    },
    {
      '@type': 'Question',
      name: 'I already paid money for an LMIA. What should I do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Collect all your evidence — bank transfers, chat screenshots, and emails. Report the employer to ESDC and IRCC. You may also be eligible for an Open Work Permit for Vulnerable Workers, which is designed to help you leave an abusive employer without losing your status in Canada.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my search on LMIA Check private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Searches on LMIA Check are private — the site does not store or share the employer names you search with employers or the government.',
      },
    },
  ],
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
