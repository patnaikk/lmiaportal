export const VIOLATION_CODES: Record<number, string> = {
  1: 'Could not prove the job offer information was accurate (record-keeping)',
  2: 'Did not keep documents proving employment conditions were met',
  3: 'Did not have funds to pay wages agreed with a live-in caregiver',
  4: 'Could not prove the LMIA job description was accurate',
  5: 'Did not attend a meeting with the government inspector',
  6: 'Did not provide documents requested by the inspector',
  7: 'Did not cooperate with or provide information to the inspector',
  8: 'Broke federal, provincial or territorial employment or recruitment laws',
  9: 'Pay or working conditions did not match — or job was not as described — in the offer',
  10: 'Live-in caregiver was not living in a private home or not providing required care',
  11: 'Hiring foreign worker did not create or protect jobs for Canadians',
  12: 'Hiring foreign worker did not result in skills transfer to Canadians',
  13: 'Did not hire or train Canadians as committed to',
  14: 'Did not make sufficient effort to hire or train Canadians as committed to',
  15: 'Was not actively operating the business the foreign worker was hired for',
  16: 'Live-in caregiver did not receive private furnished accommodation',
  17: 'Did not maintain an abuse-free workplace (physical, sexual, psychological, financial, or reprisal)',
  18: 'Prevented foreign worker from complying with Emergencies Act or Quarantine Act',
  19: 'Prevented foreign worker from complying with provincial public health law',
  20: 'Did not pay full wages during mandatory isolation or quarantine period on entry',
  21: 'Did not provide separate quarantine accommodation (minimum 2 metres distancing)',
  22: 'Did not provide cleaning and disinfecting products for quarantine accommodation',
  23: 'Did not provide private bedroom and bathroom for worker who developed COVID-19 symptoms',
  24: 'Did not provide adequate accommodation to seasonal agricultural workers',
  25: 'Did not provide foreign worker with information on their rights in Canada on first day',
  26: 'Did not make rights information available in both official languages',
  27: 'Did not make reasonable effort to provide access to health care when worker was injured or ill',
  28: 'Charged the foreign worker fees related to their hiring',
  29: 'Did not ensure the worker was not charged fees by recruiters or hiring agents',
  30: 'Did not obtain and pay for private health insurance for worker not covered by provincial plan',
}

export function expandViolationReasons(rawReasons: string): number[] {
  if (!rawReasons) return []
  return rawReasons
    .split(/[,;]/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 30)
}
