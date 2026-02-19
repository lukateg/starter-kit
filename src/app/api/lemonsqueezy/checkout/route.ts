import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";

export async function POST(request: NextRequest) {
  try {
    console.log(`🛒 Creating LemonSqueezy checkout`);
    // Authenticate user
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { variantId, packageName, eventId, projectId } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

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

    // Get user email from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    console.log(
      `🛒 Creating LemonSqueezy checkout: ${userEmail} - Package: ${packageName} (Variant: ${variantId})`
    );

    // Create checkout session with LemonSqueezy
    const checkoutData = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
              package_name: packageName,
              event_id: eventId, // Pass event_id through to webhook for deduplication
            },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}/settings/billing?success=true`,
          },
        },
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
      console.error(
        `❌ LemonSqueezy API error for ${userEmail} - Package: ${packageName}:`,
        errorData
      );
      throw new Error(`LemonSqueezy API error: ${response.status}`);
    }

    const checkout = await response.json();
    const checkoutUrl = checkout.data.attributes.url;
    const checkoutId = checkout.data.id;

    console.log(
      `✅ Checkout created successfully: ${userEmail} - Package: ${packageName} - Checkout ID: ${checkoutId} - Redirecting to: ${checkoutUrl}`
    );

    return NextResponse.json({
      checkoutUrl,
      checkoutId,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error creating checkout for user`, errorMessage);
    return NextResponse.json(
      {
        error: "Failed to create checkout",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
