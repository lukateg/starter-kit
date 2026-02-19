"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

type UserPreferences = {
  _id: string;
  name?: string;
  email: string;
  unsubscribeToken?: string;
  emailPreferences: {
    productUpdates: boolean;
    engagementEmails: boolean;
    allEmails: boolean;
    updatedAt: number;
  };
};

function EmailPreferencesContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If token is provided, use token-based query, otherwise use authenticated user query
  const tokenUserQuery = useQueryWithStatus(
    api.emailPreferences.getUserByToken,
    token ? { token } : "skip"
  );
  const tokenUser = tokenUserQuery.data;

  const authenticatedUserQuery = useQueryWithStatus(
    api.emailPreferences.getCurrentUserPreferences,
    token ? "skip" : undefined
  );
  const authenticatedUser = authenticatedUserQuery.data;

  const updatePreferences = useMutation(
    api.emailPreferences.updateEmailPreferences
  );

  // Determine which user data to use
  const user: UserPreferences | null | undefined = token
    ? tokenUser
    : authenticatedUser;

  const currentPrefs = user?.emailPreferences || {
    productUpdates: true,
    engagementEmails: true,
    allEmails: true,
    updatedAt: Date.now(),
  };

  const [preferences, setPreferences] = useState(currentPrefs);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Update local state when user data loads
  useEffect(() => {
    if (user?.emailPreferences) {
      setPreferences(user.emailPreferences);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await updatePreferences({
        token: token || undefined, // Only pass token if using token-based access
        productUpdates: preferences.productUpdates,
        engagementEmails: preferences.engagementEmails,
        allEmails: preferences.allEmails,
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev: typeof preferences) => ({
      ...prev,
      [key]: !prev[key],
      // If turning allEmails back on, enable other categories too
      ...(key === "allEmails" && !prev.allEmails
        ? { productUpdates: true, engagementEmails: true }
        : {}),
    }));
  };

  // Loading state
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>Loading your preferences...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(currentPrefs);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Manage which emails you receive from us
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which emails you&apos;d like to receive. You&apos;ll always
            receive critical account emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="all-emails" className="text-base font-semibold">
                All Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all non-critical emails
              </p>
            </div>
            <Switch
              id="all-emails"
              checked={preferences.allEmails}
              onCheckedChange={() => handleToggle("allEmails")}
            />
          </div>

          <Separator />

          {/* Product Updates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label
                  htmlFor="product-updates"
                  className="text-base font-medium"
                >
                  Product Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Credit notifications, autopilot updates, and weekly digests
                </p>
              </div>
              <Switch
                id="product-updates"
                checked={preferences.productUpdates}
                onCheckedChange={() => handleToggle("productUpdates")}
                disabled={!preferences.allEmails}
              />
            </div>

            {/* Examples */}
            <div className="ml-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground/60">•</span>
                Low credits warnings
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground/60">•</span>
                Autopilot pause notifications
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground/60">•</span>
                Weekly content digests
              </p>
            </div>
          </div>

          <Separator />

          {/* Engagement Emails */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label
                  htmlFor="engagement-emails"
                  className="text-base font-medium"
                >
                  Engagement Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Onboarding reminders, tips, and engagement notifications
                </p>
              </div>
              <Switch
                id="engagement-emails"
                checked={preferences.engagementEmails}
                onCheckedChange={() => handleToggle("engagementEmails")}
                disabled={!preferences.allEmails}
              />
            </div>

            {/* Examples */}
            <div className="ml-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground/60">•</span>
                Onboarding completion reminders
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground/60">•</span>
                Inactive account notifications
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground/60">•</span>
                Credit usage reminders
              </p>
            </div>
          </div>

          <Separator />

          {/* Critical Emails Note */}
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary font-medium mb-1">
              Critical Account Emails
            </p>
            <p className="text-sm text-primary">
              You&apos;ll always receive important emails about your account,
              such as payment receipts and security alerts. These cannot be
              disabled.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>

            {saveStatus === "success" && (
              <p className="text-sm text-success font-medium">
                Preferences saved
              </p>
            )}

            {saveStatus === "error" && (
              <p className="text-sm text-danger font-medium">
                Failed to save
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            If you have questions about our emails or want to report an issue,
            please contact us at{" "}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:underline"
            >
              support@example.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Last updated: {new Date(preferences.updatedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component
function EmailPreferencesLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/60 mx-auto" />
        <p className="text-muted-foreground mt-4">Loading email preferences...</p>
      </div>
    </div>
  );
}

export default function EmailPreferencesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <Suspense fallback={<EmailPreferencesLoading />}>
          <EmailPreferencesContent />
        </Suspense>
      </div>
    </div>
  );
}
