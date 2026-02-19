"use client";

import { api } from "../../../convex/_generated/api";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { QueryState } from "@/components/query";
import { AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

/**
 * Helper to get the current projectId from the URL pathname.
 */
function getProjectIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

function CreditWarningBannerContent({ credits }: { credits: { credits: number } }) {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = getProjectIdFromPathname(pathname);

  // Don't show banner if credits are sufficient
  if (credits.credits >= 50) {
    return null;
  }

  const isCritical = credits.credits < 20;
  const billingUrl = projectId
    ? `/projects/${projectId}/settings/billing`
    : "/app?redirect=settings/billing";

  return (
    <div
      className={`w-full ${
        isCritical
          ? "bg-danger/10 border-b border-danger/20"
          : "bg-warning/10 border-b border-warning/20"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {isCritical ? (
              <XCircle className="h-5 w-5 text-danger shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            )}
            <div className="min-w-0">
              <p
                className={`text-sm font-medium ${
                  isCritical ? "text-danger" : "text-warning"
                }`}
              >
                {isCritical
                  ? "You're out of credits!"
                  : "Your credits are running low"}
              </p>
              <p
                className={`text-xs ${
                  isCritical ? "text-danger/80" : "text-warning/80"
                } mt-0.5`}
              >
                {isCritical
                  ? `Only ${credits.credits} credits remaining. Purchase more credits to continue generating articles.`
                  : `${credits.credits} credits remaining. Consider purchasing more credits to avoid interruptions.`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className={`shrink-0 ${
              isCritical
                ? "bg-danger hover:bg-danger/90 text-white"
                : "bg-warning hover:bg-warning/90 text-white"
            }`}
            onClick={() => router.push(billingUrl)}
          >
            Buy Credits
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CreditWarningBanner() {
  const creditsQuery = useQueryWithStatus(api.users.getCredits, {});

  return (
    <QueryState
      query={creditsQuery}
      pending={null}
      empty={null}
    >
      {(credits) => <CreditWarningBannerContent credits={credits} />}
    </QueryState>
  );
}
