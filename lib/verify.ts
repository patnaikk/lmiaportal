import { supabase, supabaseAdmin } from './supabase'
import { normalizeEmployerName } from './normalize'
import type { VerifyResult, PositiveLmia, ViolatorRecord } from './types'

export async function verifyEmployer(
  employerName: string,
  city?: string,
  province?: string
): Promise<VerifyResult> {
  const normalized = normalizeEmployerName(employerName)

  if (!normalized || normalized.length < 2) {
    return {
      risk: 'GREY',
      positiveMatches: [],
      violatorMatches: [],
      source: 'not_found',
      employerQuery: employerName,
    }
  }

  // Step 1: Check violators list first (most critical check)
  let violatorMatches: ViolatorRecord[] = []
  try {
    const { data, error } = await supabase.rpc('search_violators', {
      query_normalized: normalized,
      sim_threshold: 0.65,
    })
    if (!error && data) {
      violatorMatches = data as ViolatorRecord[]
    }
  } catch {
    // RPC not available yet — fall back to ilike
    const { data } = await supabase
      .from('violators')
      .select('*')
      .ilike('employer_normalized', `%${normalized}%`)
      .limit(5)
    violatorMatches = (data as ViolatorRecord[]) || []
  }

  if (violatorMatches.length > 0) {
    const v = violatorMatches[0]

    if (v.compliance_status === 'ELIGIBLE') {
      // Served penalty — now allowed to hire. Flag YELLOW with history shown.
      return {
        risk: 'YELLOW',
        reason: 'prior_violation_now_eligible',
        positiveMatches: [],
        violatorMatches,
        source: 'violators',
        employerQuery: employerName,
      }
    }

    if (v.compliance_status === 'INELIGIBLE_UNTIL') {
      return {
        risk: 'RED',
        subtype: 'BANNED_TEMPORARY',
        ban_end_date: v.ineligible_until_date,
        positiveMatches: [],
        violatorMatches,
        source: 'violators',
        employerQuery: employerName,
      }
    }

    // INELIGIBLE_UNPAID or INELIGIBLE (plain) — treat as RED, no end date
    return {
      risk: 'RED',
      subtype: 'BANNED_UNPAID_PENALTY',
      positiveMatches: [],
      violatorMatches,
      source: 'violators',
      employerQuery: employerName,
    }
  }

  // Step 2: Check positive LMIA list
  let positiveMatches: PositiveLmia[] = []
  try {
    const { data, error } = await supabase.rpc('search_positive_lmia', {
      query_normalized: normalized,
      sim_threshold: 0.55,
    })
    if (!error && data) {
      positiveMatches = data as PositiveLmia[]
    }
  } catch {
    // RPC not available — fall back to ilike
    const { data } = await supabase
      .from('positive_lmia')
      .select('*')
      .ilike('employer_normalized', `%${normalized}%`)
      .limit(20)
    positiveMatches = (data as PositiveLmia[]) || []
  }

  if (positiveMatches.length === 0) {
    await logSearch(employerName, city, province, 'GREY')
    return {
      risk: 'GREY',
      positiveMatches: [],
      violatorMatches: [],
      source: 'not_found',
      employerQuery: employerName,
    }
  }

  // Step 3: Cross-check city/province if provided
  if (city || province) {
    const detailMatch = positiveMatches.filter(
      (m) =>
        (!city || m.city?.toLowerCase().includes(city.toLowerCase())) &&
        (!province || m.province === province)
    )

    if (detailMatch.length === 0) {
      // Employer found in positive list but location doesn't match — possible impersonation
      await logSearch(employerName, city, province, 'YELLOW')
      return {
        risk: 'YELLOW',
        reason: 'address_mismatch',
        positiveMatches,
        violatorMatches: [],
        source: 'positive_lmia',
        employerQuery: employerName,
      }
    }

    await logSearch(employerName, city, province, 'GREEN')
    return {
      risk: 'GREEN',
      positiveMatches: detailMatch,
      violatorMatches: [],
      source: 'positive_lmia',
      employerQuery: employerName,
    }
  }

  // Step 4: Check for Permanent Resident Only stream — flag YELLOW for TFW context
  const prOnlyMatches = positiveMatches.filter((m) =>
    m.program_stream?.toLowerCase().includes('permanent resident only')
  )
  const nonPrMatches = positiveMatches.filter(
    (m) => !m.program_stream?.toLowerCase().includes('permanent resident only')
  )

  if (prOnlyMatches.length > 0 && nonPrMatches.length === 0) {
    await logSearch(employerName, city, province, 'YELLOW')
    return {
      risk: 'YELLOW',
      reason: 'pr_only_stream',
      positiveMatches: prOnlyMatches,
      violatorMatches: [],
      source: 'positive_lmia',
      employerQuery: employerName,
    }
  }

  const finalMatches = nonPrMatches.length > 0 ? nonPrMatches : positiveMatches
  await logSearch(employerName, city, province, 'GREEN')
  return {
    risk: 'GREEN',
    positiveMatches: finalMatches,
    violatorMatches: [],
    source: 'positive_lmia',
    employerQuery: employerName,
  }
}

async function logSearch(
  employerQuery: string,
  city?: string,
  province?: string,
  riskResult?: string,
  matchScore?: number
) {
  try {
    await supabaseAdmin.from('search_logs').insert({
      employer_query: employerQuery,
      city_query: city || null,
      province_query: province || null,
      risk_result: riskResult,
      match_score: matchScore || null,
    })
  } catch {
    // Non-critical — don't fail the request if logging fails
  }
}
