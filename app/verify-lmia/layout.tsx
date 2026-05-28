import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Verify an LMIA Number in Canada — Is It Real? | LMIA Check',
  description:
    'Got an LMIA number on your job offer? Check the 7-digit format instantly and get the exact script to call Service Canada and confirm it is genuine — free, takes 5 minutes.',
  keywords: [
    'verify LMIA number Canada',
    'how to check if LMIA is real',
    'fake LMIA number',
    'LMIA number format',
    'is my LMIA number valid',
    'Service Canada LMIA verification',
    'LMIA fraud check',
  ],
  openGraph: {
    title: 'How to Verify an LMIA Number — Is It Real?',
    description:
      'Check the 7-digit LMIA number format instantly and get the exact script to call Service Canada and confirm it is genuine.',
    url: 'https://lmiacheck.ca/verify-lmia',
  },
  alternates: { canonical: 'https://lmiacheck.ca/verify-lmia' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to verify an LMIA number in Canada',
  description:
    'Step-by-step guide to verify that an LMIA number on a job offer is genuine by calling Service Canada directly.',
  totalTime: 'PT5M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Check the LMIA number format',
      text: 'A real LMIA number is exactly 7 digits (e.g. 9783145). Use the checker at lmiacheck.ca/verify-lmia to confirm the format before calling.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Call Service Canada',
      text: 'Call 1-800-367-5693, Monday to Friday 6:30 am – 8:00 pm ET.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Read the exact script',
      text: 'Say: "I am a foreign worker and I received a job offer from [employer name] in [province]. I want to verify that LMIA number [your number] is valid and was approved for this employer."',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'If Service Canada cannot find it',
      text: 'Stop all contact with the employer immediately and report the fraud to the Canadian Anti-Fraud Centre at 1-888-495-8501.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a real LMIA number look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A genuine LMIA number is exactly 7 digits, for example 9783145. It appears on the LMIA approval letter issued by Employment and Social Development Canada (ESDC) to the employer — not directly to the worker.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I verify an LMIA number online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. ESDC does not provide a public online lookup for LMIA numbers. The only way to confirm an LMIA is genuine is to call Service Canada at 1-800-367-5693 and ask them to verify it directly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if the LMIA number is not 7 digits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If the number on your document is not exactly 7 digits, it does not match any known LMIA format. This is a red flag that the document may be fake. Call Service Canada immediately to verify before taking any further action.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is it illegal to charge a worker for an LMIA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Under Canadian law, employers and recruiters are prohibited from charging workers any fee related to an LMIA or job offer. If you were asked to pay for an LMIA, it is almost certainly a scam.',
      },
    },
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
