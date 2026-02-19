"use client";

import { metaPixel } from "@/lib/meta-pixel";
import { getConsentPreferences } from "@/lib/cookie-consent";

interface EventOptions {
  eventID?: string; // For event deduplication with Conversion API
}

export function useMetaPixel() {
  const trackEvent = (
    eventName: string,
    data?: Record<string, unknown>,
    options?: EventOptions
  ) => {
    if (typeof window === "undefined") return;

    // Check consent before tracking
    const preferences = getConsentPreferences();
    if (!preferences?.marketing) {
      console.debug("Marketing cookies not consented, skipping Meta Pixel event");
      return;
    }

    // Auto-generate eventID for deduplication if not provided
    // This ensures CAPI and browser pixel events can be matched
    const eventID = options?.eventID || `${eventName}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Merge eventID into data
    const trackingData = { ...data, eventID };

    metaPixel.track(eventName, trackingData);
  };

  const trackCustomEvent = (
    eventName: string,
    data?: Record<string, unknown>
  ) => {
    if (typeof window === "undefined") return;

    // Check consent before tracking
    const preferences = getConsentPreferences();
    if (!preferences?.marketing) {
      console.debug("Marketing cookies not consented, skipping Meta Pixel custom event");
      return;
    }

    metaPixel.trackCustom(eventName, data);
  };

  const trackPageView = () => {
    if (typeof window === "undefined") return;

    // Check consent before tracking
    const preferences = getConsentPreferences();
    if (!preferences?.marketing) {
      console.debug("Marketing cookies not consented, skipping Meta Pixel page view");
      return;
    }

    metaPixel.pageView();
  };

  return {
    trackEvent,
    trackCustomEvent,
    trackPageView,
  };
}
