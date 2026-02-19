"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  hasConsent,
  acceptAllCookies,
  acceptNecessaryOnly,
  type ConsentPreferences,
} from "@/lib/cookie-consent";

interface CookieConsentBannerProps {
  onConsentChange?: (preferences: ConsentPreferences) => void;
}

export function CookieConsentBanner({
  onConsentChange,
}: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    setShowBanner(!hasConsent());
  }, []);

  const handleAcceptAll = () => {
    const preferences = acceptAllCookies();
    setShowBanner(false);
    onConsentChange?.(preferences);
  };

  const handleRejectAll = () => {
    const preferences = acceptNecessaryOnly();
    setShowBanner(false);
    onConsentChange?.(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg">
      <div className="container mx-auto max-w-7xl p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Cookie Preferences
            </h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, analyze site
              traffic, and personalize content. You can choose which cookies to
              accept.
            </p>

            {showDetails && (
              <div className="mt-4 space-y-2 text-sm text-foreground/80">
                <div>
                  <strong>Necessary cookies:</strong> Required for the website
                  to function properly. These cannot be disabled.
                </div>
                <div>
                  <strong>Analytics cookies:</strong> Help us understand how
                  visitors interact with our website (PostHog).
                </div>
                <div>
                  <strong>Marketing cookies:</strong> Used to track visitors
                  across websites for advertising purposes (Meta Pixel).
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
            <Button variant="outline" size="sm" onClick={handleRejectAll}>
              Necessary Only
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <button
        onClick={handleRejectAll}
        className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        aria-label="Close and reject non-essential cookies"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
