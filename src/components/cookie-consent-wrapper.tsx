"use client";

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import type { ConsentPreferences } from "@/lib/cookie-consent";

export function CookieConsentWrapper() {
  const handleConsentChange = (preferences: ConsentPreferences) => {
    // Dispatch custom event to notify providers
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("consentChange", {
          detail: preferences,
        })
      );
    }
  };

  return <CookieConsentBanner onConsentChange={handleConsentChange} />;
}
