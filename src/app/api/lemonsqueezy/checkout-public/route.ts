import { NextRequest, NextResponse } from "next/server";

const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      console.log(`🚫 Rate limited: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Get request body (all fields are optional for zero-friction mode)
    const body = await request.json().catch(() => ({}));
    const {
      email,
      eventId,
      leadType = "mifge",
      buttonLocation,
      productType = "standard", // "standard" or "bundle"
    } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Validate environment variables
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Select variant based on product type
    const variantId =
      productType === "bundle"
        ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_BUNDLE_VARIANT_ID
        : process.env.NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID;

    if (!apiKey) {
      console.error("Missing LEMONSQUEEZY_API_KEY");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    if (!storeId) {
      console.error("Missing LEMONSQUEEZY_STORE_ID");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    if (!variantId) {
      console.error(
        `Missing variant ID for product type: ${productType}. ` +
          `Expected: ${productType === "bundle" ? "NEXT_PUBLIC_LEMONSQUEEZY_BUNDLE_VARIANT_ID" : "NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID"}`
      );
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    console.log(
      `🛒 Creating public checkout: ${email || "no-email"} (Variant: ${variantId}, Type: ${productType}, Button: ${buttonLocation || "unknown"})`
    );

    // Build checkout data - email is optional for zero-friction mode
    const checkoutAttributes: {
      checkout_data: {
        email?: string;
        custom: Record<string, string | undefined>;
      };
      product_options: {
        redirect_url: string;
      };
    } = {
      checkout_data: {
        custom: {
          source: "mifge_funnel",
          lead_type: leadType,
          button_location: buttonLocation,
          event_id: eventId, // For Meta Pixel deduplication
        },
      },
      product_options: {
        redirect_url: `${appUrl}/fnls/mifge/success${email ? `?email=${encodeURIComponent(email.toLowerCase())}` : ""}`,
      },
    };

    // Only include email in checkout if provided
    if (email) {
      checkoutAttributes.checkout_data.email = email.toLowerCase();
      checkoutAttributes.checkout_data.custom.email = email.toLowerCase();
    }

    const checkoutData = {
      data: {
        type: "checkouts",
        attributes: checkoutAttributes,
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    };

    const response = await fetch(`${LEMONSQUEEZY_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ LemonSqueezy API error:`, errorData);
      throw new Error(`LemonSqueezy API error: ${response.status}`);
    }

    const checkout = await response.json();
    const checkoutUrl = checkout.data.attributes.url;
    const checkoutId = checkout.data.id;

    console.log(
      `✅ Public checkout created: ${email || "no-email"} - Checkout ID: ${checkoutId}`
    );

    return NextResponse.json({
      checkoutUrl,
      checkoutId,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error creating public checkout`, errorMessage);
    return NextResponse.json(
      {
        error: "Failed to create checkout",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
