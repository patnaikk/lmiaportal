export type RiskResult = 'GREEN' | 'YELLOW' | 'RED' | 'GREY'
export type RedSubtype = 'BANNED_TEMPORARY' | 'BANNED_UNPAID_PENALTY'
export type YellowReason = 'address_mismatch' | 'prior_violation_now_eligible' | 'pr_only_stream'
export type ComplianceStatus = 'ELIGIBLE' | 'INELIGIBLE_UNTIL' | 'INELIGIBLE_UNPAID' | 'INELIGIBLE'

export interface PositiveLmia {
  id: number
  province: string
  program_stream: string
  employer_name: string
  employer_normalized: string
  address: string
  city: string
  noc_code: string
  occupation_title: string
  incorporate_status: string
  approved_lmias: number
  approved_positions: number
  postal_code: string
  quarter: string
  ingested_at: string
}

export interface ViolatorRecord {
  id: number
  business_operating_name: string
  business_legal_name: string
  employer_normalized: string
  legal_name_normalized: string
  address: string
  province: string
  reasons: string
  decision_date: string | null
  penalty_raw: string
  penalty_amount: string
  ban_duration: string | null
  status_raw: string
  compliance_status: ComplianceStatus
  ineligible_until_date: string | null
  ingested_at: string
  /** Date we first saw ESDC drop this record from the feed. Null = still published. */
  removed_from_source?: string | null
}

export interface VerifyResult {
  risk: RiskResult
  subtype?: RedSubtype
  reason?: YellowReason
  ban_end_date?: string | null
  positiveMatches: PositiveLmia[]
  violatorMatches: ViolatorRecord[]
  /**
   * Matches ESDC has since RETRACTED from its published list. These are shown
   * for transparency but deliberately excluded from `risk` — we must not keep
   * accusing an employer the government no longer lists.
   */
  retractedMatches: ViolatorRecord[]
  source: 'positive_lmia' | 'violators' | 'not_found'
  employerQuery: string
}
