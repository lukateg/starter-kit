/**
 * Email Events - Centralized email tracking system
 *
 * This module handles all email event tracking for the automation system.
 * It uses a dedicated emailEvents table for querying, analytics, and debugging.
 */

import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// Email Sequence Definitions
// ============================================

export const EMAIL_SEQUENCES = {
  WELCOME: "welcome",
  ONBOARDING: "onboarding",
  INACTIVE_USER: "inactive_user",
  LOW_CREDITS: "low_credits",
} as const;

export const EMAIL_TYPES = {
  // Welcome sequence
  WELCOME_DAY_0: "welcome_day_0",
  WELCOME_DAY_2: "welcome_day_2",
  WELCOME_DAY_5: "welcome_day_5",

  // Onboarding reminders (opt-in)
  ONBOARDING_REMINDER_1: "onboarding_reminder_1",
  ONBOARDING_REMINDER_2: "onboarding_reminder_2",
  ONBOARDING_REMINDER_3: "onboarding_reminder_3",

  // Inactive user sequence (opt-in)
  INACTIVE_7D: "inactive_7d",
  INACTIVE_14D: "inactive_14d",
  INACTIVE_30D: "inactive_30d",

  // Credit notifications
  LOW_CREDITS_WARNING: "low_credits_warning",
} as const;

// ============================================
// Mutations - Track Email Events
// ============================================

/**
 * Record a successfully sent email
 */
export const trackEmailSent = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    sequenceId: v.string(),
    stepNumber: v.number(),
    emailType: v.string(),
    resendId: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        projectName: v.optional(v.string()),
        credits: v.optional(v.number()),
        daysSinceActivity: v.optional(v.number()),
        reminderNumber: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("emailEvents", {
      userId: args.userId,
      email: args.email,
      sequenceId: args.sequenceId,
      stepNumber: args.stepNumber,
      emailType: args.emailType,
      status: "sent",
      sentAt: now,
      resendId: args.resendId,
      metadata: args.metadata,
      createdAt: now,
    });

    console.log(
      `Tracked email sent: ${args.emailType} to ${args.email} (Resend ID: ${args.resendId || "N/A"})`
    );
  },
});

/**
 * Record a failed email send attempt
 */
export const trackEmailFailed = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    sequenceId: v.string(),
    stepNumber: v.number(),
    emailType: v.string(),
    failureReason: v.string(),
    retryCount: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        projectName: v.optional(v.string()),
        credits: v.optional(v.number()),
        daysSinceActivity: v.optional(v.number()),
        reminderNumber: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("emailEvents", {
      userId: args.userId,
      email: args.email,
      sequenceId: args.sequenceId,
      stepNumber: args.stepNumber,
      emailType: args.emailType,
      status: "failed",
      failureReason: args.failureReason,
      retryCount: args.retryCount || 0,
      metadata: args.metadata,
      createdAt: now,
    });

    console.log(
      `Tracked email failed: ${args.emailType} to ${args.email} - ${args.failureReason}`
    );
  },
});

/**
 * Record a skipped email (already sent, user unsubscribed, etc.)
 */
export const trackEmailSkipped = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    sequenceId: v.string(),
    stepNumber: v.number(),
    emailType: v.string(),
    skipReason: v.string(),
    metadata: v.optional(
      v.object({
        projectName: v.optional(v.string()),
        credits: v.optional(v.number()),
        daysSinceActivity: v.optional(v.number()),
        reminderNumber: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("emailEvents", {
      userId: args.userId,
      email: args.email,
      sequenceId: args.sequenceId,
      stepNumber: args.stepNumber,
      emailType: args.emailType,
      status: "skipped",
      failureReason: args.skipReason,
      metadata: args.metadata,
      createdAt: now,
    });

    console.log(
      `Tracked email skipped: ${args.emailType} to ${args.email} - ${args.skipReason}`
    );
  },
});

// ============================================
// Queries - Check Email Status
// ============================================

/**
 * Check if a specific email type has been successfully sent to a user
 */
export const hasEmailBeenSent = internalQuery({
  args: {
    userId: v.string(),
    emailType: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("emailEvents")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("emailType", args.emailType)
      )
      .filter((q) => q.eq(q.field("status"), "sent"))
      .first();

    return !!event;
  },
});

/**
 * Check if any email in a sequence has been sent within a time window
 * Useful for preventing spam (e.g., don't send low credits email again within 7 days)
 */
export const hasRecentEmailInSequence = internalQuery({
  args: {
    userId: v.string(),
    sequenceId: v.string(),
    withinMs: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.withinMs;

    const event = await ctx.db
      .query("emailEvents")
      .withIndex("by_user_sequence", (q) =>
        q.eq("userId", args.userId).eq("sequenceId", args.sequenceId)
      )
      .filter((q) =>
        q.and(q.eq(q.field("status"), "sent"), q.gte(q.field("sentAt"), cutoff))
      )
      .first();

    return !!event;
  },
});

/**
 * Get all emails sent to a user (for debugging/admin)
 */
export const getUserEmailHistory = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get email history for a specific sequence
 */
export const getSequenceHistory = internalQuery({
  args: {
    userId: v.string(),
    sequenceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailEvents")
      .withIndex("by_user_sequence", (q) =>
        q.eq("userId", args.userId).eq("sequenceId", args.sequenceId)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get count of emails sent by type (for analytics)
 */
export const getEmailStats = query({
  args: {},
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("emailEvents").collect();

    const stats = {
      total: allEvents.length,
      sent: allEvents.filter((e) => e.status === "sent").length,
      failed: allEvents.filter((e) => e.status === "failed").length,
      skipped: allEvents.filter((e) => e.status === "skipped").length,
      bySequence: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    for (const event of allEvents) {
      if (event.status === "sent") {
        stats.bySequence[event.sequenceId] =
          (stats.bySequence[event.sequenceId] || 0) + 1;
        stats.byType[event.emailType] =
          (stats.byType[event.emailType] || 0) + 1;
      }
    }

    return stats;
  },
});
