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

export default function CheckForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [employerDisplay, setEmployerDisplay] = useState('')
  const [employerSearchAs, setEmployerSearchAs] = useState('')
  const [province, setProvince] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [wage, setWage] = useState('')
  const [wagePeriod, setWagePeriod] = useState('hourly')
  const [offerMonths, setOfferMonths] = useState('')
  const [lmiaMonths, setLmiaMonths] = useState('')
  const [fee, setFee] = useState('')
  const [delivery, setDelivery] = useState('')

  const canSubmit = employerDisplay.trim().length >= 3 && fee !== '' && delivery !== '' && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)

    const params = new URLSearchParams()
    params.set('employer', employerSearchAs.trim() || employerDisplay.trim())
    if (province) params.set('province', province)
    if (jobTitle.trim()) params.set('job_title', jobTitle.trim())
    if (wage.trim()) {
      params.set('wage', wage.trim())
      params.set('wage_period', wagePeriod)
    }
    if (offerMonths.trim()) params.set('offer_months', offerMonths.trim())
    if (lmiaMonths.trim()) params.set('lmia_months', lmiaMonths.trim())
    params.set('fee', fee)
    params.set('delivery', delivery)

    window.scrollTo(0, 0)
    router.push(`/check/results?${params.toString()}`)
  }

  const inputClass =
    'w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50'
  const radioClass =
    'flex items-center gap-2.5 px-4 py-3 border rounded-lg cursor-pointer transition-colors text-sm font-medium'

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* Section 1 — Employer */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">About the employer</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cross-referenced against 11K+ LMIA records and the non-compliant employer list</p>
        </div>

        <EmployerInput
          onValueChange={(display, searchAs) => {
            setEmployerDisplay(display)
            setEmployerSearchAs(searchAs)
          }}
        />

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            Province / Territory <span className="text-gray-400 font-normal">(recommended)</span>
          </label>
          <select
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={inputClass + ' appearance-none'}
          >
            <option value="">Select province…</option>
            {PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
            Job title on offer <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="job_title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. General Farm Worker, Caregiver"
            className={inputClass}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Section 2 — Offer details */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Offer details <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span></h2>
          <p className="text-xs text-gray-400 mt-0.5">Enables wage comparison and duration mismatch checks — takes 30 seconds to fill in</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Offered wage
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder="e.g. 18.50"
              className={inputClass + ' flex-1'}
            />
            <select
              value={wagePeriod}
              onChange={(e) => setWagePeriod(e.target.value)}
              className="px-3 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 appearance-none"
            >
              <option value="hourly">/ hour</option>
              <option value="monthly">/ month</option>
              <option value="annually">/ year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="offer_months" className="block text-sm font-medium text-gray-700 mb-1">
              Job offer duration
            </label>
            <div className="relative">
              <input
                id="offer_months"
                type="number"
                min="1"
                max="48"
                value={offerMonths}
                onChange={(e) => setOfferMonths(e.target.value)}
                placeholder="e.g. 12"
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">months</span>
            </div>
          </div>
          <div>
            <label htmlFor="lmia_months" className="block text-sm font-medium text-gray-700 mb-1">
              LMIA duration
            </label>
            <div className="relative">
              <input
                id="lmia_months"
                type="number"
                min="1"
                max="48"
                value={lmiaMonths}
                onChange={(e) => setLmiaMonths(e.target.value)}
                placeholder="e.g. 12"
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">months</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          Duration on your job offer letter vs. what is stated on the LMIA document
        </p>
      </div>

      {/* Section 3 — Key questions */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Key questions <span className="text-red-500">*</span></h2>
          <p className="text-xs text-gray-400 mt-0.5">These two answers flag the most common scam indicators — required to run the check</p>
        </div>

        {/* Fee question */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Were you asked to pay any fee for the LMIA or job offer?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'no', label: 'No', color: fee === 'no' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-700 hover:border-gray-300' },
              { value: 'yes', label: 'Yes', color: fee === 'yes' ? 'border-red-500 bg-red-50 text-red-800' : 'border-gray-200 text-gray-700 hover:border-gray-300' },
              { value: 'unsure', label: 'Not sure', color: fee === 'unsure' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-gray-200 text-gray-700 hover:border-gray-300' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFee(opt.value)}
                className={`${radioClass} ${opt.color} justify-center`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery question */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Who gave you this job offer / LMIA?
          </p>
          <div className="space-y-2">
            {[
              { value: 'employer', label: 'Directly from the employer', sub: 'The employer contacted me or I applied directly' },
              { value: 'recruiter', label: 'From a recruiter or agency', sub: 'A third-party recruiter or staffing agency' },
              { value: 'consultant', label: 'From an immigration consultant', sub: 'An RCIC, lawyer, or immigration representative' },
              { value: 'unsure', label: 'Not sure', sub: '' },
            ].map((opt) => {
              const selected = delivery === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDelivery(opt.value)}
                  className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                    selected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <span className={`block text-sm font-medium ${selected ? 'text-red-900' : 'text-gray-800'}`}>
                    {opt.label}
                  </span>
                  {opt.sub && (
                    <span className="block text-xs text-gray-500 mt-0.5">{opt.sub}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {!canSubmit && (fee === '' || delivery === '') && employerDisplay.trim().length >= 3 && (
        <p className="text-xs text-red-500">Please answer the two questions above to continue.</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full px-8 py-3.5 bg-red-600 text-white text-base font-bold rounded-lg
          hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking…
          </>
        ) : (
          'Run all checks'
        )}
      </button>
    </form>
  )
}
