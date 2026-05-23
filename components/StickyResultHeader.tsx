'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Risk = 'GREEN' | 'YELLOW' | 'RED' | 'GREY'

interface Props {
  risk: Risk
  verdict: string
  employer: string
}

const COLORS: Record<Risk, { dot: string; text: string }> = {
  GREEN: { dot: 'bg-green-500', text: 'text-green-700' },
  YELLOW: { dot: 'bg-amber-400', text: 'text-amber-700' },
  RED: { dot: 'bg-red-500', text: 'text-red-700' },
  GREY: { dot: 'bg-gray-400', text: 'text-gray-600' },
}

export default function StickyResultHeader({ risk, verdict, employer }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const colors = COLORS[risk]

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      aria-hidden={!show}
    >
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
        <Link href="/" className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back to search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} aria-hidden="true" />
        <span className={`text-sm font-semibold flex-shrink-0 ${colors.text}`}>{verdict}</span>
        <span className="text-gray-300 flex-shrink-0">·</span>
        <span className="text-sm text-gray-700 truncate flex-1 font-medium">{employer}</span>
      </div>
    </div>
  )
}
