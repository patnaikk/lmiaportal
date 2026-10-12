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
import { RESTRICTED_CMAS_TO_2027_01_07 } from '@/lib/policy-changes'

/**
 * Subject line for the current issue. Lives here, beside the copy it belongs
 * to, because it was previously duplicated in the send route and the preview
 * page and silently drifted out of sync between them.
 */
export const SUBJECT = 'September 2026: 2 new hiring bans, 16 fines \u2014 and an update on August'

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

export interface RuleChangeCities {
  province: string
  cities: string[]
}

/**
 * A government rule change worth a card of its own. Optional: most months won't
 * have one, and the card disappears when `paragraphs` is empty.
 */
export interface RuleChange {
  eyebrow: string
  title: string
  paragraphs: string[]
  /** Grouped city list, e.g. the restricted-CMA list. Omit for a text-only rule change. */
  cityGroups?: RuleChangeCities[]
  linkUrl: string
  linkLabel: string
}

const PROVINCE_NAMES: Record<string, string> = {
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NB: 'New Brunswick', QC: 'Quebec',
  ON: 'Ontario', MB: 'Manitoba', SK: 'Saskatchewan', AB: 'Alberta', BC: 'British Columbia',
}

/** Groups "Toronto, ON" style entries by province, keeping list order. "ON/QC" files under the first. */
function groupCitiesByProvince(entries: readonly string[]): RuleChangeCities[] {
  const groups: RuleChangeCities[] = []
  for (const entry of entries) {
    const i = entry.lastIndexOf(', ')
    const code = entry.slice(i + 2).split('/')[0]
    const province = PROVINCE_NAMES[code] ?? code
    let g = groups.find((x) => x.province === province)
    if (!g) groups.push((g = { province, cities: [] }))
    g.cities.push(entry.slice(0, i))
  }
  return groups
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
  ruleChange?: RuleChange | null
}

const defaults: Required<Omit<MonthlyReportProps, 'highlights' | 'headsUpHighlights' | 'stats' | 'ruleChange'>> & {
  ruleChange: RuleChange | null
  highlights: BanHighlight[]
  headsUpHighlights: BanHighlight[]
  stats: ReportStat[]
} = {
  // DRAFT 2026-10-04, re-pulled 2026-10-12 for send on 2026-10-13. Every figure below comes from the
  // live ESDC feed as of 2026-10-12 (1,425 records, 18 September decisions; was 14 on 2026-10-03). ESDC publishes 5-14 days late, so RE-PULL
  // buildMonthlyReport('2026-09') on send day and update counts, totals and highlights.
  monthLabel: 'September 2026',
  newBansCount: 2,
  topProvince: 'BC',
  expiringCount: 0,
  stats: [
    { value: '2', label: 'New hiring bans' },
    { value: '16', label: 'Employers fined' },
    { value: '$939,750', label: 'In penalties' },
  ],
  highlights: [
    {
      name: '1366043 BC Ltd.',
      penalty: '$268,000',
      note: 'Mission, BC — fined, the largest penalty this month; was not actually operating the business, and pay or conditions did not match the offer',
      url: 'https://lmiacheck.ca/employer/1366043-bc-ltd',
    },
    {
      name: 'Ship Eazy Logistics',
      penalty: '$203,000',
      note: 'Winnipeg, MB — banned until September 2027; job not as offered, business not actually operating',
      url: 'https://lmiacheck.ca/employer/ship-eazy-logistics',
    },
    {
      name: 'Peels Nurseries Ltd.',
      penalty: '$152,000',
      note: 'Langley, BC — banned for five years, until 2031; pay or conditions did not match the offer, no health insurance for workers',
      url: 'https://lmiacheck.ca/employer/peels-nurseries-ltd',
    },
    {
      name: 'Ô Saine Terre',
      penalty: '$127,750',
      note: 'L’Assomption, QC — fined; included a finding of abuse in the workplace',
      url: 'https://lmiacheck.ca/employer/saine-terre',
    },
    {
      name: 'Africa Mart Inc',
      penalty: '$40,000',
      note: 'Scarborough, ON — fined; did not give inspectors the documents they asked for',
      url: 'https://lmiacheck.ca/employer/africa-mart-inc',
    },
  ],
  highlightsLabel: 'SEPTEMBER DECISIONS · 2 BANNED · 16 FINED',
  highlightsNote:
    'Two employers were banned from hiring foreign workers in September, and sixteen more were fined. Most hiring bans last one or two years; Peels Nurseries is barred for five. The sixteen fined employers can still legally hire today — but read the update on August below before you treat that as good news. A fine that goes unpaid becomes a ban. The five largest penalties are below; the full list is on the site.',
  reportUrl: 'https://lmiacheck.ca/reports/2026-09',
  siteUrl: 'https://lmiacheck.ca',
  unsubscribeUrl: 'https://lmiacheck.ca/unsubscribe',
  helpOrgName: 'Migrant Workers Alliance for Change',
  helpOrgUrl: 'https://migrantworkersalliance.org',
  logoUrl: 'https://lmiacheck.ca/email/canada-flag.png',
  patternText:
    'Eight of September’s eighteen employers were penalised under the same rule: the pay or working conditions were not what the job offer promised. That includes both employers banned this month and the largest fine — together $801,250 of the month’s $939,750. This is the most common way a real job goes wrong, and the one you are best placed to prove. Keep your signed job offer and your LMIA number somewhere safe, outside your employer’s reach. When your first payslip arrives, compare it line by line with the offer: hourly wage, hours, overtime, and any deductions you never agreed to. If they don’t match, write down the dates and amounts. That record is what an inspector, a lawyer or a worker organisation will ask you for first.',
  previewText:
    'Two new hiring bans, sixteen fines — and why most of August’s “fined only” employers are now banned.',
  scamTitle: 'Being asked to pay for your own LMIA or recruitment',
  scamParagraphs: [
    'An employer in Canada is not allowed to charge you, or take back from your wages, the cost of getting an LMIA. They are also not allowed to charge you recruitment fees, and since 2022 they are responsible for making sure any recruiter or agency they use doesn’t charge you either. These rules apply to the employer whether the request comes from them, from a recruiter in your home country, or from a “partner agency”.',
    'The request is rarely called a fee. It shows up as a “processing charge”, a “deposit” you’ll get back after you arrive, a cut of your first months’ pay, or money for a “job guarantee”. If anyone connected to a Canadian job asks you for money to get the job or the LMIA, treat it as a warning sign, keep every message and receipt, and check the employer before you pay anything.',
  ],
  sinceLastIssueParagraphs: [
    'Last month we told you that August’s 29 employers had been fined, not banned. That was what the government list said when we sent it. It has changed since: 15 of those 29 employers — including all five we named — are now listed as “Ineligible – unpaid monetary penalty”. They did not pay their fines, so they can no longer hire foreign workers. Between them they owe $515,750.',
    'We also told you that Kowalski Accounting & Bookkeeping (White Rock, BC) and Rock Rover Transport (Calgary, AB) would be free to hire again in September, when their bans ended. That turned out to be wrong. Their bans did end, but neither has paid its fine, so both are still ineligible and have no end date. We should have said “if the fine has been paid”, and from now on we will.',
    'The lesson for you is the same one we have repeated since July, and August proves it again: an employer’s status can change after you check it, in either direction. A fine today can be a ban next month. Check again in the week you actually sign.',
  ],
  headsUpText:
    'No hiring bans ended in September. In October, two ban periods are due to end: Polar Bear Ice Services in Surrey, BC on the 25th and Résidence Le Coulongeois in Québec City on the 31st. They can hire again only if their fines have been paid — as Kowalski and Rock Rover showed this month, that is not guaranteed. Check their status after the date, not before.',
  headsUpHighlights: [
    {
      name: 'Polar Bear Ice Services Inc.',
      penalty: '$60,000',
      note: 'Surrey, BC — ban period ends 25 October; still barred if the fine is unpaid',
      url: 'https://lmiacheck.ca/employer/polar-bear-ice-services-inc',
    },
    {
      name: 'Résidence Le Coulongeois',
      penalty: '$60,000',
      note: 'Québec City, QC — ban period ends 31 October; still barred if the fine is unpaid',
      url: 'https://lmiacheck.ca/employer/r-sidence-le-coulongeois',
    },
  ],
  ruleChange: {
    eyebrow: 'RULE CHANGE · LOW-WAGE JOBS',
    title: '30 cities where a new low-wage LMIA can’t be processed until January 8',
    paragraphs: [
      'From October 9, 2026 to January 7, 2027, the government will not process a new LMIA application for a low-wage job in any of the 30 cities below, because unemployment there is 6% or higher. A job is low-wage if it pays less than the threshold for its province — for example $36.92 an hour in Ontario, $38.40 in British Columbia and $37.50 in Alberta. Each city includes the surrounding towns in its metropolitan area.',
      'Halifax, Fredericton, Kingston, St. Catharines-Niagara, Regina and Lethbridge were added this time. Kamloops and Chilliwack were removed.',
      'Some jobs are exempt: farm work, construction, food manufacturing, hospitals, nursing homes and some in-home caregivers. For any other low-wage job in these cities, if someone tells you they are starting your LMIA now, it cannot be processed before January 8. Ask what the job pays and exactly where you would work, and check before you pay anyone.',
    ],
    cityGroups: groupCitiesByProvince(RESTRICTED_CMAS_TO_2027_01_07),
    linkUrl: 'https://lmiacheck.ca/rule-changes',
    linkLabel: 'See every rule change and the wage thresholds',
  },
  positiveCount: '40,000',
  positiveQuarter: 'January 2025 to March 2026',
  expiringNextMonthCount: 2,
  nextMonthLabel: 'October',
  provincialBreakdownLabel: 'EMPLOYERS PENALISED BY PROVINCE',
  provincialBreakdown: [
    { province: 'BC', count: 6 },
    { province: 'ON', count: 5 },
    { province: 'AB', count: 3 },
    { province: 'QC', count: 2 },
    { province: 'MB', count: 1 },
    { province: 'YT', count: 1 },
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
    ruleChange: props.ruleChange === undefined ? defaults.ruleChange : props.ruleChange,
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

          {/* Rule change — government policy that changes what an offer can be (sky card) */}
          {p.ruleChange && p.ruleChange.paragraphs.length > 0 && (
            <Section style={outer}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ ...card, backgroundColor: '#f0f9ff' }}>
                <tr>
                  <td style={cardPad}>
                    <Eyebrow color="#0369a1">{p.ruleChange.eyebrow}</Eyebrow>
                    <Text style={{ ...cardText, fontSize: '18px', lineHeight: '25px', fontWeight: 700, color: '#0c4a6e' }}>
                      {p.ruleChange.title}
                    </Text>
                    {p.ruleChange.paragraphs.map((para, i) => (
                      <Text key={i} style={{ ...cardText, color: '#075985' }}>{para}</Text>
                    ))}
                    {p.ruleChange.cityGroups && p.ruleChange.cityGroups.length > 0 && (
                      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '4px 0 14px' }}>
                        {p.ruleChange.cityGroups.flatMap((g) => [
                          <tr key={g.province}>
                            <td style={cityProvince}>{g.province}</td>
                          </tr>,
                          <tr key={`${g.province}-cities`}>
                            <td style={cityList}>{g.cities.join(' · ')}</td>
                          </tr>,
                        ])}
                      </table>
                    )}
                    <Link href={withUtm(p.ruleChange.linkUrl, 'rule_change', campaign)} style={{ ...inlineLink, color: '#0369a1' }}>
                      {p.ruleChange.linkLabel} &rsaquo;
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>
          )}

          {/* Opportunity — honest evergreen pointer to positive data */}
          <Section style={hero}>
            <Eyebrow color="#15803d">LOOKING FOR LEGITIMATE WORK?</Eyebrow>
            <Text style={{ ...cardText, marginBottom: '4px' }}>
              Over <strong>{p.positiveCount} Canadian employers</strong> have been approved for LMIAs
              to hire foreign workers legally since January 2025. Search by job type or province at{' '}
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
const cityProvince: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0369a1', paddingTop: '8px' }
const cityList: React.CSSProperties = { fontSize: '15px', lineHeight: '22px', color: '#0c4a6e', paddingBottom: '4px' }
const footer: React.CSSProperties = { padding: '18px 32px 26px' }
const footerText: React.CSSProperties = { fontSize: '12px', lineHeight: '18px', color: '#9ca3af', margin: '0 0 8px' }
const footerLink: React.CSSProperties = { color: '#6b7280', textDecoration: 'underline' }
