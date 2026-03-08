import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
}

// Disable Next.js fetch cache — search results must always be fresh
const fetchNoCache: typeof fetch = (url, options) =>
  fetch(url, { ...options, cache: 'no-store' })

// Read-only client using anon key (for verify queries)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchNoCache },
})

// Privileged client using service role key (for writes and admin)
// Falls back to anon key if service key not set (requires permissive RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  { global: { fetch: fetchNoCache } }
)
