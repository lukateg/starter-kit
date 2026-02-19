/**
 * User Engagement - Automated Email Sequences (Opt-In)
 *
 * Handles automated email sequences for:
 * - Onboarding completion reminders
 * - Inactive user re-engagement
 *
 * These are OPT-IN features. Enable them by uncommenting the
 * corresponding cron jobs in convex/crons.ts when you have
 * enough users (50+) to justify it.
 *
 * See DOCS/CORE/RETENTION.md for guidance.
 */

import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Check incomplete onboarding and send reminder emails
 * Triggered by daily cron job (opt-in, see crons.ts)
 *
 * Sends reminders at:
 * - 2 hours after signup (gentle nudge)
 * - 3 days after signup (value reminder)
 * - 7 days after signup (last chance)
 */
export const checkOnboardingCompletion = internalAction({
  handler: async (
    ctx
  ): Promise<{ totalIncomplete: number; emailsSent: number }> => {
    console.log("Checking users with incomplete onboarding...");

    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const incompleteUsers = await ctx.runQuery(
      internal.userEngagement.getUsersWithIncompleteOnboarding
    );

    console.log(
      `Found ${incompleteUsers.length} users with incomplete onboarding`
    );

    let emailsSent = 0;

    // Rate limit: Resend allows 2 requests/second = 500ms delay between requests
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (const user of incompleteUsers) {
      const timeSinceSignup = now - user.createdAt;

      // Check which emails have been sent using the emailEvents table
      const [email1Sent, email2Sent, email3Sent] = await Promise.all([
        ctx.runQuery(internal.emailEvents.hasEmailBeenSent, {
          userId: user.clerkId,
          emailType: "onboarding_reminder_1",
        }),
        ctx.runQuery(internal.emailEvents.hasEmailBeenSent, {
          userId: user.clerkId,
          emailType: "onboarding_reminder_2",
        }),
        ctx.runQuery(internal.emailEvents.hasEmailBeenSent, {
          userId: user.clerkId,
          emailType: "onboarding_reminder_3",
        }),
      ]);

      // Email 1: 2 hours after signup
      if (timeSinceSignup >= twoHours && !email1Sent) {
        try {
          const result = await ctx.runAction(
            internal.emails.sendOnboardingReminderEmail,
            {
              userId: user.clerkId,
              userEmail: user.email,
              userName: user.name || "there",
              reminderNumber: 1,
            }
          );
          if (result?.success === true) {
            emailsSent++;
          }
        } catch (error) {
          console.error(`Failed to send reminder 1 to ${user.email}:`, error);
        }
        await delay(500);
      }

      // Email 2: 3 days after signup
      else if (timeSinceSignup >= threeDays && !email2Sent) {
        try {
          const result = await ctx.runAction(
            internal.emails.sendOnboardingReminderEmail,
            {
              userId: user.clerkId,
              userEmail: user.email,
              userName: user.name || "there",
              reminderNumber: 2,
            }
          );
          if (result?.success === true) {
            emailsSent++;
          }
        } catch (error) {
          console.error(`Failed to send reminder 2 to ${user.email}:`, error);
        }
        await delay(500);
      }

      // Email 3: 7 days after signup
      else if (timeSinceSignup >= sevenDays && !email3Sent) {
        try {
          const result = await ctx.runAction(
            internal.emails.sendOnboardingReminderEmail,
            {
              userId: user.clerkId,
              userEmail: user.email,
              userName: user.name || "there",
              reminderNumber: 3,
            }
          );
          if (result?.success === true) {
            emailsSent++;
          }
        } catch (error) {
          console.error(`Failed to send reminder 3 to ${user.email}:`, error);
        }
        await delay(500);
      }
    }

    console.log(
      `Onboarding check complete. Sent ${emailsSent} reminder emails.`
    );

    return {
      totalIncomplete: incompleteUsers.length,
      emailsSent,
    };
  },
});

/**
 * Query to get users with incomplete onboarding
 * Filters for users who signed up but haven't completed onboarding
 */
export const getUsersWithIncompleteOnboarding = internalQuery({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    return users.filter((user) => {
      // Must NOT have completed onboarding
      if (user.hasCompletedOnboarding === true) return false;

      // Must have been created (has a createdAt timestamp to measure from)
      if (!user.createdAt) return false;

      return true;
    });
  },
});

/**
 * Check inactive users (completed onboarding but haven't logged in)
 * Triggered by daily cron job (opt-in, see crons.ts)
 *
 * Sends re-engagement emails at:
 * - 7 days inactive
 * - 14 days inactive
 * - 30 days inactive
 */
export const checkInactiveUsers = internalAction({
  handler: async (
    ctx
  ): Promise<{ totalInactive: number; emailsSent: number }> => {
    console.log("Checking for inactive users...");

    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const inactiveUsers = await ctx.runQuery(
      internal.userEngagement.getInactiveUsers
    );

    console.log(`Found ${inactiveUsers.length} potentially inactive users`);

    let emailsSent = 0;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (const user of inactiveUsers) {
      const lastActive = user.lastActiveAt || user.createdAt;
      const timeSinceActive = now - lastActive;
      const daysSinceActive = Math.floor(
        timeSinceActive / (24 * 60 * 60 * 1000)
      );

      // Email 1: 7 days inactive
      if (timeSinceActive >= sevenDays && timeSinceActive < fourteenDays) {
        try {
          const result = await ctx.runAction(
            internal.emails.sendInactiveUserEmail,
            {
              userId: user.clerkId,
              userEmail: user.email,
              userName: user.name || "there",
              reminderNumber: 1,
              daysSinceActive,
            }
          );
          if (result?.success === true) {
            emailsSent++;
          }
        } catch (error) {
          console.error(
            `Failed to send inactive email 1 to ${user.email}:`,
            error
          );
        }
        await delay(500);
      }

      // Email 2: 14 days inactive
      else if (
        timeSinceActive >= fourteenDays &&
        timeSinceActive < thirtyDays
      ) {
        try {
          const result = await ctx.runAction(
            internal.emails.sendInactiveUserEmail,
            {
              userId: user.clerkId,
              userEmail: user.email,
              userName: user.name || "there",
              reminderNumber: 2,
              daysSinceActive,
            }
          );
          if (result?.success === true) {
            emailsSent++;
          }
        } catch (error) {
          console.error(
            `Failed to send inactive email 2 to ${user.email}:`,
            error
          );
        }
        await delay(500);
      }

      // Email 3: 30 days inactive
      else if (timeSinceActive >= thirtyDays) {
        try {
          const result = await ctx.runAction(
            internal.emails.sendInactiveUserEmail,
            {
              userId: user.clerkId,
              userEmail: user.email,
              userName: user.name || "there",
              reminderNumber: 3,
              daysSinceActive,
            }
          );
          if (result?.success === true) {
            emailsSent++;
          }
        } catch (error) {
          console.error(
            `Failed to send inactive email 3 to ${user.email}:`,
            error
          );
        }
        await delay(500);
      }
    }

    console.log(
      `Inactive user check complete. Sent ${emailsSent} reminder emails.`
    );

    return {
      totalInactive: inactiveUsers.length,
      emailsSent,
    };
  },
});

/**
 * Query to get users who have completed onboarding but are inactive
 * Inactive = haven't logged in for 7+ days
 */
export const getInactiveUsers = internalQuery({
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const cutoff = now - sevenDays;

    const users = await ctx.db.query("users").collect();

    return users.filter((user) => {
      // Must have completed onboarding
      if (user.hasCompletedOnboarding !== true) return false;

      // Check last activity (use lastActiveAt, or fall back to createdAt)
      const lastActive = user.lastActiveAt || user.createdAt;

      // Must be inactive for 7+ days
      if (lastActive > cutoff) return false;

      return true;
    });
  },
});
