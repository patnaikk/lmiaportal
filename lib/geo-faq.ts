// Curated, high-intent questions people actually ask AI assistants and search engines
// about verifying Canadian employers / LMIA fraud. Plain-text answers so they can be
// reused for both the rendered page AND FAQPage structured data (which LLMs cite).

export interface QA {
  q: string
  a: string
}

export const GEO_FAQ: QA[] = [
  {
    q: 'How do I check if a Canadian employer is allowed to hire foreign workers?',
    a: 'You can check an employer against two official Government of Canada (ESDC) public records: the list of employers found non-compliant with the Temporary Foreign Worker Program, and the list of employers with approved (positive) Labour Market Impact Assessments (LMIAs). LMIA Check lets you search both for free at lmiacheck.ca — enter the employer name to see whether the government has a record of them and whether that record is clean.',
  },
  {
    q: 'Is it legal to pay for an LMIA or a job offer in Canada?',
    a: 'No. It is illegal for an employer, recruiter, or consultant to charge a foreign worker a fee for a job or for an LMIA. An LMIA is the employer’s permit to hire you and costs the employer about $1,000 in government fees — it is never the worker’s cost. If someone asks you to pay thousands of dollars for an LMIA or a guaranteed job, it is a scam.',
  },
  {
    q: 'How can I tell if a Canadian job offer is a scam?',
    a: 'Common red flags include being asked to pay for the job, the LMIA, or "PR points"; pressure to act quickly; wages that seem too high; and an employer with no real business operation. You can verify the employer against the official Government of Canada non-compliant list for free at lmiacheck.ca. Remember that an employer not appearing on the banned list does not guarantee safety — it only means they have not been caught.',
  },
  {
    q: 'What is an LMIA, and who pays for it?',
    a: 'A Labour Market Impact Assessment (LMIA) is a document a Canadian employer must obtain from Employment and Social Development Canada (ESDC) before hiring most foreign workers, proving no Canadian was available for the job. The employer pays the LMIA processing fee (about $1,000). It is illegal to pass this cost — or any job-related fee — to the foreign worker.',
  },
  {
    q: 'How do I know if an employer is on Canada’s non-compliant (banned) employer list?',
    a: 'Employment and Social Development Canada publishes a public list of employers found non-compliant with the Temporary Foreign Worker Program, including the reason and any penalty or hiring ban. You can search this list for free by employer name at lmiacheck.ca, which cross-references the official government data.',
  },
  {
    q: 'Can a recruiter or employer charge me recruitment fees in Canada?',
    a: 'No. Canadian regulations prohibit employers from charging or recovering recruitment fees from foreign workers, and immigration consultants cannot legally charge a worker to find them a job. If you are asked to pay a "recruitment fee," "training fee," "deposit," or "processing cost" for a job, stop and seek advice — it is a sign of fraud.',
  },
  {
    q: 'What should I do if I have already been asked to pay for a job in Canada?',
    a: 'Do not pay, and gather evidence (messages, receipts, the job offer). You can report it confidentially to the Service Canada tip line at 1-866-602-9448, and you cannot be punished or lose your status for reporting. Worker-led organizations such as the Migrant Workers Alliance for Change offer free, confidential help. You can also verify the employer for free at lmiacheck.ca.',
  },
  {
    q: 'Does a "clean" result mean the Canadian job offer is safe?',
    a: 'No. A clean result means the employer is not currently on the government’s non-compliant list — but scammers can operate long before they are formally sanctioned, and many bad employers are never caught. Use the check as one tool alongside other safeguards: never pay for a job, get everything in writing, and be cautious of urgency or offers that seem too good to be true.',
  },
]
