'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import EmployerInput from '@/components/EmployerInput'

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

const SAMPLES = [
  { label: 'Sunrise Senior Care', value: 'Sunrise Senior Care' },
  { label: 'Loblaws', value: 'Loblaws' },
]

interface SearchFormProps {
  initialEmployer?: string
  initialCity?: string
  initialProvince?: string
  autoFocus?: boolean
}

export default function SearchForm({
  initialEmployer = '',
  initialCity = '',
  initialProvince = '',
  autoFocus = false,
}: SearchFormProps) {
  const router = useRouter()
  const [employerDisplay, setEmployerDisplay] = useState(initialEmployer)
  const [employerSearchAs, setEmployerSearchAs] = useState(initialEmployer)
  const [city, setCity] = useState(initialCity)
  const [province, setProvince] = useState(initialProvince)
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [inputKey, setInputKey] = useState(0)
  const [sampleValue, setSampleValue] = useState(initialEmployer)

  const canSubmit = employerDisplay.trim().length >= 3 && !loading

  function handleEmployerChange(display: string, searchAs: string) {
    setEmployerDisplay(display)
    setEmployerSearchAs(searchAs)
  }

  function handleSampleClick(value: string) {
    setSampleValue(value)
    setEmployerDisplay(value)
    setEmployerSearchAs(value)
    setInputKey((k) => k + 1)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (employerDisplay.trim().length < 3 || loading) return
    setLoading(true)
    window.scrollTo({ top: 0, behavior: 'instant' })

    const params = new URLSearchParams({ employer: employerSearchAs.trim() || employerDisplay.trim() })
    if (city.trim()) params.set('city', city.trim())
    if (province) params.set('province', province)
    router.push(`/results?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <EmployerInput
        key={inputKey}
        initialValue={sampleValue}
        autoFocus={autoFocus}
        onValueChange={handleEmployerChange}
      />

      {/* Try It — zero-commitment preview */}
      <p className="text-xs text-gray-400 leading-relaxed">
        Not sure?{' '}
        {SAMPLES.map((s, i) => (
          <span key={s.value}>
            <button
              type="button"
              onClick={() => handleSampleClick(s.value)}
              className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
            >
              {s.label}
            </button>
            {i < SAMPLES.length - 1 && <span className="mx-1 text-gray-300">·</span>}
          </span>
        ))}
        <span className="text-gray-300 mx-1">·</span>
        <span className="text-gray-400">See what a result looks like.</span>
      </p>

      {/* Advanced search toggle */}
      {!showAdvanced ? (
        <button
          type="button"
          onClick={() => setShowAdvanced(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filter by city or province
        </button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 appearance-none"
            >
              <option value="">Any province</option>
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-base font-bold rounded-xl
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          transition-colors min-h-[52px] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Verify Employer
          </>
        )}
      </button>
    </form>
  )
}
