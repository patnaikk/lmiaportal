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
    <div className="mt-6 p-4 border border-gray-200 rounded-xl">
      <p className="text-sm font-medium text-gray-700 mb-1">Share this result</p>
      <p className="text-xs text-gray-500 mb-3">
        Scan or screenshot this QR code to send the result directly to anyone via WhatsApp or chat.
      </p>
      <div className="flex items-center gap-4">
        <div
          className="w-[96px] h-[96px] flex-shrink-0 rounded-lg overflow-hidden border border-gray-100"
          dangerouslySetInnerHTML={{ __html: svgString }}
          aria-label="QR code linking to this result"
        />
        <div className="text-xs text-gray-400 leading-relaxed">
          <p className="font-medium text-gray-600 mb-1">How to use:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Screenshot this page</li>
            <li>Send via WhatsApp to a family member or friend</li>
            <li>They scan the QR to see the same result</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
