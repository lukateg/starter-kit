import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - [Your Company]",
  description:
    "Privacy Policy for [Your Company] - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/"
          className="text-foreground/70 hover:text-foreground mb-8 inline-block transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-12">
          Last Updated: [DATE]
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              [Your Company] (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
              operates the website [your-domain.com] and the [Your Company] platform (the
              &quot;Service&quot;). This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              Service. We are committed to protecting your privacy and handling
              your data transparently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.1 Account Information
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              When you create an account, we collect your name, email address,
              and profile image. Account authentication is managed by
              our third-party authentication provider, Clerk. If you sign up
              using a social login provider (such as Google), we receive the
              profile information you authorize that provider to share.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.2 Project Information
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              During use of the Service, you may provide project names,
              descriptions, and other information related to your use of the platform.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.3 Payment Information
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Payments are processed by LemonSqueezy. We do not directly
              collect or store your credit card number or full payment details.
              We receive and store order identifiers, customer identifiers,
              purchase amounts, currency, and credit transaction records from
              LemonSqueezy to manage your account balance.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.4 Automatically Collected Information
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, click
                interactions, and time spent on the Service
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, screen resolution, IP address, and user agent
              </li>
              <li>
                <strong>Cookies:</strong> Session data, consent preferences, and
                analytics identifiers (see Section 7 for details)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                Provide, operate, and maintain the Service
              </li>
              <li>
                Process payments and manage your credit balance
              </li>
              <li>
                Send you transactional emails, including service updates
              </li>
              <li>
                Analyze usage patterns to improve the user experience and
                develop new features
              </li>
              <li>
                Detect, prevent, and address technical issues, fraud, and abuse
              </li>
              <li>
                Send you marketing communications (you can opt out at any time
                via email preferences or unsubscribe links)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Third-Party Services and Data Sharing
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We share your information with the following categories of
              third-party service providers, solely for the purposes described
              in this policy:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.1 Infrastructure and Database
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We use Convex as our backend database and serverless functions
              provider. Your account data and project data are stored in Convex.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.2 Authentication
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Clerk manages user authentication, including sign-up, sign-in,
              session management, and account security. Clerk receives your
              name, email, and profile image.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.3 Analytics
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We use PostHog for product analytics. If you consent to analytics
              cookies, PostHog receives usage data. PostHog analytics are
              loaded only after you provide consent.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.4 Payments
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              LemonSqueezy processes all payments. When you make a purchase,
              LemonSqueezy receives your email address, payment details, and
              billing information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.5 Email
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We use Resend to deliver transactional and marketing emails. Your
              email address and name are shared with Resend for this purpose.
              You can manage your email preferences or unsubscribe at any time.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.6 Legal and Business Transfers
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              We may disclose your information when required by law, to enforce
              our terms, or to protect our rights. In the event of a merger,
              acquisition, or sale of assets, your information may be
              transferred as part of that transaction. We do not sell your
              personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Data Security
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We implement appropriate technical and organizational measures to
              protect your information. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                HTTPS encryption for all data in transit
              </li>
              <li>
                Authentication and authorization checks on all protected routes
                and API endpoints
              </li>
              <li>
                Webhook signature validation for all inbound webhooks
              </li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-3">
              No method of transmission over the Internet or electronic storage
              is completely secure. While we strive to protect your information,
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Your Rights
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Depending on your location, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you
              </li>
              <li>
                <strong>Rectification:</strong> Request correction of inaccurate
                or incomplete data
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data in a
                machine-readable format
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your data
                for specific purposes
              </li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at
              privacy@[your-domain.com].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use cookies and similar technologies on our Service. Our cookie
              consent banner allows you to manage your preferences before any
              non-essential cookies are set.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              You can change your cookie preferences at any time by clearing
              your cookies and revisiting our website, at which point the
              consent banner will appear again.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Contact Us
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Email:</strong> privacy@[your-domain.com]
              <br />
              <strong>Location:</strong> [Your Location]
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="text-foreground/70 hover:text-foreground font-semibold transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
