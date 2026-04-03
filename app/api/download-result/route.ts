import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { verifyEmployer } from '@/lib/verify'
import { expandViolationReasons, VIOLATION_CODES } from '@/lib/violation-codes'

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

    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const M = 18
    const CW = W - 2 * M

    let y = M

    // ── HEADER ──────────────────────────────────────────────────────────────

    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('LMIA Check', M, y)
    y += 9

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('Employment Verification Report', M, y)
    y += 16

    // ── EMPLOYER NAME ───────────────────────────────────────────────────────

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Employer', M, y)
    y += 5

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const empLines = doc.splitTextToSize(employer, CW)
    doc.text(empLines, M, y)
    y += empLines.length * 7

    if (city || province) {
      y += 3
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`${city || ''}${city && province ? ', ' : ''}${province || ''}`, M, y)
      y += 6
    }

    y += 6

    // ── RISK BADGE ──────────────────────────────────────────────────────────

    const COLORS: Record<string, [number, number, number]> = {
      GREEN: [16, 185, 129],
      YELLOW: [245, 158, 11],
      RED: [220, 38, 38],
      GREY: [107, 114, 128],
    }

    const LABELS: Record<string, string> = {
      GREEN: 'VERIFIED',
      YELLOW: 'VERIFY FURTHER',
      RED: 'HIGH RISK — BANNED',
      GREY: 'NOT FOUND',
    }

    const badgeColor = COLORS[result.risk] || COLORS.GREY
    const badgeText = LABELS[result.risk] || 'UNKNOWN'

    doc.setFillColor(...badgeColor)
    doc.rect(M, y, CW, 15, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(badgeText, M + 6, y + 9.5)
    y += 22

    // ── STATUS SUMMARY ──────────────────────────────────────────────────────

    const STATUS_TEXT: Record<string, string> = {
      GREEN: 'This employer is verified in official Canadian government LMIA records.',
      YELLOW: 'This employer requires further verification before proceeding.',
      RED: 'This employer is banned from hiring temporary foreign workers.',
      GREY: 'This employer does not appear in official government records.',
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    const statusLines = doc.splitTextToSize(STATUS_TEXT[result.risk] || '', CW)
    doc.text(statusLines, M, y)
    y += statusLines.length * 5 + 10

    // ── VIOLATION RECORD ────────────────────────────────────────────────────

    if (result.violatorMatches.length > 0) {
      const v = result.violatorMatches[0]

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 100, 100)
      doc.text('GOVERNMENT VIOLATION RECORD', M, y)
      y += 8

      // Operating name
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('OPERATING NAME', M, y)
      y += 4

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(20, 20, 20)
      doc.text(v.business_operating_name, M, y)
      y += 7

      // Legal name if different
      if (v.business_legal_name && v.business_legal_name.toLowerCase().trim() !== v.business_operating_name?.toLowerCase().trim()) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 130)
        doc.text('LEGAL NAME', M, y)
        y += 4

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80, 80, 80)
        doc.text(v.business_legal_name, M, y)
        y += 7
      }

      y += 3

      // Compliance status
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('COMPLIANCE STATUS', M, y)
      y += 4

      const statusLabel = v.compliance_status === 'INELIGIBLE_UNTIL'
        ? `INELIGIBLE UNTIL ${v.ineligible_until_date ? new Date(v.ineligible_until_date).toLocaleDateString('en-CA') : ''}`
        : v.compliance_status === 'ELIGIBLE'
        ? 'ELIGIBLE (PREVIOUSLY PENALISED)'
        : 'INELIGIBLE — UNPAID PENALTY'

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeColor)
      doc.text(statusLabel, M, y)
      y += 7

      y += 4

      // Decision date
      if (v.decision_date) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 130)
        doc.text('DATE OF GOVERNMENT DECISION', M, y)
        y += 4

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(20, 20, 20)
        doc.text(new Date(v.decision_date).toLocaleDateString('en-CA'), M, y)
        y += 7

        y += 3
      }

      // Penalty
      if (v.penalty_amount) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 130)
        doc.text('MONETARY PENALTY', M, y)
        y += 4

        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(20, 20, 20)
        const penaltyText = v.ban_duration ? `${v.penalty_amount} + ${v.ban_duration}` : v.penalty_amount
        doc.text(penaltyText, M, y)
        y += 7

        y += 3
      }

      // Violations
      const codes = expandViolationReasons(v.reasons)
      if (codes.length > 0) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 130)
        doc.text(`VIOLATIONS FOUND (${codes.length})`, M, y)
        y += 5

        for (const code of codes) {
          const desc = VIOLATION_CODES[code] || `Code ${code}`
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(20, 20, 20)
          doc.text(`${code}.`, M, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(60, 60, 60)
          const descLines = doc.splitTextToSize(desc, CW - 6)
          doc.text(descLines, M + 6, y)
          y += descLines.length * 4.5 + 2
        }

        y += 3
      }

      y += 5
    }

    // ── LMIA RECORD ─────────────────────────────────────────────────────────

    if (result.positiveMatches.length > 0) {
      const p = result.positiveMatches[0]

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 100, 100)
      doc.text('LMIA RECORD', M, y)
      y += 8

      // Program stream
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('PROGRAM STREAM', M, y)
      y += 4

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(20, 20, 20)
      doc.text(p.program_stream || '—', M, y)
      y += 6

      y += 2

      // Occupation
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('OCCUPATION', M, y)
      y += 4

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(20, 20, 20)
      const occLines = doc.splitTextToSize(p.occupation_title || '—', CW)
      doc.text(occLines, M, y)
      y += occLines.length * 4.5 + 2

      y += 2

      // Approved LMIAs
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('APPROVED LMIAs', M, y)
      y += 4

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(20, 20, 20)
      doc.text(String(p.approved_lmias || '—'), M, y)
      y += 6

      y += 2

      // Approved positions
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('APPROVED POSITIONS', M, y)
      y += 4

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(20, 20, 20)
      doc.text(String(p.approved_positions || '—'), M, y)
      y += 6

      if (p.quarter) {
        y += 2
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(130, 130, 130)
        doc.text('DATA QUARTER', M, y)
        y += 4

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(20, 20, 20)
        doc.text(p.quarter, M, y)
        y += 6
      }

      y += 3
    }

    // ── WHAT TO DO NEXT ─────────────────────────────────────────────────────

    y += 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text('WHAT TO DO NEXT', M, y)
    y += 8

    const STEPS: Record<string, string[]> = {
      GREEN: [
        'Request a copy of the LMIA approval letter from your employer.',
        'Use a licensed RCIC or immigration lawyer to process your work permit.',
        'Never pay recruitment fees — employers pay all costs.',
      ],
      YELLOW: [
        'Contact the employer to verify details independently.',
        'Consult a licensed RCIC before signing any offer.',
      ],
      RED: [
        'Do not accept any job offer from this employer.',
        'If you already paid fees, contact ESDC: 1-800-367-5693.',
        'Report this employer to ESDC: 1-800-367-5693.',
        'Contact a licensed RCIC or legal aid for free advice.',
      ],
      GREY: [
        'Independently verify this employer exists.',
        'Check their website, business registration, and call their main line.',
        'If you paid fees, contact ESDC: 1-800-367-5693 immediately.',
      ],
    }

    for (const step of STEPS[result.risk] || []) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeColor)
      doc.text('—', M, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const stepLines = doc.splitTextToSize(step, CW - 5)
      doc.text(stepLines, M + 4, y)
      y += stepLines.length * 4.5 + 2
    }

    // ── FOOTER ──────────────────────────────────────────────────────────────

    const checkDate = new Date().toLocaleDateString('en-CA')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text(`Checked ${checkDate} · ESDC · lmiacheck.ca`, M, H - 8)

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
