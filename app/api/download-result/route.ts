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

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('🍁 LMIA Check Result', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    // Employer Checked label
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Employer Checked:', margin, yPosition)
    yPosition += 6

    // Employer name
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(employer, margin, yPosition)
    yPosition += 10

    // Location
    if (city || province) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(102, 102, 102)
      const location = `Location: ${city || '—'}${city && province ? ', ' : ''}${province || ''}`
      doc.text(location, margin, yPosition)
      yPosition += 8
      doc.setTextColor(0, 0, 0)
    }

    // Result badge
    const riskColors: Record<string, string> = {
      GREEN: '#10b981',
      YELLOW: '#f59e0b',
      RED: '#ef4444',
      GREY: '#9ca3af',
    }

    const riskLabels: Record<string, string> = {
      GREEN: '✅ VERIFIED',
      YELLOW: '⚠️ VERIFY FURTHER',
      RED: '🚫 HIGH RISK',
      GREY: '❓ NOT FOUND',
    }

    const colorHex = riskColors[result.risk] || '#9ca3af'
    const label = riskLabels[result.risk] || 'UNKNOWN'
    const [r, g, b] = hexToRgb(colorHex)

    // Draw badge background (light fill using lighter shade)
    const lightR = Math.min(255, r + 191) // Add white to lighten
    const lightG = Math.min(255, g + 191)
    const lightB = Math.min(255, b + 191)
    doc.setDrawColor(r, g, b)
    doc.setFillColor(lightR, lightG, lightB)
    doc.rect(margin, yPosition, contentWidth, 18, 'FD')

    // Draw badge text
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(r, g, b)
    doc.text(label, margin + 3, yPosition + 12)
    yPosition += 25

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Result Details heading
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Result Details:', margin, yPosition)
    yPosition += 7

    // Result details content
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    if (result.risk === 'GREEN') {
      doc.text('Status: Legitimate employer', margin, yPosition)
      yPosition += 6
      doc.setTextColor(102, 102, 102)
      const detailText = doc.splitTextToSize(
        'This employer appears in official Canadian government LMIA records.',
        contentWidth
      )
      doc.text(detailText, margin, yPosition)
      yPosition += detailText.length * 5
      doc.setTextColor(0, 0, 0)
    } else if (result.risk === 'YELLOW') {
      doc.text('Status: Verify further', margin, yPosition)
      yPosition += 6
      doc.setTextColor(102, 102, 102)
      let detailContent = ''
      if (result.reason === 'address_mismatch') {
        detailContent = 'Location details do not match your job offer. Ask your employer to clarify.'
      } else if (result.reason === 'pr_only_stream') {
        detailContent = 'All approved positions are Permanent Resident Only, not for temporary workers.'
      } else {
        detailContent = 'Previously penalised but currently eligible to hire. Proceed with caution.'
      }
      const detailText = doc.splitTextToSize(detailContent, contentWidth)
      doc.text(detailText, margin, yPosition)
      yPosition += detailText.length * 5
      doc.setTextColor(0, 0, 0)
    } else if (result.risk === 'RED') {
      doc.text('Status: High risk / Banned', margin, yPosition)
      yPosition += 6
      doc.setTextColor(102, 102, 102)
      let detailContent = ''
      if (result.subtype === 'BANNED_TEMPORARY' && result.ban_end_date) {
        detailContent = `Banned from hiring until: ${new Date(result.ban_end_date).toLocaleDateString('en-CA')}`
      } else if (result.subtype === 'BANNED_TEMPORARY') {
        detailContent = 'Currently banned from hiring temporary foreign workers.'
      } else {
        detailContent = 'Has outstanding unpaid penalties. Cannot hire temporary foreign workers.'
      }
      const detailText = doc.splitTextToSize(detailContent, contentWidth)
      doc.text(detailText, margin, yPosition)
      yPosition += detailText.length * 5
      doc.setTextColor(0, 0, 0)
    } else {
      doc.text('Status: Not found in government records', margin, yPosition)
      yPosition += 6
      doc.setTextColor(102, 102, 102)
      const detailText = doc.splitTextToSize(
        'This employer does not appear in any official LMIA records.',
        contentWidth
      )
      doc.text(detailText, margin, yPosition)
      yPosition += detailText.length * 5
      doc.setTextColor(0, 0, 0)
    }

    yPosition += 8

    // Check date & source
    const checkDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.setFontSize(9)
    doc.setTextColor(156, 163, 175)
    doc.text(`Checked on: ${checkDate}`, margin, yPosition)
    yPosition += 5
    doc.text('Source: ESDC (Employment and Social Development Canada)', margin, yPosition)
    yPosition += 8

    // Footer line
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // Footer text
    doc.setFontSize(8)
    doc.setTextColor(102, 102, 102)
    const footerText =
      'This document is a verification record from LMIA Check (lmiacheck.ca). It is based on publicly available Government of Canada data and is provided for informational purposes only. It does not constitute legal or immigration advice.'
    const footerLines = doc.splitTextToSize(footerText, contentWidth)
    doc.text(footerLines, margin, yPosition)

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
