import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Last updated: March 11, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <p>
          Signa Labs Inc. (&quot;Signa Labs&quot;, &quot;we&quot;,
          &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you use our platform at
          signalabs.com (the &quot;Service&quot;).
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Information You Provide</h3>
        <ul>
          <li>
            <strong>Account information:</strong> When you create an account, we
            collect your name, email address, and authentication credentials
            (managed by our authentication provider, Clerk).
          </li>
          <li>
            <strong>Profile information:</strong> Display name, preferred
            programming languages, editor preferences, and learning goals you
            choose to provide.
          </li>
          <li>
            <strong>Code submissions:</strong> Code you write and submit while
            completing exercises on the platform.
          </li>
          <li>
            <strong>Communications:</strong> Messages you send to us through
            support channels or feedback forms.
          </li>
        </ul>

        <h3>1.2 Information Collected Automatically</h3>
        <ul>
          <li>
            <strong>Usage data:</strong> Exercise completion history, time spent
            on exercises, learning path progress, and performance analytics.
          </li>
          <li>
            <strong>Device information:</strong> Browser type, operating system,
            device type, and screen resolution.
          </li>
          <li>
            <strong>Log data:</strong> IP address, access times, pages viewed,
            and referring URLs.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> See our{' '}
            <Link href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>{' '}
            for details.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service.</li>
          <li>
            Personalize your learning experience, including AI-generated
            exercises and feedback tailored to your skill level.
          </li>
          <li>
            Track your progress across exercises and learning paths.
          </li>
          <li>
            Generate performance analytics and insights to help you improve.
          </li>
          <li>
            Send you transactional emails (account verification, password
            resets) and, with your consent, promotional communications.
          </li>
          <li>Detect, prevent, and address technical issues and abuse.</li>
          <li>
            Comply with legal obligations and enforce our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            .
          </li>
        </ul>

        <h2>3. AI-Generated Content and Your Code</h2>
        <p>
          Our Service uses artificial intelligence to generate exercises,
          provide code feedback, and create teaching content. When you interact
          with these features:
        </p>
        <ul>
          <li>
            Your code submissions may be sent to third-party AI providers
            (such as Anthropic) for processing. These providers process data
            according to their own privacy policies and data processing
            agreements we have in place.
          </li>
          <li>
            We do not use your code submissions to train AI models.
          </li>
          <li>
            AI-generated feedback and exercise content is stored alongside
            your account data to provide a continuous learning experience.
          </li>
        </ul>

        <h2>4. How We Share Your Information</h2>
        <p>
          We do not sell your personal information. We may share your
          information in the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Service providers:</strong> Third-party vendors who help us
            operate the Service, including cloud hosting (Vercel), authentication
            (Clerk), database hosting (Neon), and AI providers (Anthropic).
          </li>
          <li>
            <strong>Team features:</strong> If you are part of a Team plan,
            your progress data and exercise completions may be visible to your
            team administrators.
          </li>
          <li>
            <strong>Legal requirements:</strong> When required by law, court
            order, or governmental regulation.
          </li>
          <li>
            <strong>Business transfers:</strong> In connection with a merger,
            acquisition, or sale of assets, your information may be transferred
            as part of that transaction.
          </li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your account data and exercise history for as long as your
          account is active. If you delete your account, we will delete or
          anonymize your personal information within 30 days, except where we
          are required to retain it for legal or legitimate business purposes.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your
          information, including encryption in transit (TLS) and at rest,
          access controls, and regular security reviews. However, no method of
          electronic transmission or storage is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2>7. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Correct inaccurate or incomplete information.</li>
          <li>Delete your personal information.</li>
          <li>Export your data in a portable format.</li>
          <li>Object to or restrict certain processing activities.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{' '}
          <a
            href="mailto:privacy@signalabs.com"
            className="text-primary hover:underline"
          >
            privacy@signalabs.com
          </a>
          .
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your country of residence. We ensure appropriate
          safeguards are in place for such transfers, including standard
          contractual clauses where required.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          The Service is not directed to children under 13. We do not
          knowingly collect personal information from children under 13. If
          you believe we have collected information from a child under 13,
          please contact us immediately.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of material changes by posting the updated policy on this page
          and updating the &quot;Last updated&quot; date. Your continued use
          of the Service after changes constitutes acceptance of the updated
          policy.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us
          at:
        </p>
        <ul>
          <li>
            Email:{' '}
            <a
              href="mailto:privacy@signalabs.com"
              className="text-primary hover:underline"
            >
              privacy@signalabs.com
            </a>
          </li>
          <li>
            Or visit our{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact page
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
