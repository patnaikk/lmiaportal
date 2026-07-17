import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'LMIA Check — Verify if a Canadian Job Offer is Real'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div style={{ fontSize: '44px', fontWeight: 700, color: 'white' }}>LMIA Check</div>
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '28px',
          }}
        >
          Got a Canadian job offer?
        </div>
        <div style={{ fontSize: '40px', color: '#94a3b8', marginBottom: '48px' }}>
          Check the employer against official government records — free.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: '#052e16',
              color: '#4ade80',
              fontSize: '26px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '999px', background: '#4ade80' }} />
            Verified
          </div>
          <div
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: '#450a0a',
              color: '#f87171',
              fontSize: '26px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '999px', background: '#f87171' }} />
            Banned
          </div>
          <div
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: '#1e293b',
              color: '#cbd5e1',
              fontSize: '26px',
              fontWeight: 600,
            }}
          >
            lmiacheck.ca
          </div>
        </div>
      </div>
    ),
    size
  )
}
