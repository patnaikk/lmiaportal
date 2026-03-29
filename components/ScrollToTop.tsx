'use client'
import { useEffect } from 'react'

export default function ScrollToTop({ query }: { query: string }) {
  useEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [query])
  return null
}
