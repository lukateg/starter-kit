"use node";

import { createHmac } from "crypto";
import { internalAction, internalMutation } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ============================================
// CREDIT PACKAGES
// Map LemonSqueezy variant/product to credit amounts.
// Update these when you change your pricing in LemonSqueezy.
// ============================================

const CREDIT_PACKAGES: Record<string, { credits: number; label: string }> = {
  // Use your LemonSqueezy variant ID as the key
  standard: { credits: 600, label: "Standard Pack (600 credits)" },
  premium: { credits: 1500, label: "Premium Pack (1,500 credits)" },
};

// Default credits if we can't match a specific package
const DEFAULT_CREDITS = 600;

/**
 * Resolve the credit amount from a LemonSqueezy order.
 * Tries to match by variant ID first, then falls back to the default.
 */
function resolveCreditsFromOrder(attributes: Record<string, unknown>): {
  credits: number;
  label: string;
} {
  const firstOrderItem = attributes.first_order_item as Record<string, unknown> | undefined;
  const variantId = String(firstOrderItem?.variant_id ?? "");

  if (variantId && CREDIT_PACKAGES[variantId]) {
    return CREDIT_PACKAGES[variantId];
  }

  // Fallback: try matching by total amount (cents)
  const totalCents = Number(attributes.total) || 0;
  if (totalCents >= 16900) {
    return CREDIT_PACKAGES.premium;
  }
  if (totalCents >= 6900) {
    return CREDIT_PACKAGES.standard;
  }

  return { credits: DEFAULT_CREDITS, label: `Credit Pack (${DEFAULT_CREDITS} credits)` };
}

// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return digest === signature;
}

// ============================================
// PROCESS WEBHOOK (internal action - runs in Node.js)
// Called from http.ts handleLemonSqueezyWebhook
// ============================================

export const processWebhook = internalAction({
  args: {
    signature: v.string(),
    payloadString: v.string(),
  },
  async handler(
    ctx,
    args
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Verify HMAC-SHA256 signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
      return { success: false, error: "Webhook secret not configured" };
    }

    if (!verifySignature(args.payloadString, args.signature, webhookSecret)) {
      console.error("Invalid LemonSqueezy webhook signature");
      return { success: false, error: "Invalid signature" };
    }

    // 2. Parse payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(args.payloadString);
    } catch {
      console.error("Failed to parse LemonSqueezy webhook payload");
      return { success: false, error: "Invalid JSON payload" };
    }

    const meta = payload.meta as Record<string, unknown> | undefined;
    const data = payload.data as Record<string, unknown> | undefined;
    const eventName = meta?.event_name as string | undefined;

    if (!eventName) {
      console.error("Missing event_name in LemonSqueezy webhook meta");
      return { success: false, error: "Missing event_name" };
    }

    const attributes = (data?.attributes ?? {}) as Record<string, unknown>;
    const providerId = String(data?.id ?? "");

    // 3. Log webhook event for audit trail
    await ctx.runMutation(internal.payments.logWebhookEvent, {
      type: eventName,
      providerEventId: providerId,
      data: args.payloadString,
    });

    // 4. Handle specific event types
    try {
      switch (eventName) {
        case "order_created":
          await handleOrderCreated(ctx, meta ?? {}, attributes, providerId);
          break;

        case "subscription_created":
          await handleSubscriptionCreated(ctx, meta ?? {}, attributes, providerId);
          break;

        case "subscription_updated":
          await handleSubscriptionUpdated(ctx, attributes, providerId);
          break;

        case "subscription_cancelled":
          await handleSubscriptionCancelled(ctx, attributes, providerId);
          break;

        default:
          console.log(`Unhandled LemonSqueezy event: ${eventName}`);
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";
      console.error(`Error processing ${eventName}:`, errorMessage, error);
      return { success: false, error: errorMessage };
    }
  },
});

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle one-time credit purchase.
 * Resolves the buyer via custom_data.user_id (Clerk ID) or falls back to user_email.
 */
async function handleOrderCreated(
  ctx: ActionCtx,
  meta: Record<string, unknown>,
  attributes: Record<string, unknown>,
  orderId: string
): Promise<void> {
  const customData = (meta.custom_data ?? {}) as Record<string, unknown>;
  const clerkUserId = customData.user_id as string | undefined;
  const userEmail = attributes.user_email as string | undefined;
  const eventId = customData.event_id as string | undefined;

  if (!clerkUserId && !userEmail) {
    throw new Error(
      "Cannot identify user: no user_id in custom_data and no user_email in attributes"
    );
  }

  // Resolve which user to credit
  const userId = clerkUserId ?? "";
  if (!userId) {
    // If we only have an email, we cannot look up the Clerk ID here.
    // Log it and bail - in practice custom_data.user_id should always be set
    // because the checkout URL is built with it.
    console.error(
      `order_created: No clerk user_id in custom_data. Email: ${userEmail}. Order: ${orderId}`
    );
    throw new Error("Missing user_id in custom_data for order_created");
  }

  const { credits, label } = resolveCreditsFromOrder(attributes);

  // Add credits to the user
  await ctx.runMutation(internal.users.addCreditsInternal, {
    userId,
    amount: credits,
    type: "purchase",
    description: `Purchased ${label}`,
    metadata: {
      orderId,
      eventId: eventId ?? undefined,
    },
  });

  console.log(
    `order_created: Added ${credits} credits to user ${userId} (order ${orderId})`
  );

  // Process referral reward if this is the user's first purchase
  await ctx.runMutation(internal.referrals.processReferralReward, {
    userId,
  });
}

/**
 * Handle new subscription creation.
 */
async function handleSubscriptionCreated(
  ctx: ActionCtx,
  meta: Record<string, unknown>,
  attributes: Record<string, unknown>,
  subscriptionId: string
): Promise<void> {
  const customData = (meta.custom_data ?? {}) as Record<string, unknown>;
  const clerkUserId = customData.user_id as string | undefined;

  if (!clerkUserId) {
    console.error(
      `subscription_created: No user_id in custom_data. Subscription: ${subscriptionId}`
    );
    throw new Error("Missing user_id in custom_data for subscription_created");
  }

  const now = Date.now();

  await ctx.runMutation(internal.payments.upsertSubscription, {
    userId: clerkUserId,
    lemonsqueezyId: subscriptionId,
    status: String(attributes.status ?? "active"),
    lemonsqueezyPriceId: attributes.first_subscription_item
      ? String(
          (attributes.first_subscription_item as Record<string, unknown>)
            .price_id ?? ""
        )
      : undefined,
    planId: attributes.variant_id ? String(attributes.variant_id) : undefined,
    amount: attributes.first_subscription_item
      ? Number(
          (attributes.first_subscription_item as Record<string, unknown>)
            .price ?? 0
        )
      : undefined,
    currency: attributes.currency ? String(attributes.currency) : undefined,
    interval: attributes.billing_anchor
      ? undefined
      : (attributes.billing_anchor as string | undefined),
    currentPeriodStart: attributes.current_period_start
      ? new Date(String(attributes.current_period_start)).getTime()
      : undefined,
    currentPeriodEnd: attributes.current_period_end
      ? new Date(String(attributes.current_period_end)).getTime()
      : undefined,
    startedAt: attributes.created_at
      ? new Date(String(attributes.created_at)).getTime()
      : now,
    createdAt: now,
  });

  console.log(
    `subscription_created: Created subscription ${subscriptionId} for user ${clerkUserId}`
  );
}

/**
 * Handle subscription update (plan change, renewal, etc.).
 */
async function handleSubscriptionUpdated(
  ctx: ActionCtx,
  attributes: Record<string, unknown>,
  subscriptionId: string
): Promise<void> {
  await ctx.runMutation(internal.payments.updateSubscription, {
    lemonsqueezyId: subscriptionId,
    status: String(attributes.status ?? "active"),
    currentPeriodStart: attributes.current_period_start
      ? new Date(String(attributes.current_period_start)).getTime()
      : undefined,
    currentPeriodEnd: attributes.current_period_end
      ? new Date(String(attributes.current_period_end)).getTime()
      : undefined,
    cancelAtPeriodEnd: attributes.cancelled
      ? Boolean(attributes.cancelled)
      : undefined,
  });

  console.log(
    `subscription_updated: Updated subscription ${subscriptionId} to status ${attributes.status}`
  );
}

/**
 * Handle subscription cancellation.
 */
async function handleSubscriptionCancelled(
  ctx: ActionCtx,
  attributes: Record<string, unknown>,
  subscriptionId: string
): Promise<void> {
  await ctx.runMutation(internal.payments.updateSubscription, {
    lemonsqueezyId: subscriptionId,
    status: "cancelled",
    cancelAtPeriodEnd: true,
    canceledAt: Date.now(),
    cancellationReason: attributes.cancellation_reason
      ? String(attributes.cancellation_reason)
      : undefined,
  });

  console.log(
    `subscription_cancelled: Cancelled subscription ${subscriptionId}`
  );
}

// ============================================
// INTERNAL MUTATIONS
// ============================================

/**
 * Log a webhook event to the audit trail.
 */
export const logWebhookEvent = internalMutation({
  args: {
    type: v.string(),
    providerEventId: v.string(),
    data: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("webhookEvents", {
      type: args.type,
      providerEventId: args.providerEventId,
      data: args.data,
      createdAt: Date.now(),
    });
  },
});

/**
 * Create or update a subscription record.
 */
export const upsertSubscription = internalMutation({
  args: {
    userId: v.string(),
    lemonsqueezyId: v.string(),
    status: v.string(),
    lemonsqueezyPriceId: v.optional(v.string()),
    planId: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    startedAt: v.optional(v.number()),
    createdAt: v.number(),
  },
  async handler(ctx, args) {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_provider", (q) =>
        q.eq("lemonsqueezyId", args.lemonsqueezyId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lemonsqueezyPriceId: args.lemonsqueezyPriceId,
        planId: args.planId,
        amount: args.amount,
        currency: args.currency,
        interval: args.interval,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        startedAt: args.startedAt,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        lemonsqueezyId: args.lemonsqueezyId,
        status: args.status,
        lemonsqueezyPriceId: args.lemonsqueezyPriceId,
        planId: args.planId,
        amount: args.amount,
        currency: args.currency,
        interval: args.interval,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        startedAt: args.startedAt,
        createdAt: args.createdAt,
      });
    }
  },
});

/**
 * Update an existing subscription by its LemonSqueezy ID.
 */
export const updateSubscription = internalMutation({
  args: {
    lemonsqueezyId: v.string(),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    canceledAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_provider", (q) =>
        q.eq("lemonsqueezyId", args.lemonsqueezyId)
      )
      .unique();

    if (!subscription) {
      console.error(
        `updateSubscription: Subscription not found for LemonSqueezy ID ${args.lemonsqueezyId}`
      );
      return;
    }

    // Build update object with only defined fields
    const updates: Record<string, unknown> = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.currentPeriodStart !== undefined)
      updates.currentPeriodStart = args.currentPeriodStart;
    if (args.currentPeriodEnd !== undefined)
      updates.currentPeriodEnd = args.currentPeriodEnd;
    if (args.cancelAtPeriodEnd !== undefined)
      updates.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
    if (args.canceledAt !== undefined) updates.canceledAt = args.canceledAt;
    if (args.cancellationReason !== undefined)
      updates.cancellationReason = args.cancellationReason;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(subscription._id, updates);
    }
  },
});
