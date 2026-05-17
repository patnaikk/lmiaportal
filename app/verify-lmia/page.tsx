'use client'

import { useState, useRef } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

type Result = 'idle' | 'valid' | 'system-file' | 'invalid' | 'empty'

function classifyNumber(raw: string): Result {
  const cleaned = raw.trim().replace(/\s/g, '')
  if (!cleaned) return 'empty'
  // System file number pattern: long alphanumeric string like 5UC1WKRV00103119
  if (/^[A-Z0-9]{10,}$/i.test(cleaned) && /[A-Za-z]/.test(cleaned)) return 'system-file'
  // Valid LMIA number: exactly 7 digits
  if (/^\d{7}$/.test(cleaned)) return 'valid'
  return 'invalid'
}

export default function VerifyLmiaPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleCheck() {
    const val = inputRef.current?.value || input
    setInput(val)
    setResult(classifyNumber(val))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-red-50 text-center pt-10 pb-7 px-4">
        <div className="text-4xl mb-3">🔢</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Is my LMIA number real?
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Check the format of your LMIA number and get the exact steps to verify it directly with Service Canada.
        </p>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

        {/* Checker card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md">
          <label htmlFor="lmia-number" className="block text-sm font-semibold text-gray-800 mb-1">
            LMIA number from your document
          </label>
          <p className="text-xs text-gray-400 mb-3">Enter the number exactly as it appears — usually labelled "LMIA #" or "File Number"</p>
          <input
            id="lmia-number"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult('idle') }}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="e.g. 9783145"
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 font-mono"
          />
          <button
            onClick={handleCheck}
            disabled={!input.trim() && !inputRef.current?.value}
            className="mt-3 w-full px-4 py-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Check format
          </button>
        </div>

        {/* Result */}
        {result === 'valid' && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-green-900">✓ Format looks correct</p>
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>{input.trim()}</strong> matches the 7-digit format used on real LMIA approval letters. However, format alone cannot confirm the number is genuine — only Service Canada can do that.
            </p>
            <p className="text-sm text-green-800 leading-relaxed font-medium mt-1">→ Follow the verification steps below to confirm with Service Canada.</p>
          </div>
        )}

        {result === 'system-file' && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-amber-900">⚠ This looks like a System File Number, not an LMIA number</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              ESDC also issues an internal system file number (e.g. <span className="font-mono text-xs bg-amber-100 px-1 rounded">5UC1WKRV00103119</span>) used in their online portal. This is different from the LMIA number on your approval letter.
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">Ask the employer to provide the LMIA number from the approval letter — it should be 7 digits. Then follow the steps below to verify it.</p>
          </div>
        )}

        {result === 'invalid' && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-red-900">🔴 This does not match any known LMIA number format</p>
            <p className="text-sm text-red-800 leading-relaxed">
              Real LMIA numbers are exactly 7 digits (e.g. <span className="font-mono text-xs bg-red-100 px-1 rounded">9783145</span>). <strong>"{input.trim()}"</strong> does not match this format — this is a red flag that the document may be forged.
            </p>
            <p className="text-sm text-red-800 leading-relaxed">Call Service Canada to verify before submitting any application or documents.</p>
          </div>
        )}

        {/* What a real LMIA letter looks like */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">What a real LMIA approval letter looks like</h2>
          <ul className="space-y-2.5">
            {[
              { icon: '✓', color: 'text-green-600', text: 'Addressed to the employer — not to you. The worker is never the recipient of an LMIA.' },
              { icon: '✓', color: 'text-green-600', text: 'Issued on official ESDC letterhead with a Government of Canada header.' },
              { icon: '✓', color: 'text-green-600', text: 'Contains a 7-digit LMIA number (e.g. 9783145) labelled "LMIA #" or "File Number".' },
              { icon: '✓', color: 'text-green-600', text: 'Lists the specific job title, wage, and number of positions approved.' },
              { icon: '✓', color: 'text-green-600', text: 'Signed by a Service Canada officer — not a recruiter or consultant.' },
              { icon: '✗', color: 'text-red-600', text: 'Is NOT sent directly to the worker by the employer or recruiter — the employer receives it from ESDC.' },
              { icon: '✗', color: 'text-red-600', text: 'Does NOT guarantee your work permit — it only allows the employer to make an offer.' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className={`text-sm font-bold flex-shrink-0 mt-0.5 ${item.color}`}>{item.icon}</span>
                <span className="text-sm text-gray-700 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Verify with Service Canada */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-blue-900 mb-1">Verify directly with Service Canada</h2>
          <p className="text-xs text-blue-700 mb-3">This is the only way to confirm an LMIA is genuine. It is free and takes about 5 minutes.</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">1</span>
              <div>
                <p className="text-sm font-medium text-blue-900">Call Service Canada</p>
                <a href="tel:18003675693" className="text-sm font-bold text-blue-700 underline">1-800-367-5693</a>
                <p className="text-xs text-blue-600 mt-0.5">Mon–Fri, 6:30 am – 8:00 pm ET</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">2</span>
              <div>
                <p className="text-sm font-medium text-blue-900">Use this exact script</p>
                <div className="mt-1.5 bg-white border border-blue-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 leading-relaxed italic">
                  "I am a foreign worker and I received a job offer from [employer name] in [province]. I want to verify that LMIA number [your number] is valid and was approved for this employer."
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">3</span>
              <div>
                <p className="text-sm font-medium text-blue-900">Have this information ready</p>
                <ul className="mt-1 text-sm text-blue-800 space-y-0.5 list-disc list-inside">
                  <li>Employer name (exactly as on the document)</li>
                  <li>Province or territory</li>
                  <li>The LMIA number</li>
                  <li>Job title on the offer</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">4</span>
              <div>
                <p className="text-sm font-medium text-blue-900">If they cannot find it</p>
                <p className="text-sm text-blue-800 leading-relaxed">If Service Canada has no record of the LMIA number — stop all contact with the employer and report it to the <a href="tel:18884958501" className="font-bold underline">Canadian Anti-Fraud Centre (1-888-495-8501)</a>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Also verify the employer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Also verify the employer</p>
          <p className="text-xs text-gray-500 mb-3">An LMIA number check is not complete without also checking whether the employer is on the government non-compliant list.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Check the employer →
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center leading-relaxed pb-2">
          lmiacheck.ca cannot access ESDC systems or confirm LMIA validity. Format checking is a preliminary step only. Always verify with Service Canada directly before making any decision.
        </p>

      </main>

      <Footer />
    </div>
  )
}
