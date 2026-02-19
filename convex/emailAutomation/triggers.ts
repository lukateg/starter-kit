/**
 * Email Automation - Sequence Triggers
 *
 * Entry points for enrolling users into email sequences.
 * Called from user lifecycle events (e.g. user creation in users.ts).
 *
 * Each trigger:
 * 1. Schedules the Day 0 email immediately
 * 2. Records the event in emailEvents so the cron processor picks up Day 1+
 */

import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { SEQUENCES } from "./config";

// ============================================
// Welcome Sequence Trigger
// ============================================

/**
 * Enroll a new user in the welcome email sequence.
 *
 * Call this from users.ts after a new user is created:
 *   ctx.scheduler.runAfter(0, internal.emailAutomation.triggers.triggerWelcomeSequence, {
 *     userId: user.clerkId,
 *     email: user.email,
 *     name: user.name || "",
 *   });
 */
export const triggerWelcomeSequence = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const sequence = SEQUENCES.WELCOME;
    const step0 = sequence.steps[0];

    // Schedule the Day 0 welcome email to send immediately
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendWelcomeEmail,
      {
        userId: args.userId,
        email: args.email,
        name: args.name,
        stepNumber: step0.stepNumber,
      }
    );

    // Record that step 0 was triggered so the cron knows this user is enrolled
    await ctx.db.insert("emailEvents", {
      userId: args.userId,
      email: args.email,
      sequenceId: sequence.id,
      stepNumber: step0.stepNumber,
      emailType: step0.emailType,
      status: "sent",
      sentAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});
