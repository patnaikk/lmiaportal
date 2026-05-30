import { supabaseAdmin } from '@/lib/supabase'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Search = { e?: string; t?: string }

async function processUnsubscribe(email?: string, token?: string): Promise<'ok' | 'invalid' | 'error'> {
  if (!email || !token || !verifyUnsubscribeToken(email, token)) return 'invalid'
  const { error } = await supabaseAdmin
    .from('monthly_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim())
    .is('unsubscribed_at', null)
  return error ? 'error' : 'ok'
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Search }) {
  const result = await processUnsubscribe(searchParams.e, searchParams.t)

  const messages = {
    ok: { title: 'You’re unsubscribed', body: 'You won’t receive the monthly enforcement report anymore. You can re-subscribe anytime at lmiacheck.ca.' },
    invalid: { title: 'Link not valid', body: 'This unsubscribe link is invalid or incomplete. If you keep getting emails, reply to one and we’ll remove you.' },
    error: { title: 'Something went wrong', body: 'We couldn’t process that just now. Please try again, or reply to any email to be removed.' },
  }[result]

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full card-elevated rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{messages.title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{messages.body}</p>
        <Link href="/" className="inline-block text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl px-5 py-2.5 transition-colors">
          Back to LMIA Check
        </Link>
      </div>
    </div>
  )
}
