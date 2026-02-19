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
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-red-50 p-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-gray-900">
              Something Went Wrong
            </h1>
            <p className="mb-6 text-gray-600">
              We encountered an unexpected error. Please try again. If the
              problem persists, contact support.
            </p>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
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
