import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { verifyEmployer } from '@/lib/verify'

// Hex to RGB conversion
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0]
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const searchParams = request.nextUrl.searchParams
    const employer = searchParams.get('employer')?.trim()
    const city = searchParams.get('city') || undefined
    const province = searchParams.get('province') || undefined

    if (!employer) {
      return NextResponse.json({ error: 'Employer name required' }, { status: 400 })
    }

    // Get verification result
    const result = await verifyEmployer(employer, city, province)

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Title (without emoji - jsPDF doesn't render emojis well)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('LMIA Check Result', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    // Divider line
    doc.setDrawColor(239, 68, 68)
    doc.setLineWidth(1)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // Employer Checked label
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('EMPLOYER CHECKED', margin, yPosition)
    yPosition += 5

    // Employer name
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const employerLines = doc.splitTextToSize(employer, contentWidth)
    doc.text(employerLines, margin, yPosition)
    yPosition += employerLines.length * 6 + 4

    // Location
    if (city || province) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      const location = `${city || ''}${city && province ? ', ' : ''}${province || ''}`
      const locationLines = doc.splitTextToSize(location, contentWidth)
      doc.text(locationLines, margin, yPosition)
      yPosition += locationLines.length * 4 + 4
    }

    yPosition += 3

    // Result badge with solid color background
    const riskColors: Record<string, string> = {
      GREEN: '#10b981',
      YELLOW: '#f59e0b',
      RED: '#ef4444',
      GREY: '#9ca3af',
    }

    const riskLabelsNoEmoji: Record<string, string> = {
      GREEN: 'VERIFIED',
      YELLOW: 'VERIFY FURTHER',
      RED: 'HIGH RISK',
      GREY: 'NOT FOUND',
    }

    const colorHex = riskColors[result.risk] || '#9ca3af'
    const label = riskLabelsNoEmoji[result.risk] || 'UNKNOWN'
    const [r, g, b] = hexToRgb(colorHex)

    // Draw badge background with solid color
    doc.setDrawColor(r, g, b)
    doc.setFillColor(r, g, b)
    doc.rect(margin, yPosition, contentWidth, 22, 'FD')

    // Draw badge text (white text on colored background)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(label, margin + 5, yPosition + 14)
    yPosition += 28

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Result Details section
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('WHAT THIS MEANS', margin, yPosition)
    yPosition += 6

    // Result details content
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)

    let statusText = ''
    let detailText = ''

    if (result.risk === 'GREEN') {
      statusText = 'This employer is verified in official Canadian government records.'
      detailText = 'You can proceed with confidence. Request a copy of their LMIA approval letter.'
    } else if (result.risk === 'YELLOW') {
      statusText = 'This employer needs further verification before you proceed.'
      if (result.reason === 'address_mismatch') {
        detailText = 'Location details do not match records. Contact the employer directly to clarify.'
      } else if (result.reason === 'pr_only_stream') {
        detailText = 'Their approved positions are for Permanent Residents only, not temporary workers.'
      } else {
        detailText = 'They were previously penalized but are currently eligible. Proceed with caution.'
      }
    } else if (result.risk === 'RED') {
      statusText = 'This employer is banned from hiring foreign workers.'
      if (result.subtype === 'BANNED_TEMPORARY' && result.ban_end_date) {
        detailText = `Ban until: ${new Date(result.ban_end_date).toLocaleDateString('en-CA')}. Do not accept an offer from this employer.`
      } else if (result.subtype === 'BANNED_TEMPORARY') {
        detailText = 'They cannot hire temporary foreign workers. Do not accept an offer from this employer.'
      } else {
        detailText = 'They have unpaid penalties. Do not accept an offer from this employer.'
      }
    } else {
      statusText = 'This employer does not appear in official government records.'
      detailText = 'Verify they exist independently before proceeding. Check their website, business registration, and call their main line.'
    }

    const statusLines = doc.splitTextToSize(statusText, contentWidth)
    doc.text(statusLines, margin, yPosition)
    yPosition += statusLines.length * 5 + 3

    const detailLines = doc.splitTextToSize(detailText, contentWidth)
    doc.setTextColor(107, 114, 128)
    doc.text(detailLines, margin, yPosition)
    yPosition += detailLines.length * 5 + 6

    // Check date & source
    const checkDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.text(`Checked on: ${checkDate}`, margin, yPosition)
    yPosition += 4
    doc.text('Source: Employment and Social Development Canada (ESDC)', margin, yPosition)
    yPosition += 6

    // Footer divider
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // Footer text
    doc.setFontSize(7)
    doc.setTextColor(107, 114, 128)
    const footerText =
      'This is an informational verification record from LMIA Check (lmiacheck.ca) based on publicly available Government of Canada data. It does not constitute legal or immigration advice. For help with visa applications, consult a licensed immigration consultant or lawyer.'
    const footerLines = doc.splitTextToSize(footerText, contentWidth - 2)
    doc.text(footerLines, margin + 1, yPosition)

    // Generate PDF and convert to Buffer
    const pdfBytes = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfBytes)

    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LMIA_${employer.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })

    return response
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
