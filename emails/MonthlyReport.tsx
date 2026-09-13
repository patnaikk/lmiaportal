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

/**
 * Subject line for the current issue. Lives here, beside the copy it belongs
 * to, because it was previously duplicated in the send route and the preview
 * page and silently drifted out of sync between them.
 */
export const SUBJECT = 'August 2026: 29 employers fined $627,750 \u2014 and no new bans'

export interface BanHighlight {
  name: string
  penalty: string // e.g. "$90,000"
  note?: string // e.g. "largest penalty"
  url?: string // deep link to the employer's page on the site
}

export interface ProvinceCount {
  province: string
  count: number
}

export interface ReportStat {
  value: string
  label: string
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
  provincialBreakdown?: ProvinceCount[]
  /**
   * Eyebrow above the province table. Defaults to bans; override when the
   * month's breakdown counts something else (August 2026 had no bans at all,
   * so its table counts fined employers).
   */
  provincialBreakdownLabel?: string
  highlightsLabel?: string
  highlightsNote?: string
  previewText?: string
  scamTitle?: string
  scamParagraphs?: string[]
  sinceLastIssueParagraphs?: string[]
  headsUpText?: string
  /**
   * Employers named under the "heads up" line — normally the bans ending soon.
   * Same row treatment as `highlights` but with a neutral dot: these are not
   * new enforcement, they are employers becoming free to hire again.
   */
  headsUpHighlights?: BanHighlight[]
  /**
   * The three figures in the report card's stat row. Defaults to
   * bans / top province / expiring, which is the right summary in a month
   * whose story is bans. It is not always. August 2026 had 29 fines totalling
   * $627,750 and zero bans: the default row would have read "0 — 0" and made
   * the heaviest fine month since March look like nothing happened. Override
   * it so the row leads with whatever the month actually did.
   */
  stats?: ReportStat[]
}

const defaults: Required<Omit<MonthlyReportProps, 'highlights' | 'headsUpHighlights' | 'stats'>> & {
  highlights: BanHighlight[]
  headsUpHighlights: BanHighlight[]
  stats: ReportStat[]
} = {
  monthLabel: 'August 2026',
  newBansCount: 0,
  topProvince: 'AB',
  expiringCount: 0,
  stats: [
    { value: '29', label: 'Employers fined' },
    { value: '$627,750', label: 'In penalties' },
    { value: '0', label: 'New bans' },
  ],
  highlights: [
    {
      name: 'Smart Greenhouse Ltd.',
      penalty: '$180,000',
      note: 'Edmonton, AB \u2014 business was not actually operating',
      url: 'https://lmiacheck.ca/employer/smart-greenhouse-ltd',
    },
    {
      name: 'Royal Greenhouse Ltd.',
      penalty: '$100,000',
      note: 'Beaumont, AB \u2014 business was not actually operating',
      url: 'https://lmiacheck.ca/employer/royal-greenhouse-ltd',
    },
    {
      name: 'Baseline Trucking Ltd.',
      penalty: '$63,000',
      note: 'Sherwood Park, AB \u2014 pay or conditions did not match the offer',
      url: 'https://lmiacheck.ca/employer/baseline-trucking-ltd',
    },
    {
      name: 'BCM Farms Ltd.',
      penalty: '$60,000',
      note: 'Surrey, BC \u2014 business was not actually operating',
      url: 'https://lmiacheck.ca/employer/bcm-farms-ltd',
    },
    {
      name: 'Earan Janitorial Services Ltd.',
      penalty: '$46,000',
      note: 'Surrey, BC \u2014 business was not actually operating',
      url: 'https://lmiacheck.ca/employer/earan-janitorial-services-ltd',
    },
  ],
  highlightsLabel: 'AUGUST DECISIONS \u00b7 29 FINED \u00b7 NO NEW BANS',
  highlightsNote:
    'August brought more enforcement decisions than any month since March: 29 employers, penalised $627,750 between them. Not one was banned from hiring foreign workers. That combination is normal and worth understanding \u2014 ESDC reserves a hiring ban for the most serious or repeated violations, so an employer can be fined heavily and still be free to recruit you tomorrow. The five largest are below; the full list of 29 is on the site.',
  reportUrl: 'https://lmiacheck.ca/reports/2026-08',
  siteUrl: 'https://lmiacheck.ca',
  unsubscribeUrl: 'https://lmiacheck.ca/unsubscribe',
  helpOrgName: 'Migrant Workers Alliance for Change',
  helpOrgUrl: 'https://migrantworkersalliance.org',
  logoUrl: 'https://lmiacheck.ca/email/canada-flag.png',
  patternText:
    'Seven of August\u2019s 29 employers \u2014 including the two largest fines of the month, $180,000 and $100,000 \u2014 were penalised under the same rule: they were not actually operating the business the foreign worker had been hired for. Together those seven account for $407,000 of the month\u2019s total. In plain terms, this is the closest thing in the enforcement record to the job not being real. It is the same harm as a recruitment scam, except the employer here was a registered company with a genuine LMIA. The other striking number is 20: that is how many of the 29 were penalised for not handing inspectors the documents they asked for. An employer who cannot produce payroll records when the government asks is unlikely to produce them for you either. Before you pay anyone or board a flight, ask for the job offer and the LMIA number in writing, and check that the company is genuinely operating at the address on the offer \u2014 a phone number that works, a real premises, staff who have heard of it.',
  previewText:
    '29 employers fined $627,750 \u2014 and two banned employers can hire again this week.',
  scamTitle: 'The \u201cconsultant\u201d who isn\u2019t allowed to charge you',
  scamParagraphs: [
    'Only three kinds of people may legally charge you for immigration advice in Canada: a consultant licensed by the College of Immigration and Citizenship Consultants, a lawyer (or, in Ontario, a licensed paralegal) in good standing with a provincial or territorial law society, or a Quebec notary. Anyone else who takes your money for it \u2014 an agent, a \u201cvisa consultancy\u201d, a friend of a friend with an office and a printer \u2014 is acting illegally, whatever the business card says.',
    'The check takes two minutes: ask for the person\u2019s full legal name and licence number, then look them up yourself in the College\u2019s public register or the law society\u2019s directory. Two more signs worth knowing: no authorized representative can guarantee you an LMIA or a visa, and none of them need to be paid in cryptocurrency, gift cards, or a transfer to someone\u2019s personal account.',
  ],
  sinceLastIssueParagraphs: [
    'Last month we told you July had three decisions and one hiring ban. The real figure is sixteen decisions and twelve employers now ineligible to hire \u2014 $502,760 in penalties. Nothing was withdrawn and no employer we named has been cleared \u2014 the rest of July simply had not reached us when we went to press. It has now, and we would rather show you a number that moved than quietly leave the old one standing.',
    'Ten of those twelve are ineligible for a specific reason worth knowing: they have not paid their fine. That status lasts until they pay, with no fixed end date, and it is the most common form of ineligibility by far. The practical lesson is the one we keep coming back to, and July is the sharpest example of it yet: an employer who looked clean when you checked in August may not look clean today. Check again in the week you actually sign, not once at the start of your search.',
  ],
  headsUpText:
    'Two hiring bans end this month, and both employers become free to recruit foreign workers again. We promised in July to name them before it happened. A finished ban is not a clean record \u2014 it means the penalty has been served. In October two more end: Polar Bear Ice Services in Surrey, BC on the 25th and R\u00e9sidence Le Coulongeois in Qu\u00e9bec City on the 31st.',
  headsUpHighlights: [
    {
      name: 'Kowalski Accounting & Bookkeeping Inc.',
      penalty: '$43,000',
      note: 'White Rock, BC \u2014 free to hire again from 13 September',
      url: 'https://lmiacheck.ca/employer/kowalski-accounting-bookkeeping-inc',
    },
    {
      name: 'Rock Rover Transport',
      penalty: '$155,000',
      note: 'Calgary, AB \u2014 free to hire again from 17 September',
      url: 'https://lmiacheck.ca/employer/rock-rover-transport',
    },
  ],
  positiveCount: '10,000',
  positiveQuarter: 'Q3 2025',
  expiringNextMonthCount: 2,
  nextMonthLabel: 'October',
  provincialBreakdownLabel: 'EMPLOYERS FINED BY PROVINCE',
  provincialBreakdown: [
    { province: 'BC', count: 10 },
    { province: 'AB', count: 8 },
    { province: 'ON', count: 6 },
    { province: 'QC', count: 2 },
  ],
}

function Eyebrow({ children, color = '#9ca3af' }: { children: React.ReactNode; color?: string }) {
  return <Text style={{ ...eyebrow, color }}>{children}</Text>
}

function withUtm(url: string, content: string, campaign: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}&utm_content=${content}`
}

export default function MonthlyReport(props: MonthlyReportProps) {
  const p = {
    ...defaults,
    ...props,
    highlights: props.highlights ?? defaults.highlights,
    headsUpHighlights: props.headsUpHighlights ?? defaults.headsUpHighlights,
    stats: props.stats ?? defaults.stats,
    provincialBreakdown: props.provincialBreakdown ?? defaults.provincialBreakdown,
  }
  const campaign = `monthly_${p.monthLabel.toLowerCase().replace(/\s+/g, '_')}` // e.g. monthly_may_2026
  const reportHref = withUtm(p.reportUrl, 'report', campaign)
  const siteHref = withUtm(p.siteUrl, 'cta', campaign)

  return (
    <Html lang="en">
      <Head />
      <Preview>{p.previewText}</Preview>
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
                  <Link href={`${p.siteUrl}/help/i-paid`} style={headerLink}>
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
              the facts before you accept a job offer.
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
                  <Heading style={h2}>{p.scamTitle}</Heading>
                  {p.scamParagraphs.map((para, i) => (
                    <Text
                      key={i}
                      style={{ ...cardText, marginBottom: i === p.scamParagraphs.length - 1 ? 0 : 12 }}
                    >
                      {para}
                    </Text>
                  ))}
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
                      {p.stats.map((s, i) => (
                        <td
                          key={i}
                          style={i === 0 ? statCell : { ...statCell, borderLeft: '1px solid #f1f1f1' }}
                        >
                          <Text style={statNum}>{s.value}</Text>
                          <Text style={statLabel}>{s.label}</Text>
                        </td>
                      ))}
                    </tr>
                  </table>
                </td>
              </tr>
              {/* Newly banned list */}
              <tr>
                <td style={{ padding: '16px 22px 20px' }}>
                  <Text style={listEyebrow}>{p.highlightsLabel}</Text>
                  {p.highlightsNote && (
                    <Text style={{ ...cardText, fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>
                      {p.highlightsNote}
                    </Text>
                  )}
                  {p.highlights.map((b, i) => (
                    <table key={i} width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                      <tr>
                        <td style={{ width: '16px', verticalAlign: 'top' }}>
                          <div style={redDot} />
                        </td>
                        <td style={bannedName}>
                          {b.url ? (
                            <Link href={withUtm(b.url, 'employer', campaign)} style={{ color: '#1f2937', textDecoration: 'underline' }}>
                              {b.name}
                            </Link>
                          ) : (
                            b.name
                          )}
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

            {p.headsUpText ? (
              <>
                <Text style={{ ...cardText, marginTop: '16px', marginBottom: '4px' }}>{p.headsUpText}</Text>
                {p.headsUpHighlights.length > 0 && (
                  <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ marginTop: '10px' }}>
                    {p.headsUpHighlights.map((b, i) => (
                      <tr key={i}>
                        <td style={{ width: '16px', verticalAlign: 'top' }}>
                          <div style={amberDot} />
                        </td>
                        <td style={bannedName}>
                          {b.url ? (
                            <Link href={withUtm(b.url, 'expiring', campaign)} style={{ color: '#1f2937', textDecoration: 'underline' }}>
                              {b.name}
                            </Link>
                          ) : (
                            b.name
                          )}
                          {b.note ? <span style={rowNote}> · {b.note}</span> : null}
                        </td>
                        <td style={bannedPenalty}>{b.penalty}</td>
                      </tr>
                    ))}
                  </table>
                )}
              </>
            ) : (
              <Text style={{ ...cardText, marginTop: '16px', marginBottom: '4px' }}>
                <strong>Heads up for {p.nextMonthLabel}:</strong> {p.expiringNextMonthCount} employer
                {p.expiringNextMonthCount === 1 ? '’s' : 's’'} bans end in {p.nextMonthLabel},
                so they&rsquo;ll be allowed to hire again. A past ban means be <em>extra</em> careful —
                never reassured.{' '}
                <Link href={reportHref} style={inlineLink}>See who &rsaquo;</Link>
              </Text>
            )}
          </Section>

          {/* Since our last issue — follow-up on last month's story */}
          {p.sinceLastIssueParagraphs.length > 0 && (
            <Section style={outer}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#f9fafb' }}>
                <tr>
                  <td style={cardPad}>
                    <Eyebrow color="#6b7280">SINCE OUR LAST ISSUE</Eyebrow>
                    {p.sinceLastIssueParagraphs.map((para, i) => (
                      <Text
                        key={i}
                        style={{ ...cardText, marginBottom: i === p.sinceLastIssueParagraphs.length - 1 ? 0 : 12 }}
                      >
                        {para}
                      </Text>
                    ))}
                  </td>
                </tr>
              </table>
            </Section>
          )}
          {/* Provincial breakdown */}
          {p.provincialBreakdown.length > 0 && (
            <Section style={outer}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#f9fafb' }}>
                <tr>
                  <td style={cardPad}>
                    <Eyebrow color="#6b7280">{p.provincialBreakdownLabel} · {p.monthLabel.toUpperCase()}</Eyebrow>
                    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                      {p.provincialBreakdown.map((row, i) => {
                        const maxCount = Math.max(...p.provincialBreakdown.map(r => r.count))
                        const barWidth = Math.round((row.count / maxCount) * 100)
                        return (
                          <tr key={i}>
                            <td style={provLabel}>{row.province}</td>
                            <td style={provBarCell}>
                              <div style={{ ...provBar, width: `${barWidth}%` }} />
                            </td>
                            <td style={provCount}>{row.count}</td>
                          </tr>
                        )
                      })}
                    </table>
                  </td>
                </tr>
              </table>
            </Section>
          )}

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
const amberDot: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fbbf24', marginTop: '9px' }
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
const provLabel: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#374151', width: '36px', paddingBottom: '8px', verticalAlign: 'middle' }
const provBarCell: React.CSSProperties = { paddingBottom: '8px', verticalAlign: 'middle' }
const provBar: React.CSSProperties = { height: '8px', backgroundColor: '#d1d5db', borderRadius: '4px', minWidth: '8px' }
const provCount: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#6b7280', width: '24px', textAlign: 'right', paddingBottom: '8px', paddingLeft: '10px', verticalAlign: 'middle' }
const footer: React.CSSProperties = { padding: '18px 32px 26px' }
const footerText: React.CSSProperties = { fontSize: '12px', lineHeight: '18px', color: '#9ca3af', margin: '0 0 8px' }
const footerLink: React.CSSProperties = { color: '#6b7280', textDecoration: 'underline' }
