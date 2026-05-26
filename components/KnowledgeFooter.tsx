'use client'

import { useState } from 'react'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

const accordionItems: AccordionItem[] = [
  {
    id: 'what-is-fraud',
    title: 'What is LMIA fraud?',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          LMIA (Labour Market Impact Assessment) fraud happens when scammers impersonate legitimate Canadian employers to trick foreign workers into paying illegal recruitment fees.
        </p>
        <p>
          The Canadian government <strong>never charges workers for LMIAs</strong>. If someone is asking you to pay an upfront fee for an LMIA, visa, or job offer — that's always fraud.
        </p>
        <p>
          Scammers use fake job offers, fake LMIA numbers, and fake company documents to build false credibility. They may:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Create fake company websites that look like real employers</li>
          <li>Use real company names but fake email addresses (gmail.com, yahoo.com)</li>
          <li>Provide fake LMIA approval numbers that don't exist in official records</li>
          <li>Claim your application is "approved" if you pay a fee</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'spot-fake-offers',
    title: 'How to spot a fake Canadian job offer',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          Real Canadian employers communicate professionally and never ask for upfront payment. Here's what legitimate LMIA job offers look like:
        </p>
        <div className="bg-green-50 rounded-xl p-4 space-y-2 text-xs">
          <p className="font-semibold text-green-900">✓ Real offer characteristics:</p>
          <ul className="space-y-1 text-green-800">
            <li>• Official company email address (not gmail, yahoo, or free email)</li>
            <li>• Clear job details: title, location, wage, start date</li>
            <li>• References to official ESDC or provincial government processes</li>
            <li>• <strong>Never asks for money upfront</strong></li>
            <li>• Can verify the employer exists at lmiacheck.ca</li>
            <li>• Professional language and formatting (no typos/grammar errors)</li>
          </ul>
        </div>
        <div className="bg-red-50 rounded-xl p-4 space-y-2 text-xs">
          <p className="font-semibold text-red-900">✗ Major red flags:</p>
          <ul className="space-y-1 text-red-800">
            <li>• Asks for any upfront payment (the biggest warning sign)</li>
            <li>• Uses free email (gmail, yahoo, hotmail)</li>
            <li>• Employer name doesn't match lmiacheck.ca records</li>
            <li>• Vague job details or unrealistically high wages</li>
            <li>• Poorly written with spelling/grammar errors</li>
            <li>• Urgency: "approve within 24 hours" or "pay now or lose offer"</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'red-flags-checklist',
    title: 'Common red flags — checklist',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p className="font-semibold text-gray-900">Before paying anything, ask yourself:</p>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">They asked me for money upfront</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Critical risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">The company email is not official</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Critical risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">The employer is banned or not found on LMIA Check</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Critical risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">They provided a fake LMIA number (doesn't match records)</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Critical risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">The offer has spelling or grammar mistakes</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">High risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">They're pressuring me to decide quickly</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">High risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">The salary is much higher than the market rate</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">High risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">They want me to prepay for visa/work permit fees</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">High risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">I found them on an unfamiliar job board or WhatsApp</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Medium risk</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">They don't provide detailed job information</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Medium risk</span>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          <strong>Rule of thumb:</strong> If you see even one "Critical" flag, stop communicating. Do not send money.
        </p>
      </div>
    ),
  },
  {
    id: 'why-banned',
    title: 'Why are employers banned?',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          Canadian employers are banned from hiring Temporary Foreign Workers (TFW) when they violate federal Temporary Foreign Worker Program rules. Common violations include:
        </p>
        <div className="space-y-2.5">
          {[
            { violation: 'Underpayment', desc: 'Paying less than the prevailing wage for the role' },
            { violation: 'Unsafe working conditions', desc: 'Failing to provide safe equipment or working environment' },
            { violation: 'Wage deductions', desc: 'Illegally withholding or deducting wages' },
            { violation: 'Recruiting fraud', desc: 'Misrepresenting job terms or conditions' },
            { violation: 'Document falsification', desc: 'Submitting false records to ESDC' },
            { violation: 'Discrimination', desc: 'Discriminating based on protected grounds' },
            { violation: 'Unpaid wages or fees', desc: 'Not paying workers or charging illegal recruitment fees' },
            { violation: 'Non-compliance with rules', desc: 'General failure to follow TFW program requirements' },
          ].map((item, idx) => (
            <div key={idx} className="border-l-2 border-red-200 pl-3.5">
              <p className="font-semibold text-gray-900">{item.violation}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Use LMIA Check to verify an employer is not on Canada's official non-compliant list before accepting any job offer.
        </p>
      </div>
    ),
  },
  {
    id: 'report-fraud',
    title: 'Where to report fraud or get help',
    content: (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          If you believe you've encountered LMIA fraud, worker exploitation, or an unsafe work situation, here's where to report:
        </p>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-3.5 hover:bg-blue-50 transition-colors">
            <p className="font-semibold text-gray-900">Employment and Social Development Canada (ESDC)</p>
            <p className="text-xs text-gray-500 mt-1">Report non-compliant employers, recruitment fraud, or wage violations</p>
            <a
              href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/report.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Report to ESDC →
            </a>
          </div>

          <div className="border border-gray-200 rounded-lg p-3.5 hover:bg-blue-50 transition-colors">
            <p className="font-semibold text-gray-900">Service Canada (Labour Standards)</p>
            <p className="text-xs text-gray-500 mt-1">Report wage violations, unsafe conditions, or unpaid wages</p>
            <a
              href="https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/contact.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Service Canada →
            </a>
          </div>

          <div className="border border-gray-200 rounded-lg p-3.5 hover:bg-blue-50 transition-colors">
            <p className="font-semibold text-gray-900">Local Labour Inspection Office</p>
            <p className="text-xs text-gray-500 mt-1">Report workplace violations to your provincial/territorial labour board</p>
            <a
              href="https://www.canada.ca/en/services/jobs/workplace.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Find your labour office →
            </a>
          </div>

          <div className="border border-gray-200 rounded-lg p-3.5 hover:bg-blue-50 transition-colors">
            <p className="font-semibold text-gray-900">Police or RCMP (Fraud)</p>
            <p className="text-xs text-gray-500 mt-1">Report criminal fraud or scams to local law enforcement</p>
            <p className="inline-block mt-2 text-xs text-gray-700 font-medium">Call 911 or your local police non-emergency line</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-3.5 hover:bg-blue-50 transition-colors">
            <p className="font-semibold text-gray-900">Immigration Refugees and Citizenship Canada (IRCC)</p>
            <p className="text-xs text-gray-500 mt-1">Report issues related to work permits or immigration fraud</p>
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/report-fraud.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Report fraud to IRCC →
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          <strong>Need immediate help?</strong> If you're in danger, call 911. If you're being exploited, reach out to local labour authorities or call the RCMP non-emergency line.
        </p>
      </div>
    ),
  },
]

export default function KnowledgeFooter() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10 border-t border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Knowledge & Prevention
        </h2>
        <p className="text-sm text-gray-600">
          Everything you need to know about LMIA fraud, red flags, and how to protect yourself.
        </p>
      </div>

      <div className="space-y-3">
        {accordionItems.map((item) => (
          <details
            key={item.id}
            onToggle={(e) => setOpenId(e.currentTarget.open ? item.id : null)}
            className="group border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
          >
            <summary className="cursor-pointer px-5 py-4 hover:bg-gray-50 flex items-center justify-between transition-colors select-none">
              <h3 className="text-sm font-semibold text-gray-900 group-open:text-gray-700">
                {item.title}
              </h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 text-gray-700 animate-in fade-in duration-200">
              {item.content}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Remember: Canada never charges workers for LMIA.</p>
            <p className="text-xs text-blue-800">If anyone asks for upfront payment for a job offer, visa, or LMIA number, that's always a scam. Report it to ESDC and your local authorities.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
