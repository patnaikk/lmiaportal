import QRCode from 'qrcode'

interface Props {
  employer: string
  city?: string
  province?: string
}

const SITE_URL = 'https://lmiacheck.ca'

export default async function ResultQRCode({ employer, city, province }: Props) {
  const params = new URLSearchParams({ employer })
  if (city) params.set('city', city)
  if (province) params.set('province', province)
  const resultUrl = `${SITE_URL}/results?${params.toString()}`

  let svgString = ''
  try {
    svgString = await QRCode.toString(resultUrl, {
      type: 'svg',
      margin: 1,
      width: 120,
      color: { dark: '#111827', light: '#ffffff' },
    })
  } catch {
    return null
  }

  return (
    <div className="mt-4 p-5 bg-white rounded-2xl shadow-lg shadow-gray-200/80">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Share this result</p>
      <p className="text-sm text-gray-500 mb-4">
        Scan or screenshot this QR code to send the result directly to anyone via WhatsApp or chat.
      </p>
      <div className="flex items-center gap-5">
        <div
          className="w-[88px] h-[88px] flex-shrink-0 rounded-xl overflow-hidden bg-white"
          dangerouslySetInnerHTML={{ __html: svgString }}
          aria-label="QR code linking to this result"
        />
        <div className="text-xs text-gray-400 leading-relaxed space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 mb-2">How to use</p>
          <p>1. Screenshot this page</p>
          <p>2. Send via WhatsApp to a family member</p>
          <p>3. They scan the QR to see the same result</p>
        </div>
      </div>
    </div>
  )
}
