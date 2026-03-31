import { supabase, supabaseAdmin } from './supabase'
import { normalizeEmployerName } from './normalize'
import type { VerifyResult, PositiveLmia, ViolatorRecord } from './types'

// DB stores full province names; the UI sends 2-letter codes.
const PROVINCE_CODE_TO_NAME: Record<string, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
}

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
    // RPC not available — skip to ILIKE below
  }
  // Always run ILIKE contains search as a supplement.
  // Searches BOTH operating name and legal name so "2771482 Ontario Inc" finds the record.
  // Order by exact prefix match first, then by name length (shorter = closer match).
  if (violatorMatches.length === 0) {
    const { data } = await supabase
      .from('violators')
      .select('*')
      .or(`employer_normalized.ilike.%${normalized}%,legal_name_normalized.ilike.%${normalized}%`)
      .order('employer_normalized', { ascending: true })
      .limit(5)
    violatorMatches = (data as ViolatorRecord[]) || []
  }
  // Truncation fallback for violators: drop trailing descriptor words one at a time.
  // e.g. "Afghan Chopan Kebab Restaurant" → retry as "Afghan Chopan Kebab".
  if (violatorMatches.length === 0) {
    const words = normalized.split(' ')
    for (let drop = 1; drop <= words.length - 2; drop++) {
      const shorter = words.slice(0, words.length - drop).join(' ')
      const { data: rpcData, error: rpcErr } = await supabase.rpc('search_violators', {
        query_normalized: shorter,
        sim_threshold: 0.65,
      })
      if (!rpcErr && rpcData?.length) {
        violatorMatches = rpcData as ViolatorRecord[]
        break
      }
      const { data: ilikeData } = await supabase
        .from('violators')
        .select('*')
        .or(`employer_normalized.ilike.%${shorter}%,legal_name_normalized.ilike.%${shorter}%`)
        .order('employer_normalized', { ascending: true })
        .limit(5)
      if (ilikeData?.length) {
        violatorMatches = ilikeData as ViolatorRecord[]
        break
      }
    }
  }

  if (violatorMatches.length > 0) {
    // Evaluate worst compliance status across all matches (not just first).
    // Priority: INELIGIBLE/INELIGIBLE_UNPAID > INELIGIBLE_UNTIL > ELIGIBLE
    const worstIneligible = violatorMatches.find(
      (v) => v.compliance_status === 'INELIGIBLE' || v.compliance_status === 'INELIGIBLE_UNPAID'
    )
    const tempBanned = violatorMatches.find((v) => v.compliance_status === 'INELIGIBLE_UNTIL')
    const v = worstIneligible ?? tempBanned ?? violatorMatches[0]
    // Ensure the worst match is first so the UI displays it prominently.
    if (v !== violatorMatches[0]) {
      violatorMatches = [v, ...violatorMatches.filter((m) => m !== v)]
    }

    if (v.compliance_status === 'ELIGIBLE') {
      // Served penalty — now allowed to hire. Flag YELLOW with history shown.
      await logSearch(employerName, city, province, 'YELLOW')
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
      await logSearch(employerName, city, province, 'RED')
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
    await logSearch(employerName, city, province, 'RED')
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
    // RPC not available — skip to ILIKE below
  }
  // ILIKE fallback: catches partial/short matches the trigram RPC misses (e.g. "amazon").
  // NOTE: positive_lmia has no legal_name_normalized column — search employer_normalized only.
  if (positiveMatches.length === 0) {
    const { data } = await supabase
      .from('positive_lmia')
      .select('*')
      .ilike('employer_normalized', `%${normalized}%`)
      .limit(20)
    positiveMatches = (data as PositiveLmia[]) || []
  }

  // Truncation fallback: if the user added descriptor words (e.g. "Tim Hortons Restaurant"),
  // the normalized query is longer than the stored value, so ILIKE %query% fails.
  // Retry by dropping one word at a time until we get a hit or reach 2 words.
  if (positiveMatches.length === 0) {
    const words = normalized.split(' ')
    for (let drop = 1; drop <= words.length - 2; drop++) {
      const shorter = words.slice(0, words.length - drop).join(' ')
      const { data: rpcData, error: rpcErr } = await supabase.rpc('search_positive_lmia', {
        query_normalized: shorter,
        sim_threshold: 0.55,
      })
      if (!rpcErr && rpcData?.length) {
        positiveMatches = rpcData as PositiveLmia[]
        break
      }
      const { data: ilikeData } = await supabase
        .from('positive_lmia')
        .select('*')
        .ilike('employer_normalized', `%${shorter}%`)
        .limit(20)
      if (ilikeData?.length) {
        positiveMatches = ilikeData as PositiveLmia[]
        break
      }
    }
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
    // Resolve province code to full name as stored in DB (e.g. "BC" → "British Columbia")
    const provinceFull = province
      ? (PROVINCE_CODE_TO_NAME[province.toUpperCase()] ?? province)
      : undefined
    // Normalise city for comparison: strip punctuation + diacritics so
    // "St Johns" matches "St. John's" and "Montreal" matches "Montréal".
    const normCity = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    const cityNorm = city ? normCity(city) : undefined
    const detailMatch = positiveMatches.filter(
      (m) =>
        (!cityNorm || normCity(m.city ?? '').includes(cityNorm)) &&
        (!provinceFull || m.province === provinceFull)
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

    // PR-only check on the location-filtered results (mirrors Step 4 logic).
    // Without this, an employer with only PR-only LMIAs in the matching province
    // would return GREEN instead of YELLOW/pr_only_stream.
    const prOnlyDetail = detailMatch.filter((m) =>
      m.program_stream?.toLowerCase().includes('permanent resident only')
    )
    const nonPrDetail = detailMatch.filter(
      (m) => !m.program_stream?.toLowerCase().includes('permanent resident only')
    )
    if (prOnlyDetail.length > 0 && nonPrDetail.length === 0) {
      await logSearch(employerName, city, province, 'YELLOW')
      return {
        risk: 'YELLOW',
        reason: 'pr_only_stream',
        positiveMatches: prOnlyDetail,
        violatorMatches: [],
        source: 'positive_lmia',
        employerQuery: employerName,
      }
    }

    await logSearch(employerName, city, province, 'GREEN')
    return {
      risk: 'GREEN',
      positiveMatches: nonPrDetail.length > 0 ? nonPrDetail : detailMatch,
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
