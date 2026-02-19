import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotFoundErrorProps {
  message?: string;
}

/**
 * NotFoundError Component
 *
 * Displayed when a requested resource doesn't exist.
 * Shows not found message with link back to dashboard.
 */
export function NotFoundError({ message }: NotFoundErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto w-fit rounded-full bg-gray-100 p-4">
          <FileQuestion className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Not Found</h2>
        <p className="text-gray-600">
          {message ??
            "The resource you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild>
          <Link href="/app">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
