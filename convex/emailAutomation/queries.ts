/**
 * Email Automation - Queries
 *
 * Helper queries used by the sequence processor (sequences.ts).
 * Separated from the processor because queries cannot use the Node.js runtime.
 */

import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

// ============================================
// Get Users Enrolled in a Sequence
// ============================================

/**
 * Returns all distinct users who have step 0 "sent" for a given sequence.
 * This is how we know who is enrolled in the sequence.
 */
export const getUsersInSequence = internalQuery({
  args: {
    sequenceId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all step-0 "sent" events for this sequence
    const step0Events = await ctx.db
      .query("emailEvents")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .filter((q) =>
        q.and(
          q.eq(q.field("sequenceId"), args.sequenceId),
          q.eq(q.field("stepNumber"), 0)
        )
      )
      .collect();

    // Deduplicate by userId (a user could theoretically have duplicates)
    const seen = new Set<string>();
    const users: Array<{ userId: string; email: string; enrolledAt: number }> = [];

    for (const event of step0Events) {
      if (!seen.has(event.userId)) {
        seen.add(event.userId);
        users.push({
          userId: event.userId,
          email: event.email,
          enrolledAt: event.sentAt ?? event.createdAt,
        });
      }
    }

    return users;
  },
});

// ============================================
// Get Sequence Progress for a User
// ============================================

/**
 * Returns the highest step number that was successfully sent
 * for a user in a given sequence, or -1 if no emails have been sent.
 */
export const getSequenceProgress = internalQuery({
  args: {
    userId: v.string(),
    sequenceId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("emailEvents")
      .withIndex("by_user_sequence", (q) =>
        q.eq("userId", args.userId).eq("sequenceId", args.sequenceId)
      )
      .filter((q) => q.eq(q.field("status"), "sent"))
      .collect();

    if (events.length === 0) {
      return { currentStep: -1, enrolledAt: 0 };
    }

    const currentStep = Math.max(...events.map((e) => e.stepNumber));
    const enrolledAt = Math.min(...events.map((e) => e.sentAt ?? e.createdAt));

    return { currentStep, enrolledAt };
  },
});

// ============================================
// Check if a Specific Email Was Already Sent
// ============================================

/**
 * Returns true if a specific emailType has already been sent to a user.
 * Used to prevent duplicate sends.
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
