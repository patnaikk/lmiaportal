'use client'

import { useState } from 'react'

interface CheckItem {
  id: string
  label: string
  subtext: string
  howTo?: string
}

const CHECKS: CheckItem[] = [
  {
    id: 'commercial_address',
    label: 'Business address is commercial, not residential',
    subtext: 'A home address can indicate a shell company.',
    howTo: 'Verify on Google Maps Street View.',
  },
  {
    id: 'web_presence',
    label: 'Company has a verifiable web presence',
    subtext:
      'A real employer should have a website, Google Business listing, or LinkedIn page matching their registered name.',
  },
  {
    id: 'province_match',
    label: 'Business number matches the claimed province',
    subtext:
      "An 'Ontario Ltd.' with a BC business number is a red flag. The province in the registry should match the job location.",
  },
  {
    id: 'lmia_format',
    label: 'LMIA number is in the correct format',
    subtext: 'Valid LMIA numbers follow the format: XXXXXXXXX-YYYY (9 digits, dash, 4 digits). Fake LMIAs often have incorrect formats.',
  },
  {
    id: 'no_fee',
    label: 'You were not charged any fee for this LMIA',
    subtext: 'IRCC does not allow employers to charge workers. Any payment for an LMIA is illegal.',
  },
  {
    id: 'noc_match',
    label: 'Job description matches the NOC code on the LMIA',
    subtext:
      'If your actual duties differ from the advertised role, your work permit may be invalid.',
  },
]

interface Props {
  employerAddress?: string
}

export default function RedFlagChecklist({ employerAddress }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [lmiaNumber, setLmiaNumber] = useState('')
  const [open, setOpen] = useState(false)

  const completedCount = Object.values(checked).filter(Boolean).length
  const totalChecks = CHECKS.length

  // Colour bands
  const scoreColor =
    completedCount <= 2
      ? { bar: 'bg-red-500', text: 'text-red-700', label: 'High risk — more checks needed' }
      : completedCount <= 4
      ? { bar: 'bg-amber-400', text: 'text-amber-700', label: 'Some checks incomplete' }
      : { bar: 'bg-green-500', text: 'text-green-700', label: 'Looking good — keep verifying' }

  const isValidLmia = /^\d{9}-\d{4}$/.test(lmiaNumber.trim())

  function toggleCheck(id: string) {
    if (id === 'lmia_format') {
      // lmia_format is auto-validated — only toggle if they type a valid number
      return
    }
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleLmiaChange(val: string) {
    setLmiaNumber(val)
    setChecked((prev) => ({ ...prev, lmia_format: /^\d{9}-\d{4}$/.test(val.trim()) }))
  }

  const mapsUrl = employerAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(employerAddress)}`
    : null

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 group"
        aria-expanded={open}
      >
        <span>Employer Trust Checklist</span>
        <span className={`flex items-center gap-2 font-normal normal-case ${scoreColor.text}`}>
          <span className="text-xs">{completedCount}/{totalChecks} checks</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Mini trust bar — always visible */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-300 ${scoreColor.bar}`}
          style={{ width: `${(completedCount / totalChecks) * 100}%` }}
        />
      </div>

      {open && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          <p className={`text-xs font-semibold ${scoreColor.text} mb-1`}>
            Employer Trust Score: {completedCount}/{totalChecks} — {scoreColor.label}
          </p>

          {CHECKS.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              {item.id === 'lmia_format' ? (
                // LMIA format is auto-validated by input
                <div
                  className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center ${
                    checked.lmia_format
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {checked.lmia_format && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                    checked[item.id]
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  aria-label={`Mark "${item.label}" as ${checked[item.id] ? 'incomplete' : 'complete'}`}
                >
                  {checked[item.id] && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.subtext}</p>

                {/* LMIA format validator */}
                {item.id === 'lmia_format' && (
                  <div className="mt-1.5">
                    <input
                      type="text"
                      value={lmiaNumber}
                      onChange={(e) => handleLmiaChange(e.target.value)}
                      placeholder="e.g. 123456789-2024"
                      className={`w-full max-w-xs px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 ${
                        lmiaNumber && !isValidLmia
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-gray-200'
                      }`}
                    />
                    {lmiaNumber && !isValidLmia && (
                      <p className="text-xs text-red-600 mt-1">
                        Format should be 9 digits, a dash, then 4 digits (e.g. 123456789-2024)
                      </p>
                    )}
                    {isValidLmia && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        ✓ Valid LMIA number format
                      </p>
                    )}
                  </div>
                )}

                {/* Google Maps link for address check */}
                {item.id === 'commercial_address' && mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    View on Google Maps
                  </a>
                )}

                {item.howTo && !mapsUrl && item.id === 'commercial_address' && (
                  <p className="text-xs text-gray-400 mt-0.5 italic">{item.howTo}</p>
                )}
              </div>
            </div>
          ))}

          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100 leading-relaxed">
            Complete all checks before submitting. A low score means more verification is needed —
            not necessarily fraud.
          </p>
        </div>
      )}
    </div>
  )
}
