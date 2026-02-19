"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function UnsubscribePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const category = searchParams.get("category");

  const userQuery = useQueryWithStatus(api.emailPreferences.getUserByToken, {
    token: token || "",
  });
  const user = userQuery.data;
  const updatePreferences = useMutation(
    api.emailPreferences.updateEmailPreferences
  );

  const [status, setStatus] = useState<
    "idle" | "confirming" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && status === "idle") {
      setStatus("confirming");
    }
  }, [user, status]);

  const getCategoryLabel = () => {
    if (category === "product_updates") {
      return "product update emails (low credits, account updates)";
    } else if (category === "engagement") {
      return "engagement emails (onboarding, inactive user reminders)";
    }
    return "all non-essential emails";
  };

  const handleUnsubscribe = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      if (category === "product_updates") {
        await updatePreferences({ token, productUpdates: false });
      } else if (category === "engagement") {
        await updatePreferences({ token, engagementEmails: false });
      } else {
        await updatePreferences({ token, allEmails: false });
      }
      setStatus("success");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      if (category === "product_updates") {
        await updatePreferences({
          token,
          productUpdates: true,
          allEmails: true,
        });
      } else if (category === "engagement") {
        await updatePreferences({
          token,
          engagementEmails: true,
          allEmails: true,
        });
      } else {
        await updatePreferences({
          token,
          allEmails: true,
          productUpdates: true,
          engagementEmails: true,
        });
      }
      setStatus("confirming");
    } catch (error) {
      console.error("Failed to resubscribe:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>
              {!token
                ? "Invalid or missing unsubscribe link"
                : "Loading your preferences..."}
            </CardDescription>
          </CardHeader>
          {!token && (
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                The unsubscribe link you used is invalid or expired. Please use
                the link from your email or contact support.
              </p>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go to Homepage
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Unsubscribed Successfully
            </CardTitle>
            <CardDescription>
              You&apos;ve been unsubscribed from {getCategoryLabel()}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>{user.name}</strong>, you won&apos;t receive these
                emails anymore.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Changed your mind?</p>
              <Button
                onClick={handleResubscribe}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Resubscribe"}
              </Button>
            </div>

            {/* <div className="border-t pt-4">
              <Link href={`/settings/email-preferences?token=${token}`}>
                <Button variant="ghost" className="w-full">
                  Manage All Email Preferences
                </Button>
              </Link>
            </div> */}

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Go to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <span>✗</span>
              Something Went Wrong
            </CardTitle>
            <CardDescription>
              We couldn&apos;t process your request. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                If the problem persists, please contact support.
              </p>
            </div>

            <Button
              onClick={() => setStatus("confirming")}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Go to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unsubscribe from Emails</CardTitle>
          <CardDescription>
            We&apos;re sorry to see you go, {user.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-800 font-medium mb-2">
              You&apos;re about to unsubscribe from:
            </p>
            <p className="text-sm text-gray-700">{getCategoryLabel()}</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> You&apos;ll still receive important account
              emails like payment receipts and security alerts.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleUnsubscribe}
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Unsubscribe"}
            </Button>

            {/* <Link href={`/settings/email-preferences?token=${token}`}>
              <Button variant="outline" className="w-full">
                Manage Email Preferences Instead
              </Button>
            </Link> */}
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Never mind, go back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span>Loading...</span>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <UnsubscribePageContent />
    </Suspense>
  );
}
