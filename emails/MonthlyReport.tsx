import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface BanHighlight {
  name: string
  penalty: string // e.g. "$90,000"
  note?: string // e.g. "largest penalty"
}

export interface MonthlyReportProps {
  monthLabel?: string
  newBansCount?: number
  topProvince?: string
  expiringCount?: number
  highlights?: BanHighlight[]
  reportUrl?: string
  siteUrl?: string
  unsubscribeUrl?: string
  helpOrgName?: string
  helpOrgUrl?: string
  logoUrl?: string
  patternText?: string
  positiveCount?: string
  positiveQuarter?: string
  expiringNextMonthCount?: number
  nextMonthLabel?: string
}

const defaults: Required<Omit<MonthlyReportProps, 'highlights'>> & { highlights: BanHighlight[] } = {
  monthLabel: 'May 2026',
  newBansCount: 18,
  topProvince: 'BC',
  expiringCount: 4,
  highlights: [
    { name: 'HBC Transportation Inc.', penalty: '$90,000', note: 'largest penalty' },
    { name: 'BeeGrove Greenhouse', penalty: '$30,000' },
    { name: 'Georgetown Tandoori', penalty: '$23,000' },
  ],
  reportUrl: 'https://lmiacheck.ca/reports/2026-05',
  siteUrl: 'https://lmiacheck.ca',
  unsubscribeUrl: 'https://lmiacheck.ca/unsubscribe',
  helpOrgName: 'Migrant Workers Alliance for Change',
  helpOrgUrl: 'https://migrantworkersalliance.org',
  logoUrl: 'https://lmiacheck.ca/email/canada-flag.png',
  patternText:
    'Half of May’s bans were for the same thing: pay or working conditions that didn’t match what the employer promised. Several others were caught not actually operating the business they hired for — a hallmark of fake-LMIA schemes. The lesson: get everything in writing, and be suspicious if an “employer” has no real operation.',
  positiveCount: '11,000',
  positiveQuarter: 'Q3 2025',
  expiringNextMonthCount: 2,
  nextMonthLabel: 'June',
}

function Eyebrow({ children, color = '#9ca3af' }: { children: React.ReactNode; color?: string }) {
  return <Text style={{ ...eyebrow, color }}>{children}</Text>
}

function withUtm(url: string, content: string, campaign: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}&utm_content=${content}`
}

export default function MonthlyReport(props: MonthlyReportProps) {
  const p = { ...defaults, ...props, highlights: props.highlights ?? defaults.highlights }
  const campaign = `monthly_${p.monthLabel.toLowerCase().replace(/\s+/g, '_')}` // e.g. monthly_may_2026
  const reportHref = withUtm(p.reportUrl, 'report', campaign)
  const siteHref = withUtm(p.siteUrl, 'cta', campaign)

  return (
    <Html lang="en">
      <Head />
      <Preview>Official government data — plus the paid-job scam to watch for.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Brand header — white, airy, hairline divider */}
          <Section style={header}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tr>
                <td style={{ verticalAlign: 'middle' }}>
                  <table cellPadding={0} cellSpacing={0} role="presentation">
                    <tr>
                      <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                        <Img src={p.logoUrl} width="30" height="15" alt="Canada" style={{ display: 'block', borderRadius: '2px' }} />
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Text style={wordmark}>LMIA Check</Text>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <Link href={`${p.siteUrl}/help`} style={headerLink}>
                    Need help?
                  </Link>
                </td>
              </tr>
            </table>
          </Section>
          <div style={hairline} />

          {/* Hero / welcome */}
          <Section style={hero}>
            <Eyebrow color="#6b7280">MONTHLY ENFORCEMENT REPORT · {p.monthLabel.toUpperCase()}</Eyebrow>
            <Heading style={h1}>Know before you sign.</Heading>
            <Text style={lead}>
              You signed up to see which Canadian employers have been caught breaking foreign-worker
              rules — pulled directly from the official Government of Canada (ESDC) record, so you have
              the facts before you pay anyone or sign anything.
            </Text>
          </Section>

          {/* Honest caveat — subtle gray card */}
          <Section style={outer}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#f9fafb' }}>
              <tr>
                <td style={cardPad}>
                  <Text style={cardText}>
                    <strong>One honest thing:</strong> this list only shows employers who got{' '}
                    <em>caught</em>. If an employer isn&rsquo;t on it, that doesn&rsquo;t mean
                    they&rsquo;re safe — only that they haven&rsquo;t been caught yet. Use it as one
                    tool, not a guarantee.
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Scam warning — amber card */}
          <Section style={outer}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#fffbeb' }}>
              <tr>
                <td style={cardPad}>
                  <Eyebrow color="#b45309">WARNING · SCAM OF THE MONTH</Eyebrow>
                  <Heading style={h2}>You should never pay for a job</Heading>
                  <Text style={cardText}>
                    The most common scam: someone asks a worker for <strong>$22,000–$35,000</strong>{' '}
                    for an &ldquo;LMIA&rdquo; or a guaranteed job. The truth — an LMIA (the
                    employer&rsquo;s permit to hire you) costs the <em>employer</em> about $1,000, and
                    it is illegal for anyone to charge <em>you</em> for a job.
                  </Text>
                  <Text style={{ ...cardText, marginBottom: 0 }}>
                    These offers often come from someone who seems trustworthy — a recruiter, a friend,
                    someone from your own community — and the fee is often hidden as a
                    &ldquo;training fee,&rdquo; &ldquo;deposit,&rdquo; or &ldquo;processing cost.&rdquo;
                    If you&rsquo;re asked to pay for a job, stop and get advice.
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Enforcement report — echoes the site's signature report card */}
          <Section style={outer}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={reportCard}>
              {/* Red header bar */}
              <tr>
                <td style={reportHeader}>
                  <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                    <tr>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Text style={reportHeaderEyebrow}>ENFORCEMENT REPORT</Text>
                        <Text style={reportHeaderTitle}>{p.monthLabel}</Text>
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                        <Link href={reportHref} style={reportHeaderPill}>Full report &rsaquo;</Link>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              {/* Stats row */}
              <tr>
                <td style={{ padding: 0 }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                    <tr>
                      <td style={statCell}>
                        <Text style={statNum}>{p.newBansCount}</Text>
                        <Text style={statLabel}>New bans</Text>
                      </td>
                      <td style={{ ...statCell, borderLeft: '1px solid #f1f1f1' }}>
                        <Text style={statNum}>{p.topProvince}</Text>
                        <Text style={statLabel}>Top province</Text>
                      </td>
                      <td style={{ ...statCell, borderLeft: '1px solid #f1f1f1' }}>
                        <Text style={statNum}>{p.expiringCount}</Text>
                        <Text style={statLabel}>Expiring</Text>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              {/* Newly banned list */}
              <tr>
                <td style={{ padding: '16px 22px 20px' }}>
                  <Text style={listEyebrow}>NEWLY BANNED · MOST SERIOUS</Text>
                  {p.highlights.map((b, i) => (
                    <table key={i} width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                      <tr>
                        <td style={{ width: '16px', verticalAlign: 'top' }}>
                          <div style={redDot} />
                        </td>
                        <td style={bannedName}>
                          {b.name}
                          {b.note ? <span style={rowNote}> · {b.note}</span> : null}
                        </td>
                        <td style={bannedPenalty}>{b.penalty}</td>
                      </tr>
                    </table>
                  ))}
                  <Text style={{ ...muted, marginTop: '10px', fontStyle: 'normal' }}>
                    Source: Government of Canada non-compliant employer list.
                  </Text>
                </td>
              </tr>
            </table>

            <Text style={{ ...cardText, marginTop: '16px', marginBottom: '4px' }}>
              <strong>Heads up for {p.nextMonthLabel}:</strong> {p.expiringNextMonthCount} employer
              {p.expiringNextMonthCount === 1 ? '’s' : 's’'} bans end in {p.nextMonthLabel},
              so they&rsquo;ll be allowed to hire again. A past ban means be <em>extra</em> careful —
              never reassured.{' '}
              <Link href={reportHref} style={inlineLink}>See who &rsaquo;</Link>
            </Text>
          </Section>

          {/* This month's pattern — interpretive layer (indigo card) */}
          <Section style={outer}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#eef2ff' }}>
              <tr>
                <td style={cardPad}>
                  <Eyebrow color="#4338ca">THIS MONTH&rsquo;S PATTERN</Eyebrow>
                  <Text style={{ ...cardText, color: '#3730a3', marginBottom: 0 }}>{p.patternText}</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Opportunity — honest evergreen pointer to positive data */}
          <Section style={hero}>
            <Eyebrow color="#15803d">LOOKING FOR LEGITIMATE WORK?</Eyebrow>
            <Text style={{ ...cardText, marginBottom: '4px' }}>
              Over <strong>{p.positiveCount} Canadian employers</strong> currently hold approved LMIAs
              to hire foreign workers legally. Search by job type or province at{' '}
              <Link href={siteHref} style={inlineLink}>lmiacheck.ca</Link>.
            </Text>
            <Text style={muted}>Latest government data: {p.positiveQuarter}.</Text>
          </Section>

          {/* Rights */}
          <Section style={hero}>
            <Eyebrow>YOUR RIGHTS</Eyebrow>
            <Heading style={h2}>You&rsquo;re allowed to use them</Heading>
            <Bullet>Your employer has no legal right to hold your passport, work permit, or ID.</Bullet>
            <Bullet>
              You cannot be punished, fired, or lose your status for reporting unfair or unsafe
              treatment. Reports are confidential.
            </Bullet>
            <Bullet>
              Being mistreated? You can apply for an open work permit for vulnerable workers and leave
              that employer right away.
            </Bullet>
          </Section>

          {/* Help — green card */}
          <Section style={outer}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#f0fdf4' }}>
              <tr>
                <td style={cardPad}>
                  <Eyebrow color="#15803d">WHERE TO GET HELP</Eyebrow>
                  <Text style={helpItem}>
                    <strong>{p.helpOrgName}</strong> — worker-led, free, confidential
                    <br />
                    <Link href={p.helpOrgUrl} style={greenLink}>{p.helpOrgUrl.replace(/^https?:\/\//, '')}</Link>
                  </Text>
                  <Text style={helpItem}>
                    Service Canada confidential tip line
                    <br />
                    <Link href="tel:18666029448" style={greenLink}>1-866-602-9448</Link>
                  </Text>
                  <Text style={{ ...helpItem, marginBottom: 0 }}>
                    Human Trafficking Hotline
                    <br />
                    <Link href="tel:18339001010" style={greenLink}>1-833-900-1010</Link>
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Primary CTA */}
          <Section style={{ textAlign: 'center', padding: '12px 24px 28px' }}>
            <Button href={siteHref} style={buttonPrimary}>
              Check any employer — free
            </Button>
          </Section>

          <div style={hairline} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&rsquo;re receiving this because you signed up at lmiacheck.ca for the monthly
              enforcement report. Data is from the public Government of Canada non-compliant employer
              list.
            </Text>
            <Text style={footerText}>
              Know someone job-hunting in Canada? Forward this — it could save them thousands.
            </Text>
            <Text style={footerText}>
              LMIA Check &nbsp;·&nbsp; <Link href={p.unsubscribeUrl} style={footerLink}>Unsubscribe anytime</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
      <tr>
        <td style={{ width: '22px', verticalAlign: 'top' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1d4ed8', marginTop: '9px' }} />
        </td>
        <td>
          <Text style={{ ...cardText, margin: '0 0 12px' }}>{children}</Text>
        </td>
      </tr>
    </table>
  )
}

/* ---------- styles ---------- */
const body: React.CSSProperties = {
  backgroundColor: '#ececed',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: '24px 0',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  width: '100%',
  borderRadius: '18px',
  overflow: 'hidden',
}
const header: React.CSSProperties = { padding: '22px 32px 16px' }
const wordmark: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', margin: 0 }
const headerLink: React.CSSProperties = { fontSize: '14px', color: '#6b7280', textDecoration: 'none' }
const hairline: React.CSSProperties = { borderTop: '1px solid #ececec', margin: '0 32px' }
const hero: React.CSSProperties = { padding: '20px 32px 8px' }
const eyebrow: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }
const h1: React.CSSProperties = { fontSize: '30px', lineHeight: '34px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: '0 0 12px' }
const h2: React.CSSProperties = { fontSize: '21px', lineHeight: '26px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: '0 0 10px' }
const lead: React.CSSProperties = { fontSize: '16px', lineHeight: '25px', color: '#4b5563', margin: '0 0 8px' }
const outer: React.CSSProperties = { padding: '10px 24px' }
const card: React.CSSProperties = {
  borderRadius: '16px',
  width: '100%',
  boxShadow: '0 1px 2px 0 rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08)',
}
const cardPad: React.CSSProperties = { padding: '22px 24px' }
const cardText: React.CSSProperties = { fontSize: '16px', lineHeight: '25px', color: '#374151', margin: '0 0 12px' }
const muted: React.CSSProperties = { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', margin: '0 0 4px' }
const inlineLink: React.CSSProperties = { color: '#1d4ed8', textDecoration: 'underline', fontWeight: 600 }
const rowName: React.CSSProperties = { fontSize: '16px', color: '#111827', padding: '10px 0', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }
const rowNote: React.CSSProperties = { fontSize: '13px', color: '#9ca3af', fontWeight: 400 }
const rowPenalty: React.CSSProperties = { fontSize: '16px', fontWeight: 700, color: '#111827', textAlign: 'right', whiteSpace: 'nowrap', padding: '10px 0', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }
const helpItem: React.CSSProperties = { fontSize: '15px', lineHeight: '22px', color: '#166534', margin: '0 0 14px' }
// Signature report card (mirrors homepage)
const reportCard: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #eef0f2',
  overflow: 'hidden',
  boxShadow: '0 1px 2px 0 rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08)',
}
const reportHeader: React.CSSProperties = { backgroundColor: '#dc2626', padding: '16px 22px' }
const reportHeaderEyebrow: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fecaca', margin: '0 0 2px' }
const reportHeaderTitle: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }
const reportHeaderPill: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '7px 12px', textDecoration: 'none', whiteSpace: 'nowrap' }
const statCell: React.CSSProperties = { width: '33.33%', textAlign: 'center', padding: '14px 8px', borderBottom: '1px solid #f1f1f1' }
const statNum: React.CSSProperties = { fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0, fontVariantNumeric: 'tabular-nums', lineHeight: '28px' }
const statLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', margin: '2px 0 0' }
const listEyebrow: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 10px' }
const redDot: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f87171', marginTop: '9px' }
const bannedName: React.CSSProperties = { fontSize: '15px', fontWeight: 600, color: '#1f2937', padding: '5px 0', verticalAlign: 'top' }
const bannedPenalty: React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: '#111827', textAlign: 'right', whiteSpace: 'nowrap', padding: '5px 0', verticalAlign: 'top' }
const greenLink: React.CSSProperties = { color: '#15803d', textDecoration: 'underline', fontWeight: 600 }
const buttonPrimary: React.CSSProperties = {
  backgroundColor: '#1d4ed8', borderRadius: '12px', color: '#ffffff', fontSize: '16px', fontWeight: 700, padding: '15px 30px', textDecoration: 'none', display: 'inline-block',
}
const buttonSecondary: React.CSSProperties = {
  backgroundColor: '#ffffff', border: '1.5px solid #d1d5db', borderRadius: '10px', color: '#1d4ed8', fontSize: '15px', fontWeight: 600, padding: '11px 22px', textDecoration: 'none', display: 'inline-block',
}
const footer: React.CSSProperties = { padding: '18px 32px 26px' }
const footerText: React.CSSProperties = { fontSize: '12px', lineHeight: '18px', color: '#9ca3af', margin: '0 0 8px' }
const footerLink: React.CSSProperties = { color: '#6b7280', textDecoration: 'underline' }
