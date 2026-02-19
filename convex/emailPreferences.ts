/**
 * Email Preferences - Unsubscribe Management
 *
 * Handles user email preferences and unsubscribe functionality
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate unique unsubscribe token for user
 * Called when sending emails to users without a token
 */
export const generateUnsubscribeToken = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Generate a unique token using crypto.randomUUID
    const token = crypto.randomUUID();

    await ctx.db.patch(args.userId, {
      emailUnsubscribeToken: token,
      updatedAt: Date.now(),
    });

    return token;
  },
});

/**
 * Get user by unsubscribe token (public query for unsubscribe page)
 */
export const getUserByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("emailUnsubscribeToken"), args.token))
      .first();

    if (!user) {
      return null;
    }

    // Return only necessary fields
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailUnsubscribeToken: user.emailUnsubscribeToken,
      emailPreferences: user.emailPreferences || {
        productUpdates: true,
        engagementEmails: true,
        allEmails: true,
        updatedAt: Date.now(),
      },
    };
  },
});

/**
 * Get current authenticated user's email preferences
 * Used when user is logged in (not using token)
 */
export const getCurrentUserPreferences = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Return only necessary fields
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailUnsubscribeToken: user.emailUnsubscribeToken,
      emailPreferences: user.emailPreferences || {
        productUpdates: true,
        engagementEmails: true,
        allEmails: true,
        updatedAt: Date.now(),
      },
    };
  },
});

/**
 * Update email preferences (public mutation)
 * Can use either token-based authentication (no login) or authenticated user
 */
export const updateEmailPreferences = mutation({
  args: {
    token: v.optional(v.string()), // Optional: for token-based access
    productUpdates: v.optional(v.boolean()),
    engagementEmails: v.optional(v.boolean()),
    allEmails: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let user;

    // If token is provided, use token-based lookup
    if (args.token) {
      user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("emailUnsubscribeToken"), args.token))
        .first();

      if (!user) {
        throw new Error("Invalid unsubscribe token");
      }
    } else {
      // Otherwise, use authenticated user
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user) {
        throw new Error("User not found");
      }
    }

    // Get current preferences or set defaults
    const currentPrefs = user.emailPreferences || {
      productUpdates: true,
      engagementEmails: true,
      allEmails: true,
      updatedAt: Date.now(),
    };

    // Update only the fields that were provided
    const updatedPrefs = {
      productUpdates: args.productUpdates ?? currentPrefs.productUpdates,
      engagementEmails: args.engagementEmails ?? currentPrefs.engagementEmails,
      allEmails: args.allEmails ?? currentPrefs.allEmails,
      updatedAt: Date.now(),
    };

    // If allEmails is false, turn off all categories
    if (updatedPrefs.allEmails === false) {
      updatedPrefs.productUpdates = false;
      updatedPrefs.engagementEmails = false;
    }

    await ctx.db.patch(user._id, {
      emailPreferences: updatedPrefs,
      updatedAt: Date.now(),
    });

    console.log(
      `Updated email preferences for ${user.email}:`,
      updatedPrefs
    );

    return { success: true, preferences: updatedPrefs };
  },
});

/**
 * Initialize email preferences for user (called when user is created)
 */
export const initializeEmailPreferences = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only initialize if preferences don't exist
    if (!user.emailPreferences) {
      await ctx.db.patch(args.userId, {
        emailPreferences: {
          productUpdates: true,
          engagementEmails: true,
          allEmails: true,
          updatedAt: Date.now(),
        },
        updatedAt: Date.now(),
      });
    }

    // Generate unsubscribe token if it doesn't exist
    if (!user.emailUnsubscribeToken) {
      const token = crypto.randomUUID();
      await ctx.db.patch(args.userId, {
        emailUnsubscribeToken: token,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Check if user can receive a specific email type
 * Called before sending any email to verify preferences
 */
export const canSendEmail = query({
  args: {
    userId: v.string(), // Clerk ID
    emailType: v.string(), // "product_updates" | "engagement" | "critical"
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      return false;
    }

    // Get preferences or use defaults
    const prefs = user.emailPreferences || {
      productUpdates: true,
      engagementEmails: true,
      allEmails: true,
      updatedAt: Date.now(),
    };

    // If allEmails is false, only allow critical emails
    if (!prefs.allEmails && args.emailType !== "critical") {
      return false;
    }

    // Check specific category
    if (args.emailType === "product_updates" && !prefs.productUpdates) {
      return false;
    }

    if (args.emailType === "engagement" && !prefs.engagementEmails) {
      return false;
    }

    // Critical emails are always allowed
    return true;
  },
});
