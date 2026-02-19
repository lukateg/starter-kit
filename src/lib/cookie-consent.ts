/**
 * Cookie Consent Manager
 * GDPR-compliant cookie consent handling
 */

export type ConsentPreferences = {
  necessary: boolean; // Always true, required for site functionality
  analytics: boolean; // PostHog analytics
  marketing: boolean; // Meta Pixel
};

const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

/**
 * Get current consent preferences from cookie
 */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const value = cookie.split("=")[1];
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded) as ConsentPreferences;
  } catch {
    return null;
  }
}

/**
 * Save consent preferences to cookie
 */
export function saveConsentPreferences(preferences: ConsentPreferences): void {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_EXPIRY_DAYS);

  const value = encodeURIComponent(JSON.stringify(preferences));
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Check if user has made a consent choice
 */
export function hasConsent(): boolean {
  return getConsentPreferences() !== null;
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): ConsentPreferences {
  const preferences: ConsentPreferences = {
    necessary: true,
    analytics: true,
    marketing: true,
  };
  saveConsentPreferences(preferences);
  return preferences;
}

/**
 * Accept only necessary cookies
 */
export function acceptNecessaryOnly(): ConsentPreferences {
  const preferences: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
  };
  saveConsentPreferences(preferences);
  return preferences;
}

/**
 * Update specific consent preference
 */
export function updateConsent(
  type: keyof ConsentPreferences,
  value: boolean
): void {
  const current = getConsentPreferences() || {
    necessary: true,
    analytics: false,
    marketing: false,
  };

  // Necessary cookies cannot be disabled
  if (type === "necessary") return;

  current[type] = value;
  saveConsentPreferences(current);
}
