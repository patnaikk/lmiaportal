'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Stats {
  subscribers: {
    total: number
    thisMonth: number
    breakdown: { GREEN: number; YELLOW: number; RED: number; GREY: number }
  }
  dataFreshness: {
    positive_lmia: { lastIngested: string | null; count: number }
    violators: { lastIngested: string | null; count: number }
  }
}

interface SearchLog {
  employer_query: string
  risk_result: string
  searched_at: string
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function FreshnessIndicator({ lastIngested }: { lastIngested: string | null }) {
  const days = daysSince(lastIngested)
  if (days === null) return <span className="text-gray-400 text-sm">Never ingested</span>
  const isStale = days > 90
  return (
    <span className={`text-sm font-medium ${isStale ? 'text-amber-600' : 'text-green-600'}`}>
      {isStale ? '⚠ ' : '✓ '}
      {lastIngested ? new Date(lastIngested).toLocaleDateString('en-CA') : '—'}
      {' '}({days}d ago)
    </span>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [searches, setSearches] = useState<SearchLog[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Check for saved session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token')
    if (saved) setToken(saved)
  }, [])

  const loadData = useCallback(async (tok: string) => {
    setDataLoading(true)
    const headers = { 'x-admin-token': tok }
    try {
      const [statsRes, searchesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/searches', { headers }),
      ])
      if (statsRes.status === 401) {
        setToken(null)
        sessionStorage.removeItem('admin_token')
        return
      }
      const statsData = await statsRes.json()
      const searchesData = await searchesRes.json()
      setStats(statsData)
      setSearches(searchesData.searches || [])
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) loadData(token)
  }, [token, loadData])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(false)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.ok && data.token) {
        sessionStorage.setItem('admin_token', data.token)
        setToken(data.token)
      } else {
        setAuthError(true)
      }
    } finally {
      setAuthLoading(false)
    }
  }

  function handleExport() {
    if (!token) return
    const url = `/api/admin/export`
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('x-admin-token', token) // won't work via anchor
    // Instead, fetch the CSV and trigger download
    fetch(url, { headers: { 'x-admin-token': token } })
      .then((r) => r.blob())
      .then((blob) => {
        const objUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objUrl
        link.download = `lmia-subscribers-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(objUrl)
      })
  }

  // Password gate
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              autoFocus
            />
            {authError && (
              <p className="text-sm text-red-600">Incorrect password.</p>
            )}
            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {authLoading ? 'Checking…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">LMIA Check — Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-blue-700 underline">← Public site</Link>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_token')
              setToken(null)
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      {dataLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading…</div>
        </div>
      ) : stats ? (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Section 1: Subscriber Summary */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Subscriber Summary</h2>
              <button
                onClick={handleExport}
                className="px-4 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-900 font-medium"
              >
                Export CSV
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.subscribers.total}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total subscribers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.subscribers.thisMonth}</div>
                  <div className="text-xs text-gray-500 mt-0.5">This month</div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Breakdown by result</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['GREEN', 'YELLOW', 'RED', 'GREY'] as const).map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        r === 'GREEN' ? 'bg-green-500' :
                        r === 'YELLOW' ? 'bg-yellow-500' :
                        r === 'RED' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm text-gray-700">{r}: <strong>{stats.subscribers.breakdown[r]}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Data Freshness */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-4">Data Freshness</h2>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Positive LMIA</div>
                  <div className="text-xs text-gray-500">{stats.dataFreshness.positive_lmia.count.toLocaleString()} records</div>
                </div>
                <FreshnessIndicator lastIngested={stats.dataFreshness.positive_lmia.lastIngested} />
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Non-Compliant Employers</div>
                  <div className="text-xs text-gray-500">{stats.dataFreshness.violators.count.toLocaleString()} records</div>
                </div>
                <FreshnessIndicator lastIngested={stats.dataFreshness.violators.lastIngested} />
              </div>
            </div>
          </section>

          {/* Section 3: Recent Searches */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-4">Recent Searches (last 50)</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Employer searched</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {searches.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-gray-400 text-center">No searches yet</td>
                    </tr>
                  ) : (
                    searches.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{s.employer_query}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            s.risk_result === 'GREEN' ? 'bg-green-100 text-green-800' :
                            s.risk_result === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                            s.risk_result === 'RED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {s.risk_result || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {s.searched_at ? new Date(s.searched_at).toLocaleString('en-CA', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
