'use client'

import { useState } from 'react'

interface Props {
  employer: string
  banUntil?: string | null
  mode?: 'red' | 'grey' | 'green'
}

type Template = {
  id: string
  label: string
  description: string
  build: (employer: string, banUntil?: string | null) => string
}

const TEMPLATES: Template[] = [
  {
    id: 'buytime',
    label: 'Buy time',
    description: 'Pause pressure without committing — use when you need 48 hours to verify',
    build: () =>
      `Thank you for reaching out about this opportunity.\n\nBefore I can proceed, I need 48 hours to speak with my family and verify the details of this offer with Service Canada directly. This is standard practice I follow for all job offers.\n\nI will be in touch by [date]. Please do not contact me again before then.\n\nThank you for understanding.`,
  },
  {
    id: 'recruiter',
    label: 'Reply to recruiter',
    description: 'When a recruiter is offering you a position and you want to decline or push back',
    build: (employer, banUntil) =>
      `Hello,\n\nI have verified ${employer} on the official Government of Canada non-compliant employer list at canada.ca. This employer is currently banned from hiring temporary foreign workers${banUntil ? ` until ${banUntil}` : ''}.\n\nPlease do not contact me again about this position. I will be reporting this offer to Service Canada (ESDC) at 1-800-367-5693.\n\nThank you.`,
  },
  {
    id: 'esdc',
    label: 'Report to Service Canada',
    description: 'Send to Service Canada (ESDC) when you suspect fraud or were targeted',
    build: (employer) =>
      `I would like to report a suspected fraudulent job offer from ${employer}.\n\nThis employer appears on the Government of Canada non-compliant employer list, yet I have been approached with what was presented as a valid LMIA offer.\n\nDetails:\n- Employer name: ${employer}\n- How I was contacted: [describe — e.g. WhatsApp, Facebook, email]\n- Date contacted: [date]\n- Amount asked for (if any): [amount or "none"]\n- Documents I was sent: [LMIA copy / offer letter / job description]\n\nPlease let me know what further information you require.`,
  },
  {
    id: 'family',
    label: 'Tell your family',
    description: 'A short message to forward to a family member or friend',
    build: (employer) =>
      `Update: The Canadian job offer from ${employer} is not legitimate. I verified it on lmiacheck.ca — this employer is officially banned by the Canadian government from hiring foreign workers. I am not going to proceed and have not paid them anything. Please warn anyone else who may have been contacted by them.`,
  },
]

const MODE_CONFIG = {
  red: {
    headline: 'Ready-to-send messages',
    sub: "Don't know what to say? Use one of these — edit as needed.",
    defaultTab: 'recruiter',
  },
  grey: {
    headline: 'Suspicious offer? Reply with this',
    sub: "Employer not found doesn't mean the offer is safe. Use these if anything feels off.",
    defaultTab: 'buytime',
  },
  green: {
    headline: 'Still want to push back on fees?',
    sub: 'Even verified employers cannot legally charge you recruitment fees. Use these if anyone asks.',
    defaultTab: 'buytime',
  },
}

export default function ReportTemplate({ employer, banUntil, mode = 'red' }: Props) {
  const config = MODE_CONFIG[mode]
  const [activeId, setActiveId] = useState<string>(config.defaultTab)
  const [copied, setCopied] = useState(false)

  const active = TEMPLATES.find((t) => t.id === activeId) || TEMPLATES[0]
  const text = active.build(employer, banUntil)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mt-4 p-5 sm:p-6 card-elevated">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{config.headline}</p>
          <p className="text-xs text-gray-500 mt-0.5">{config.sub}</p>
        </div>
      </div>

      {/* Template tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto -mx-1 px-1 pb-1">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveId(t.id); setCopied(false) }}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeId === t.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-2">{active.description}</p>

      <div className="relative">
        <pre className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap leading-relaxed font-sans break-words max-h-64 overflow-y-auto">
          {text}
        </pre>

        <button
          onClick={handleCopy}
          className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
          aria-label="Copy message to clipboard"
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied to clipboard
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy message
            </>
          )}
        </button>
      </div>
    </div>
  )
}
