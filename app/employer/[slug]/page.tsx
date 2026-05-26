import { redirect } from 'next/navigation'
import { fromSlug } from '@/lib/slug'
import type { Metadata } from 'next'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const employer = fromSlug(params.slug)
  const canonicalUrl = `https://lmiacheck.ca/employer/${params.slug}`
  return {
    title: `${employer} — LMIA Check`,
    description: `Check whether ${employer} is approved or banned under Canada's Temporary Foreign Worker Program. Verified against official ESDC records.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${employer} — LMIA Status`,
      description: `Is ${employer} a legitimate LMIA employer? Check their status in the official ESDC database.`,
      url: canonicalUrl,
    },
  }
}

export default function EmployerSlugPage({ params }: PageProps) {
  const employer = fromSlug(params.slug)
  redirect(`/results?employer=${encodeURIComponent(employer)}&from=slug`)
}
