// Lightweight GA4 event helper. Safe to call anywhere on the client;
// no-ops on the server or if gtag hasn't loaded.

type GtagParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: GtagParams) => void
  }
}

export function track(event: string, params?: GtagParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  try {
    window.gtag('event', event, params)
  } catch {
    /* analytics must never break the UI */
  }
}
