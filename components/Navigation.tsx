'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavigationProps {
  // Optional override. When omitted (recommended), the active item is derived
  // from the current URL so it's always correct without per-page wiring.
  currentPage?: 'home' | 'check' | 'bulk' | 'guide' | 'faq' | 'about' | 'updates' | 'reports' | 'reference'
}

const NAV_LINKS = [
  { href: '/bulk', label: 'Bulk Check', page: 'bulk', desktop: true },
  { href: '/guide', label: 'Guide', page: 'guide', desktop: true },
  { href: '/faq', label: 'FAQ', page: 'faq', desktop: true },
  { href: '/reports', label: 'Reports', page: 'reports', desktop: true },
  { href: '/reference', label: 'Reference', page: 'reference', desktop: true },
  { href: '/about', label: 'About', page: 'about', desktop: false },
  { href: '/updates', label: "What's new", page: 'updates', desktop: false },
] as const

export default function Navigation(_props: NavigationProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // URL is authoritative so the active item is always correct, regardless of any
  // per-page prop. Matches the exact path and sub-routes (e.g. /reports/2026-05).
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 text-lg font-bold text-gray-900 tracking-tight hover:text-gray-600 transition-colors whitespace-nowrap"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/canada-flag.svg" alt="Canada flag" width="28" height="14" style={{ display: 'block' }} />
          LMIA Check
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/check"
            className="text-sm text-white bg-gray-900 hover:bg-gray-700 font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
          >
            Verify offer
          </Link>
          {NAV_LINKS.filter(({ desktop }) => desktop).map(({ href, label }) => {
            const displayLabel = label === 'Bulk Check' ? 'Bulk' : label
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`text-sm font-medium transition-colors relative whitespace-nowrap ${
                  active
                    ? 'text-gray-900 after:absolute after:-bottom-[17px] after:left-0 after:right-0 after:h-[2px] after:bg-gray-900 after:rounded-full'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {displayLabel}
              </Link>
            )
          })}
        </nav>

        {/* Mobile: CTA + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/check"
            className="text-sm text-white bg-gray-900 hover:bg-gray-700 font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
            onClick={() => setOpen(false)}
          >
            Verify offer
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`py-2.5 text-[15px] font-medium transition-colors ${
                  active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
