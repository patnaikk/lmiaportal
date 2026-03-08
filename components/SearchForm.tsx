'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current && !initialEmployer) {
      inputRef.current.focus()
    }
  }, [initialEmployer])

  const canSubmit = employer.trim().length >= 3 && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    const params = new URLSearchParams({ employer: employer.trim() })
    if (city.trim()) params.set('city', city.trim())
    if (province) params.set('province', province)
    router.push(`/results?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
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
          onChange={(e) => setEmployer(e.target.value)}
          placeholder="e.g. Sunrise Senior Care"
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
          autoComplete="organization"
          inputMode="text"
        />
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
