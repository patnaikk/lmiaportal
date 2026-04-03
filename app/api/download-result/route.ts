import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { verifyEmployer } from '@/lib/verify'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function divider(doc: jsPDF, y: number, margin: number, pageWidth: number) {
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
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

    const result = await verifyEmployer(employer, city, province)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const PW = doc.internal.pageSize.getWidth()
    const PH = doc.internal.pageSize.getHeight()
    const M = 20
    const CW = PW - 2 * M

    const COLORS: Record<string, [number, number, number]> = {
      GREEN:  [16, 185, 129],
      YELLOW: [202, 130, 10],
      RED:    [190, 30, 30],
      GREY:   [100, 100, 100],
    }
    const badgeColor = COLORS[result.risk] || COLORS.GREY

    let y = M

    // ─────────────────────────────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────────────────────────────

    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 15, 15)
    doc.text('LMIA Check', M, y)
    y += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(130, 130, 130)
    doc.text('Employment Verification Report  ·  lmiacheck.ca', M, y)
    y += 5

    // Red accent line
    doc.setDrawColor(...badgeColor)
    doc.setLineWidth(1)
    doc.line(M, y, M + 30, y)
    y += 14

    // ─────────────────────────────────────────────────────────────────
    // EMPLOYER
    // ─────────────────────────────────────────────────────────────────

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text('EMPLOYER', M, y)
    y += 6

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 15, 15)
    const empLines = doc.splitTextToSize(employer, CW)
    doc.text(empLines, M, y)
    y += empLines.length * 7

    if (city || province) {
      y += 2
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text(`${city || ''}${city && province ? ', ' : ''}${province || ''}`, M, y)
      y += 6
    }

    y += 10

    // ─────────────────────────────────────────────────────────────────
    // RISK BADGE
    // ─────────────────────────────────────────────────────────────────

    const LABELS: Record<string, string> = {
      GREEN:  'VERIFIED',
      YELLOW: 'VERIFY FURTHER',
      RED:    'HIGH RISK — BANNED',
      GREY:   'NOT FOUND',
    }

    doc.setFillColor(...badgeColor)
    doc.rect(M, y, CW, 14, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(LABELS[result.risk] || 'UNKNOWN', M + 6, y + 9)
    y += 20

    // Status summary
    const STATUS: Record<string, string> = {
      GREEN:  'This employer is verified in official Canadian government LMIA records.',
      YELLOW: 'This employer requires further verification before proceeding.',
      RED:    'This employer is banned from hiring temporary foreign workers.',
      GREY:   'This employer does not appear in official government records.',
    }
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const statusLines = doc.splitTextToSize(STATUS[result.risk] || '', CW)
    doc.text(statusLines, M, y)
    y += statusLines.length * 5 + 10

    // ─────────────────────────────────────────────────────────────────
    // VIOLATION RECORD
    // ─────────────────────────────────────────────────────────────────

    if (result.violatorMatches.length > 0) {
      const v = result.violatorMatches[0]

      divider(doc, y, M, PW)
      y += 7

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(120, 120, 120)
      doc.text('GOVERNMENT VIOLATION RECORD', M, y)
      y += 9

      // Operating name
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('OPERATING NAME', M, y)
      y += 4

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 15, 15)
      const opLines = doc.splitTextToSize(v.business_operating_name, CW)
      doc.text(opLines, M, y)
      y += opLines.length * 5.5 + 4

      // Legal name (if different)
      if (
        v.business_legal_name &&
        v.business_legal_name.toLowerCase().trim() !== v.business_operating_name?.toLowerCase().trim()
      ) {
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text('LEGAL NAME', M, y)
        y += 4

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80, 80, 80)
        const legalLines = doc.splitTextToSize(v.business_legal_name, CW)
        doc.text(legalLines, M, y)
        y += legalLines.length * 5 + 4
      }

      // Compliance status
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('COMPLIANCE STATUS', M, y)
      y += 4

      const statusLabel = v.compliance_status === 'INELIGIBLE_UNTIL'
        ? `INELIGIBLE UNTIL ${v.ineligible_until_date ? fmtDate(v.ineligible_until_date) : ''}`
        : v.compliance_status === 'ELIGIBLE'
        ? 'ELIGIBLE (PREVIOUSLY PENALISED)'
        : 'INELIGIBLE — UNPAID PENALTY'

      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeColor)
      doc.text(statusLabel, M, y)
      y += 8

      // Decision date
      if (v.decision_date) {
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text('DATE OF GOVERNMENT DECISION', M, y)
        y += 4

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 15, 15)
        doc.text(fmtDate(v.decision_date), M, y)
        y += 8
      }

      // Monetary penalty
      if (v.penalty_amount) {
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text('MONETARY PENALTY', M, y)
        y += 4

        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 15, 15)
        const penaltyText = v.ban_duration
          ? `${v.penalty_amount}  +  ${v.ban_duration}`
          : v.penalty_amount
        doc.text(penaltyText, M, y)
        y += 8
      }

      // Violations list
      const codes = expandViolationReasons(v.reasons)
      if (codes.length > 0) {
        y += 2
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text(`VIOLATIONS FOUND (${codes.length})`, M, y)
        y += 5

        for (const code of codes) {
          const desc = VIOLATION_CODES[code] || `Code ${code}`
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(15, 15, 15)
          doc.text(`${code}.`, M, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(55, 55, 55)
          const descLines = doc.splitTextToSize(desc, CW - 7)
          doc.text(descLines, M + 7, y)
          y += descLines.length * 4.5 + 1.5
        }
      }

      y += 4
    }

    // ─────────────────────────────────────────────────────────────────
    // LMIA RECORD (GREEN)
    // ─────────────────────────────────────────────────────────────────

    if (result.positiveMatches.length > 0) {
      const p = result.positiveMatches[0]

      divider(doc, y, M, PW)
      y += 7

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(120, 120, 120)
      doc.text('LMIA RECORD', M, y)
      y += 9

      const fields: [string, string][] = [
        ['PROGRAM STREAM', p.program_stream || '—'],
        ['OCCUPATION', p.occupation_title || '—'],
        ['APPROVED LMIAs', String(p.approved_lmias ?? '—')],
        ['APPROVED POSITIONS', String(p.approved_positions ?? '—')],
      ]
      if (p.quarter) fields.push(['DATA QUARTER', p.quarter])

      for (const [lbl, val] of fields) {
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text(lbl, M, y)
        y += 4

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 15, 15)
        const vLines = doc.splitTextToSize(val, CW)
        doc.text(vLines, M, y)
        y += vLines.length * 5 + 5
      }

      y += 2
    }

    // ─────────────────────────────────────────────────────────────────
    // WHAT TO DO NEXT
    // ─────────────────────────────────────────────────────────────────

    divider(doc, y, M, PW)
    y += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(120, 120, 120)
    doc.text('WHAT TO DO NEXT', M, y)
    y += 9

    const STEPS: Record<string, string[]> = {
      GREEN: [
        'Request a copy of the LMIA approval letter from your employer before signing anything.',
        'Use a licensed RCIC or immigration lawyer to process your work permit application.',
        'Never pay recruitment fees — by law, employers pay all LMIA costs.',
      ],
      YELLOW: [
        'Contact the employer directly using independently verified contact information.',
        'Ask them to clarify any discrepancies with your offer before signing.',
        'Consult a licensed RCIC before proceeding.',
      ],
      RED: [
        'Do not accept any job offer from this employer.',
        'If you already paid fees, contact ESDC immediately: 1-800-367-5693.',
        'Report this employer to ESDC: 1-800-367-5693.',
        'Contact a licensed RCIC or legal aid for free advice.',
      ],
      GREY: [
        'Independently verify this employer exists before proceeding.',
        'Check their website, business registration, and call their main number.',
        'If you paid fees, contact ESDC immediately: 1-800-367-5693.',
      ],
    }

    for (const step of STEPS[result.risk] || []) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeColor)
      doc.text('—', M, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)
      const stepLines = doc.splitTextToSize(step, CW - 5)
      doc.text(stepLines, M + 4, y)
      y += stepLines.length * 5 + 1.5
    }

    // ─────────────────────────────────────────────────────────────────
    // FOOTER
    // ─────────────────────────────────────────────────────────────────

    const checkDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    divider(doc, PH - 16, M, PW)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text(`Verified on ${checkDate}  ·  Source: ESDC (Employment and Social Development Canada)  ·  lmiacheck.ca`, M, PH - 11)

    const disclaimer = 'Based on publicly available Government of Canada data. Not legal or immigration advice. Consult a licensed immigration consultant or lawyer before making employment decisions.'
    const dlLines = doc.splitTextToSize(disclaimer, CW)
    doc.text(dlLines, M, PH - 7)

    const pdfBytes = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfBytes)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LMIA_${employer.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
