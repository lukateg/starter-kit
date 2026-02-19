import crypto from "crypto";

/**
 * Meta Conversion API Utility
 * Sends server-side events to Meta (Facebook) for better tracking reliability
 * and to complement browser-based Meta Pixel events.
 */

interface UserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID cookie
  fbp?: string; // Facebook browser ID cookie
}

interface CustomData {
  currency?: string;
  value?: number | string;
  content_name?: string;
  content_category?: string;
  [key: string]: string | number | undefined;
}

interface ConversionEvent {
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: "website";
  user_data: Record<string, string | string[] | null>;
  custom_data?: CustomData;
  event_id?: string;
}

/**
 * Normalize and hash PII according to Meta Parameter Builder best practices
 *
 * @param value - The PII value to normalize and hash
 * @param type - Type of PII: 'email', 'phone', 'name', or 'location'
 * @returns Normalized and hashed value, or null if invalid
 */
function normalizeAndHashPII(
  value: string | undefined | null,
  type: "email" | "phone" | "name" | "location"
): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  let normalized: string;

  if (type === "email") {
    // Email normalization: lowercase, trim whitespace
    normalized = value.toLowerCase().trim();

    // Basic email validation
    if (!normalized.includes("@") || normalized.length < 3) {
      return null;
    }
  } else if (type === "phone") {
    // Phone normalization: remove all non-digit characters
    normalized = value.replace(/\D/g, "");

    // Basic phone validation (at least 7 digits)
    if (normalized.length < 7) {
      return null;
    }
  } else if (type === "name") {
    // Name normalization: lowercase, trim whitespace, remove extra spaces
    normalized = value.toLowerCase().trim().replace(/\s+/g, " ");

    if (normalized.length === 0) {
      return null;
    }
  } else if (type === "location") {
    // Location normalization: lowercase, trim whitespace
    normalized = value.toLowerCase().trim();

    if (normalized.length === 0) {
      return null;
    }
  } else {
    return null;
  }

  // SHA-256 hash
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return hash;
}

/**
 * Parse name into first and last name
 */
function parseName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

/**
 * Send an event to Meta Conversion API
 */
export async function sendMetaConversionEvent(
  eventName: string,
  userData: UserData,
  customData?: CustomData,
  eventSourceUrl?: string,
  eventId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSION_API_ACCESS_TOKEN;
    const apiVersion = process.env.META_API_VERSION || "v22.0";

    // Validate required environment variables
    if (!pixelId || !accessToken) {
      console.error(
        "Meta Conversion API: Missing required environment variables"
      );
      return {
        success: false,
        error: "Missing Meta API credentials",
      };
    }

    // Build user_data object with hashed PII using Parameter Builder best practices
    const user_data: Record<string, string | string[] | null> = {};

    // Hash email if provided (using Parameter Builder normalization)
    if (userData.email) {
      const hashedEmail = normalizeAndHashPII(userData.email, "email");
      user_data.em = hashedEmail ? [hashedEmail] : null;
    }

    // Hash first and last name if provided (using Parameter Builder normalization)
    if (userData.firstName) {
      const hashedFirstName = normalizeAndHashPII(userData.firstName, "name");
      user_data.fn = hashedFirstName ? [hashedFirstName] : null;
    }
    if (userData.lastName) {
      const hashedLastName = normalizeAndHashPII(userData.lastName, "name");
      user_data.ln = hashedLastName ? [hashedLastName] : null;
    }

    // Hash phone if provided (using Parameter Builder normalization)
    if (userData.phone) {
      const hashedPhone = normalizeAndHashPII(userData.phone, "phone");
      user_data.ph = hashedPhone ? [hashedPhone] : null;
    }

    // IP address and User Agent are NOT hashed
    if (userData.clientIpAddress) {
      user_data.client_ip_address = userData.clientIpAddress;
    }

    if (userData.clientUserAgent) {
      user_data.client_user_agent = userData.clientUserAgent;
    }

    // Facebook click and browser IDs (from cookies)
    if (userData.fbc) {
      user_data.fbc = userData.fbc;
    }

    if (userData.fbp) {
      user_data.fbp = userData.fbp;
    }

    // Build the event object
    const event: ConversionEvent = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
      event_source_url: eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000",
      action_source: "website",
      user_data,
    };

    // Add custom data if provided
    if (customData && Object.keys(customData).length > 0) {
      event.custom_data = customData;
    }

    // Add event_id for deduplication with browser pixel
    if (eventId) {
      event.event_id = eventId;
    }

    // Build the API request payload
    const payload = {
      data: [event],
    };

    // Send to Meta Conversion API
    const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        access_token: accessToken,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Meta Conversion API Error:", {
        status: response.status,
        data: responseData,
      });
      return {
        success: false,
        error: responseData.error?.message || "Failed to send event",
      };
    }

    // Log success for debugging
    console.log("Meta Conversion API Event Sent:", {
      event: eventName,
      eventId,
      eventsReceived: responseData.events_received,
      fbtrace_id: responseData.fbtrace_id,
    });

    return { success: true };
  } catch (error) {
    console.error("Meta Conversion API Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send Lead event to Meta Conversion API
 * Used when a user signs up for the waitlist
 */
export async function sendLeadEvent(
  email: string,
  name: string | undefined,
  clientIpAddress: string | undefined,
  clientUserAgent: string | undefined,
  fbc: string | undefined,
  fbp: string | undefined,
  eventId?: string
): Promise<{ success: boolean; error?: string }> {
  const { firstName, lastName } = name
    ? parseName(name)
    : { firstName: "", lastName: "" };

  return sendMetaConversionEvent(
    "Lead",
    {
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      clientIpAddress,
      clientUserAgent,
      fbc,
      fbp,
    },
    {
      content_name: "Waitlist Signup",
      content_category: "Newsletter",
      value: 1,
      currency: "USD",
    },
    undefined,
    eventId
  );
}

/**
 * Send custom event to Meta Conversion API
 */
export async function sendCustomEvent(
  eventName: string,
  email: string | undefined,
  name: string | undefined,
  clientIpAddress: string | undefined,
  clientUserAgent: string | undefined,
  fbc: string | undefined,
  fbp: string | undefined,
  customData?: CustomData,
  eventId?: string
): Promise<{ success: boolean; error?: string }> {
  const { firstName, lastName } = name
    ? parseName(name)
    : { firstName: "", lastName: "" };

  return sendMetaConversionEvent(
    eventName,
    {
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      clientIpAddress,
      clientUserAgent,
      fbc,
      fbp,
    },
    customData,
    undefined,
    eventId
  );
}
