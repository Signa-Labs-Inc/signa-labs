import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Last updated: March 11, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <p>
          This Cookie Policy explains how Signa Labs Inc. (&quot;Signa
          Labs&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) uses
          cookies and similar technologies when you visit our platform at
          signalabs.com (the &quot;Service&quot;). It explains what these
          technologies are, why we use them, and your rights to control their
          use.
        </p>

        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device when you visit a
          website. They are widely used to make websites work more efficiently
          and to provide information to the website owners. Cookies can be
          &quot;persistent&quot; (remaining on your device until they expire or
          you delete them) or &quot;session&quot; cookies (deleted when you
          close your browser).
        </p>

        <h2>2. Cookies We Use</h2>

        <h3>2.1 Strictly Necessary Cookies</h3>
        <p>
          These cookies are essential for the Service to function. They cannot
          be disabled.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>__clerk_db_jwt</code></td>
                <td>Authentication session managed by Clerk</td>
                <td>Session</td>
              </tr>
              <tr>
                <td><code>__client_uat</code></td>
                <td>Authentication state token</td>
                <td>Session</td>
              </tr>
              <tr>
                <td><code>__session</code></td>
                <td>Session identification</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>2.2 Functional Cookies</h3>
        <p>
          These cookies enable enhanced functionality and personalization.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Cookie / Storage</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>sidebar-collapsed</code></td>
                <td>Remembers your navigation layout preference</td>
                <td>Persistent (localStorage)</td>
              </tr>
              <tr>
                <td><code>theme</code></td>
                <td>Stores your light/dark mode preference</td>
                <td>Persistent (localStorage)</td>
              </tr>
              <tr>
                <td><code>draft-code-*</code></td>
                <td>Auto-saves your in-progress code so you don&apos;t lose work</td>
                <td>Persistent (localStorage)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>2.3 Analytics Cookies</h3>
        <p>
          We may use analytics cookies to understand how visitors interact
          with the Service. These help us measure and improve performance.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>_va</code></td>
                <td>Vercel Analytics</td>
                <td>Anonymous page view analytics</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>3. Third-Party Cookies</h2>
        <p>
          Our authentication provider (Clerk) sets cookies necessary for
          sign-in and session management. These cookies are governed by
          Clerk&apos;s privacy policy. We do not allow advertising or tracking
          cookies from third parties.
        </p>

        <h2>4. How to Control Cookies</h2>
        <p>You can control cookies through several methods:</p>
        <ul>
          <li>
            <strong>Browser settings:</strong> Most browsers allow you to
            block or delete cookies through their settings. Note that blocking
            strictly necessary cookies will prevent the Service from
            functioning.
          </li>
          <li>
            <strong>localStorage:</strong> You can clear localStorage data
            through your browser&apos;s developer tools (Application &gt;
            Local Storage &gt; Clear All).
          </li>
        </ul>
        <p>
          Please note that if you disable cookies, some features of the
          Service may not work properly. For example, you will not be able to
          stay signed in, and your editor preferences will not be saved.
        </p>

        <h2>5. Do Not Track</h2>
        <p>
          Some browsers send a &quot;Do Not Track&quot; (DNT) signal. There
          is currently no industry standard for how websites should respond to
          DNT signals. We do not currently respond to DNT signals, but we do
          not engage in cross-site tracking.
        </p>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect
          changes in technology, regulation, or our practices. We will post
          the updated policy on this page with a new &quot;Last updated&quot;
          date.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have questions about our use of cookies, please contact us
          at{' '}
          <a
            href="mailto:privacy@signalabs.com"
            className="text-primary hover:underline"
          >
            privacy@signalabs.com
          </a>{' '}
          or visit our{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact page
          </Link>
          .
        </p>

        <p>
          For more information about how we handle your data, see our{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
