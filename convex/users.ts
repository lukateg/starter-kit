import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import {
  throwUnauthenticated,
  throwNotFound,
  throwValidationError,
} from "./lib/errors";

/**
 * CREDIT COSTS - Backend copy of pricing constants
 *
 * SOURCE OF TRUTH: src/lib/pricing/index.ts
 *
 * These values MUST match the frontend pricing config.
 * When updating prices, update BOTH files:
 * 1. src/lib/pricing/index.ts (frontend)
 * 2. This file (backend)
 */
export const CREDIT_COSTS = {
  // Free tier
  INITIAL_FREE_CREDITS: 60,

  // Add your app-specific credit costs here
  // Example:
  // GENERATION: 10,
  // EXPORT: 5,
} as const;

export const getUser = internalQuery({
  args: { subject: v.string() },
  async handler(ctx, args) {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.subject))
      .unique();
  },
});

/**
 * Get user by email address
 */
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  async handler(ctx, args) {
    return ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

/**
 * Get user credits by Clerk user ID (for internal use)
 * Used when we don't have Clerk authentication context
 */
export const getUserCredits = internalQuery({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .unique();

    if (!user) {
      throwNotFound("User");
    }

    return {
      credits: user.credits ?? 0,
      userId: user.clerkId,
    };
  },
});

export const updateOrCreateUser = internalMutation({
  args: {
    clerkUser: v.object({
      id: v.string(),
      email_addresses: v.array(
        v.object({
          id: v.string(),
          email_address: v.union(v.string(), v.null()),
          created_at: v.optional(v.number()),
          updated_at: v.optional(v.number()),
          verification: v.optional(v.any()),
          linked_to: v.optional(v.array(v.any())),
          matches_sso_connection: v.optional(v.boolean()),
          object: v.optional(v.string()),
          reserved: v.optional(v.boolean()),
        })
      ),
      primary_email_address_id: v.union(v.string(), v.null()),
      first_name: v.union(v.string(), v.null()),
      last_name: v.union(v.string(), v.null()),
      username: v.union(v.string(), v.null()),
      image_url: v.union(v.string(), v.null()),
      created_at: v.union(v.number(), v.null()),
      updated_at: v.union(v.number(), v.null()),
      unsafe_metadata: v.union(v.any(), v.null()),
    }),
  },
  async handler(ctx, args) {
    const { clerkUser } = args;

    // Extract email from the complex Clerk email_addresses array
    if (!clerkUser.email_addresses || clerkUser.email_addresses.length === 0) {
      throwValidationError(
        "User has no email addresses - this should not happen with Google OAuth"
      );
    }

    // Get the primary email or first email
    const primaryEmail = clerkUser.email_addresses.find(
      (e) => e.id === clerkUser.primary_email_address_id
    );
    const email =
      primaryEmail?.email_address ||
      clerkUser.email_addresses[0]?.email_address;

    if (!email) {
      throwValidationError("Failed to extract email address from Clerk user data");
    }

    // Extract user data from Clerk webhook payload
    const userData = {
      clerkId: clerkUser.id,
      email: email,
      name: clerkUser.first_name
        ? `${clerkUser.first_name} ${clerkUser.last_name || ""}`.trim()
        : clerkUser.username || "User",
      imageUrl: clerkUser.image_url || undefined,
      createdAt: clerkUser.created_at || Date.now(),
      updatedAt: clerkUser.updated_at || Date.now(),
    };

    // Check if user already exists by Clerk ID (primary lookup)
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUser.id))
      .unique();

    // If not found by Clerk ID, check by email to prevent duplicates
    if (!existingUser) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", userData.email))
        .unique();

      // If found by email but different Clerk ID, update the Clerk ID
      // This handles cases where user might have been created with different auth method
      if (existingUser && existingUser.clerkId !== clerkUser.id) {
        console.log(
          `Found existing user by email but different Clerk ID. Updating from ${existingUser.clerkId} to ${clerkUser.id}`
        );
      }
    }

    if (existingUser) {
      // Update existing user
      const updateData: {
        clerkId?: string;
        email: string;
        name: string;
        imageUrl?: string;
        updatedAt: number;
        credits?: number;
      } = {
        email: userData.email,
        name: userData.name,
        imageUrl: userData.imageUrl,
        updatedAt: userData.updatedAt,
      };

      // Update Clerk ID if it changed (handles auth method changes)
      if (existingUser.clerkId !== clerkUser.id) {
        updateData.clerkId = clerkUser.id;
      }

      // Backfill credits if user doesn't have them yet (migration)
      if (existingUser.credits === undefined) {
        updateData.credits = CREDIT_COSTS.INITIAL_FREE_CREDITS;

        // Create initial grant transaction for migrated user
        await ctx.db.insert("creditTransactions", {
          userId: clerkUser.id,
          type: "initial_grant",
          amount: CREDIT_COSTS.INITIAL_FREE_CREDITS,
          balanceAfter: CREDIT_COSTS.INITIAL_FREE_CREDITS,
          description: "Welcome bonus - free credits (auto-migration)",
          createdAt: Date.now(),
        });
        console.log("Backfilled credits for existing user:", clerkUser.id);
      }

      await ctx.db.patch(existingUser._id, updateData);
      console.log("Updated user:", clerkUser.id);
    } else {
      // Extract referral code from unsafe_metadata
      const referralCode =
        (clerkUser.unsafe_metadata as { referralCode?: string })
          ?.referralCode || undefined;

      // Create new user
      await ctx.db.insert("users", {
        clerkId: userData.clerkId,
        email: userData.email,
        name: userData.name,
        imageUrl: userData.imageUrl,
        credits: CREDIT_COSTS.INITIAL_FREE_CREDITS,
        referredBy: referralCode,
        hasCompletedOnboarding: false,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });
      console.log("Created new user:", clerkUser.id);

      // Record initial credit grant transaction
      await ctx.db.insert("creditTransactions", {
        userId: clerkUser.id,
        type: "initial_grant",
        amount: CREDIT_COSTS.INITIAL_FREE_CREDITS,
        balanceAfter: CREDIT_COSTS.INITIAL_FREE_CREDITS,
        description: "Welcome bonus - free credits",
        createdAt: Date.now(),
      });

      // Schedule welcome email sequence for new user
      ctx.scheduler.runAfter(
        0,
        internal.emailAutomation.triggers.triggerWelcomeSequence,
        {
          userId: clerkUser.id,
          email: userData.email,
          name: userData.name,
        }
      );
    }
  },
});

export const deleteUser = internalMutation({
  args: { id: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.id))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
      console.log("Deleted user:", args.id);
    }
  },
});

// Get current user's credit balance
export const getCredits = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing - allows component to handle unauthenticated state gracefully
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Return null instead of throwing - user might not exist yet
      return null;
    }

    return {
      credits: user.credits ?? 0,
    };
  },
});

// Check if user has enough credits
export const hasEnoughCredits = query({
  args: { amount: v.number() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    return (user.credits ?? 0) >= args.amount;
  },
});

// Deduct credits from user account
export const deductCredits = mutation({
  args: {
    amount: v.number(),
    type: v.string(),
    description: v.string(),
    metadata: v.optional(
      v.object({
        orderId: v.optional(v.string()),
        eventId: v.optional(v.string()),
      })
    ),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throwNotFound("User");
    }

    const currentCredits = user.credits ?? 0;

    if (currentCredits < args.amount) {
      throwValidationError(
        `Insufficient credits. You have ${currentCredits} credits but need ${args.amount}.`
      );
    }

    const balanceAfter = currentCredits - args.amount;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: balanceAfter,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: identity.subject,
      type: args.type as "usage",
      amount: -args.amount, // Negative for deductions
      balanceAfter,
      description: args.description,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return {
      success: true,
      creditsRemaining: balanceAfter,
      creditsDeducted: args.amount,
    };
  },
});

// Internal mutation to add credits (called from webhooks)
export const addCreditsInternal = internalMutation({
  args: {
    userId: v.string(), // Clerk ID
    amount: v.number(),
    type: v.string(),
    description: v.string(),
    metadata: v.optional(
      v.object({
        orderId: v.optional(v.string()),
        eventId: v.optional(v.string()),
      })
    ),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .unique();

    if (!user) {
      throwNotFound("User");
    }

    const currentCredits = user.credits ?? 0;
    const balanceAfter = currentCredits + args.amount;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: balanceAfter,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: args.type as "purchase" | "bonus" | "refund",
      amount: args.amount, // Positive for additions
      balanceAfter,
      description: args.description,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return {
      success: true,
      creditsRemaining: balanceAfter,
      creditsAdded: args.amount,
    };
  },
});

// Internal mutation to deduct credits (called from internal actions)
export const deductCreditsInternal = internalMutation({
  args: {
    userId: v.string(), // Clerk ID
    amount: v.number(),
    type: v.string(),
    description: v.string(),
    metadata: v.optional(
      v.object({
        orderId: v.optional(v.string()),
        eventId: v.optional(v.string()),
      })
    ),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .unique();

    if (!user) {
      throwNotFound("User");
    }

    const currentCredits = user.credits ?? 0;

    if (currentCredits < args.amount) {
      throwValidationError(
        `Insufficient credits. User has ${currentCredits} credits but needs ${args.amount}.`
      );
    }

    const balanceAfter = currentCredits - args.amount;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: balanceAfter,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: args.type as "usage",
      amount: -args.amount, // Negative for deductions
      balanceAfter,
      description: args.description,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    // Check if we should send low credits warning email
    // Schedule as action to avoid blocking the mutation
    await ctx.scheduler.runAfter(0, internal.emails.checkAndNotifyLowCredits, {
      userId: args.userId,
      credits: balanceAfter,
    });

    return {
      success: true,
      creditsRemaining: balanceAfter,
      creditsDeducted: args.amount,
    };
  },
});

// Get credit transaction history
export const getCreditTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

// Mark onboarding as completed for current user
export const markOnboardingCompleted = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throwNotFound("User");
    }

    await ctx.db.patch(user._id, {
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Track user activity (login/navigation)
// Debounced: only updates if lastActiveAt was more than 1 minute ago
export const trackUserActivity = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Skip write if lastActiveAt was updated within the last minute
    // This prevents write conflicts from multiple rapid calls
    const ONE_MINUTE = 60 * 1000;
    const now = Date.now();
    if (user.lastActiveAt && now - user.lastActiveAt < ONE_MINUTE) {
      return { success: true, reason: "Recently updated, skipping" };
    }

    await ctx.db.patch(user._id, {
      lastActiveAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});
