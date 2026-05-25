'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

type RiskLevel = 'RED' | 'YELLOW' | 'GREEN' | 'GREY'

interface ResultRow {
  index: number
  employer: string
  risk: RiskLevel
  summary: string
  violatorName?: string
  reasons?: string
}

const RISK_STYLE: Record<RiskLevel, { pill: string; label: string }> = {
  RED:    { pill: 'bg-red-100 text-red-700',     label: 'Banned' },
  YELLOW: { pill: 'bg-amber-100 text-amber-700', label: 'Caution' },
  GREEN:  { pill: 'bg-green-100 text-green-700', label: 'Clean' },
  GREY:   { pill: 'bg-gray-100 text-gray-600',   label: 'Not found' },
}

const FREE_LIMIT = 25

export default function BulkPage() {
  const [showSample, setShowSample] = useState(false)
  const [tab, setTab] = useState<'paste' | 'upload'>('paste')
  const [pasteText, setPasteText] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsedEmployers, setParsedEmployers] = useState<Array<{ name: string; province?: string; city?: string }>>([])
  const [parseError, setParseError] = useState('')
  const [email, setEmail] = useState('')
  const [firmName, setFirmName] = useState('')
  const [results, setResults] = useState<ResultRow[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Parse uploaded file ──────────────────────────────────────────────────
  function handleFile(file: File) {
    setParseError('')
    setParsedEmployers([])
    setFileName(file.name)

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setParseError('Please upload a .csv or .xlsx file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (rows.length === 0) {
          setParseError('The file appears to be empty.')
          return
        }

        const firstRow = rows[0]
        const keys = Object.keys(firstRow).map((k) => k.toLowerCase().trim())

        const nameKey = Object.keys(firstRow).find((k) =>
          k.toLowerCase().trim() === 'employer_name'
        )

        if (!nameKey) {
          setParseError(
            `Column "employer_name" not found. Columns found: ${Object.keys(firstRow).join(', ')}. Download our template to get started.`
          )
          return
        }

        const provinceKey = Object.keys(firstRow).find((k) => keys[Object.keys(firstRow).indexOf(k)] === 'province')
        const cityKey = Object.keys(firstRow).find((k) => keys[Object.keys(firstRow).indexOf(k)] === 'city')

        const employers = rows
          .map((r) => ({
            name: String(r[nameKey] ?? '').trim(),
            province: provinceKey ? String(r[provinceKey] ?? '').trim() || undefined : undefined,
            city: cityKey ? String(r[cityKey] ?? '').trim() || undefined : undefined,
          }))
          .filter((e) => e.name.length > 1)

        if (employers.length === 0) {
          setParseError('No valid employer names found in the file.')
          return
        }

        setParsedEmployers(employers)
      } catch {
        setParseError('Could not read the file. Make sure it is a valid CSV or Excel file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // ── Derive the employer list from whichever tab is active ────────────────
  function getEmployers() {
    if (tab === 'paste') {
      return pasteText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 1)
        .map((name) => ({ name }))
    }
    return parsedEmployers
  }

  // ── Run the batch check ──────────────────────────────────────────────────
  async function runCheck() {
    setError('')
    setResults([])
    setDone(false)
    setProgress(0)

    const employers = getEmployers().slice(0, FREE_LIMIT)

    if (employers.length === 0) {
      setError('Please enter at least one employer name.')
      return
    }

    setRunning(true)

    try {
      const res = await fetch('/api/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employers, email }),
      })

      if (res.status === 429) {
        setError('You have reached the 3 bulk checks per day limit. Enter your email above to unlock Pro access and run unlimited checks.')
        setRunning(false)
        return
      }

      if (!res.ok || !res.body) {
        setError('Something went wrong. Please try again.')
        setRunning(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const total = employers.length

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const row: ResultRow = JSON.parse(line)
            setResults((prev) => [...prev, row])
            setProgress(Math.round(((row.index + 1) / total) * 100))
          } catch {
            // malformed line — skip
          }
        }
      }

      setDone(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setRunning(false)
    }
  }

  // ── Download results as CSV ──────────────────────────────────────────────
  function downloadCSV() {
    if (!email || !email.includes('@')) {
      setError('Please enter your email address to download results.')
      return
    }
    const header = 'Employer,Status,Summary,Violator Name,Reasons\n'
    const rows = results.map((r) =>
      [r.employer, r.risk, r.summary, r.violatorName ?? '', r.reasons ?? '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lmia-bulk-check-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const employers = getEmployers()
  const count = Math.min(employers.length, FREE_LIMIT)
  const overLimit = employers.length > FREE_LIMIT

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation currentPage="bulk" />

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-50 text-center pt-10 pb-7 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 mb-4" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
          Bulk Employer Check
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto mb-2">
          Screen employer legitimacy before filing LMIA-backed work permit applications. Check up to {FREE_LIMIT} employers at once.
        </p>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-3">
          Built for RCICs and immigration consultants vetting employer records against ESDC databases.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Free for RCICs
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            {FREE_LIMIT} employers / run
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            3 runs / day
          </span>
        </div>

        {/* Data freshness info */}
        <div className="mt-4 inline-flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-gray-100 text-xs text-gray-600">
          <div>📊 Q3 2025 LMIA data</div>
          <div className="w-px h-4 bg-gray-200" aria-hidden="true" />
          <div>🚫 1,262 violators on file</div>
          <div className="w-px h-4 bg-gray-200" aria-hidden="true" />
          <div>✓ ESDC official records</div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">

        {/* Step 1 — Input */}
        <div className="card-elevated p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Step 1 — Add employers</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
            {(['paste', 'upload'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setParseError(''); setResults([]); setDone(false) }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'paste' ? 'Paste names' : 'Upload file'}
              </button>
            ))}
          </div>

          {tab === 'paste' && (
            <div>
              <p className="text-xs text-gray-600 mb-2 font-medium">Paste one employer name per line:</p>
              <textarea
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setResults([]); setDone(false) }}
                placeholder={"Tim Hortons\nABC Trucking Ltd\nMcDonald's Canada"}
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">💡 Each name on its own line. Not comma-separated.</p>
            </div>
          )}

          {tab === 'upload' && (
            <div>
              <a
                href="/api/bulk-template"
                download="lmia-bulk-check-template.xlsx"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 mb-3"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download template (.xlsx)
              </a>

              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <svg className="mx-auto mb-2 text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  {fileName ? fileName : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">.xlsx or .csv · max {FREE_LIMIT} employers</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>

              {parseError && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl text-xs text-red-700 leading-relaxed">
                  <span className="font-semibold">Could not read file: </span>{parseError}
                </div>
              )}

              {parsedEmployers.length > 0 && !parseError && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-800">
                  <span className="font-semibold">{parsedEmployers.length} employer{parsedEmployers.length !== 1 ? 's' : ''} found</span> — ready to check.
                </div>
              )}
            </div>
          )}

          {overLimit && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Free tier is limited to {FREE_LIMIT} employers per run. The first {FREE_LIMIT} will be checked.
            </p>
          )}
        </div>

        {/* Step 2 — Email + firm + run */}
        <div className="card-elevated p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Step 2 — Get your results</p>
          <p className="text-xs text-gray-500 mb-4">We'll email you the report as a PDF for your client file. Your firm details help us improve the service.</p>

          <div className="space-y-2 mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="Your firm name (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={runCheck}
            disabled={running || count === 0}
            className="w-full px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {running ? 'Checking…' : `Check ${count > 0 ? count : ''} employer${count !== 1 ? 's' : ''}`}
          </button>

          {error && (
            <p className="mt-3 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <p className="text-center text-xs text-gray-400 mt-3">🔒 No login required · Free tier: {FREE_LIMIT} employers, 3 runs/day</p>
        </div>

        {/* Sample result preview */}
        <div className="card-elevated">
          <button
            onClick={() => setShowSample(!showSample)}
            className="w-full px-5 py-3 text-sm font-semibold text-indigo-700 hover:text-indigo-900 flex items-center justify-between"
          >
            <span>See what a result looks like</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${showSample ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSample && (
            <div className="border-t border-gray-100 px-5 py-4 space-y-3">
              <p className="text-xs text-gray-500 font-semibold">Example results from a batch check:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex-shrink-0 mt-0.5">
                    Clean
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Tim Hortons</p>
                    <p className="text-xs text-gray-500 mt-0.5">Found in positive LMIA records</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex-shrink-0 mt-0.5">
                    Banned
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Example Corp Inc</p>
                    <p className="text-xs text-red-600 mt-0.5">On ESDC non-compliant list — wage violations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 flex-shrink-0 mt-0.5">
                    Not found
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Unknown Ltd</p>
                    <p className="text-xs text-gray-500 mt-0.5">Not in government LMIA records</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {running && (
          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Checking employers…</p>
              <p className="text-sm text-gray-500">{progress}%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Results are appearing below as each check completes.</p>
          </div>
        )}

        {/* Results table */}
        {results.length > 0 && (
          <div className="card-elevated overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                Results{done ? ` — ${results.length} employer${results.length !== 1 ? 's' : ''}` : ` (${results.length} of ${count})`}
              </p>
              {done && (
                <button
                  onClick={downloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download CSV
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-50">
              {results.map((row, i) => {
                const style = RISK_STYLE[row.risk] ?? RISK_STYLE.GREY
                return (
                  <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                    <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${style.pill}`}>
                      {style.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{row.employer}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{row.summary}</p>
                      {row.reasons && (
                        <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{row.reasons}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {done && (
              <div className="px-5 py-4 border-t border-gray-100 bg-indigo-50">
                <p className="text-sm font-semibold text-indigo-900 mb-2">
                  Need more than {FREE_LIMIT} employers per run?
                </p>
                <p className="text-xs text-indigo-800 leading-relaxed mb-3">
                  Pro tier (launching soon): 50 employers/run, unlimited daily checks, saved history, and PDF export.
                </p>
                <a
                  href="mailto:hello@lmiacheck.ca?subject=Pro+Tier+Interest&body=Hi%2C%0A%0AI'm interested in the Pro tier for bulk employer checks.%0A%0AFirm:%20[Your firm name]%0AEmail:%20[Your email]%0ACurrent caseload:%20[# of clients/year]%0A%0AThanks!"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Join the waitlist
                </a>
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
