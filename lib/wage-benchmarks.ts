// Static wage benchmarks based on StatsCan Job Bank median wages (2024-2025).
// Covers the most common LMIA occupations. Used to flag suspiciously low offers.

export interface WageBenchmark {
  label: string        // display name shown to user
  keywords: string[]   // matched against job title (case-insensitive, any match)
  minHourly: number    // low end of typical range — below this is a yellow flag
  typicalHourly: number // median — shown to user as reference
}

export const WAGE_BENCHMARKS: WageBenchmark[] = [
  {
    label: 'Restaurant / Food Service Manager',
    keywords: ['restaurant manager', 'food service manager', 'food and beverage manager', 'bar manager', 'cafe manager'],
    minHourly: 20,
    typicalHourly: 26,
  },
  {
    label: 'Cook / Chef',
    keywords: ['cook', 'chef', 'line cook', 'sous chef', 'head chef', 'pastry chef'],
    minHourly: 16,
    typicalHourly: 21,
  },
  {
    label: 'Kitchen Helper / Food Counter Worker',
    keywords: ['kitchen helper', 'dishwasher', 'food counter', 'food service worker', 'food preparer', 'prep cook'],
    minHourly: 15,
    typicalHourly: 17,
  },
  {
    label: 'Truck / Transport Driver',
    keywords: ['truck driver', 'transport driver', 'long haul', 'delivery driver', 'courier', 'transport operator'],
    minHourly: 22,
    typicalHourly: 27,
  },
  {
    label: 'Farm / Agricultural Worker',
    keywords: ['farm worker', 'agricultural worker', 'harvester', 'picker', 'farm labourer', 'greenhouse worker', 'crop worker'],
    minHourly: 15,
    typicalHourly: 17,
  },
  {
    label: 'Caregiver / Personal Support Worker',
    keywords: ['caregiver', 'personal support worker', 'psw', 'home support', 'home care', 'nanny', 'childcare worker', 'elder care'],
    minHourly: 18,
    typicalHourly: 22,
  },
  {
    label: 'Cleaner / Housekeeper',
    keywords: ['cleaner', 'janitor', 'housekeeping', 'custodian', 'janitorial', 'sanitation worker', 'housekeeper'],
    minHourly: 15,
    typicalHourly: 18,
  },
  {
    label: 'Construction / General Labourer',
    keywords: ['construction worker', 'general labour', 'labourer', 'construction labourer', 'site worker', 'helper'],
    minHourly: 18,
    typicalHourly: 24,
  },
  {
    label: 'Welder',
    keywords: ['welder', 'welding'],
    minHourly: 24,
    typicalHourly: 32,
  },
  {
    label: 'Electrician',
    keywords: ['electrician', 'electrical worker', 'electrical technician'],
    minHourly: 30,
    typicalHourly: 42,
  },
  {
    label: 'Security Guard',
    keywords: ['security guard', 'security officer', 'security personnel'],
    minHourly: 17,
    typicalHourly: 20,
  },
  {
    label: 'Retail / Sales Associate',
    keywords: ['retail', 'sales associate', 'cashier', 'store clerk', 'sales clerk'],
    minHourly: 15,
    typicalHourly: 17,
  },
  {
    label: 'Software Developer / Engineer',
    keywords: ['software developer', 'software engineer', 'programmer', 'web developer', 'full stack', 'frontend', 'backend'],
    minHourly: 35,
    typicalHourly: 50,
  },
  {
    label: 'Nurse',
    keywords: ['nurse', 'registered nurse', 'rn', 'lpn', 'licensed practical nurse'],
    minHourly: 35,
    typicalHourly: 45,
  },
  {
    label: 'Accountant / Bookkeeper',
    keywords: ['accountant', 'bookkeeper', 'accounting clerk'],
    minHourly: 25,
    typicalHourly: 35,
  },
  {
    label: 'Meat Cutter / Butcher',
    keywords: ['meat cutter', 'butcher', 'meat packer', 'meat processing'],
    minHourly: 17,
    typicalHourly: 22,
  },
  {
    label: 'Warehouse / Shipping Worker',
    keywords: ['warehouse', 'shipping', 'forklift', 'packer', 'order picker', 'logistics worker'],
    minHourly: 17,
    typicalHourly: 21,
  },
]

// Convert offered wage to hourly equivalent
export function toHourly(wage: number, period: string): number {
  if (period === 'monthly') return wage / 173.33
  if (period === 'annually') return wage / 2080
  return wage // hourly
}

// Find the best matching benchmark for a job title
export function findBenchmark(jobTitle: string): WageBenchmark | null {
  if (!jobTitle) return null
  const lower = jobTitle.toLowerCase()
  return WAGE_BENCHMARKS.find((b) =>
    b.keywords.some((kw) => lower.includes(kw.toLowerCase()))
  ) ?? null
}
