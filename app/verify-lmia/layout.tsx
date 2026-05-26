import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify an LMIA Number — LMIA Check',
  description: 'Have an LMIA number on your job offer? Check whether it is valid and get the exact script to verify it directly with Service Canada in 5 minutes.',
  openGraph: {
    title: 'Verify an LMIA Number — Is It Real?',
    description: 'Check if the LMIA number on your job offer is valid. Get the exact script to call Service Canada and confirm.',
    url: 'https://lmiacheck.ca/verify-lmia',
  },
  alternates: { canonical: 'https://lmiacheck.ca/verify-lmia' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
