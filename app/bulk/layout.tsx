import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bulk Employer Check — LMIA Check',
  description: 'Check multiple Canadian employers at once against the official ESDC LMIA database. Upload a list and get verified results in seconds. Free, no signup required.',
  openGraph: {
    title: 'Bulk LMIA Employer Check',
    description: 'Verify multiple Canadian employers at once against official ESDC records. Free bulk LMIA check tool.',
    url: 'https://lmiacheck.ca/bulk',
  },
  alternates: { canonical: 'https://lmiacheck.ca/bulk' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
