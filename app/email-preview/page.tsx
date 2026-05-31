import { render } from '@react-email/render'
import { readFileSync } from 'fs'
import { join } from 'path'
import MonthlyReport from '@/emails/MonthlyReport'

// Dev-only preview of the monthly newsletter email, rendered to real email HTML.
export const dynamic = 'force-dynamic'

export default async function EmailPreviewPage() {
  // Inline the logo as a data URI so it renders in the local preview
  // (in production the template uses the hosted https://lmiacheck.ca/email/canada-flag.png).
  let logoUrl = 'https://lmiacheck.ca/email/canada-flag.png'
  try {
    const png = readFileSync(join(process.cwd(), 'public/email/canada-flag.png'))
    logoUrl = `data:image/png;base64,${png.toString('base64')}`
  } catch {}

  const html = await render(<MonthlyReport logoUrl={logoUrl} />)

  return (
    <div style={{ minHeight: '100vh', background: '#e5e7eb', padding: '24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
          Email preview — this is the actual HTML that will be sent. Subject:{' '}
          <strong>May: 18 employers banned in Canada</strong>
        </p>
        <iframe
          title="Monthly newsletter preview"
          srcDoc={html}
          style={{ width: '100%', height: '1400px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff' }}
        />
      </div>
    </div>
  )
}
