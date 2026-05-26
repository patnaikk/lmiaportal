import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import FraudWarningBanner from '@/components/FraudWarningBanner'

export const metadata: Metadata = {
  title: 'LMIA Check 2026 — Verify if a Canadian Job Offer is Real',
  description:
    'Free tool to verify a Canadian employer and detect LMIA fraud. Check if your job offer is legitimate against official government records. No fees, no signup.',
  keywords: 'LMIA verification, LMIA fraud, Canadian employer check, job offer fraud, verify LMIA, is LMIA real, temporary foreign worker, ESDC',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'LMIA Check — Verify if a Canadian Job Offer is Real (2026)',
    description: 'Free tool to verify a Canadian employer and detect LMIA fraud before you pay any fees.',
    type: 'website',
    url: 'https://lmiacheck.ca',
    siteName: 'LMIA Check',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LMIA Check — Verify if a Canadian Job Offer is Real',
    description: 'Free tool to verify a Canadian employer and detect LMIA fraud before you pay any fees.',
    site: '@lmiacheck',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: `history.scrollRestoration='manual'` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'LMIA Check',
            url: 'https://lmiacheck.ca',
            description: 'Free tool to verify Canadian employers against official ESDC LMIA records. Protects foreign workers from job offer fraud.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://lmiacheck.ca/results?employer={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GQ04SJHDPG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GQ04SJHDPG');
          `}
        </Script>
        <FraudWarningBanner />
        {children}
      </body>
    </html>
  )
}
