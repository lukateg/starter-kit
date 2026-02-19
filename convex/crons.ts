/**
 * Convex Cron Jobs
 *
 * Scheduled background tasks that run automatically.
 * Uncomment crons as needed when you enable the corresponding features.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Expire old project invitations
 * Runs daily at 3:00 AM UTC
 *
 * Marks email invitations as "expired" if they've passed their expiresAt time.
 * Link invitations don't expire (they're valid until revoked).
 */
crons.daily(
  "expire-project-invitations",
  { hourUTC: 3, minuteUTC: 0 },
  internal.teamInvitations.expireOldInvitations
);

/**
 * Process email sequences (welcome flow, etc.)
 * Runs daily at 9:00 AM UTC
 *
 * Handles all email sequences from emailAutomation/config.ts.
 * Day 0 emails are sent immediately on trigger, not via cron.
 * This cron processes Day 1+ emails based on timing.
 */
crons.daily(
  "email-sequences",
  { hourUTC: 9, minuteUTC: 0 },
  internal.emailAutomation.sequences.processAllSequences
);

// ============================================
// OPT-IN: Engagement Crons
// Uncomment these when you have enough users (50+)
// to justify automated engagement emails.
// See DOCS/CORE/RETENTION.md
// ============================================

// /**
//  * Check user engagement and send onboarding reminder emails
//  * Runs daily at 10:00 AM UTC
//  *
//  * Checks for users with incomplete onboarding and sends
//  * reminder emails at configured intervals.
//  */
// crons.daily(
//   "check-user-engagement",
//   { hourUTC: 10, minuteUTC: 0 },
//   internal.userEngagement.checkOnboardingCompletion
// );

// /**
//  * Check for inactive users and send re-engagement emails
//  * Runs daily at 11:00 AM UTC
//  *
//  * Checks for users who completed onboarding but haven't been active.
//  * Sends emails at 7, 14, 30 days of inactivity.
//  */
// crons.daily(
//   "check-inactive-users",
//   { hourUTC: 11, minuteUTC: 0 },
//   internal.userEngagement.checkInactiveUsers
// );

export default crons;
