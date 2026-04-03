import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { verifyEmployer } from '@/lib/verify'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

// ─── helpers ────────────────────────────────────────────────────────────────

function fieldLabel(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(text.toUpperCase(), x, y)
}

function fieldValue(doc: jsPDF, text: string, x: number, y: number, contentWidth: number): number {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  const lines = doc.splitTextToSize(text, contentWidth)
  doc.text(lines, x, y)
  return lines.length
}

function sectionTitle(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(107, 114, 128)
  doc.text(text.toUpperCase(), x, y)
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
    const margin = 14
    const col = margin
    const colW = pageWidth - 2 * margin
    let y = margin

    const COLORS: Record<string, [number, number, number]> = {
      GREEN:  [16, 185, 129],
      YELLOW: [245, 158, 11],
      RED:    [220, 38, 38],
      GREY:   [107, 114, 128],
    }
    const badgeRgb = COLORS[result.risk] ?? COLORS['GREY']

    // ── Header ─────────────────────────────────────────────────────────────
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text('LMIA Check', col, y)
    y += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Employment Verification Report · lmiacheck.ca', col, y)
    y += 8

    // ── Employer Name ──────────────────────────────────────────────────────
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('EMPLOYER', col, y)
    y += 4

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    const empLines = doc.splitTextToSize(employer, colW)
    doc.text(empLines, col, y)
    y += empLines.length * 6 + 2

    if (city || province) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(`${city || ''}${city && province ? ', ' : ''}${province || ''}`, col, y)
      y += 5
    }
    y += 4

    // ── Risk Badge ─────────────────────────────────────────────────────────
    const BADGE: Record<string, string> = {
      GREEN:  'VERIFIED',
      YELLOW: 'VERIFY FURTHER',
      RED:    'HIGH RISK — BANNED',
      GREY:   'NOT FOUND',
    }
    doc.setFillColor(...badgeRgb)
    doc.rect(col, y, colW, 13, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(BADGE[result.risk] ?? 'UNKNOWN', col + 5, y + 8.5)
    y += 18

    // ── Status text ────────────────────────────────────────────────────────
    const STATUS: Record<string, string> = {
      GREEN:  'This employer is verified in official Canadian government records.',
      YELLOW: 'This employer requires further verification.',
      RED:    'This employer is banned from hiring temporary foreign workers.',
      GREY:   'This employer does not appear in official government records.',
    }
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    const statusLines = doc.splitTextToSize(STATUS[result.risk] ?? '', colW)
    doc.text(statusLines, col, y)
    y += statusLines.length * 4.5 + 5

    // ── Violation Record ───────────────────────────────────────────────────
    if (result.violatorMatches.length > 0) {
      const v = result.violatorMatches[0]

      sectionTitle(doc, 'Government Violation Record', col, y)
      y += 6

      // Operating name
      fieldLabel(doc, 'Matched Employer', col, y)
      y += 3
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(17, 24, 39)
      doc.text(v.business_operating_name, col, y)
      y += 5

      // Legal name
      if (v.business_legal_name && v.business_legal_name.toLowerCase().trim() !== v.business_operating_name?.toLowerCase().trim()) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(107, 114, 128)
        doc.text(`Legal: ${v.business_legal_name}`, col, y)
        y += 5
      }
      y += 2

      // Compliance status
      fieldLabel(doc, 'Compliance Status', col, y)
      y += 3
      const statusLabel = v.compliance_status === 'INELIGIBLE_UNTIL'
        ? `INELIGIBLE UNTIL ${v.ineligible_until_date ? new Date(v.ineligible_until_date).toLocaleDateString('en-CA') : ''}`
        : v.compliance_status === 'ELIGIBLE'
        ? 'ELIGIBLE (previously penalised)'
        : 'INELIGIBLE — UNPAID PENALTY'
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeRgb)
      doc.text(statusLabel, col, y)
      y += 6

      // Decision date (full width)
      if (v.decision_date) {
        fieldLabel(doc, 'Date of Government Decision', col, y)
        y += 3
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(17, 24, 39)
        doc.text(new Date(v.decision_date).toLocaleDateString('en-CA'), col, y)
        y += 5
      }

      // Monetary penalty (full width)
      if (v.penalty_amount) {
        fieldLabel(doc, 'Monetary Penalty', col, y)
        y += 3
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(17, 24, 39)
        const penaltyText = v.ban_duration ? `${v.penalty_amount} + ${v.ban_duration}` : v.penalty_amount
        doc.text(penaltyText, col, y)
        y += 6
      }

      // Violations list
      const codes = expandViolationReasons(v.reasons)
      if (codes.length > 0) {
        fieldLabel(doc, `Violations Found (${codes.length})`, col, y)
        y += 4
        for (const code of codes) {
          const desc = VIOLATION_CODES[code] ?? `Code ${code}`
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(17, 24, 39)
          doc.text(`${code}.`, col, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(55, 65, 81)
          const descLines = doc.splitTextToSize(desc, colW - 8)
          doc.text(descLines, col + 6, y)
          y += descLines.length * 4 + 1
        }
        y += 2
      }
      y += 2
    }

    // ── LMIA Record ────────────────────────────────────────────────────────
    if (result.positiveMatches.length > 0) {
      const p = result.positiveMatches[0]

      sectionTitle(doc, 'LMIA Record', col, y)
      y += 6

      // Stream
      fieldLabel(doc, 'Program Stream', col, y)
      y += 3
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(17, 24, 39)
      doc.text(p.program_stream ?? '—', col, y)
      y += 5

      // Occupation
      fieldLabel(doc, 'Occupation', col, y)
      y += 3
      const occLines = doc.splitTextToSize(p.occupation_title ?? '—', colW)
      doc.text(occLines, col, y)
      y += occLines.length * 4 + 2

      // Approved counts
      fieldLabel(doc, 'Approved LMIAs', col, y)
      y += 3
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(String(p.approved_lmias ?? '—'), col, y)
      y += 5

      fieldLabel(doc, 'Approved Positions', col, y)
      y += 3
      doc.text(String(p.approved_positions ?? '—'), col, y)
      y += 5

      if (p.quarter) {
        fieldLabel(doc, 'Data Quarter', col, y)
        y += 3
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(17, 24, 39)
        doc.text(p.quarter, col, y)
        y += 5
      }
      y += 2
    }

    // ── What To Do Next ────────────────────────────────────────────────────
    sectionTitle(doc, 'What To Do Next', col, y)
    y += 6

    const STEPS: Record<string, string[]> = {
      GREEN: [
        'Request a copy of the LMIA approval letter from your employer.',
        'Use a licensed RCIC or immigration lawyer to process your work permit.',
        'Never pay recruitment fees — employers pay all LMIA costs.',
      ],
      YELLOW: [
        'Contact the employer to verify details independently.',
        'Consult a licensed RCIC before signing any offer letter.',
      ],
      RED: [
        'Do not accept any job offer from this employer.',
        'If you have already paid fees, contact ESDC at 1-800-367-5693.',
        'Report this employer to ESDC: 1-800-367-5693.',
        'Contact a licensed RCIC or legal aid for free advice.',
      ],
      GREY: [
        'Independently verify this employer exists.',
        'Check their website, business registration, and call their main line.',
        'If you paid fees, contact ESDC at 1-800-367-5693 immediately.',
      ],
    }

    for (const step of STEPS[result.risk] ?? []) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeRgb)
      doc.text('—', col, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      const stepLines = doc.splitTextToSize(step, colW - 5)
      doc.text(stepLines, col + 4, y)
      y += stepLines.length * 4 + 1.5
    }

    // ── Footer ─────────────────────────────────────────────────────────────
    const checkDate = new Date().toLocaleDateString('en-CA')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text(`Checked ${checkDate} · ESDC data · lmiacheck.ca`, col, pageHeight - 8)

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
