import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotAuthorizedProps {
  message?: string;
}

/**
 * NotAuthorized Component
 *
 * Displayed when user lacks permission to access a resource.
 * Shows access denied message with link back to dashboard.
 */
export function NotAuthorized({ message }: NotAuthorizedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto w-fit rounded-full bg-muted p-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">
          {message ??
            "You don't have permission to access this resource. Contact the project owner for an invitation."}
        </p>
        <Button asChild>
          <Link href="/app">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
