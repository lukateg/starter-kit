"use client";

import { api } from "../../../convex/_generated/api";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { QueryState } from "@/components/query";
import { Coins, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Helper to get the current projectId from the URL pathname.
 */
function getProjectIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

function CreditDisplayLoading() {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
      <span className="text-muted-foreground">Loading...</span>
    </div>
  );
}

function CreditDisplayContent({ credits }: { credits: { credits: number } }) {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = getProjectIdFromPathname(pathname);
  const isLowCredits = credits.credits < 50; // Warning threshold
  const isCriticalCredits = credits.credits < 20; // Critical threshold

  const billingUrl = projectId
    ? `/projects/${projectId}/settings/billing`
    : "/app?redirect=settings/billing";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex items-center gap-3 text-sm font-medium text-foreground/80"
            onClick={() => router.push(billingUrl)}
          >
            <Coins
              className={`h-5 w-5 shrink-0 ${
                isCriticalCredits
                  ? "text-danger"
                  : isLowCredits
                    ? "text-warning"
                    : "text-success"
              }`}
            />
            <span
              className={`font-medium ${
                isCriticalCredits
                  ? "text-danger"
                  : isLowCredits
                    ? "text-warning"
                    : "text-foreground/80"
              }`}
            >
              {credits.credits}
              {" "}credits
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-background text-black">
          <div className="text-sm bg-background text-black">
            <p className="font-medium">{credits.credits} credits available</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Click to purchase more</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CreditDisplay() {
  const creditsQuery = useQueryWithStatus(api.users.getCredits, {});

  return (
    <QueryState
      query={creditsQuery}
      pending={<CreditDisplayLoading />}
      empty={null}
    >
      {(credits) => <CreditDisplayContent credits={credits} />}
    </QueryState>
  );
}
