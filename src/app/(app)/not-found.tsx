import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

/**
 * App 404 Page
 *
 * Displayed when a user navigates to a route that doesn't exist
 * within the (app) route group. Renders with the app sidebar.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-muted p-4">
          <FileQuestion className="h-12 w-12 text-muted-foreground/60" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Page Not Found
        </h1>
        <p className="mb-6 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/app">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
