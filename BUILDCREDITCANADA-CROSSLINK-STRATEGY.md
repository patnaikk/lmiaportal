# LMIA Check ↔ BuildCreditCanada Cross-Linking Strategy
**Revised:** May 17, 2026 (v2 — post-audit)

---

## What the Audit Found (Changes from v1)

After reading all page and component code, the original strategy had four material errors:

1. **Missed the primary results page.** The homepage search goes to `/results/`, not `/check/results/`. The `/results/` page is used far more and already has a `NextSteps` component — the best insertion point in the entire site.
2. **Homepage priority was wrong.** Users on the homepage are in verification mode, not planning mode. A "Ready to move to Canada?" section there creates cognitive dissonance. Downgraded to low priority.
3. **Didn't differentiate by risk state.** Links must only appear for GREEN and YELLOW(eligible) results. RED results are crisis moments — never add financial tool links there.
4. **Underweighted the Money Transfer Calculator.** Foreign workers regularly send money home. This is the most immediately relevant BuildCreditCanada tool, but v1 buried it.

---

## Placement Zones — Revised Priority

### Priority 1 — Highest Intent, Easiest to Add

#### A. `NextSteps.tsx` — GREEN state (component-level)
**File:** `components/NextSteps.tsx:18–23`  
**Current state:** GREEN result shows 2 steps:
1. Request a copy of the LMIA approval letter
2. Use a licensed RCIC

**Gap:** After verifying employer legitimacy, no guidance on financial preparation. This is the exact moment users are thinking "okay, this is real — what's next for me?"

**Change:** Add a 3rd step to the GREEN `steps` array:

```tsx
{
  icon: '✓',
  text: (
    <>
      <strong>Set up your Canadian finances before you arrive.</strong>{' '}
      Open the right bank account, create a spending plan for your first paycheque,
      and start building credit on day one.{' '}
      <a
        href="https://buildcreditcanada.ca/tools.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-nextsteps"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold underline text-blue-700"
      >
        Free newcomer financial tools →
      </a>
    </>
  ),
}
```

**Why this is #1:** Every single GREEN result shows NextSteps. Zero new UI — just one more list item. The moment is perfect: employer verified, planning the move.

---

#### B. Full check results — existing "Useful resources" section
**File:** `app/check/results/page.tsx:418–432`  
**Current state:** "Useful resources" section already exists with 3 government links.

**Gap:** All links are about fraud and abuse reporting. No forward-looking resources.

**Change:** Add one more link after the CICC consultant link (GREEN/YELLOW only — wrap in a conditional):

```tsx
{overall !== 'red' && (
  <a
    href="https://buildcreditcanada.ca/tools.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=check-results"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline"
  >
    <span>🇨🇦</span> Financial tools for newcomers — buildcreditcanada.ca
  </a>
)}
```

**Why this works:** The existing section already has the right visual weight and context. Adding one more link here costs nothing in design or attention.

---

### Priority 2 — Section Additions

#### C. Simple results page — "Planning your move?" card (GREEN only)
**File:** `app/results/page.tsx`, between `NextSteps` (line 103) and `EmailCapture` (line 149)

**Gap:** The simple results page has no post-verification financial guidance at all. For GREEN results, users leave with "what now?" — no path forward.

**Change:** Add a conditional card between NextSteps and EmailCapture, visible only when `result.risk === 'GREEN'`:

```tsx
{result.risk === 'GREEN' && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
    <p className="text-sm font-semibold text-blue-900 mb-1">
      Planning your move to Canada?
    </p>
    <p className="text-xs text-blue-700 mb-3 leading-relaxed">
      Once your employer is verified, start your financial setup — bank account, 
      first budget, and credit-building plan. All free, no signup.
    </p>
    <div className="flex flex-wrap gap-2">
      <a
        href="https://buildcreditcanada.ca/compare.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-results"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-50"
      >
        Compare banks →
      </a>
      <a
        href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-results"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-50"
      >
        Cheapest remittance →
      </a>
      <a
        href="https://buildcreditcanada.ca/spending-plan.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=green-results"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-50"
      >
        Spending plan →
      </a>
    </div>
  </div>
)}
```

**Tool selection rationale:**
- **Banking Comparator** — immediate arrival need
- **Money Transfer Calculator** — the most relevant tool for foreign workers who send money home regularly
- **Spending Plan** — first paycheque is a pain point

---

#### D. Guide page — "After Arrival" section
**File:** `app/guide/page.tsx`, after the Step 4 block (around line 130)

**Gap:** The guide ends at "You get your work permit." The user journey continues, but the page stops.

**Change:** Add a new section after Step 4:

```tsx
<section className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
  <h2 className="text-2xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
    <span>🏦</span> After You Arrive: Financial Setup
  </h2>
  <p className="text-gray-700 leading-relaxed mb-4">
    Your first 90 days in Canada are the most financially critical. Most newcomers 
    miss key steps that cost them months of credit-building time or hundreds in 
    unnecessary bank fees.
  </p>
  <div className="space-y-3">
    <div className="flex gap-3 items-start">
      <span className="font-bold text-blue-600 text-lg">1.</span>
      <div>
        <p className="font-semibold text-gray-800">Open the right bank account</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Not all newcomer accounts are equal. Compare fees, perks, and welcome offers 
          before you walk into a branch.{' '}
          <a href="https://buildcreditcanada.ca/compare.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=guide"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            Banking Comparator →
          </a>
        </p>
      </div>
    </div>
    <div className="flex gap-3 items-start">
      <span className="font-bold text-blue-600 text-lg">2.</span>
      <div>
        <p className="font-semibold text-gray-800">Plan your first paycheque</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Split your take-home pay into rent, savings, and spending before it arrives 
          — not after.{' '}
          <a href="https://buildcreditcanada.ca/spending-plan.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=guide"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            Spending Plan →
          </a>
        </p>
      </div>
    </div>
    <div className="flex gap-3 items-start">
      <span className="font-bold text-blue-600 text-lg">3.</span>
      <div>
        <p className="font-semibold text-gray-800">Start building Canadian credit</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Your foreign credit history doesn't follow you. See the realistic 
          month-by-month path from zero to 700+.{' '}
          <a href="https://buildcreditcanada.ca/credit-score-timeline.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=guide"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            Credit Score Timeline →
          </a>
        </p>
      </div>
    </div>
    <div className="flex gap-3 items-start">
      <span className="font-bold text-blue-600 text-lg">4.</span>
      <div>
        <p className="font-semibold text-gray-800">Find the cheapest way to send money home</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Bank wire fees cost you hundreds per year. Compare Wise, Remitly, Western 
          Union, and others to find the lowest rate.{' '}
          <a href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=guide"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            Money Transfer Calculator →
          </a>
        </p>
      </div>
    </div>
  </div>
  <p className="text-xs text-gray-500 mt-4">
    All tools at{' '}
    <a href="https://buildcreditcanada.ca?utm_source=lmiacheck&utm_medium=referral&utm_campaign=guide"
      target="_blank" rel="noopener noreferrer"
      className="underline">buildcreditcanada.ca
    </a>{' '}
    are free, bilingual (English/French), and require no signup.
  </p>
</section>
```

---

### Priority 3 — Low-Friction Additions

#### E. Footer — single subdued line
**File:** `components/Footer.tsx`, after the disclaimer paragraph (around line 20)

**Gap:** The footer currently has no partner or resource links. This is globally visible on all pages.

**Change:** Add one line to the attribution row at the bottom:

```tsx
<a
  href="https://buildcreditcanada.ca?utm_source=lmiacheck&utm_medium=referral&utm_campaign=footer"
  target="_blank"
  rel="noopener noreferrer"
  className="underline hover:text-gray-600"
>
  Financial tools for newcomers
</a>
```

Add this to the existing flex row on line 28, after the "What's new" link. One link, same visual weight as "About" — no new section needed.

---

#### F. FAQ page — new section at the end
**File:** `app/faq/page.tsx`, add to the `sections` array

**Gap:** FAQs cover verification, fraud, and rights. No "after LMIA" questions exist.

**Change:** Add a new section object:

```ts
{
  heading: '🏦 After Your LMIA: Financial Setup',
  questions: [
    {
      q: 'My employer is legitimate. What should I do to prepare financially for Canada?',
      a: (
        <>
          Before your first paycheque, focus on three things: open a Canadian bank account
          (some newcomer programs waive fees for your first year), create a spending plan
          so rent and savings don't compete, and get a secured credit card to start building
          Canadian credit history from day one. BuildCreditCanada has free tools for all three:{' '}
          <a href="https://buildcreditcanada.ca/tools.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=faq"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            buildcreditcanada.ca
          </a>.
        </>
      ),
    },
    {
      q: 'What is the cheapest way to send money home from Canada?',
      a: (
        <>
          Bank wire transfers typically cost 4–6% in exchange rate markup plus fees. 
          Services like Wise, Remitly, and Remitbee can cut that to under 1%. 
          The actual cost depends on the destination country and amount.{' '}
          <a href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=faq"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            Compare remittance services →
          </a>
        </>
      ),
    },
    {
      q: 'Does my credit score from my home country transfer to Canada?',
      a: (
        <>
          No. Canadian credit bureaus (Equifax and TransUnion Canada) have no access to 
          foreign credit histories. You start from scratch. The fastest path to a 700+ 
          score involves a secured credit card, on-time payments, and low utilization —
          a realistic timeline is 12–18 months.{' '}
          <a href="https://buildcreditcanada.ca/credit-score-timeline.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=faq"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:underline">
            See the credit-building timeline →
          </a>
        </>
      ),
    },
  ],
},
```

---

### Priority 4 — Targeted Add (Specific Context)

#### G. Spot LMIA Fraud page — after the report section
**File:** `app/spot-lmia-fraud/page.tsx`, after the "Suspect You've Been Scammed?" section (line 148)

**Context:** Users on this page have either been scammed or are researching to protect themselves. Scam victims often lost money via wire transfer. A forward-looking resource on how to send money safely (and cheaply) is genuinely useful here.

**Change:** Add a new card after the report section:

```tsx
<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
  <h2 className="text-lg font-bold text-blue-900 mb-2">
    Sending Money Home Safely
  </h2>
  <p className="text-blue-800 mb-4 text-sm leading-relaxed">
    Whether you are already in Canada or planning to be — bank wire transfers 
    are expensive. Compare Wise, Remitly, and Western Union to find the 
    lowest-cost option for sending money to your family.
  </p>
  <a
    href="https://buildcreditcanada.ca/send-money.html?utm_source=lmiacheck&utm_medium=referral&utm_campaign=fraud-page"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
  >
    Compare money transfer services →
  </a>
</div>
```

---

## What I Dropped from v1 (and Why)

| v1 Placement | Status | Reason |
|---|---|---|
| Homepage "Ready to move to Canada?" section | **Removed** | Users are in verification mode, not planning mode — wrong context |
| Check results as a separate new section | **Downgraded** | Existing "Useful resources" section is the right spot; no new section needed |
| Full footer "Resources" section | **Downgraded to single link** | Footer is intentionally minimal; a full section breaks visual design |

---

## Tool Priority Ranking (Revised)

| Rank | Tool | Why | URL |
|------|------|-----|-----|
| 1 | Money Transfer Calculator | Foreign workers send money home regularly — most immediate financial need | `buildcreditcanada.ca/send-money.html` |
| 2 | Banking Comparator | Must open account on or near arrival | `buildcreditcanada.ca/compare.html` |
| 3 | Credit Score Timeline | Canadian credit history starts at zero for everyone | `buildcreditcanada.ca/credit-score-timeline.html` |
| 4 | Spending Plan | First paycheque planning prevents financial stress | `buildcreditcanada.ca/spending-plan.html` |
| 5 | Benefits Maximizer | CCB, GST credits often missed by newcomers | `buildcreditcanada.ca/benefits-maximizer.html` |

Advanced tools (TFSA/RRSP, FHSA, Rent vs Buy) are for 1+ year residents — too early for LMIA Check's core audience. Leave them out of cross-links.

---

## Risk-State Rules (Do Not Deviate)

| Result | Show BuildCreditCanada Links? | Rationale |
|--------|------|-----------|
| GREEN | Yes — all priority 1–4 placements | Verified employer, planning mode |
| YELLOW (eligible) | Yes — subdued only (footer, resources section) | Cautious tone; user still verifying |
| GREY | Optional — only Money Transfer Calculator | Not in crisis, but still unresolved |
| RED | Never | Crisis mode; financial tools are tone-deaf here |

---

## UTM Parameters (All Links)

Format: `?utm_source=lmiacheck&utm_medium=referral&utm_campaign=<placement>`

| Placement | Campaign value |
|-----------|---------------|
| NextSteps.tsx GREEN step | `green-nextsteps` |
| Simple results card | `green-results` |
| Full check results resources | `check-results` |
| Guide page section | `guide` |
| Footer | `footer` |
| FAQ section | `faq` |
| Spot fraud page | `fraud-page` |

---

## Implementation Order

| Week | Change | File | Effort |
|------|--------|------|--------|
| 1 | Add step to NextSteps GREEN state | `components/NextSteps.tsx` | 15 min |
| 1 | Add link to check results "Useful resources" | `app/check/results/page.tsx` | 5 min |
| 1 | Add Footer link | `components/Footer.tsx` | 5 min |
| 2 | Add "Planning your move?" card to simple results | `app/results/page.tsx` | 30 min |
| 2 | Add FAQ section | `app/faq/page.tsx` | 20 min |
| 3 | Add guide "After Arrival" section | `app/guide/page.tsx` | 45 min |
| 3 | Add fraud page money transfer card | `app/spot-lmia-fraud/page.tsx` | 15 min |
