import type { Metadata } from 'next'
import './globals.css'
import FraudWarningBanner from '@/components/FraudWarningBanner'

export const metadata: Metadata = {
  title: 'LMIA Check — Verify a Canadian employer before you pay',
  description:
    'Free tool to verify whether a Canadian employer has a legitimate Labour Market Impact Assessment (LMIA). Check government records before paying recruitment fees.',
  keywords: 'LMIA, Canada, employer verification, temporary foreign worker, ESDC, job offer fraud',
  openGraph: {
    title: 'LMIA Check — Verify a Canadian employer before you pay',
    description: 'Free tool to verify whether a Canadian employer has a legitimate LMIA. Check before paying any fees.',
    type: 'website',
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
      </head>
      <body className="min-h-screen flex flex-col">
        <FraudWarningBanner />
        {children}
      </body>
    </html>
  )
}
