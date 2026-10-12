// Government policy changes to the Temporary Foreign Worker Program.
//
// Distinct from app/updates (the product changelog). This tracks what ESDC/IRCC
// changed, for workers who need to know how the rules moved — not what we shipped.
//
// Each entry is dated and carries an official source. Verified 2026-10-12.

export type PolicyImpact = 'critical' | 'important' | 'context'

export interface PolicyChange {
  /** ISO date the change took effect (or was published, for reports). */
  date: string
  /** Short headline — what changed. */
  title: string
  /** What it means for a foreign worker, in plain language. */
  meaning: string
  /** Why it matters when judging a job offer. Omit where there's no fraud angle. */
  fraudAngle?: string
  impact: PolicyImpact
  sourceLabel: string
  sourceUrl: string
  /** Set when the change is scheduled to be revisited — drives the "next update" note. */
  nextReview?: string
}

/** High-wage / low-wage boundary by province, effective 2026-07-17 (120% of provincial median). */
export const WAGE_THRESHOLDS_2026_07_17: { province: string; current: number; previous: number }[] = [
  { province: 'Alberta', current: 37.5, previous: 36.0 },
  { province: 'British Columbia', current: 38.4, previous: 36.6 },
  { province: 'Manitoba', current: 31.33, previous: 30.16 },
  { province: 'New Brunswick', current: 31.73, previous: 30.0 },
  { province: 'Newfoundland and Labrador', current: 33.6, previous: 32.4 },
  { province: 'Northwest Territories', current: 48.0, previous: 48.0 },
  { province: 'Nova Scotia', current: 31.96, previous: 30.0 },
  { province: 'Nunavut', current: 45.0, previous: 42.0 },
  { province: 'Ontario', current: 36.92, previous: 36.0 },
  { province: 'Prince Edward Island', current: 31.2, previous: 30.0 },
  { province: 'Quebec', current: 36.0, previous: 34.62 },
  { province: 'Saskatchewan', current: 34.62, previous: 33.6 },
  { province: 'Yukon', current: 45.6, previous: 44.4 },
]

/**
 * Census metropolitan areas where ESDC will NOT process low-wage LMIA
 * applications, 2026-10-09 through 2027-01-07 (unemployment >= 6%).
 * Refreshed quarterly — ESDC publishes the next list on 2027-01-08; it MUST be
 * re-verified then or removed.
 */
export const RESTRICTED_CMAS_TO_2027_01_07 = [
  "St. John's, NL", 'Halifax, NS', 'Moncton, NB', 'Fredericton, NB',
  'Montréal, QC', 'Ottawa-Gatineau, ON/QC', 'Kingston, ON', 'Belleville–Quinte West, ON',
  'Peterborough, ON', 'Oshawa, ON', 'Toronto, ON', 'Hamilton, ON',
  'St. Catharines-Niagara, ON', 'Kitchener-Cambridge-Waterloo, ON', 'Brantford, ON', 'Guelph, ON',
  'London, ON', 'Windsor, ON', 'Barrie, ON', 'Greater Sudbury, ON',
  'Regina, SK', 'Saskatoon, SK', 'Lethbridge, AB', 'Calgary, AB',
  'Red Deer, AB', 'Edmonton, AB', 'Kelowna, BC', 'Abbotsford-Mission, BC',
  'Vancouver, BC', 'Nanaimo, BC',
] as const

/** Last day the list above applies (per ESDC's refusal-to-process page). */
export const RESTRICTED_CMAS_VALID_UNTIL = '2027-01-07'
/** Day ESDC publishes the next quarterly list. */
export const RESTRICTED_CMAS_NEXT_UPDATE = '2027-01-08'

export const POLICY_CHANGES: PolicyChange[] = [
  {
    date: '2026-10-09',
    title: '30 cities are closed to low-wage LMIA applications through January 7, 2027',
    meaning:
      'ESDC will not process low-wage LMIA applications in census metropolitan areas where unemployment is 6% or higher. That currently includes Toronto, Vancouver, Calgary, Edmonton and Montréal. Halifax, Fredericton, Kingston, St. Catharines-Niagara, Regina and Lethbridge were newly added. Kamloops and Chilliwack reopened.',
    fraudAngle:
      'This is the clearest test on this page. If someone is selling you a low-wage job in one of these cities right now, an LMIA cannot legally be issued for it. The offer cannot be what they say it is.',
    impact: 'critical',
    sourceLabel: 'ESDC — refusal to process',
    sourceUrl: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers/refusal.html',
    nextReview: '2027-01-08',
  },
  {
    date: '2026-09-18',
    title: 'Staffing agencies can no longer be the employer on an LMIA',
    meaning:
      'Service Canada added an "Employers" section to its LMIA requirements. The employer must be the business that hires you, sets your working conditions and pays you directly — judged by who decides where, when and how you work, who can dismiss you, and who benefits from your work. Staffing or employment agencies that recruit workers for other businesses are not employers under the program, and employers cannot classify temporary foreign workers as independent contractors, before or after hiring.',
    fraudAngle:
      'Look at who is named as the employer. If it is a staffing, recruitment or placement agency, and you would actually work at a different company, that is not a valid LMIA arrangement. The same goes for an offer that calls you an "independent contractor". Either one is a reason to stop before you pay anyone.',
    impact: 'critical',
    sourceLabel: 'ESDC — program requirements for low-wage positions',
    sourceUrl:
      'https://www.canada.ca/en/employment-social-development/services/foreign-workers/median-wage/low/requirements.html',
  },
  {
    date: '2026-10-07',
    title: 'High-wage LMIAs now take about 98 business days to process',
    meaning:
      'ESDC publishes average LMIA processing times every month. For September 2026: high-wage stream 98 business days, low-wage stream 82, permanent residence stream 79, agricultural stream 22, Seasonal Agricultural Worker Program 7, Global Talent Stream 9. Business days exclude weekends and holidays, so 98 business days is roughly four and a half months. The required advertising period is not counted in these times.',
    fraudAngle:
      'Outside the Global Talent Stream — which is limited to specialized, mostly tech, roles — nobody can get you an LMIA in two weeks. If a recruiter promises a fast LMIA for an ordinary job, that promise does not match how long the government is actually taking.',
    impact: 'important',
    sourceLabel: 'ESDC — LMIA processing times',
    sourceUrl:
      'https://www.canada.ca/en/employment-social-development/services/foreign-workers/labour-market-impact-assessment-processing-times.html',
  },
  {
    date: '2026-08-21',
    title: 'Workers already in Canada get a 90-day window while their employer\'s LMIA is pending',
    meaning:
      'If your work permit expires within 2 weeks and your employer has already submitted a complete LMIA application, IRCC will hold your new work permit application for up to 90 days (up from 60) while the LMIA is decided. Applicants are asked to put the code CPTS2026 in the intended occupation field. An LMIA filed at the last minute only qualifies in exceptional cases.',
    fraudAngle:
      'This only works if a real LMIA application has already been submitted by a real employer. Ask for the LMIA application details before you rely on it — a recruiter who says "apply now, the LMIA is coming" may leave you without status.',
    impact: 'context',
    sourceLabel: 'IRCC — LMIA review officer instructions',
    sourceUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/exemption-codes/validity-suspension-duration-employment.html',
  },
  {
    date: '2026-08-18',
    title: 'ESDC clarified the low-wage cap for employers with fewer than 10 employees',
    meaning:
      'For a work location with fewer than 10 employees, ESDC calculates the low-wage cap as if the location had 10. That means at most 1 low-wage temporary foreign worker under a 10% cap, or 2 under a 20% cap, at that location. Part-time staff count as half an employee. Positions with no cap, such as on-farm primary agriculture, are not affected.',
    fraudAngle:
      'A small business — a single restaurant, shop or household — cannot bring in a group of low-wage foreign workers at one location. If a tiny employer is offering several low-wage LMIA jobs at the same place, the numbers do not add up.',
    impact: 'important',
    sourceLabel: 'ESDC — program requirements for low-wage positions',
    sourceUrl:
      'https://www.canada.ca/en/employment-social-development/services/foreign-workers/median-wage/low/requirements.html',
  },
  {
    date: '2026-07-17',
    title: 'Wage thresholds reset — many jobs moved from high-wage to low-wage',
    meaning:
      'The line dividing the high-wage and low-wage streams is now 120% of the median wage in each province. Every province went up. A job paying $36/hour in Ontario was high-wage in June; it is low-wage now.',
    fraudAngle:
      'Low-wage positions carry far more restrictions. If someone told you your offer is "high-wage", check it against the table below — the answer may have changed on July 17.',
    impact: 'critical',
    sourceLabel: 'CIC News — new TFWP wage thresholds',
    sourceUrl: 'https://www.cicnews.com/2026/07/canada-raises-wage-thresholds-for-tfwp-work-permits-0778105.html',
  },
  {
    date: '2026-07-10',
    title: '26 cities were closed to low-wage LMIA applications from July 10 to October 8',
    meaning:
      'ESDC would not process low-wage LMIA applications in census metropolitan areas where unemployment was 6% or higher. That included Toronto, Vancouver, Calgary, Edmonton and Montréal. Saskatoon, Red Deer, Kamloops and Chilliwack were newly added. Halifax, Winnipeg, Regina, Saint John, Fredericton, Kingston, St. Catharines-Niagara and Drummondville reopened.',
    fraudAngle:
      'This is the clearest test on this page. If someone is selling you a low-wage job in one of these cities right now, an LMIA cannot legally be issued for it. The offer cannot be what they say it is.',
    impact: 'critical',
    sourceLabel: 'ESDC — refusal to process',
    sourceUrl: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers/refusal.html',
    nextReview: '2026-10-09',
  },
  {
    date: '2026-07-09',
    title: 'Penalties against non-compliant employers more than doubled',
    meaning:
      'ESDC published its enforcement results for April 2025 to March 2026: 1,488 inspections, 12% of inspected employers found non-compliant, $10.2 million in penalties (up from $4.5 million the year before), and 30 employers banned from the program.',
    fraudAngle:
      'Enforcement is increasing, and banned employers are published. Checking an employer against that list before you pay anyone is now more useful than it has ever been.',
    impact: 'important',
    sourceLabel: 'Government of Canada — compliance penalties',
    sourceUrl:
      'https://www.canada.ca/en/employment-social-development/news/2026/07/the-government-of-canada-highlights-doubling-of-compliance-monetary-penalties-under-the-temporary-foreign-worker-program.html',
  },
  {
    date: '2026-04-01',
    title: 'Low-wage jobs must be advertised for 8 weeks, and youth must be recruited first',
    meaning:
      'Employers must advertise a low-wage position for 8 consecutive weeks — double the previous 4 — and must show they tried to recruit young Canadians first. Rural employers in participating provinces can raise their low-wage cap from 10% to 15% until March 31, 2027.',
    fraudAngle:
      'The 8 weeks must be finished before the employer applies. A "fast LMIA" on a low-wage job is not possible within that window.',
    impact: 'important',
    sourceLabel: 'CIC News — new LMIA advertising rules',
    sourceUrl:
      'https://www.cicnews.com/2026/04/new-lmia-rules-double-advertising-period-and-require-employers-to-target-youth-0473796.html',
  },
  {
    date: '2026-01-01',
    title: 'Canada cut how many temporary foreign workers it will admit in 2026',
    meaning:
      'The 2026 target is 60,000 workers through the TFWP — 22,000 fewer than the 82,000 targeted for 2025, part of a plan to bring temporary residents below 5% of the population by 2027.',
    fraudAngle:
      'Fewer available positions and longer waits mean more pressure — and more people willing to sell offers that do not exist. Scarcity is exactly when fraud rises.',
    impact: 'context',
    sourceLabel: 'CIC News — TFWP admissions',
    sourceUrl: 'https://www.cicnews.com/2026/08/lmia-processing-times-edge-higher-0879065.html',
  },
]

/** Most recent change, for the homepage teaser. */
export function latestPolicyChange(): PolicyChange {
  return [...POLICY_CHANGES].sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function formatPolicyDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}
