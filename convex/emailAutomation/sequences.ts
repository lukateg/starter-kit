"use node";

/**
 * Email Automation - Sequence Processor
 *
 * The main processing engine called by a cron job.
 *
 * How it works:
 * 1. Cron calls processAllSequences()
 * 2. For each sequence, finds enrolled users (those with step 0 sent)
 * 3. Checks each user's progress and whether enough time has passed
 * 4. Sends the next email in the sequence
 * 5. Tracks sends/failures in emailEvents
 */

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { SEQUENCES, getNextStep, resolveSubject } from "./config";

// ============================================
// Constants
// ============================================

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Delay between sends to avoid rate limits (500ms)
const SEND_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Main Cron Entry Point
// ============================================

/**
 * Process all email sequences.
 * Called by the cron job (see crons.ts).
 */
export const processAllSequences = internalAction({
  args: {},
  handler: async (ctx) => {
    let totalSent = 0;
    let totalErrors = 0;

    for (const sequence of Object.values(SEQUENCES)) {
      // Get all users enrolled in this sequence (those who received step 0)
      const enrolledUsers = await ctx.runQuery(
        internal.emailAutomation.queries.getUsersInSequence,
        { sequenceId: sequence.id }
      );

      for (const user of enrolledUsers) {
        // Get the user's current progress
        const progress = await ctx.runQuery(
          internal.emailAutomation.queries.getSequenceProgress,
          { userId: user.userId, sequenceId: sequence.id }
        );

        // Find the next step
        const nextStep = getNextStep(sequence, progress.currentStep);
        if (!nextStep) {
          // Sequence complete for this user
          continue;
        }

        // Check if enough time has elapsed since enrollment
        const msSinceEnrollment = Date.now() - progress.enrolledAt;
        const daysSinceEnrollment = msSinceEnrollment / DAY_IN_MS;

        if (daysSinceEnrollment < nextStep.delayDays) {
          // Not time yet
          continue;
        }

        // Check the user hasn't already received this exact email (safety check)
        const alreadySent = await ctx.runQuery(
          internal.emailAutomation.queries.hasEmailBeenSent,
          { userId: user.userId, emailType: nextStep.emailType }
        );

        if (alreadySent) {
          continue;
        }

        // Send the email
        try {
          await ctx.runAction(internal.emails.sendWelcomeEmail, {
            userId: user.userId,
            email: user.email,
            name: "", // The email action can look up the user's name if needed
            stepNumber: nextStep.stepNumber,
          });

          // Track successful send
          await ctx.runMutation(internal.emailEvents.trackEmailSent, {
            userId: user.userId,
            email: user.email,
            sequenceId: sequence.id,
            stepNumber: nextStep.stepNumber,
            emailType: nextStep.emailType,
          });

          totalSent++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
            userId: user.userId,
            email: user.email,
            sequenceId: sequence.id,
            stepNumber: nextStep.stepNumber,
            emailType: nextStep.emailType,
            failureReason: errorMessage,
          });

          totalErrors++;
        }

        // Rate limit between sends
        await sleep(SEND_DELAY_MS);
      }
    }

    console.log(
      `Sequence processing complete: ${totalSent} sent, ${totalErrors} errors`
    );
  },
});
