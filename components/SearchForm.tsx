'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import Fuse from 'fuse.js'
import { TRADE_LEGAL_MAPPINGS, type TradeMapping } from '@/lib/trade-legal-mappings'

const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
]

// Build a combined search index: each mapping appears twice —
// once keyed by tradeName and once by legalName, so users can find
// the match no matter which name they type.
interface SearchEntry {
  displayTrade: string
  displayLegal: string
  province: string
  searchAs: string // the value we actually submit to the DB
}

const searchEntries: SearchEntry[] = []
for (const m of TRADE_LEGAL_MAPPINGS) {
  // Entry keyed by trade name
  searchEntries.push({
    displayTrade: m.tradeName,
    displayLegal: m.legalName,
    province: m.province,
    searchAs: m.legalName, // submit legal name so the DB finds it
  })
  // Entry keyed by legal name (if different from trade name)
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

interface SearchFormProps {
  initialEmployer?: string
  initialCity?: string
  initialProvince?: string
}

export default function SearchForm({
  initialEmployer = '',
  initialCity = '',
  initialProvince = '',
}: SearchFormProps) {
  const router = useRouter()
  const [employer, setEmployer] = useState(initialEmployer)
  const [city, setCity] = useState(initialCity)
  const [province, setProvince] = useState(initialProvince)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchEntry[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [selectedMapping, setSelectedMapping] = useState<SearchEntry | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inputRef.current && !initialEmployer) {
      inputRef.current.focus()
    }
  }, [initialEmployer])

  // Close dropdown on outside click
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

  const handleEmployerChange = useCallback((value: string) => {
    setEmployer(value)
    setSelectedMapping(null)

    if (value.trim().length < 2) {
      setSuggestions([])
      return
    }

    const results = fuse.search(value.trim())
    // Deduplicate by legal name (show each mapping only once)
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
  }, [])

  function selectSuggestion(entry: SearchEntry) {
    setEmployer(entry.displayTrade)
    setSelectedMapping(entry)
    setSuggestions([])
    setActiveSuggestion(-1)
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

  const canSubmit = employer.trim().length >= 3 && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setSuggestions([])

    // If user selected a mapping, search using the legal name
    const searchName = selectedMapping ? selectedMapping.searchAs : employer.trim()
    const params = new URLSearchParams({ employer: searchName })
    if (city.trim()) params.set('city', city.trim())
    if (province) params.set('province', province)
    router.push(`/results?${params.toString()}`)
  }

  const showTradeNameDiffers =
    selectedMapping &&
    selectedMapping.displayTrade.toLowerCase() !== selectedMapping.displayLegal.toLowerCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="relative">
        <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-1">
          Employer name <span className="text-red-600" aria-label="required">*</span>
        </label>
        <input
          ref={inputRef}
          id="employer"
          name="employer"
          type="text"
          required
          minLength={3}
          value={employer}
          onChange={(e) => handleEmployerChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Sunrise Senior Care or 1234567 BC Ltd."
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
          autoComplete="off"
          inputMode="text"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
        />

        {/* Autocomplete dropdown */}
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
              const isDifferent =
                entry.displayTrade.toLowerCase() !== entry.displayLegal.toLowerCase()
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
                  <span className="block text-sm font-semibold text-gray-900">
                    {entry.displayTrade}
                  </span>
                  {isDifferent && (
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Files as:{' '}
                      <span className="font-medium text-gray-700">{entry.displayLegal}</span>
                      {' · '}{entry.province}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Confirmation badge when a mapping is selected */}
        {showTradeNameDiffers && (
          <div className="mt-2 flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <svg
              className="flex-shrink-0 w-4 h-4 text-blue-500 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{selectedMapping!.displayTrade}</span> files with the
              government as{' '}
              <span className="font-semibold">{selectedMapping!.displayLegal}</span>. We&apos;ll
              search for the registered name automatically.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Toronto"
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
            inputMode="text"
          />
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            Province / Territory <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            id="province"
            name="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 appearance-none"
          >
            <option value="">Any province</option>
            {PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full px-8 py-3 bg-red-600 text-white text-base font-bold rounded-lg
          hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Checking...
          </>
        ) : (
          'Check This Employer'
        )}
      </button>
    </form>
  )
}
