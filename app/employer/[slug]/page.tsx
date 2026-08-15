import { fromSlug, toDisplayName } from '@/lib/slug'
import ResultsContent from '@/app/results/ResultsContent'
import type { Metadata } from 'next'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const displayName = toDisplayName(params.slug)
  const canonicalUrl = `https://lmiacheck.ca/employer/${params.slug}`
  return {
    title: `${displayName} — LMIA Check`,
    description: `Check whether ${displayName} is approved or banned under Canada's Temporary Foreign Worker Program. Verified against official ESDC records.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${displayName} — LMIA Status`,
      description: `Is ${displayName} a legitimate LMIA employer? Check their status in the official ESDC database.`,
      url: canonicalUrl,
    },
  }
}

export default function EmployerSlugPage({ params }: PageProps) {
  const employer = fromSlug(params.slug)
  const canonicalUrl = `https://lmiacheck.ca/employer/${params.slug}`
  return <ResultsContent employer={employer} canonicalUrl={canonicalUrl} origin="employer_page" />
}
