import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - [Your Company]",
  description:
    "Terms of Service for [Your Company].",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-12">
          Last Updated: [DATE]
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing or using [Your Company] (the &quot;Service&quot;), operated
              at [your-domain.com], you agree to be bound by these Terms of
              Service (&quot;Terms&quot;). If you disagree with any part of
              these Terms, you may not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Description of Service
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              [Your Company] is a [describe your service]. The Service allows
              users to [describe key capabilities].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. User Accounts
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              To use the Service, you must create an account. You are
              responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                Providing accurate and complete information during registration
              </li>
              <li>
                Maintaining the security of your account credentials
              </li>
              <li>
                All activities that occur under your account
              </li>
              <li>
                Notifying us immediately of any unauthorized access to your
                account
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Credits and Payments
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              The Service operates on a credit-based system. Credits are used
              to access paid features. New users receive a limited number of
              free credits.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.1 Purchasing Credits
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Additional credits can be purchased through our payment processor,
              LemonSqueezy. All prices are displayed at the time of purchase.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.2 Credit Usage
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Credits are consumed when you use paid features of the Service.
              Credit costs for each action are displayed before you confirm
              the action.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.3 No Subscription
            </h3>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Credits are purchased as one-time packages, not as recurring
              subscriptions. Credits do not expire while your account remains
              active.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.4 Refunds
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              Refunds are provided in accordance with our{" "}
              <Link href="/refund" className="underline hover:text-foreground">
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Acceptable Use
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                Engage in any illegal, harmful, or abusive activity
              </li>
              <li>
                Attempt to gain unauthorized access to our systems or other
                users&apos; accounts
              </li>
              <li>
                Use automated scripts, bots, or scrapers to access the Service
                without our written permission
              </li>
              <li>
                Resell or redistribute access to the Service without our
                written consent
              </li>
              <li>
                Use the Service in any manner that could disable, damage, or
                impair it
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Content Ownership
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              You retain all rights to the content you create using the Service.
              By using the Service, you grant us a limited, non-exclusive
              license to store and process your content solely for the purposes
              of providing the Service.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              The Service, including its design, features, code, and trademarks,
              is owned by [Your Company] and protected by applicable
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Service Availability
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We strive to provide reliable, continuous access to the Service,
              but we do not guarantee uninterrupted availability. The Service
              may be temporarily unavailable due to maintenance, updates, or
              circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, whether express or
              implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              To the maximum extent permitted by applicable law, [Your Company]
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of
              the Service.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Our total aggregate liability for all claims shall not exceed
              the total amount you paid to us in the twelve (12) months
              preceding the event giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Termination
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We may suspend or terminate your account if we reasonably believe
              you have violated these Terms. You may terminate your account at
              any time by deleting it through your account settings.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Upon termination, your right to use the Service ceases
              immediately. Any unused credits are forfeited unless a refund
              is owed under our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify you of material changes by posting the updated Terms on
              this page. Your continued use of the Service after changes are
              posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Governing Law
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of [Your Jurisdiction]. Any disputes shall be subject
              to the exclusive jurisdiction of the courts located in
              [Your Location].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              13. Entire Agreement
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms, together with our{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/refund" className="underline hover:text-foreground">
                Refund Policy
              </Link>
              , constitute the entire agreement between you and [Your Company]
              regarding your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              14. Contact Us
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Email:</strong> support@[your-domain.com]
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
