import * as XLSX from 'xlsx'

export async function GET() {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Template (the actual data sheet) ────────────────────────────
  const templateData = [
    { employer_name: 'Tim Hortons', province: 'ON', city: 'Toronto' },
    { employer_name: 'ABC Trucking Ltd', province: 'BC', city: 'Vancouver' },
    { employer_name: "McDonald's Canada", province: '', city: '' },
  ]
  const templateSheet = XLSX.utils.json_to_sheet(templateData, {
    header: ['employer_name', 'province', 'city'],
  })

  // Column widths
  templateSheet['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 20 }]

  XLSX.utils.book_append_sheet(wb, templateSheet, 'Employers')

  // ── Sheet 2: Instructions ────────────────────────────────────────────────
  const instructions = [
    ['LMIA Bulk Check — Template Instructions'],
    [''],
    ['Column', 'Required?', 'Notes'],
    ['employer_name', 'REQUIRED', 'The employer name exactly as it appears on your job offer or LMIA document.'],
    ['province', 'Optional', 'Two-letter code: ON, BC, AB, QC, MB, SK, NS, NB, NL, PE, NT, NU, YT'],
    ['city', 'Optional', 'City name. Helps narrow results when the same employer name appears in multiple locations.'],
    [''],
    ['Tips'],
    ['— Only fill in province and city if you want location-specific results.'],
    ['— Leave province and city blank to search nationally.'],
    ['— Do not change the column headers in the Employers sheet.'],
    ['— Maximum 25 employers per run on the free tier.'],
  ]
  const instrSheet = XLSX.utils.aoa_to_sheet(instructions)
  instrSheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 70 }]

  XLSX.utils.book_append_sheet(wb, instrSheet, 'Instructions')

  // ── Write and return ─────────────────────────────────────────────────────
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="lmia-bulk-check-template.xlsx"',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
