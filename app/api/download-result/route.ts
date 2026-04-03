import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { verifyEmployer } from '@/lib/verify'

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

    // Create PDF and stream to buffer
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('🍁 LMIA Check Result', { align: 'center' })
    doc.moveDown(0.3)

    // Employer name
    doc.fontSize(11).font('Helvetica').text('Employer Checked:', { underline: true })
    doc.fontSize(14).font('Helvetica-Bold').text(employer, { align: 'left' })
    doc.moveDown(0.5)

    // Location
    if (city || province) {
      doc.fontSize(10).font('Helvetica').fillColor('#666666').text(
        `Location: ${city || '—'}${city && province ? ', ' : ''}${province || ''}`
      )
      doc.moveDown(0.3)
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

    const color = riskColors[result.risk] || '#9ca3af'
    const label = riskLabels[result.risk] || 'UNKNOWN'

    doc.rect(40, doc.y, 515, 50).fill(color).opacity(0.1)
    doc.fillColor(color).fontSize(16).font('Helvetica-Bold').text(label, 50, doc.y + 15, {
      width: 495,
    })
    doc.moveDown(2)
    doc.fillColor('#000000')

    // Result details
    doc.fontSize(11).font('Helvetica-Bold').text('Result Details:', {
      underline: true,
    })
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#000000')

    if (result.risk === 'GREEN') {
      doc.text('Status: Legitimate employer')
      doc.fillColor('#666666').text('This employer appears in official Canadian government LMIA records.')
      doc.fillColor('#000000')
    } else if (result.risk === 'YELLOW') {
      doc.text('Status: Verify further')
      if (result.reason === 'address_mismatch') {
        doc.fillColor('#666666').text('Location details do not match your job offer. Ask your employer to clarify.')
      } else if (result.reason === 'pr_only_stream') {
        doc.fillColor('#666666').text('All approved positions are Permanent Resident Only, not for temporary workers.')
      } else {
        doc.fillColor('#666666').text('Previously penalised but currently eligible to hire. Proceed with caution.')
      }
      doc.fillColor('#000000')
    } else if (result.risk === 'RED') {
      doc.text('Status: High risk / Banned')
      if (result.subtype === 'BANNED_TEMPORARY' && result.ban_end_date) {
        doc.fillColor('#666666').text(
          `Banned from hiring until: ${new Date(result.ban_end_date).toLocaleDateString('en-CA')}`
        )
      } else if (result.subtype === 'BANNED_TEMPORARY') {
        doc.fillColor('#666666').text('Currently banned from hiring temporary foreign workers.')
      } else {
        doc.fillColor('#666666').text('Has outstanding unpaid penalties. Cannot hire temporary foreign workers.')
      }
      doc.fillColor('#000000')
    } else {
      doc.text('Status: Not found in government records')
      doc.fillColor('#666666').text('This employer does not appear in any official LMIA records.')
      doc.fillColor('#000000')
    }

    doc.moveDown(0.5)

    // Check date & source
    const checkDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.fontSize(9).font('Helvetica').fillColor('#9ca3af').text(`Checked on: ${checkDate}`)
    doc.text('Source: ESDC (Employment and Social Development Canada)')
    doc.fillColor('#000000')

    doc.moveDown(1)

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#e5e7eb').text('─'.repeat(80))
    doc.moveDown(0.3)
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'This document is a verification record from LMIA Check (lmiacheck.ca). It is based on publicly available Government of Canada data and is provided for informational purposes only. It does not constitute legal or immigration advice.',
        { align: 'left', width: 495 }
      )

    doc.end()

    return new Promise<Response>((resolve, reject) => {
      doc.on('finish', () => {
        const pdfBuffer = Buffer.concat(chunks)
        const response = new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="LMIA_${employer.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
          },
        })
        resolve(response)
      })
      doc.on('error', reject)
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
