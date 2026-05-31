import Link from 'next/link'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LMIA Check',
  description:
    'How lmiacheck.ca handles analytics, search queries, and email sign-ups. PIPEDA-aligned privacy policy for a public data aggregator.',
  alternates: { canonical: 'https://lmiacheck.ca/privacy' },
  robots: { index: true, follow: true },
}

const EFFECTIVE_DATE = 'May 30, 2026'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-gray-600 leading-relaxed mb-3">{children}</p>
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mb-6">Effective {EFFECTIVE_DATE}</p>

        <P>
          This policy explains what limited information lmiacheck.ca (the &ldquo;Site&rdquo;) collects
          and why. We aim to collect as little personal information as possible. We do not sell your
          personal information.
        </P>

        <H2>1. Information we collect</H2>
        <P>
          <span className="font-semibold">Search queries.</span> When you check an employer, the name you
          type (and any city/province you add) is processed to return a result and is logged in our
          database (hosted on Supabase) in aggregate to monitor usage, detect abuse, improve matching,
          and understand which employers people look up. We ask you not to enter personal information
          about yourself into the search box; the search box is intended for employer names only.
        </P>
        <P>
          <span className="font-semibold">Email address (optional).</span> If you choose to sign up for
          change alerts, we store the email address you provide together with the employer you asked us
          to watch, so we can notify you when the official record changes. You can unsubscribe at any
          time using the link in any email or our{' '}
          <Link className="text-blue-600 underline" href="/unsubscribe">
            unsubscribe page
          </Link>
          .
        </P>
        <P>
          <span className="font-semibold">Analytics &amp; telemetry.</span> We use basic website analytics
          (such as Google Analytics) to understand aggregate traffic — pages viewed, approximate region,
          device and browser type, and referring source. These tools may set cookies or use similar
          identifiers and may collect a truncated/anonymised IP address. We use this only in aggregate to
          improve the Site.
        </P>
        <P>
          <span className="font-semibold">Server logs.</span> Like most websites, our hosting providers
          automatically record standard technical request logs (IP address, timestamp, user agent) for
          security and reliability.
        </P>

        <H2>2. How we use information</H2>
        <P>
          We use the limited information above to: operate and secure the Site; return your search result;
          send the change alerts you requested; detect and prevent abuse, fraud, and technical problems;
          and analyse aggregate usage to improve the service. We do not use your information to make
          decisions about you, and we do not build advertising profiles.
        </P>

        <H2>3. Legal basis &amp; consent</H2>
        <P>
          We rely on your consent and on our legitimate interest in operating a secure, useful public
          information service, consistent with Canada&rsquo;s Personal Information Protection and
          Electronic Documents Act (PIPEDA). Providing an email for alerts is entirely optional and based
          on your express opt-in.
        </P>

        <H2>4. Sharing &amp; service providers</H2>
        <P>
          We share information only with the service providers that help us run the Site — for example our
          database/hosting provider (Supabase), our web host/CDN (Vercel), our email-delivery provider,
          and our analytics provider (Google) — and only as needed to provide those services. Some of
          these providers may process or store data outside Canada (including in the United States); by
          using the Site you acknowledge this cross-border processing. We may also disclose information
          where required by law.
        </P>

        <H2>5. Retention</H2>
        <P>
          We keep aggregated search logs only as long as useful for the purposes above, then delete or
          de-identify them. Alert email addresses are kept until you unsubscribe or ask us to delete them.
        </P>

        <H2>6. Cookies</H2>
        <P>
          The Site uses a small number of cookies/identifiers for analytics and basic functionality. You
          can block or delete cookies in your browser settings; the core employer-check function works
          without them.
        </P>

        <H2>7. Your choices and rights</H2>
        <P>
          Under PIPEDA you may request access to, correction of, or deletion of the personal information
          we hold about you (which is generally limited to an alert email address). To make a request,
          unsubscribe, or ask a privacy question, email{' '}
          <a className="text-blue-600 underline" href="mailto:privacy@lmiacheck.ca">
            privacy@lmiacheck.ca
          </a>
          . You also have the right to complain to the Office of the Privacy Commissioner of Canada.
        </P>

        <H2>8. Children</H2>
        <P>The Site is not directed to children and we do not knowingly collect their personal information.</P>

        <H2>9. Government data is not covered by this policy</H2>
        <P>
          Information about employers shown on the Site comes from public Government of Canada datasets and
          is not personal information that we collect about you. See our{' '}
          <Link className="text-blue-600 underline" href="/terms">
            Terms of Use &amp; Legal Disclaimer
          </Link>{' '}
          for how that data is handled.
        </P>

        <H2>10. Changes &amp; contact</H2>
        <P>
          We may update this policy; the effective date above will change accordingly. Questions:{' '}
          <a className="text-blue-600 underline" href="mailto:privacy@lmiacheck.ca">
            privacy@lmiacheck.ca
          </a>
          .
        </P>

        <p className="text-xs text-gray-400 leading-relaxed mt-10 border-t border-gray-200 pt-5">
          This document is a general template and not a substitute for advice from a licensed lawyer.
          Have it reviewed by Ontario/Canadian counsel, and confirm it matches your actual analytics,
          email, and hosting providers before publishing.
        </p>
      </main>
      <Footer />
    </div>
  )
}
