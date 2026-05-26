import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recruiter Blacklist — LMIA Check',
  description: 'Community-sourced list of fraudulent recruiters charging illegal fees for Canadian LMIA job offers. Search by name, province, or contact. Report a bad recruiter.',
  openGraph: {
    title: 'Recruiter Blacklist — Report LMIA Fraud',
    description: 'Search and report fraudulent recruiters charging illegal fees for Canadian LMIA job offers.',
    url: 'https://lmiacheck.ca/recruiter-blacklist',
  },
  alternates: { canonical: 'https://lmiacheck.ca/recruiter-blacklist' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
