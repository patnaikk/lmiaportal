import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { verifyEmployer } from '@/lib/verify'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

// ─── helpers ────────────────────────────────────────────────────────────────

function label(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(text.toUpperCase(), x, y)
}

function value(doc: jsPDF, text: string, x: number, y: number, contentWidth: number): number {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  const lines = doc.splitTextToSize(text, contentWidth)
  doc.text(lines, x, y)
  return lines.length
}

function sectionHeading(doc: jsPDF, text: string, x: number, y: number, pageWidth: number, margin: number) {
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(107, 114, 128)
  doc.text(text.toUpperCase(), x, y)
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  const textWidth = doc.getTextWidth(text.toUpperCase()) + 3
  doc.line(x + textWidth, y - 1, pageWidth - margin, y - 1)
}

// ─── route ──────────────────────────────────────────────────────────────────

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
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 16
    const col = margin
    const contentWidth = pageWidth - 2 * margin
    let y = margin + 2

    // ── Brand header ──────────────────────────────────────────────────────
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text('LMIA Check', col, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Employment Verification Report  ·  lmiacheck.ca', col, y)
    y += 10

    // ── Employer block ────────────────────────────────────────────────────
    label(doc, 'Employer Verified', col, y)
    y += 4

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    const empLines = doc.splitTextToSize(employer, contentWidth)
    doc.text(empLines, col, y)
    y += empLines.length * 6.5

    if (city || province) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(`${city || ''}${city && province ? ', ' : ''}${province || ''}`, col, y)
      y += 5
    }
    y += 5

    // ── Risk badge ────────────────────────────────────────────────────────
    const COLORS: Record<string, [number, number, number]> = {
      GREEN:  [16, 185, 129],
      YELLOW: [245, 158, 11],
      RED:    [220, 38, 38],
      GREY:   [107, 114, 128],
    }
    const BADGE_LABELS: Record<string, string> = {
      GREEN:  'VERIFIED',
      YELLOW: 'VERIFY FURTHER',
      RED:    'HIGH RISK — BANNED',
      GREY:   'NOT FOUND IN RECORDS',
    }
    const STATUS_TEXT: Record<string, string> = {
      GREEN:  'This employer appears in official Canadian government LMIA records.',
      YELLOW: 'This employer requires further verification before you proceed.',
      RED:    'This employer is banned from hiring temporary foreign workers.',
      GREY:   'This employer does not appear in any official government records.',
    }

    const badgeRgb = COLORS[result.risk] ?? COLORS['GREY']
    const badgeLabel = BADGE_LABELS[result.risk] ?? 'UNKNOWN'

    doc.setFillColor(...badgeRgb)
    doc.rect(col, y, contentWidth, 14, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(badgeLabel, col + 5, y + 9.5)
    y += 18

    // Status one-liner
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    const statusLines = doc.splitTextToSize(STATUS_TEXT[result.risk] ?? '', contentWidth)
    doc.text(statusLines, col, y)
    y += statusLines.length * 5 + 7

    // ── Violator detail block ─────────────────────────────────────────────
    if (result.violatorMatches.length > 0) {
      const v = result.violatorMatches[0]

      sectionHeading(doc, 'Government Violation Record', col, y, pageWidth, margin)
      y += 6

      // Operating name + legal name
      const hasDistinctLegal =
        v.business_legal_name &&
        v.business_legal_name.toLowerCase().trim() !== v.business_operating_name?.toLowerCase().trim()

      label(doc, 'Matched Employer', col, y); y += 4
      const opLines = value(doc, v.business_operating_name, col, y, contentWidth)
      y += opLines * 5

      if (hasDistinctLegal) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(107, 114, 128)
        const legalLines = doc.splitTextToSize(`Legal name: ${v.business_legal_name}`, contentWidth)
        doc.text(legalLines, col, y)
        y += legalLines.length * 4.5
      }
      y += 3

      // Compliance status
      label(doc, 'Compliance Status', col, y); y += 4
      const statusLabel =
        v.compliance_status === 'INELIGIBLE_UNTIL'
          ? `INELIGIBLE UNTIL ${v.ineligible_until_date ? new Date(v.ineligible_until_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'date not specified'}`
          : v.compliance_status === 'ELIGIBLE'
          ? 'ELIGIBLE (previously penalised, now allowed to hire)'
          : 'INELIGIBLE — UNPAID PENALTY'

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeRgb)
      const statusLabelLines = doc.splitTextToSize(statusLabel, contentWidth)
      doc.text(statusLabelLines, col, y)
      y += statusLabelLines.length * 5 + 3

      // Decision date + penalty side by side (with proper spacing)
      if (v.decision_date || v.penalty_amount) {
        const col2 = col + 115 // Fixed column 2 position (enough space for first column)

        if (v.decision_date) {
          label(doc, 'Date of Government Decision', col, y)
        }
        if (v.penalty_amount) {
          label(doc, 'Monetary Penalty', col2, y)
        }
        y += 4

        if (v.decision_date) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(17, 24, 39)
          doc.text(
            new Date(v.decision_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
            col, y
          )
        }
        if (v.penalty_amount) {
          doc.setFontSize(13)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(17, 24, 39)
          doc.text(v.penalty_amount, col2, y)
          if (v.ban_duration) {
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(107, 114, 128)
            doc.text(`${v.ban_duration}`, col2 + 40, y)
          }
        }
        y += 8
      }

      // Violations list
      const codes = expandViolationReasons(v.reasons)
      if (codes.length > 0) {
        label(doc, `Violations Found (${codes.length})`, col, y); y += 5
        for (const code of codes) {
          const desc = VIOLATION_CODES[code] ?? `Violation code ${code}`
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(17, 24, 39)
          doc.text(`${code}.`, col, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(55, 65, 81)
          const descLines = doc.splitTextToSize(desc, contentWidth - 8)
          doc.text(descLines, col + 7, y)
          y += descLines.length * 4.5 + 1.5
        }
        y += 2
      }
    }

    // ── Positive LMIA detail block ────────────────────────────────────────
    if (result.positiveMatches.length > 0) {
      const p = result.positiveMatches[0]

      sectionHeading(doc, 'LMIA Record', col, y, pageWidth, margin)
      y += 6

      // Stream + occupation side by side (fixed columns)
      const col2 = col + 115

      label(doc, 'Program Stream', col, y)
      label(doc, 'Occupation', col2, y)
      y += 4
      const streamLines = value(doc, p.program_stream ?? '—', col, y, 105)
      const occLines = value(doc, p.occupation_title ?? '—', col2, y, contentWidth - 115)
      y += Math.max(streamLines, occLines) * 5 + 3

      // Approved LMIAs + positions + quarter
      label(doc, 'Approved LMIAs', col, y)
      label(doc, 'Approved Positions', col2, y)
      y += 4
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(String(p.approved_lmias ?? '—'), col, y)
      doc.text(String(p.approved_positions ?? '—'), col2, y)
      y += 7

      if (p.quarter) {
        label(doc, 'Data Quarter', col, y); y += 4
        value(doc, p.quarter, col, y, contentWidth)
        y += 6
      }
      y += 2
    }

    // ── What To Do Next ───────────────────────────────────────────────────
    sectionHeading(doc, 'What To Do Next', col, y, pageWidth, margin)
    y += 6

    const NEXT_STEPS: Record<string, string[]> = {
      GREEN: [
        'Request a copy of the LMIA approval letter from your employer.',
        'Use a licensed RCIC or immigration lawyer to process your work permit.',
        'Never pay recruitment fees — employers bear all costs under LMIA rules.',
      ],
      YELLOW: [
        result.reason === 'address_mismatch'
          ? 'Contact the employer using independently verified contact info and ask them to clarify the address in your offer.'
          : result.reason === 'pr_only_stream'
          ? 'Ask the employer to provide their LMIA approval letter confirming the correct stream for your position.'
          : 'Verify this employer independently before proceeding.',
        'Consult a licensed RCIC before signing any offer letter.',
      ],
      RED: [
        'Do not accept any job offer from this employer.',
        'If you have already paid fees, contact ESDC at 1-800-367-5693.',
        'Report this employer to ESDC: 1-800-367-5693.',
        'Contact a licensed RCIC or legal aid for free advice.',
      ],
      GREY: [
        'Independently verify this employer exists before proceeding.',
        'Check their website, business registration, and call their main line.',
        'If you paid fees, contact ESDC at 1-800-367-5693 immediately.',
      ],
    }

    const steps = NEXT_STEPS[result.risk] ?? []
    for (const step of steps) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeRgb)
      doc.text('—', col, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      const stepLines = doc.splitTextToSize(step, contentWidth - 6)
      doc.text(stepLines, col + 5, y)
      y += stepLines.length * 4.5 + 2
    }

    // ── Footer ────────────────────────────────────────────────────────────
    const checkDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(col, pageHeight - 20, pageWidth - margin, pageHeight - 20)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text(`Checked: ${checkDate}  ·  Source: Employment and Social Development Canada (ESDC)  ·  lmiacheck.ca`, col, pageHeight - 15)

    const disclaimer = 'Based on publicly available Government of Canada data. Not legal or immigration advice. Consult a licensed immigration consultant or lawyer before making any employment decisions.'
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth)
    doc.text(disclaimerLines, col, pageHeight - 11)

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
