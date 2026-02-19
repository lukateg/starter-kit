"use client";

import { useEffect, useState } from "react";
import { metaPixel } from "@/lib/meta-pixel";
import {
  getConsentPreferences,
  type ConsentPreferences,
} from "@/lib/cookie-consent";
import {
  processAndCollectAllParams,
  getClientIpAddress,
} from "@/lib/meta-param-builder-client";

export function MetaPixelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);

  // Initialize Meta Pixel based on consent
  const initializePixel = async (preferences: ConsentPreferences) => {
    if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      console.warn("NEXT_PUBLIC_META_PIXEL_ID is not set");
      return;
    }

    if (preferences.marketing) {
      // Process and collect all parameters using Meta Parameter Builder
      // This improves event matching quality by ensuring fbc, fbp, and IP are collected early
      try {
        await processAndCollectAllParams(
          typeof window !== "undefined" ? window.location.href : "",
          getClientIpAddress
        );
      } catch (error) {
        console.warn("Failed to process Meta parameters:", error);
      }

      // User has consented to marketing cookies
      metaPixel.init(process.env.NEXT_PUBLIC_META_PIXEL_ID, {
        autoConfig: true,
        debug: false,
      });

      // Grant consent
      metaPixel.grantConsent();

      // Track initial page view
      metaPixel.pageView();

      setInitialized(true);
    } else {
      // User has not consented, revoke consent
      if (initialized) {
        metaPixel.revokeConsent();
      }
    }
  };

  useEffect(() => {
    // Check for existing consent preferences
    const preferences = getConsentPreferences();

    if (preferences) {
      // User has made a choice, initialize accordingly
      initializePixel(preferences);
    }

    // Listen for consent changes
    const handleConsentChange = (event: CustomEvent<ConsentPreferences>) => {
      initializePixel(event.detail);
    };

    window.addEventListener(
      "consentChange",
      handleConsentChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "consentChange",
        handleConsentChange as EventListener
      );
    };
  }, []);

  return <>{children}</>;
}
