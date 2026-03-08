'use client'

import { useState } from 'react'
import type { RiskResult } from '@/lib/types'

const SITE_URL = 'https://lmiacheck.ca'

const WHATSAPP_MSG = encodeURIComponent(
  `Use this free tool to verify a Canadian employer before you pay any fees: ${SITE_URL}`
)

const COPY_BY_RESULT: Record<RiskResult, string> = {
  GREEN: 'Did this give you peace of mind? Share it with someone who needs it.',
  YELLOW: 'Know someone checking a job offer? Share this free tool with them.',
  RED: 'Help protect others. Share this tool with foreign workers you know.',
  GREY: 'Know someone checking a job offer? Share this free tool with them.',
}

interface Props {
  riskResult: RiskResult
}

export default function ShareComponent({ riskResult }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SITE_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = SITE_URL
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`
    window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer')
  }

  const emailSubject = encodeURIComponent('Free tool to verify a Canadian job offer')
  const emailBody = encodeURIComponent(
    `I found this free tool that helps verify whether a Canadian employer has a legitimate LMIA before paying any recruitment fees.\nCheck it here: ${SITE_URL}`
  )

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-xl">
      <p className="text-sm font-medium text-gray-700 mb-1">Know someone who needs this?</p>
      <p className="text-xs text-gray-500 mb-3">{COPY_BY_RESULT[riskResult]}</p>

      {/* Mobile: 2x2 grid, Desktop: single row */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-colors min-h-[44px]"
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy link
            </>
          )}
        </button>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-colors min-h-[44px]"
          aria-label="Share on WhatsApp"
        >
          {/* WhatsApp icon — green icon only, not button background */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.508 5.82L.057 23.569a.5.5 0 00.611.611l5.749-1.451A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.951 0-3.77-.524-5.33-1.432l-.383-.228-3.97 1.001 1.001-3.97-.228-.383A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          WhatsApp
        </a>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-colors min-h-[44px]"
          aria-label="Share on Facebook"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        {/* Email */}
        <a
          href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-colors min-h-[44px]"
          aria-label="Share via email"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Email
        </a>
      </div>
    </div>
  )
}
