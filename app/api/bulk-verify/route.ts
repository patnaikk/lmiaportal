import { NextRequest } from 'next/server'
import { verifyEmployer } from '@/lib/verify'
import { supabaseAdmin } from '@/lib/supabase'

const BATCH_SIZE = 5
const FREE_LIMIT = 25       // max employers per run on free tier
const DAILY_RUN_LIMIT = 3   // max runs per IP per day

interface BulkEmployer {
  name: string
  province?: string
  city?: string
}

function getRiskSummary(risk: string, reason?: string): string {
  if (risk === 'RED') return 'Banned / non-compliant employer'
  if (risk === 'YELLOW' && reason === 'prior_violation_now_eligible') return 'Past violation — now eligible'
  if (risk === 'YELLOW' && reason === 'pr_only_stream') return 'LMIA is PR-only stream'
  if (risk === 'YELLOW' && reason === 'address_mismatch') return 'Employer found but location mismatch'
  if (risk === 'YELLOW') return 'Caution — review recommended'
  if (risk === 'GREEN') return 'Found in positive LMIA records'
  return 'Not found in government records'
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  let body: { employers: BulkEmployer[]; email: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { employers, email } = body

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400 })
  }

  if (!Array.isArray(employers) || employers.length === 0) {
    return new Response(JSON.stringify({ error: 'No employers provided' }), { status: 400 })
  }

  // Enforce free tier limit
  const capped = employers.slice(0, FREE_LIMIT)

  // Rate limit: check how many runs this IP has done today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabaseAdmin
    .from('bulk_search_runs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', todayStart.toISOString())

  if ((count ?? 0) >= DAILY_RUN_LIMIT) {
    return new Response(
      JSON.stringify({ error: 'rate_limited', message: 'You have reached the 3 bulk checks per day limit on the free tier.' }),
      { status: 429 }
    )
  }

  // Insert run record upfront — captures email for the list
  const { data: runRow } = await supabaseAdmin
    .from('bulk_search_runs')
    .insert({ email, employer_count: capped.length, ip_address: ip, tier: 'free' })
    .select('id')
    .single()

  const runId: string | null = runRow?.id ?? null

  // Stream results back as newline-delimited JSON
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const allResults: Array<{ employer_name: string; risk: string; summary: string; position: number }> = []

      for (let i = 0; i < capped.length; i += BATCH_SIZE) {
        const batch = capped.slice(i, i + BATCH_SIZE)

        const batchResults = await Promise.all(
          batch.map((e) => verifyEmployer(e.name, e.city, e.province))
        )

        for (let j = 0; j < batch.length; j++) {
          const idx = i + j
          const result = batchResults[j]
          const summary = getRiskSummary(result.risk, result.reason)

          const row = {
            index: idx,
            employer: batch[j].name,
            risk: result.risk,
            summary,
            violatorName: result.violatorMatches?.[0]?.business_operating_name,
            reasons: result.violatorMatches?.[0]?.reasons,
          }

          allResults.push({ employer_name: batch[j].name, risk: result.risk, summary, position: idx })
          controller.enqueue(encoder.encode(JSON.stringify(row) + '\n'))
        }
      }

      // Persist individual results and update run with final JSON
      if (runId) {
        await Promise.all([
          supabaseAdmin.from('bulk_search_results').insert(
            allResults.map((r) => ({ ...r, run_id: runId }))
          ),
          supabaseAdmin
            .from('bulk_search_runs')
            .update({ results_json: allResults })
            .eq('id', runId),
        ])
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Run-Id': runId ?? '',
    },
  })
}
