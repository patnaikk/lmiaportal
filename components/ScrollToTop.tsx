'use client'
import { useLayoutEffect } from 'react'

export default function ScrollToTop({ query }: { query: string }) {
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [query])
  return null
}
