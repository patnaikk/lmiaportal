'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Fuse from 'fuse.js'
import { TRADE_LEGAL_MAPPINGS } from '@/lib/trade-legal-mappings'

interface SearchEntry {
  displayTrade: string
  displayLegal: string
  province: string
  searchAs: string
}

const searchEntries: SearchEntry[] = []
for (const m of TRADE_LEGAL_MAPPINGS) {
  searchEntries.push({
    displayTrade: m.tradeName,
    displayLegal: m.legalName,
    province: m.province,
    searchAs: m.legalName,
  })
  if (m.tradeName !== m.legalName) {
    searchEntries.push({
      displayTrade: m.tradeName,
      displayLegal: m.legalName,
      province: m.province,
      searchAs: m.legalName,
    })
  }
}

const fuse = new Fuse(searchEntries, {
  keys: ['displayTrade', 'displayLegal'],
  threshold: 0.35,
  minMatchCharLength: 2,
  includeScore: true,
})

interface EmployerInputProps {
  initialValue?: string
  autoFocus?: boolean
  /** Called on every change: display = what user sees, searchAs = what to query */
  onValueChange: (display: string, searchAs: string) => void
}

export default function EmployerInput({
  initialValue = '',
  autoFocus = false,
  onValueChange,
}: EmployerInputProps) {
  const [value, setValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<SearchEntry[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [selectedMapping, setSelectedMapping] = useState<SearchEntry | null>(null)
  const [tipOpen, setTipOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setSuggestions([])
        setActiveSuggestion(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = useCallback((raw: string) => {
    setValue(raw)
    setSelectedMapping(null)
    onValueChange(raw, raw.trim())

    if (raw.trim().length < 2) {
      setSuggestions([])
      return
    }
    const results = fuse.search(raw.trim())
    const seen = new Set<string>()
    const deduped: SearchEntry[] = []
    for (const r of results) {
      const key = `${r.item.displayTrade}|${r.item.displayLegal}`
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(r.item)
      }
    }
    setSuggestions(deduped.slice(0, 5))
    setActiveSuggestion(-1)
  }, [onValueChange])

  function selectSuggestion(entry: SearchEntry) {
    setValue(entry.displayTrade)
    setSelectedMapping(entry)
    setSuggestions([])
    setActiveSuggestion(-1)
    onValueChange(entry.displayTrade, entry.searchAs)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeSuggestion])
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setActiveSuggestion(-1)
    }
  }

  const showTradeNameDiffers =
    selectedMapping &&
    selectedMapping.displayTrade.toLowerCase() !== selectedMapping.displayLegal.toLowerCase()

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="employer" className="block text-sm font-medium text-gray-700">
          Employer name <span className="text-red-600" aria-label="required">*</span>
        </label>
        <button
          type="button"
          onClick={() => setTipOpen((o) => !o)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 focus:outline-none focus:underline"
          aria-expanded={tipOpen}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Where do I find the name?
        </button>
      </div>

      {tipOpen && (
        <div className="mb-3 p-3.5 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Where to find the right employer name</p>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li className="flex gap-2"><span className="text-blue-500 font-bold mt-0.5">›</span><span><span className="font-medium">Job offer letter</span> — check the signature line or letterhead at the top</span></li>
            <li className="flex gap-2"><span className="text-blue-500 font-bold mt-0.5">›</span><span><span className="font-medium">T4 slip or pay stub</span> — the employer name printed there is the legal name on file with CRA</span></li>
            <li className="flex gap-2"><span className="text-blue-500 font-bold mt-0.5">›</span><span><span className="font-medium">Employment contract</span> — look for &quot;Employer&quot; or &quot;Company&quot; in the parties section</span></li>
          </ul>
          <div className="pt-1.5 border-t border-blue-100">
            <p className="text-xs text-gray-600"><span className="font-medium">Numbered companies:</span> Some employers file under a numbered name like <span className="font-mono bg-white px-1 rounded border border-gray-200">1234567 BC Ltd.</span> — this may differ from the trade name on your offer letter. Try both.</p>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id="employer"
          name="employer"
          type="text"
          required
          minLength={3}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Sunrise Senior Care or 1234567 BC Ltd."
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
          autoComplete="off"
          inputMode="text"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
        />

        {suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100">
              <p className="text-[11px] text-amber-700 font-medium">
                Known trade → legal name matches — click to search the registered name
              </p>
            </div>
            {suggestions.map((entry, i) => {
              const isDifferent = entry.displayTrade.toLowerCase() !== entry.displayLegal.toLowerCase()
              return (
                <button
                  key={`${entry.displayTrade}|${entry.displayLegal}`}
                  type="button"
                  role="option"
                  aria-selected={i === activeSuggestion}
                  onClick={() => selectSuggestion(entry)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                    i === activeSuggestion ? 'bg-red-50' : ''
                  }`}
                >
                  <span className="block text-sm font-semibold text-gray-900">{entry.displayTrade}</span>
                  {isDifferent && (
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Files as: <span className="font-medium text-gray-700">{entry.displayLegal}</span>
                      {' · '}{entry.province}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {showTradeNameDiffers && (
        <div className="mt-2 flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
          <svg className="flex-shrink-0 w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">{selectedMapping!.displayTrade}</span> files with the government as{' '}
            <span className="font-semibold">{selectedMapping!.displayLegal}</span>. We&apos;ll search for the registered name automatically.
          </p>
        </div>
      )}
    </div>
  )
}
