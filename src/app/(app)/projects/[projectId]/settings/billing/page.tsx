"use client";

import { Suspense } from "react";
import { Coins, CreditCard, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../../../../../convex/_generated/api";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useMetaPixel } from "@/app/hooks/useMetaPixel";
import {
  CREDIT_PACKAGES,
  CREDIT_COSTS_DISPLAY,
} from "@/lib/pricing";

// Map variant IDs from environment variables
// IMPORTANT: Next.js only inlines NEXT_PUBLIC_* env vars when accessed as literal strings
// Dynamic access like process.env[varName] does NOT work - the values must be hardcoded
const VARIANT_IDS: Record<string, string> = {
  "NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID":
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID || "",
  "NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID":
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID || "",
};

// Transform packages for use in this component (add runtime variantId)
const creditPackages = CREDIT_PACKAGES.map((pkg) => ({
  ...pkg,
  variantId: VARIANT_IDS[pkg.variantEnvKey] || "",
}));

function BillingContent() {
  const params = useParams();
  const projectId = params.projectId as string;
  const searchParams = useSearchParams();
  const userCreditsQuery = useQueryWithStatus(api.users.getCredits, {});
  const transactionsQuery = useQueryWithStatus(api.users.getCreditTransactions, {
    limit: 10,
  });
  const userCredits = userCreditsQuery.data;
  const transactions = transactionsQuery.data;
  const { trackEvent } = useMetaPixel();
  const hasTrackedPurchase = useRef(false);

  const isLoading = userCredits === undefined;
  const [purchasingVariantId, setPurchasingVariantId] = useState<string | null>(
    null
  );

  // Track Purchase event when returning from successful checkout
  useEffect(() => {
    const success = searchParams.get("success");

    if (
      success === "true" &&
      !hasTrackedPurchase.current &&
      transactions &&
      transactions.length > 0
    ) {
      hasTrackedPurchase.current = true;

      // Get the most recent purchase transaction
      const recentPurchase = transactions.find(
        (tx) => tx.description.includes("Purchased") && tx.amount > 0
      );

      if (recentPurchase) {
        // Extract package info from description (e.g., "Purchased Standard package (630 credits) - Order 12345")
        const packageMatch = recentPurchase.description.match(
          /Purchased (\w+) package/
        );
        const packageName = packageMatch ? packageMatch[1] : "Unknown";

        // Determine purchase value from package
        const priceMap: Record<string, number> = {
          Standard: 69,
          Premium: 169,
        };
        const purchaseValue = priceMap[packageName] || 0;

        // Get event_id from transaction metadata for deduplication with Conversion API
        const eventId = (recentPurchase.metadata as { eventId?: string })
          ?.eventId;

        // Track Purchase event to Meta Pixel with event_id for deduplication
        trackEvent(
          "Purchase",
          {
            value: purchaseValue,
            currency: "USD",
            content_name: `${packageName} Credit Package`,
            content_type: "product",
            num_items: 1,
          },
          { eventID: eventId }
        ); // Meta Pixel uses eventID (capital ID)

        // Show success toast
        toast.success(`Successfully purchased ${packageName} package!`);

        // Clean up URL without page reload
        window.history.replaceState({}, "", `/projects/${projectId}/settings/billing`);
      }
    }
  }, [searchParams, transactions, trackEvent, projectId]);

  const handlePurchase = async (variantId: string, packageName: string) => {
    if (!variantId) {
      toast.error(
        "This package is not yet configured. Please contact support."
      );
      return;
    }

    setPurchasingVariantId(variantId);

    try {
      // Generate unique event ID for deduplication between browser pixel and Conversion API
      const eventId = `purchase_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          packageName,
          eventId, // Pass to backend for webhook tracking
          projectId, // For redirect URL after checkout
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to LemonSqueezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to start checkout. Please try again.");
      setPurchasingVariantId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Billing & Credits
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Credits never expire • Use like a subscription without being locked in
          </p>
        </div>

      </div>

      {/* Credit Packages */}
      <div>
        <div className="grid md:grid-cols-2 gap-6">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.credits}
              className={`relative ${pkg.bgColor} rounded-2xl p-8 flex flex-col ${pkg.popular ? "border-2 border-foreground" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-foreground text-background px-4 py-1 text-sm font-semibold hover:bg-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">
                    ${pkg.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pkg.credits.toLocaleString()} credits - one-time payment
                </p>
                {pkg.savings && (
                  <div className="mt-2 inline-block bg-warning/20 text-warning text-xs px-2 py-1 rounded-full font-semibold">
                    {pkg.savings}
                  </div>
                )}
                {pkg.monthsOfContent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({pkg.monthsOfContent})
                  </p>
                )}
              </div>

              <p className="text-foreground/80 mb-6 text-sm leading-relaxed">
                {pkg.description}
              </p>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-foreground/80">
                    {pkg.credits.toLocaleString()} credits included
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-foreground/80">
                    Access to all features
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-foreground/80">
                    Team collaboration
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-foreground/80">
                    Credits never expire
                  </span>
                </div>
              </div>

              <Button
                className={`w-full ${pkg.popular ? "bg-foreground hover:bg-foreground/90 text-background" : "bg-background hover:bg-muted text-foreground border border-border"}`}
                onClick={() => handlePurchase(pkg.variantId, pkg.name)}
                disabled={purchasingVariantId === pkg.variantId}
              >
                {purchasingVariantId === pkg.variantId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Purchase credits`
                )}
              </Button>

              <div className="text-xs text-center text-muted-foreground mt-3">
                ${pkg.perCreditCost.toFixed(3)} per credit
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Costs Reference */}
      <Card>
        <CardHeader>
          <CardTitle>How Credits Work</CardTitle>
          <CardDescription>
            Credits are deducted only when you use these features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {CREDIT_COSTS_DISPLAY.map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{item.action}</span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {item.cost} credits
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your credit usage history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="max-h-72 overflow-auto">
              {" "}
              {/* max-h-72 ~ 18rem, adjust as needed */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.description}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.amount > 0 ? "text-success" : "text-foreground"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {tx.balanceAfter}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-2 text-muted-foreground/40" />
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method (Placeholder for future Stripe integration) */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Securely manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground/60" />
              <div>
                <div className="text-sm font-medium">No payment method</div>
                <div className="text-xs text-muted-foreground">
                  Add a card to purchase credits
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Add Card
              <span className="ml-2 text-xs text-muted-foreground/60">(Coming soon)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component
function BillingLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/60 mx-auto" />
        <p className="text-muted-foreground mt-4">Loading billing...</p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <Suspense fallback={<BillingLoading />}>
          <BillingContent />
        </Suspense>
      </div>
    </div>
  );
}
