# LMIA Verification Portal — Claude Code Master Prompt
### Copy and paste this entire prompt into Claude Code to begin building

---

## YOUR ROLE

You are a principal UI/UX engineer with 15 years at Apple, specialising in human interface design, performance engineering, and accessibility. You design tools used by millions of people across every device and network condition — including people on slow mobile connections in developing countries. You obsess over simplicity, clarity, and speed. You never add what isn't needed. Every pixel earns its place.

---

## THE PROJECT

Build the **LMIA Verification Portal** — a free, mobile-first web application that helps vulnerable foreign workers in Canada and abroad verify whether a job offer letter they have received is legitimate or potentially fraudulent.

Workers are targeted by LMIA (Labour Market Impact Assessment) fraud. They are asked to pay $5,000–$20,000 CAD to fake recruiters for fraudulent job offers. The Canadian government publishes data on which employers have received legitimate LMIAs and which employers have been found non-compliant — but this data is buried in Excel files that workers cannot access or understand.

This portal closes that gap. A worker types in an employer name. The portal checks the government data and returns a clear risk indicator. That is the entire purpose.

---

## DESIGN PHILOSOPHY — APPLE PRINCIPLES

Apply these principles without compromise:

- **Clarity above all** — The risk result must be immediately understood by someone with limited English literacy viewing it on a cheap Android phone on a slow connection in the Philippines
- **No heavy assets** — Zero large images, zero hero graphics, zero decorative illustrations. SVG icons only, inline where possible
- **Performance first** — Sub-2-second load on a 3G connection. Lighthouse score 95+. No render-blocking resources
- **Progressive disclosure** — Show only what is needed at each step. Do not overwhelm with information upfront
- **Accessible** — WCAG 2.1 AA minimum. High contrast. Large tap targets (minimum 44px). Works with screen readers
- **Mobile first** — Design for a 375px wide screen first. Desktop is secondary
- **One job, done perfectly** — This tool does one thing: verify an employer name and return a risk score. Resist all feature creep in the UI

---

## TECH STACK

```
Frontend:     Next.js 14 (App Router) + TypeScript
Styling:      Tailwind CSS only — no component libraries, no heavy UI kits
Backend:      Netlify Functions (serverless, Node.js)
Database:     Supabase (PostgreSQL with pg_trgm fuzzy search extension)
Fonts:        System font stack only — -apple-system, BlinkMacSystemFont, 'Segoe UI'
              No Google Fonts, no web font loading — zero font render blocking
Icons:        Inline SVG only — no icon libraries
Analytics:    Minimal anonymous search logging (employer name searched, result returned, timestamp)
```

---

## COLOUR SYSTEM

Use CSS variables. Keep the palette minimal and purposeful:

```css
--color-bg:           #FAFAFA;    /* Near white background */
--color-surface:      #FFFFFF;    /* Cards and inputs */
--color-border:       #E5E7EB;    /* Subtle borders */
--color-text-primary: #111827;    /* Primary text */
--color-text-muted:   #6B7280;    /* Secondary text, disclaimers */

/* Risk indicator colours — these are the most important colours in the system */
--color-green:        #16A34A;    /* Verified */
--color-green-bg:     #F0FDF4;
--color-yellow:       #D97706;    /* Verify further */
--color-yellow-bg:    #FFFBEB;
--color-red:          #DC2626;    /* High risk */
--color-red-bg:       #FEF2F2;
--color-grey:         #4B5563;    /* Not found */
--color-grey-bg:      #F9FAFB;

--color-brand:        #1D4ED8;    /* Primary brand blue — links, focus rings */
```

---

## APPLICATION STRUCTURE

Build the following pages and components:

### Pages

**1. Home Page (`/`)**
- Minimal header: site name "LMIA Check" + tagline "Verify a Canadian employer before you pay"
- Single search form (see Search Component below)
- Brief 3-line explanation of what the tool does and why it matters
- Footer: ESDC tip line (1-800-367-5693), disclaimer, data source attribution
- No hero image. No animations. No carousels. No marketing copy blocks.

**2. Results Page (`/results`)**
- Displays after search is submitted
- Shows the risk indicator prominently (see Risk Indicator Component)
- Shows matched employer details from government data
- Shows recommended next steps based on risk level
- ESDC reporting link on all non-green results
- "Search again" button back to home

**3. About Page (`/about`)**
- Single column, plain text
- Explains the tool, data sources, limitations, disclaimer
- Lists: what GREEN means, what YELLOW means, what RED means, what GREY means
- Links to government data sources

**4. Admin Page (`/admin`)**
- Password protected — single hardcoded password via environment variable
  ADMIN_PASSWORD. Not a full auth system — just a simple password gate.
- If password not set or wrong: show a plain password input, nothing else.
- Once authenticated (session stored in localStorage for the browser tab):
  show the admin dashboard.

Admin dashboard shows three sections:

SECTION 1 — Subscriber Summary
  - Total subscribers (all time)
  - Subscribers this month
  - Breakdown by last_result type:
      GREEN subscribers: N
      YELLOW subscribers: N
      RED subscribers: N
      GREY subscribers: N
  - "Export CSV" button — downloads all subscribed (unsubscribed_at IS NULL)
    emails as a CSV with columns: email, employer_query, last_result, subscribed_at
    This CSV is what you paste into Mailchimp for broadcast emails.

SECTION 2 — Data Freshness
  - Shows the most recent ingested_at timestamp from both tables:
      positive_lmia: last ingested [date]
      violators: last ingested [date]
  - Total record counts for both tables
  - Simple visual indicator: green if ingested within 90 days, amber if older

SECTION 3 — Recent Searches (last 50)
  - Table of recent search_logs rows:
    employer_query | risk_result | searched_at
  - Most recent first
  - No emails shown here — search_logs is anonymous

Styling: functional, plain. This is an internal tool.
No need to match the public site aesthetic — just clean and readable.
Keep it as a single server-rendered page, no client-side framework needed.

### Components

**Search Component**
```
Fields:
  - Employer Name (required) — large text input, placeholder "e.g. Sunrise Senior Care"
  - City (optional) — helps narrow results
  - Province (optional) — dropdown of Canadian provinces/territories

Submit button: "Check This Employer"

Behaviour:
  - Disable submit until employer name has at least 3 characters
  - Show loading state on submit (simple spinner, no skeleton screens)
  - Auto-focus employer name field on page load
  - Mobile keyboard type: text
```

**Risk Indicator Component**

This is the most important component in the entire application. It must be:
- Large enough to read at arm's length on a phone
- Colour coded with an icon and plain English label
- Followed immediately by a one-sentence plain English explanation

```
GREEN  ✓  VERIFIED
"This employer appears in official Canadian government LMIA records and
has not been flagged for violations."

YELLOW  ⚠  VERIFY FURTHER
Two scenarios trigger YELLOW:
  (a) Employer found in records but city/province details do not match offer.
      "This employer was found in government records but some details do not
       match your offer. Ask your employer to clarify before paying any fees."
  (b) Employer was previously found non-compliant but has since served their
      penalty and is now ELIGIBLE to hire again.
      "This employer was previously penalised by the Canadian government for
       Temporary Foreign Worker violations but is currently eligible to hire.
       Proceed with caution and verify all offer details independently."
      → Always show the violation history (reason codes, decision date,
        penalty amount) on YELLOW results from violators.

RED — BANNED (temporary)  ✕  HIGH RISK — CURRENTLY BANNED
"This employer has been found non-compliant by the Canadian government and
is BANNED from hiring temporary foreign workers until [DATE]. Do not pay
any fees. This ban is active."
→ Show the ban end date prominently, e.g. "Banned until: March 15, 2027"
→ Show violation reason codes and decision date
→ Show penalty amount if applicable

RED — BANNED (unpaid penalty)  ✕  HIGH RISK — OUTSTANDING PENALTY
"This employer has an outstanding unpaid monetary penalty issued by the
Canadian government and cannot hire temporary foreign workers until it is
paid. Do not pay any fees."
→ Show decision date and penalty amount prominently
→ Show violation reason codes

GREY  ?  NOT FOUND
"This employer does not appear in any government LMIA records. This may
mean the offer is fraudulent. Exercise maximum caution."
```

**Status parsing rules for ingestion:**
At data ingestion time, parse the raw `Status` column from the government
Excel into the `compliance_status` enum as follows:
```
Raw value is exactly "Eligible" (case-insensitive)     → compliance_status = 'ELIGIBLE'
Raw value contains "Ineligible until"                  → compliance_status = 'INELIGIBLE_UNTIL'
                                                          parse the date into ineligible_until_date
Raw value contains "unpaid" (case-insensitive)         → compliance_status = 'INELIGIBLE_UNPAID'
Raw value is exactly "Ineligible" (no date, no unpaid) → compliance_status = 'INELIGIBLE'
                                                          treat same as INELIGIBLE_UNPAID for
                                                          display purposes (RED, no end date shown)
Any other / unrecognised value                         → compliance_status = 'INELIGIBLE_UNPAID'
                                                          (fail safe — treat as worst case)
```

**Penalty field parsing rules for ingestion:**
The raw `Penalty` field from the government data sometimes embeds the ban
duration inside the penalty string, e.g. "$210,000 and a 2-year ban".
Always parse this field into two separate stored values:
```
penalty_raw     = store the full original string verbatim
penalty_amount  = extract the dollar value only → "$210,000"
ban_duration    = extract ban text if present   → "2-year ban"
                  store NULL if no ban text found in this field
```
Note: ban_duration parsed from the Penalty field is supplementary context.
The authoritative ban end date always comes from parsing the Status field
into ineligible_until_date. Never use ban_duration alone to compute a date.

**Matched Data Card**
When a confirmed match is found in the positive LMIA list, show a data card
with ALL of the following fields. This is valuable, government-sourced
information that helps the worker independently verify their offer is real.
Do not hide or collapse any of these fields — show them all clearly:

- **Employer name** — business operating name as it appears in government data
- **Legal name** — if different from operating name, show in smaller text beneath
- **Address** — full address from the LMIA record
- **Province / Territory**
- **Program stream** — e.g. High Wage, Low Wage, Seasonal Agricultural Worker
  Program, Caregiver, Global Talent Stream, etc.
- **NOC Code** — the National Occupational Classification code, e.g. "NOC 72600". Show alongside a small label "National Occupational Classification". This lets the worker cross-reference against their work permit application.
- **Occupation title** — the plain English job title, e.g. "Air pilots, flight engineers and flying instructors". Never show the raw combined string (e.g. "72600-Air pilots...") — always split and display NOC code and title separately.
- **Approved LMIAs** — the number of LMIA applications approved for this employer
  in this data quarter. Label clearly: "Approved LMIAs: 3"
- **Approved Positions** — the total number of worker positions approved across
  those LMIAs. Label clearly: "Approved Positions: 12". This is the most
  useful number for a worker — it tells them how many foreign workers this
  employer was legitimately approved to hire.
- **Incorporate status** — e.g. Incorporated / Not Incorporated
- **Data quarter** — the government data quarter this record is from,
  e.g. "Q3 2025 (Jul–Sep 2025)". Include a note: "Government data is
  published quarterly and may be up to 3 months behind."

**Display guidance for the Matched Data Card:**
- Use a clean two-column label/value layout on desktop, single column on mobile
- Group the LMIA numbers (Approved LMIAs + Approved Positions) together
  visually — these are the key trust signals for the worker
- Show Approved Positions in a larger, bolder font than other fields —
  it is the most actionable data point
- If multiple records match (same employer, multiple quarters or streams),
  show the most recent quarter first and allow the worker to expand to
  see historical records with a "Show all records (N)" toggle
- Never truncate or hide Occupation or Program Stream — these help the
  worker confirm their specific job offer matches the approved role

If the employer appears in the violators list, show a dedicated
**Violation Detail Panel** beneath the risk indicator containing:
- Compliance status — rendered as a clearly labelled badge:
    🟡 ELIGIBLE (previously penalised, now allowed to hire)
    🔴 INELIGIBLE UNTIL [DATE] (active temporary ban — show the date large)
    🔴 INELIGIBLE — UNPAID PENALTY (active ban due to unpaid fine)
- Decision date: the date the government issued its final decision
- Penalty amount: dollar value of the monetary penalty (if any)
- Violation reasons: the reasons field contains comma-separated code numbers
  e.g. "6, 8, 9". Expand EACH code individually into plain English and display
  as a numbered list — never show raw code numbers to the user. Use this
  complete lookup table:

  1  → Could not prove the job offer information was accurate (record-keeping)
  2  → Did not keep documents proving employment conditions were met
  3  → Did not have funds to pay wages agreed with a live-in caregiver
  4  → Could not prove the LMIA job description was accurate
  5  → Did not attend a meeting with the government inspector
  6  → Did not provide documents requested by the inspector
  7  → Did not cooperate with or provide information to the inspector
  8  → Broke federal, provincial or territorial employment or recruitment laws
  9  → Pay or working conditions did not match — or job was not as described — in the offer
 10  → Live-in caregiver was not living in a private home or not providing required care
 11  → Hiring foreign worker did not create or protect jobs for Canadians
 12  → Hiring foreign worker did not result in skills transfer to Canadians
 13  → Did not hire or train Canadians as committed to
 14  → Did not make sufficient effort to hire or train Canadians as committed to
 15  → Was not actively operating the business the foreign worker was hired for
 16  → Live-in caregiver did not receive private furnished accommodation
 17  → Did not maintain an abuse-free workplace (physical, sexual, psychological, financial, or reprisal)
 18  → Prevented foreign worker from complying with Emergencies Act or Quarantine Act
 19  → Prevented foreign worker from complying with provincial public health law
 20  → Did not pay full wages during mandatory isolation or quarantine period on entry
 21  → Did not provide separate quarantine accommodation (minimum 2 metres distancing)
 22  → Did not provide cleaning and disinfecting products for quarantine accommodation
 23  → Did not provide private bedroom and bathroom for worker who developed COVID-19 symptoms
 24  → Did not provide adequate accommodation to seasonal agricultural workers
 25  → Did not provide foreign worker with information on their rights in Canada on first day
 26  → Did not make rights information available in both official languages
 27  → Did not make reasonable effort to provide access to health care when worker was injured or ill
 28  → Charged the foreign worker fees related to their hiring
 29  → Did not ensure the worker was not charged fees by recruiters or hiring agents
 30  → Did not obtain and pay for private health insurance for worker not covered by provincial plan

  ⚠ Special contextual callout — if Reason 9 is present, show this highlighted
  warning separately above the reasons list:
  "This employer was specifically found to have misrepresented pay or working
  conditions. This is one of the most common violations affecting foreign workers
  directly." 
- Ban end date (only for INELIGIBLE_UNTIL): shown prominently as
  "Banned until: [DATE]" in red
- Do NOT show raw government status strings — always render the
  parsed, plain-English version

**Next Steps Component**
Below the risk indicator, show 2-3 plain English recommended actions:

```
GREEN:  
✓ Request a copy of the LMIA approval letter from your employer
✓ Use a licensed RCIC (immigration consultant) to process your application
✓ Never pay fees directly to a recruiter — fees should only go to licensed consultants

YELLOW (address/detail mismatch):
⚠ Contact the employer directly using contact information you find independently (not from the offer letter)
⚠ Ask them to confirm their LMIA number and address match what is on your offer
⚠ Do not pay any fees until details are confirmed

YELLOW (prior violation, now eligible):
⚠ This employer has a history of non-compliance with the Temporary Foreign Worker Program
⚠ Review the violation details shown — understand what rule they broke and when
⚠ Contact the employer directly to verify all offer details independently
⚠ Consider consulting a licensed RCIC before proceeding
⚠ Do not pay any fees until all details are independently confirmed

RED (active temporary ban):
✕ This employer is BANNED from hiring temporary workers until [DATE] — any offer is illegitimate
✕ Do not pay any fees to this employer or recruiter under any circumstances
✕ Report this offer to ESDC: 1-800-367-5693
✕ Contact a licensed RCIC or legal aid for advice

RED (unpaid monetary penalty):
✕ This employer has an outstanding government penalty and cannot legally hire temporary workers
✕ Do not pay any fees to this employer or recruiter under any circumstances
✕ Report this offer to ESDC: 1-800-367-5693
✕ Contact a licensed RCIC or legal aid for advice

GREY:
? Do not pay any fees until you have independently verified this employer exists
? Call ESDC at 1-800-367-5693 to ask them to verify the employer
? Search the employer name on the Canada Revenue Agency Business Registry
```

**Email Capture Component**
Show this component at the bottom of EVERY results page, below Next Steps,
regardless of risk result (GREEN / YELLOW / RED / GREY). A worker who just
searched may want to know if the status changes.

```
┌─────────────────────────────────────────────────────┐
│  📬  Get notified if this employer's status changes  │
│                                                     │
│  We'll email you when the government updates the    │
│  non-compliant employer list.                       │
│                                                     │
│  [ your@email.com                    ] [Notify me]  │
│                                                     │
│  Free. No spam. Unsubscribe anytime.                │
└─────────────────────────────────────────────────────┘
```

Behaviour:
- Email field + submit button — that is all. No name field, no checkboxes.
- On submit: store email + employer_normalized + last_result in
  search_subscriptions table via a Netlify Function POST to /api/subscribe
- Success state: replace form with a single line —
  "✓ Got it. We'll notify you if anything changes."
- Error state: "Something went wrong — please try again."
- Do not redirect. Do not reload the page. Inline state change only.
- If email already exists for same employer_normalized: silently succeed
  (do not show an error, do not create a duplicate row)
- Styling: understated — this is not a marketing CTA. Small text, muted
  colours. It should feel like a utility, not a pitch.
- Position: below Next Steps, above the footer disclaimer. Always visible,
  never hidden behind a toggle.

API endpoint — POST /api/subscribe:
```typescript
// netlify/functions/subscribe.ts
// Body: { email: string, employer_query: string,
//         employer_normalized: string, last_result: string }
// Validates email format server-side
// Checks for duplicate (same email + employer_normalized) before inserting
// Returns: { success: true } or { error: string }
// Rate limit: max 5 subscriptions per IP per hour
```

**Share Component**
Show this component on the results page, below the Email Capture component
and above the footer disclaimer. It should feel lightweight and helpful —
not a pushy social media block. The framing matters: this is about protecting
someone else, not promoting the site.

Copy:
```
  Know someone who needs this?
  Share LMIA Check with a foreign worker, recruiter, or immigration consultant.
  [ Copy link ]  [ WhatsApp ]  [ Facebook ]  [ Email ]
```

Behaviour and implementation:

COPY LINK button:
- Copies https://lmiacheck.ca to clipboard
- Button label changes to "✓ Copied!" for 2 seconds then resets
- Uses navigator.clipboard.writeText() — no library needed

WHATSAPP button:
- Opens: https://wa.me/?text=Use%20this%20free%20tool%20to%20verify%20a%20Canadian%20employer%20before%20you%20pay%20any%20fees%3A%20https%3A%2F%2Flmiacheck.ca
- Pre-filled message in English: "Use this free tool to verify a Canadian
  employer before you pay any fees: https://lmiacheck.ca"
- Opens in new tab
- WhatsApp is the dominant messaging platform for the target audience
  (Philippines, India, Mexico) — this button is the most important one

FACEBOOK button:
- Opens: https://www.facebook.com/sharer/sharer.php?u=https://lmiacheck.ca
- Opens in a small popup window (600x400) using window.open()

EMAIL button:
- Opens mailto: link with pre-filled subject and body:
  Subject: Free tool to verify a Canadian job offer
  Body: "I found this free tool that helps verify whether a Canadian employer
  has a legitimate LMIA before paying any recruitment fees.
  Check it here: https://lmiacheck.ca"

Styling rules:
- Buttons are small and secondary — do not compete with the risk indicator
  or the email capture form visually
- Use outline/ghost style buttons with icons — NOT filled colour buttons
- WhatsApp button: use WhatsApp green (#25D366) for the icon only, not the button background
- No share count, no like count, no social proof numbers — keep it clean
- On mobile: show all 4 buttons in a 2x2 grid
- On desktop: show all 4 buttons in a single row

Show on: GREEN, YELLOW, RED, GREY results — always show.
The share prompt copy adjusts slightly by result:
- GREEN:  "Did this give you peace of mind? Share it with someone who needs it."
- YELLOW: "Know someone checking a job offer? Share this free tool with them."
- RED:    "Help protect others. Share this tool with foreign workers you know."
- GREY:   "Know someone checking a job offer? Share this free tool with them."

ShareComponent.tsx receives the current risk result as a prop and renders
the appropriate copy.

---

## DATABASE SCHEMA

Create these tables in Supabase:

```sql
-- Enable fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Positive LMIA employers (loaded from ESDC quarterly Excel)
CREATE TABLE positive_lmia (
  id                   SERIAL PRIMARY KEY,
  province             VARCHAR(100),
  program_stream       VARCHAR(100),
  employer_name        VARCHAR(255),
  employer_normalized  VARCHAR(255),  -- lowercased, punctuation stripped, legal suffixes removed
  address              VARCHAR(500),
  city                 VARCHAR(100),
  noc_code             VARCHAR(10),   -- e.g. '72600' — parsed from occupation field
  occupation_title     VARCHAR(255),  -- e.g. 'Air pilots, flight engineers and flying instructors'
  incorporate_status   VARCHAR(50),   -- Corporation | Sole Proprietorship | Partnership |
                                      -- Non-Profit Organization | Co-operative | Registered Charity | Unknown
  approved_lmias       INTEGER,       -- number of LMIA applications approved this quarter
  approved_positions   INTEGER,       -- total worker positions approved across those LMIAs
  postal_code          VARCHAR(10),   -- parsed from address field, e.g. 'A1A 0R7'
  quarter              VARCHAR(20),   -- e.g. '2025-Q3'
  ingested_at          TIMESTAMP DEFAULT NOW()
);

-- Fast fuzzy search index
CREATE INDEX idx_employer_trgm 
ON positive_lmia 
USING GIN (employer_normalized gin_trgm_ops);

-- Non-compliant / violator employers
CREATE TABLE violators (
  id                      SERIAL PRIMARY KEY,
  business_operating_name VARCHAR(255),
  business_legal_name     VARCHAR(255),
  employer_normalized     VARCHAR(255),
  address                 VARCHAR(500),
  province                VARCHAR(100),
  reasons                 TEXT,          -- violation reason code(s), e.g. "9, 17"
  decision_date           DATE,          -- date of final government decision
  penalty_raw             VARCHAR(255),  -- raw penalty string e.g. "$210,000 and a 2-year ban"
  penalty_amount          VARCHAR(100),  -- parsed dollar value only, e.g. "$210,000"
  ban_duration            VARCHAR(50),   -- parsed ban length only, e.g. "2-year ban" (if embedded in penalty field)
  status_raw              VARCHAR(255),  -- raw status string from government data
  -- Derived fields parsed at ingestion time for display logic:
  compliance_status       VARCHAR(30),   -- 'ELIGIBLE' | 'INELIGIBLE_UNTIL' | 'INELIGIBLE_UNPAID' | 'INELIGIBLE'
  ineligible_until_date   DATE,          -- populated when compliance_status = 'INELIGIBLE_UNTIL'
  ingested_at             TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_violators_trgm 
ON violators 
USING GIN (employer_normalized gin_trgm_ops);

-- Anonymous search analytics
CREATE TABLE search_logs (
  id                   SERIAL PRIMARY KEY,
  employer_query       VARCHAR(255),
  city_query           VARCHAR(100),
  province_query       VARCHAR(100),
  risk_result          VARCHAR(10),   -- 'GREEN', 'YELLOW', 'RED', 'GREY'
  match_score          FLOAT,
  searched_at          TIMESTAMP DEFAULT NOW()
);

-- Email subscriber list for data update notifications (MVP)
-- Captures email + what they searched + what result they got
-- No confirmation email required at MVP stage — just collect and store
CREATE TABLE search_subscriptions (
  id                   SERIAL PRIMARY KEY,
  email                VARCHAR(255) NOT NULL,
  employer_query       VARCHAR(255) NOT NULL,  -- original search term as typed
  employer_normalized  VARCHAR(255),           -- normalized for future diff matching
  last_result          VARCHAR(10),            -- 'GREEN' | 'YELLOW' | 'RED' | 'GREY'
  subscribed_at        TIMESTAMP DEFAULT NOW(),
  unsubscribed_at      TIMESTAMP               -- NULL = still subscribed
);

-- Index for fast lookup when doing manual export or future diff matching
CREATE INDEX idx_sub_email      ON search_subscriptions(email);
CREATE INDEX idx_sub_normalized ON search_subscriptions(employer_normalized);

-- Note: one email can appear multiple times (searched multiple employers).
-- That is intentional — they want updates on each employer they searched.
```

---

## RISK SCORING LOGIC

Build this as a Netlify Function at `/api/verify`:

```javascript
// Pseudocode for the scoring logic — implement fully in TypeScript

async function verifyEmployer(employerName, city, province) {
  
  const normalized = normalizeEmployerName(employerName)
  // normalizeEmployerName:
  // 1. Lowercase
  // 2. Remove punctuation
  // 3. Strip legal suffixes: inc, ltd, corp, co, llc, limited, incorporated
  // 4. Trim whitespace

  // Step 1: Check violators list first (most important check)
  const violatorMatch = await supabase
    .from('violators')
    .select('*')
    .textSearch('employer_normalized', normalized, { type: 'websearch' })
    // Also run pg_trgm similarity query with threshold 0.7

  if (violatorMatch.length > 0) {
    const v = violatorMatch[0]

    // Map compliance_status to the correct risk sub-type
    // ELIGIBLE = previously penalised but now allowed to hire → YELLOW with warning
    // INELIGIBLE_UNTIL = currently banned with a known end date → RED_TEMPORARY
    // INELIGIBLE_UNPAID = banned due to outstanding unpaid penalty → RED_UNPAID

    if (v.compliance_status === 'ELIGIBLE') {
      // Served their penalty — flag as YELLOW, not RED. Still show violation history.
      return { risk: 'YELLOW', matches: violatorMatch, source: 'violators',
               reason: 'prior_violation_now_eligible' }
    }

    if (v.compliance_status === 'INELIGIBLE_UNTIL') {
      return { risk: 'RED', subtype: 'BANNED_TEMPORARY',
               ban_end_date: v.ineligible_until_date,
               matches: violatorMatch, source: 'violators' }
    }

    if (v.compliance_status === 'INELIGIBLE_UNPAID') {
      return { risk: 'RED', subtype: 'BANNED_UNPAID_PENALTY',
               matches: violatorMatch, source: 'violators' }
    }

    // Fallback for any unrecognised status — treat as RED
    return { risk: 'RED', matches: violatorMatch, source: 'violators' }
  }

  // Step 2: Check positive LMIA list
  const positiveMatches = await supabase
    .from('positive_lmia')
    .select('*')
    .textSearch('employer_normalized', normalized)
    // pg_trgm similarity threshold: 0.6 minimum

  if (positiveMatches.length === 0) {
    return { risk: 'GREY', matches: [], source: 'not_found' }
  }

  // Step 3: Cross-check details if city/province provided
  if (city || province) {
    const detailMatch = positiveMatches.filter(m => 
      (!city || m.city.toLowerCase().includes(city.toLowerCase())) &&
      (!province || m.province === province)
    )
    
    if (detailMatch.length === 0) {
      // Found in positive list but location doesn't match — possible impersonation
      return { risk: 'YELLOW', matches: positiveMatches, reason: 'address_mismatch' }
    }
    
      return { risk: 'GREEN', matches: detailMatch, source: 'positive_lmia' }
  }

  // Step 4: Check for Permanent Resident Only stream — flag as YELLOW mismatch
  // for any worker searching with a temporary work permit context
  const prOnlyMatches = positiveMatches.filter(
    m => m.program_stream?.toLowerCase().includes('permanent resident only')
  )
  const nonPrMatches = positiveMatches.filter(
    m => !m.program_stream?.toLowerCase().includes('permanent resident only')
  )

  if (prOnlyMatches.length > 0 && nonPrMatches.length === 0) {
    // All matches are PR-Only — this is a mismatch for a TFW
    return { risk: 'YELLOW', matches: prOnlyMatches,
             reason: 'pr_only_stream', source: 'positive_lmia' }
  }

  // Return only non-PR-Only matches for GREEN result
  const finalMatches = nonPrMatches.length > 0 ? nonPrMatches : positiveMatches
  return { risk: 'GREEN', matches: finalMatches, source: 'positive_lmia' }
}
```

---

## DATA INGESTION SCRIPT

Create `scripts/ingest.py`:

```python
# Usage:
# python scripts/ingest.py --file data/tfwp_2025q3_pos_en.xlsx --quarter 2025-Q3
# python scripts/ingest.py --file data/non-compliant.xlsx --type violators

import pandas as pd
import re
from supabase import create_client
import argparse

LEGAL_SUFFIXES = ['inc', 'ltd', 'corp', 'co', 'llc', 'limited', 'incorporated', 'ltee']

def normalize_name(name):
    if not isinstance(name, str):
        return ''
    name = name.lower()
    name = re.sub(r'[^\w\s]', '', name)  # remove punctuation
    words = name.split()
    words = [w for w in words if w not in LEGAL_SUFFIXES]
    return ' '.join(words).strip()

def ingest_positive_lmia(df, quarter, supabase_client):
    # Handle the government Excel format where real headers are in row 1
    # Row 0 is the long title, Row 1 is actual column headers
    df.columns = df.iloc[0]
    df = df.iloc[1:].reset_index(drop=True)
    
    records = []
    for _, row in df.iterrows():
        employer = str(row.get('Employer', ''))
        if not employer or employer == 'nan':
            continue
        address = str(row.get('Address', ''))
        city = address.split(',')[0].strip() if ',' in address else ''
        # Split NOC code from occupation title
        # Raw format: "72600-Air pilots, flight engineers and flying instructors"
        raw_occupation = str(row.get('Occupation', '') or '')
        noc_code = ''
        occupation_title = raw_occupation
        if '-' in raw_occupation:
            parts = raw_occupation.split('-', 1)
            if parts[0].strip().isdigit():
                noc_code = parts[0].strip()
                occupation_title = parts[1].strip()

        # Parse postal code from address
        # Raw format: "St. John's, NL A1A 0R7"
        import re
        postal_match = re.search(
            r'([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)', address
        )
        postal_code = postal_match.group(1).upper() if postal_match else ''

        records.append({
            'province': str(row.get('Province/Territory', '') or '').strip(),
            'program_stream': str(row.get('Program Stream', '') or '').strip(),
            'employer_name': employer,
            'employer_normalized': normalize_name(employer),
            'address': address,
            'city': city,
            'noc_code': noc_code,
            'occupation_title': occupation_title,
            'incorporate_status': str(row.get('Incorporate Status', '') or '').strip(),
            'approved_lmias': int(row.get('Approved LMIAs', 0) or 0),
            'approved_positions': int(row.get('Approved Positions', 0) or 0),
            'postal_code': postal_code,
            'quarter': quarter
        })
    
    # Upsert in batches of 500
    for i in range(0, len(records), 500):
        batch = records[i:i+500]
        supabase_client.table('positive_lmia').upsert(batch).execute()
        print(f'Ingested {min(i+500, len(records))}/{len(records)} records...')
    
    print(f'Done. Total: {len(records)} employers loaded for {quarter}.')

def parse_compliance_status(raw_status):
    """
    Parse the raw Status column from the government non-compliant Excel
    into a structured compliance_status enum and optional ban end date.
    
    Known raw values (examples):
      "Eligible"
      "Ineligible until 2027-03-15"
      "Ineligible – Unpaid monetary penalty"
    """
    import re
    from datetime import datetime

    if not isinstance(raw_status, str):
        return 'INELIGIBLE_UNPAID', None  # fail safe

    s = raw_status.strip().lower()

    if s.startswith('eligible') and 'ineligible' not in s:
        return 'ELIGIBLE', None

    if 'ineligible until' in s:
        # Try to extract the date
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', raw_status)
        if not date_match:
            # Try other date formats e.g. "March 15, 2027"
            date_match = re.search(
                r'(\w+ \d{1,2},?\s*\d{4})', raw_status, re.IGNORECASE
            )
        if date_match:
            try:
                for fmt in ('%Y-%m-%d', '%B %d, %Y', '%B %d %Y'):
                    try:
                        parsed = datetime.strptime(date_match.group(1).strip(), fmt).date()
                        return 'INELIGIBLE_UNTIL', parsed
                    except ValueError:
                        continue
            except Exception:
                pass
        return 'INELIGIBLE_UNTIL', None

    if 'unpaid' in s:
        return 'INELIGIBLE_UNPAID', None

    if s == 'ineligible':
        # Plain "Ineligible" with no date and no unpaid mention — 17 records in data
        # Treat same as INELIGIBLE_UNPAID for display (RED, no end date)
        return 'INELIGIBLE', None

    # Unrecognised — fail safe to worst case
    return 'INELIGIBLE_UNPAID', None


def ingest_violators(df, supabase_client):
    """
    Ingest the non-compliant employers list downloaded from Canada.ca.
    Expected columns (from the scraper):
      Business Operating Name, Business Legal Name, Address,
      Reason(s), Date of Final Decision, Penalty, Status
    """
    records = []
    for _, row in df.iterrows():
        op_name = str(row.get('Business Operating Name', '') or '')
        if not op_name or op_name == 'nan':
            continue

        raw_status = str(row.get('Status', '') or '')
        compliance_status, ineligible_until = parse_compliance_status(raw_status)

        # Parse decision date
        raw_date = str(row.get('Date of Final Decision', '') or '')
        decision_date = None
        for fmt in ('%Y-%m-%d', '%B %d, %Y', '%d/%m/%Y'):
            try:
                from datetime import datetime
                decision_date = datetime.strptime(raw_date.strip(), fmt).date()
                break
            except Exception:
                continue

        # Parse penalty field — may contain embedded ban duration
        # e.g. "$210,000 and a 2-year ban" or "$15,000" or "N/A"
        import re
        raw_penalty = str(row.get('Penalty', '') or '')
        penalty_amount = ''
        ban_duration = None
        dollar_match = re.search(r'(\$[\d,]+)', raw_penalty)
        if dollar_match:
            penalty_amount = dollar_match.group(1)
        ban_match = re.search(r'(\d+-year ban|\d+ year ban)', raw_penalty, re.IGNORECASE)
        if ban_match:
            ban_duration = ban_match.group(1)

        records.append({
            'business_operating_name': op_name,
            'business_legal_name':     str(row.get('Business Legal Name', '') or ''),
            'employer_normalized':     normalize_name(op_name),
            'address':                 str(row.get('Address', '') or ''),
            'province':                '',  # parse from address if needed
            'reasons':                 str(row.get('Reason(s)', '') or ''),
            'decision_date':           str(decision_date) if decision_date else None,
            'penalty_raw':             raw_penalty,
            'penalty_amount':          penalty_amount,
            'ban_duration':            ban_duration,
            'status_raw':              raw_status,
            'compliance_status':       compliance_status,
            'ineligible_until_date':   str(ineligible_until) if ineligible_until else None,
        })

    for i in range(0, len(records), 500):
        batch = records[i:i+500]
        supabase_client.table('violators').upsert(batch).execute()
        print(f'Ingested {min(i+500, len(records))}/{len(records)} violator records...')

    print(f'Done. Total: {len(records)} violator records loaded.')
```

---

## FILE STRUCTURE

```
lmia-portal/
├── app/
│   ├── layout.tsx          # Root layout — minimal, loads system fonts only
│   ├── page.tsx            # Home page with search form
│   ├── results/
│   │   └── page.tsx        # Results page
│   ├── about/
│   │   └── page.tsx        # About / disclaimer page
│   └── admin/
│       └── page.tsx        # Password-protected admin dashboard
├── components/
│   ├── SearchForm.tsx      # Employer search form
│   ├── RiskIndicator.tsx   # GREEN/YELLOW/RED/GREY result display
│   ├── MatchedData.tsx     # Government data match details
│   ├── NextSteps.tsx       # Recommended actions by risk level
│   ├── EmailCapture.tsx    # "Notify me" subscription form
│   ├── ShareComponent.tsx  # Share via WhatsApp / Facebook / Email / Copy link
│   └── ESDCAlert.tsx       # ESDC tip line prominent display
├── netlify/
│   └── functions/
│       ├── verify.ts       # Serverless verification API
│       └── subscribe.ts    # Email subscription endpoint
├── scripts/
│   └── ingest.py           # Government data ingestion script
├── lib/
│   ├── supabase.ts         # Supabase client config
│   └── normalize.ts        # Employer name normalization utilities
├── data/                   # Place government Excel files here (gitignored)
├── .env.local              # SUPABASE_URL, SUPABASE_ANON_KEY (never commit)
├── .env.example            # Template with variable names only
├── netlify.toml            # Netlify build and function config
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## PERFORMANCE REQUIREMENTS

- **No images** except the favicon (SVG preferred)
- **No external fonts** — system font stack only
- **No CSS frameworks beyond Tailwind** — no Bootstrap, no MUI, no Chakra
- **No client-side JavaScript on initial load** where server rendering suffices
- **API response time** under 800ms for 95th percentile searches
- **Total page weight** under 100KB for home page (excluding Supabase SDK)
- **Lighthouse scores**: Performance 95+, Accessibility 95+, Best Practices 95+

---

## CONTENT — DISCLAIMERS (REQUIRED ON ALL PAGES)

Include this disclaimer in the footer of every page:

> "This tool is for informational purposes only and does not constitute legal or immigration advice. Results are based on publicly available Government of Canada data published by Employment and Social Development Canada (ESDC) and may not reflect the current status of any employer. A positive result does not guarantee a job offer is legitimate. Always seek advice from a licensed Regulated Canadian Immigration Consultant (RCIC) before making immigration decisions. This portal is not affiliated with the Government of Canada."

Include this on every RED or GREY result prominently:

> "If you believe you have been targeted by LMIA fraud, contact ESDC: **1-800-367-5693**"

---

## ENVIRONMENT VARIABLES

Create `.env.local` (never commit to Git):
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=choose_a_strong_password_here
```

Create `.env.example` (commit this):
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
ADMIN_PASSWORD=
```

---

## NETLIFY CONFIG

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

---

## WHAT NOT TO BUILD (MVP SCOPE)

Do NOT build these in the first version. They are roadmap items only:
- User accounts or login
- Search history
- PDF offer letter upload
- Multilingual support (comes in v1.1)
- Admin dashboard
- Payment or subscription features
- Email notifications
- Social sharing buttons
- Comment or feedback submission from users

Keep the MVP focused. One search. One result. Done perfectly. Keep in mind, we also need to spin a French version of this in the future, so design should account for multiple languages. Maybe if users find the tool useful, we can expand later to include other languages like Hindi, etc.

---

## DEPLOYMENT CHECKLIST

After building, verify these before deploying:

- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] Supabase tables created and both government datasets ingested
- [ ] Test GREEN result: search "Cougar Helicopters" (appears in Q3 2025 data)
- [ ] Test GREEN result: confirm NOC code "72600" and occupation title display correctly
- [ ] Test PR-Only YELLOW: search an employer with only "Permanent Resident Only" stream — confirm YELLOW warning banner appears
- [ ] Test RED BANNED: search "Agventure Fields Inc." — confirm ban until Feb 19, 2027 displays correctly
- [ ] Test RED UNPAID: find an "Ineligible - unpaid monetary penalty" employer — confirm RED displays with penalty amount
- [ ] Test plain INELIGIBLE: confirm "Ineligible" (no date, no unpaid) renders as RED
- [ ] Test multi-reason: search employer with reasons "6, 8, 9" — confirm all three expand to plain English
- [ ] Test Reason 9 callout: confirm highlighted warning appears when Reason 9 is present
- [ ] Test penalty parsing: confirm "$210,000 and a 2-year ban" splits into amount + duration correctly
- [ ] Test GREY result: search a clearly fake company name
- [ ] Mobile layout looks correct at 375px width
- [ ] Disclaimer appears on every page
- [ ] ESDC phone number is correct: 1-800-367-5693
- [ ] Lighthouse performance score 90+
- [ ] Environment variables added to Netlify dashboard
- [ ] Custom domain configured (if available)
- [ ] Test email capture: submit a real email on results page — confirm row appears in Supabase search_subscriptions table
- [ ] Test duplicate handling: submit same email + employer twice — confirm no duplicate row created
- [ ] Test /admin page: confirm password gate works, wrong password shows nothing
- [ ] Test admin CSV export: download and confirm columns are correct
- [ ] Confirm ADMIN_PASSWORD environment variable is set in Netlify dashboard
- [ ] Test /api/subscribe rate limiting: more than 5 submissions from same IP should be rejected
- [ ] Test Share — Copy link: confirm clipboard copy works and button resets after 2 seconds
- [ ] Test Share — WhatsApp: confirm pre-filled message opens correctly on mobile
- [ ] Test Share — Facebook: confirm popup opens at correct size
- [ ] Test Share — Email: confirm mailto opens with correct subject and body
- [ ] Test Share copy changes by result type: GREEN / YELLOW / RED / GREY each show correct message

---

## FUTURE ROADMAP (do not build now)

These are confirmed future features — do not build in MVP but design the
codebase to accommodate them without major refactoring:

**v1.1 — First broadcast notification**
- When ESDC updates their data, manually export subscriber CSV from /admin
- Import into Mailchimp free tier and send one broadcast email:
  "The employer list has been updated — search your employer again at lmiacheck.ca"
- No personalization yet. Just a simple "new data is up" message.

**v1.2 — Personalized diff notifications**
- Diff engine: compare old vs new violators snapshot, detect state changes:
    - Newly banned (NEWLY_BANNED) → urgent email
    - Re-banned after being eligible (RE_BANNED) → urgent email
    - Ban lifted, now eligible (NOW_ELIGIBLE) → informational email
- Notification matcher: find subscribers whose employer_normalized matches
  a changed employer and send them a targeted email
- Requires: email confirmation (double opt-in), unsubscribe links (CASL),
  email service API (Resend recommended), snapshot storage in Supabase

**v1.3 — French language version**
- All UI strings already extracted to a constants file for easy translation
- /fr route with identical functionality in French
- Data from ESDC is already bilingual — French Excel available

**v1.4 — Geographic watchlists**
- "Alert me about any new bans in Ontario"
- Province-level subscription, not just per-employer

**v1.5 — Additional languages**
- Hindi, Tagalog, Spanish — based on user demand data from search_logs

---

## FINAL NOTE

This portal exists for one reason: to protect people who have nothing to lose and everything to lose. A domestic worker in Manila. A truck driver in Punjab. A farm worker in Mexico City. They are about to hand over their life savings based on a piece of paper.

Build it like it matters. Because it does.

---
*Prompt version 1.4 — March 2026*
*Based on LMIA Verification Portal Blueprint v1.0*
*v1.1 changes: Full compliance status handling (ELIGIBLE / INELIGIBLE_UNTIL / INELIGIBLE_UNPAID), updated violators DB schema, status parsing logic, updated risk indicator, matched data card, next steps, and ingest script.*
*v1.2 changes (data-driven, from actual file inspection):*
  *- DB schema: NOC code + occupation title split; postal_code added; penalty_raw/amount/ban_duration added; INELIGIBLE status variant*
  *- Matched Data Card: NOC code, postal code, incorporate status cleanup, PR-Only YELLOW warning*
  *- Violation Detail Panel: full 30-reason lookup table, Reason 9 callout, multi-reason list*
  *- Status + penalty parsing, PR-Only risk scoring, ingest script updates, 8 new test cases*
*v1.3 changes (audience building — MVP notification foundation):*
  *- DB schema: search_subscriptions table added (email + employer + result)*
  *- New component: EmailCapture.tsx — "Notify me" form on every results page*
  *- New API endpoint: POST /api/subscribe with duplicate prevention and rate limiting*
  *- New page: /admin — password-protected dashboard with subscriber summary,*
  *  data freshness indicators, recent searches, and CSV export for Mailchimp*
  *- New env var: ADMIN_PASSWORD*
  *- File structure updated: EmailCapture, subscribe.ts, admin/page.tsx*
  *- Future roadmap section added: v1.1 broadcast → v1.2 diff notifications → v1.3 French → v1.4 watchlists*
  *- Deployment checklist: 6 new items for subscription and admin features*
*v1.4 changes (share feature):*
  *- New component: ShareComponent.tsx — Copy link / WhatsApp / Facebook / Email*
  *- WhatsApp prioritised as primary share channel for target audience*
  *- Share copy varies by risk result (GREEN / YELLOW / RED / GREY)*
  *- No external libraries — native clipboard API, mailto, and window.open only*
  *- File structure updated: ShareComponent.tsx added*
  *- Deployment checklist: 5 new share test cases added*
