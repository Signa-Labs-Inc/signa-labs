import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Last updated: March 11, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of the Signa Labs platform at signalabs.com (the
          &quot;Service&quot;), operated by Signa Labs Inc. (&quot;Signa
          Labs&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By
          creating an account or using the Service, you agree to be bound by
          these Terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years of age to use the Service. If you are
          under 18, you represent that you have your parent or guardian&apos;s
          consent to use the Service. By using the Service, you represent and
          warrant that you meet these requirements.
        </p>

        <h2>2. Account Registration</h2>
        <ul>
          <li>
            You must provide accurate and complete information when creating
            an account.
          </li>
          <li>
            You are responsible for maintaining the security of your account
            credentials.
          </li>
          <li>
            You are responsible for all activity that occurs under your
            account.
          </li>
          <li>
            You must notify us immediately if you suspect unauthorized access
            to your account.
          </li>
          <li>
            We reserve the right to suspend or terminate accounts that
            violate these Terms.
          </li>
        </ul>

        <h2>3. Subscription Plans and Billing</h2>

        <h3>3.1 Free Plan</h3>
        <p>
          The Free plan provides limited access to the Service at no cost. We
          reserve the right to modify the features and limitations of the Free
          plan at any time.
        </p>

        <h3>3.2 Paid Plans</h3>
        <ul>
          <li>
            Paid subscriptions (Pro, Team) are billed on a recurring monthly
            basis at the rate displayed at the time of purchase.
          </li>
          <li>
            Payment is due at the beginning of each billing cycle. Failure to
            pay may result in suspension or downgrade of your account.
          </li>
          <li>
            All fees are non-refundable except as required by applicable law
            or as explicitly stated in these Terms.
          </li>
          <li>
            We may change subscription pricing with 30 days&apos; notice.
            Continued use after a price change constitutes acceptance.
          </li>
        </ul>

        <h3>3.3 Cancellation</h3>
        <p>
          You may cancel your paid subscription at any time. Cancellation
          takes effect at the end of the current billing period. You will
          retain access to paid features until the end of the period you have
          already paid for.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the Service to write, store, or distribute malicious code,
            malware, or any code intended to harm systems or individuals.
          </li>
          <li>
            Attempt to circumvent rate limits, access controls, or other
            security measures of the Service.
          </li>
          <li>
            Use automated tools (bots, scrapers) to access the Service
            without our written permission.
          </li>
          <li>
            Share your account credentials with others or operate multiple
            free accounts to circumvent plan limitations.
          </li>
          <li>
            Submit code or content that infringes the intellectual property
            rights of any third party.
          </li>
          <li>
            Use the Service to generate or distribute content that is
            unlawful, harmful, threatening, abusive, or otherwise
            objectionable.
          </li>
          <li>
            Reverse-engineer, decompile, or disassemble any part of the
            Service.
          </li>
          <li>
            Resell, redistribute, or commercially exploit the Service or its
            content without authorization.
          </li>
        </ul>

        <h2>5. Your Code and Content</h2>

        <h3>5.1 Ownership</h3>
        <p>
          You retain ownership of the code you write and submit on the
          platform. We do not claim ownership of your code submissions.
        </p>

        <h3>5.2 License Grant</h3>
        <p>
          By submitting code to the Service, you grant Signa Labs a
          non-exclusive, worldwide, royalty-free license to store, process,
          and display your code as necessary to operate the Service. This
          includes sending your code to AI providers for feedback generation.
          We will not use your code to train AI models, share it publicly, or
          distribute it to third parties outside of what is necessary to
          provide the Service.
        </p>

        <h3>5.3 AI-Generated Content</h3>
        <p>
          The Service generates exercises, feedback, and teaching content
          using artificial intelligence. AI-generated content is provided
          &quot;as is&quot; and may contain errors or inaccuracies. You should
          not rely on AI-generated code for production use without independent
          review.
        </p>

        <h2>6. Platform Content and Exercises</h2>

        <h3>6.1 Signa Labs Content</h3>
        <p>
          All exercises, learning paths, teaching content, and other
          materials created by Signa Labs are our intellectual property or
          licensed to us. You may use this content solely for personal
          learning through the Service.
        </p>

        <h3>6.2 User-Generated Exercises</h3>
        <p>
          Exercises you generate through the AI exercise generator are for
          your personal use within the Service. We reserve the right to
          review and remove user-generated content that violates these Terms.
        </p>

        <h2>7. Availability and Modifications</h2>
        <ul>
          <li>
            We strive to maintain high availability but do not guarantee
            uninterrupted access. The Service may be temporarily unavailable
            for maintenance, updates, or due to circumstances beyond our
            control.
          </li>
          <li>
            We may modify, suspend, or discontinue any feature of the
            Service at any time. For material changes that negatively affect
            paid subscribers, we will provide reasonable notice.
          </li>
          <li>
            We reserve the right to impose or modify usage limits on Free
            plan accounts.
          </li>
        </ul>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
          AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
          THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR AVAILABLE AT ALL
          TIMES.
        </p>
        <p>
          AI-generated exercises, feedback, and code suggestions are
          educational tools and should not be treated as professional advice.
          We make no warranty regarding the accuracy, completeness, or
          reliability of AI-generated content.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIGNA LABS AND ITS
          OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT
          LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS
          INTERRUPTION.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE
          SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS
          PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Signa Labs and its
          officers, directors, employees, and agents from any claims,
          damages, losses, or expenses (including reasonable attorney&apos;s
          fees) arising from your use of the Service, violation of these
          Terms, or infringement of any third-party rights.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate your access to the Service at any time
          for violation of these Terms, with or without notice. Upon
          termination:
        </p>
        <ul>
          <li>Your right to use the Service immediately ceases.</li>
          <li>
            We may delete your account data after 30 days, subject to legal
            retention requirements.
          </li>
          <li>
            You may request an export of your data before or within 30 days
            of termination.
          </li>
          <li>
            Provisions that by their nature should survive termination
            (including Sections 8, 9, 10, and 12) will survive.
          </li>
        </ul>

        <h2>12. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by and construed in accordance with the
          laws of the State of Delaware, United States, without regard to
          conflict of law principles. Any disputes arising from these Terms
          or the Service shall be resolved through binding arbitration in
          accordance with the rules of the American Arbitration Association,
          except that either party may seek injunctive relief in a court of
          competent jurisdiction.
        </p>

        <h2>13. General Provisions</h2>
        <ul>
          <li>
            <strong>Entire agreement:</strong> These Terms, together with our{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            , constitute the entire agreement between you and Signa Labs.
          </li>
          <li>
            <strong>Severability:</strong> If any provision of these Terms is
            found to be unenforceable, the remaining provisions will continue
            in effect.
          </li>
          <li>
            <strong>Waiver:</strong> Failure to enforce any provision of
            these Terms does not constitute a waiver of that provision.
          </li>
          <li>
            <strong>Assignment:</strong> You may not assign your rights under
            these Terms. We may assign our rights without restriction.
          </li>
        </ul>

        <h2>14. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of
          material changes by email or by posting a notice on the Service at
          least 30 days before the changes take effect. Your continued use of
          the Service after the effective date constitutes acceptance of the
          updated Terms.
        </p>

        <h2>15. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at{' '}
          <a
            href="mailto:legal@signalabs.com"
            className="text-primary hover:underline"
          >
            legal@signalabs.com
          </a>{' '}
          or visit our{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
