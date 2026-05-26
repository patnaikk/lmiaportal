'use client'

import { useState } from 'react'

type WizardStep = 'entry' | 'step1' | 'step2' | 'step3' | 'result'
type Step1Answer = 'yes' | 'no' | null
type Step2Answer = 'yes' | 'no_unsure' | null
type Step3Answer = 'yes' | 'no' | null

interface AuditResult {
  step1: Step1Answer
  step2: Step2Answer
  step3: Step3Answer
}

export default function PGWPAuditor() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<WizardStep>('entry')
  const [result, setResult] = useState<AuditResult>({
    step1: null,
    step2: null,
    step3: null,
  })

  const openWizard = () => {
    setIsOpen(true)
    setCurrentStep('step1')
    setResult({ step1: null, step2: null, step3: null })
  }

  const closeWizard = () => {
    setIsOpen(false)
    setCurrentStep('entry')
  }

  const handleStep1 = (answer: Step1Answer) => {
    setResult((prev) => ({ ...prev, step1: answer }))
    if (answer === 'no') {
      setCurrentStep('result')
    } else {
      setCurrentStep('step2')
    }
  }

  const handleStep2 = (answer: Step2Answer) => {
    setResult((prev) => ({ ...prev, step2: answer }))
    if (answer === 'no_unsure') {
      setCurrentStep('result')
    } else {
      setCurrentStep('step3')
    }
  }

  const handleStep3 = (answer: Step3Answer) => {
    setResult((prev) => ({ ...prev, step3: answer }))
    setCurrentStep('result')
  }

  const goBack = () => {
    if (currentStep === 'step2') setCurrentStep('step1')
    else if (currentStep === 'step3') setCurrentStep('step2')
    else if (currentStep === 'result') {
      setCurrentStep('step1')
      setResult({ step1: null, step2: null, step3: null })
    }
  }

  return (
    <>
      {/* Entry Card */}
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <button
          onClick={openWizard}
          className="group block w-full card-elevated p-5 sm:p-6 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-12px_rgba(34,197,94,0.15)] hover:ring-green-100 transition-all text-left"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-green-50 flex items-center justify-center" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M9 10h.01M15 10h.01"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 mb-0.5">🎓 Recent Graduates & PGWP Holders</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">LMIA Process Auditor</p>
              <p className="text-sm text-gray-500 mt-2 leading-snug">
                Is your employer stringing you along? Some employers promise an LMIA to keep temporary graduates working, only to drag their feet until your work permit expires. Run a quick, anonymous audit to see if your application path is actually real.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">PGWP-to-LMIA Audit</h2>
              <button
                onClick={closeWizard}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Step 1: LMIA System File Number */}
              {currentStep === 'step1' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-[11px] font-bold text-gray-600">Step 1 of 3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Did your employer give you a 7-digit LMIA System File Number?</h3>
                    <p className="text-sm text-gray-600">This would look like a number starting with "W" or "A" (e.g., W12345678). You can verify it on the <a href="https://www.canada.ca/en/employment-social-development/services/foreign-workers.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">ESDC Job Bank</a>.</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleStep1('yes')}
                      className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-900 font-semibold rounded-xl transition-colors"
                    >
                      ✓ Yes, I have the file number
                    </button>
                    <button
                      onClick={() => handleStep1('no')}
                      className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-semibold rounded-xl transition-colors"
                    >
                      ✗ No, I don't have it
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Job Bank Posting */}
              {currentStep === 'step2' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-[11px] font-bold text-gray-600">Step 2 of 3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Has your exact job title been posted on the government Job Bank for at least 30 consecutive days?</h3>
                    <p className="text-sm text-gray-600">Your employer is legally required to recruit Canadian residents first. You can search the <a href="https://www.jobbank.gc.ca/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">Job Bank</a> to confirm the posting exists under your job title, location, and company name.</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleStep2('yes')}
                      className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-900 font-semibold rounded-xl transition-colors"
                    >
                      ✓ Yes, I found the posting
                    </button>
                    <button
                      onClick={() => handleStep2('no_unsure')}
                      className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-semibold rounded-xl transition-colors"
                    >
                      ✗ No / I'm not sure
                    </button>
                  </div>

                  <button
                    onClick={goBack}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Step 3: Wage/Title Anomaly */}
              {currentStep === 'step3' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-[11px] font-bold text-gray-600">Step 3 of 3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Did your employer suddenly change your job title or artificially bump your wage?</h3>
                    <p className="text-sm text-gray-600">For example, changing you from "General Labourer" to "Skilled Tradesperson" or jumping your wage by 20%+ right before filing the LMIA, just to bypass low-wage restrictions.</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleStep3('no')}
                      className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-900 font-semibold rounded-xl transition-colors"
                    >
                      ✓ No, everything matches my offer
                    </button>
                    <button
                      onClick={() => handleStep3('yes')}
                      className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-semibold rounded-xl transition-colors"
                    >
                      ⚠️ Yes, something changed
                    </button>
                  </div>

                  <button
                    onClick={goBack}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Results Screen */}
              {currentStep === 'result' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Audit Results</h3>
                  </div>

                  {/* Red Flag: No File Number */}
                  {result.step1 === 'no' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">🔴</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-red-900 mb-1">System Alert: No Valid LMIA Application</p>
                          <p className="text-sm text-red-800">Your employer has <strong>not officially submitted</strong> your application to Service Canada. An LMIA application cannot legally exist without a 7-digit file number. If they claim it is "in progress with a lawyer" or "being prepared," demand the file number immediately. You can verify it directly with Service Canada.</p>
                          <p className="text-xs text-red-700 font-semibold mt-2 uppercase">Risk Level: CRITICAL</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Red Flag: No Job Bank Posting */}
                  {result.step2 === 'no_unsure' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">🔴</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-red-900 mb-1">System Alert: Mandatory Recruitment Step Not Completed</p>
                          <p className="text-sm text-red-800">It is <strong>legally impossible</strong> for an employer to submit an LMIA application without completing the mandatory 30-day Canadian recruitment advertising period on the Job Bank. If the ad doesn't exist or you can't find it, an application cannot legally be processed. Your employer may be lying about the status.</p>
                          <p className="text-xs text-red-700 font-semibold mt-2 uppercase">Risk Level: CRITICAL</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Caution Flag: Wage/Title Anomaly */}
                  {result.step3 === 'yes' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">⚠️</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-amber-900 mb-1">Salary Anomaly Alert</p>
                          <p className="text-sm text-amber-800">Service Canada <strong>cross-references local economic wage structures</strong> for your job and region. Artificially raising an entry-level wage to bypass low-wage restrictions is a primary trigger for strict officer scrutiny and often results in immediate refusal. Document the original offer letter and current position details.</p>
                          <p className="text-xs text-amber-700 font-semibold mt-2 uppercase">Risk Level: HIGH</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Green Result: All checks passed */}
                  {result.step1 === 'yes' && result.step2 === 'yes' && result.step3 === 'no' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">✅</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-green-900 mb-1">Positive Indicators Found</p>
                          <p className="text-sm text-green-800">Your employer has a valid file number, completed the Job Bank posting, and hasn't made suspicious wage changes. These are good signs, but remember: even legitimate applications can be denied. Keep copies of all documents and stay in touch with Service Canada directly for updates.</p>
                          <p className="text-xs text-green-700 font-semibold mt-2 uppercase">Status: Monitoring Recommended</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Resources */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Next Steps:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 flex-shrink-0">•</span>
                        <span>Verify directly with <a href="https://www.canada.ca/en/employment-social-development.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">Service Canada</a> — they can confirm if your application exists</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 flex-shrink-0">•</span>
                        <span>Request all official documents from your employer (Job Bank posting proof, LMIA file number, contract)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 flex-shrink-0">•</span>
                        <span>Consider consulting with an immigration lawyer if red flags appear</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 flex-shrink-0">•</span>
                        <span>Report suspicious activity to <a href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/report.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">ESDC</a></span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setCurrentStep('step1')
                        setResult({ step1: null, step2: null, step3: null })
                      }}
                      className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
                    >
                      Run Another Audit
                    </button>
                    <button
                      onClick={closeWizard}
                      className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
