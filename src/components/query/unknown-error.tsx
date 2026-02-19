import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UnknownErrorProps {
  error?: Error;
  message?: string;
}

/**
 * UnknownError Component
 *
 * Displayed for unexpected server errors or unhandled error codes.
 * Shows generic error message - never exposes internal error details.
 */
export function UnknownError({ message }: UnknownErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto w-fit rounded-full bg-red-50 p-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Something Went Wrong
        </h2>
        <p className="text-gray-600">
          {message ??
            "We encountered an unexpected error. Please try again. If the problem persists, contact support."}
        </p>
        <Button asChild>
          <Link href="/app">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
