"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * Global Error Boundary (Root Level)
 *
 * This catches errors in the root layout.tsx file.
 * Since root layout errors cannot use the normal layout, this component
 * must include its own html and body tags.
 *
 * This is rare - most errors are caught by error.tsx instead.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f4f6] p-8">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-[#dc2626]/10 p-4">
              <AlertTriangle className="h-12 w-12 text-[#dc2626]" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-[#030711]">
              Something Went Wrong
            </h1>
            <p className="mb-6 text-[#71717a]">
              We encountered an unexpected error. Please try again. If the
              problem persists, contact support.
            </p>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-[#1e40af] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e40af]/90"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-[#e9eaed] bg-white px-4 py-2 text-sm font-medium text-[#030711] hover:bg-[#f4f4f6]"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
