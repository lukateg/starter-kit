"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

/**
 * App Error Boundary
 *
 * Catches errors in all (app) route group pages.
 * Renders within the app layout (with sidebar).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging (only visible in console, not to users)
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-danger/10 p-4">
          <AlertTriangle className="h-12 w-12 text-danger" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Something Went Wrong
        </h1>
        <p className="mb-6 text-muted-foreground">
          We encountered an unexpected error. Please try again. If the problem
          persists, contact support.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/app">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
