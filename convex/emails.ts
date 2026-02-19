"use node";

/**
 * Email Service - Resend Integration
 *
 * Handles all transactional emails: credit warnings, support tickets,
 * onboarding reminders, inactive user re-engagement, and welcome sequence.
 *
 * All functions check email preferences before sending and track
 * delivery via the emailEvents system.
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { EMAIL_SEQUENCES, EMAIL_TYPES } from "./emailEvents";

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// Types
// ============================================

type ResendEmailResponse = {
  data?: { id: string };
  error?: {
    message: string;
    name?: string;
  } | null;
};

type EmailSendResult =
  | { success: true; resendId?: string }
  | { success: false; reason: string; error: string };

// ============================================
// Helpers
// ============================================

const FROM_ADDRESS = `Your App <noreply@${process.env.EMAIL_DOMAIN || "yourdomain.com"}>`;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Your App";

function getDefaultPrefs() {
  return {
    productUpdates: true,
    engagementEmails: true,
    allEmails: true,
    updatedAt: Date.now(),
  };
}

function isRateLimitError(error: ResendEmailResponse["error"]): boolean {
  return error?.name === "rate_limit_exceeded" || error?.name === "rate_limit";
}

/**
 * Shared email layout wrapper.
 * Keeps every email visually consistent: white card on light background,
 * system font stack, dark header, and a footer with unsubscribe link.
 */
function emailLayout(opts: {
  title: string;
  body: string;
  unsubscribeUrl?: string;
  footerText?: string;
}): string {
  const footer = opts.unsubscribeUrl
    ? `<p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 18px; text-align: center;">
        ${opts.footerText || `You're receiving this because you have an account with ${APP_NAME}.`}
        <br />
        <a href="${opts.unsubscribeUrl}" style="color: #a1a1aa; text-decoration: underline;">Unsubscribe</a>
      </p>`
    : `<p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 18px; text-align: center;">
        ${opts.footerText || `Sent by ${APP_NAME}`}
      </p>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 4px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">${opts.title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              ${opts.body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Dark CTA button */
function ctaButton(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
    <tr>
      <td style="background-color: #171717; border-radius: 4px;">
        <a href="${href}" style="display: inline-block; padding: 12px 24px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ============================================
// 1. Check & Notify Low Credits
// ============================================

/**
 * Check if credits dropped below threshold and send warning + in-app notification.
 * Called from deductCreditsInternal in users.ts after every credit deduction.
 */
export const checkAndNotifyLowCredits = internalAction({
  args: {
    userId: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const THRESHOLD = 20;

    // Only fire when credits first cross the threshold (avoid spam on repeated deductions)
    if (args.credits > THRESHOLD) return;
    if (args.credits !== THRESHOLD && args.credits !== THRESHOLD - 1) return;

    const user = await ctx.runQuery(internal.users.getUser, {
      subject: args.userId,
    });

    if (!user) return;

    // Send the styled email
    try {
      await ctx.runAction(internal.emails.sendLowCreditsWarning, {
        userId: user.clerkId,
        userEmail: user.email,
        userName: user.name || "there",
        credits: args.credits,
      });
    } catch (error) {
      console.error("Failed to send low credits warning:", error);
    }

    // Also create in-app notification
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: user.clerkId,
      type: "credits_low",
      title: "Low Credits Warning",
      message: `You have ${args.credits} credits remaining. Purchase more to continue using the app.`,
      metadata: { credits: args.credits },
    });
  },
});

/**
 * Send low credits warning email.
 * Checks email preferences, sends via Resend, tracks the event.
 */
export const sendLowCreditsWarning = internalAction({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args): Promise<EmailSendResult> => {
    const sequenceId = EMAIL_SEQUENCES.LOW_CREDITS;
    const emailType = EMAIL_TYPES.LOW_CREDITS_WARNING;

    try {
      // Check if already sent recently
      const alreadySent = await ctx.runQuery(
        internal.emailEvents.hasEmailBeenSent,
        { userId: args.userId, emailType }
      );

      if (alreadySent) {
        return { success: false, reason: "already_sent", error: "Low credits email already sent" };
      }

      // Look up user and check preferences
      const user = await ctx.runQuery(internal.users.getUser, {
        subject: args.userId,
      });

      if (!user) {
        return { success: false, reason: "user_not_found", error: "User not found" };
      }

      const prefs = user.emailPreferences || getDefaultPrefs();

      if (!prefs.allEmails || !prefs.productUpdates) {
        await ctx.runMutation(internal.emailEvents.trackEmailSkipped, {
          userId: args.userId,
          email: args.userEmail,
          sequenceId,
          stepNumber: 0,
          emailType,
          skipReason: "unsubscribed",
          metadata: { credits: args.credits },
        });
        return { success: false, reason: "unsubscribed", error: "User unsubscribed" };
      }

      // Unsubscribe token
      let unsubscribeToken = user.emailUnsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = await ctx.runMutation(
          internal.emailPreferences.generateUnsubscribeToken,
          { userId: user._id }
        );
      }

      const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}&category=product_updates`;

      const html = emailLayout({
        title: "Your credits are running low",
        unsubscribeUrl,
        body: `
          <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
            Hi ${args.userName},
          </p>
          <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
            Just a heads up &mdash; you have <strong style="color: #171717;">${args.credits} credits</strong> remaining in your account.
          </p>
          <p style="margin: 0 0 24px 0; color: #71717a; font-size: 16px; line-height: 24px;">
            To keep things running smoothly, consider topping up soon.
          </p>
          ${ctaButton("Buy More Credits", `${APP_URL}/settings/billing`)}
        `,
      });

      const { data, error } = (await resend.emails.send({
        from: FROM_ADDRESS,
        to: args.userEmail,
        subject: "Your credits are running low",
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        html,
      })) as ResendEmailResponse;

      if (error) {
        if (isRateLimitError(error)) {
          console.error("Resend rate limit hit for low credits email");
        }
        await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
          userId: args.userId,
          email: args.userEmail,
          sequenceId,
          stepNumber: 0,
          emailType,
          failureReason: error.message,
          metadata: { credits: args.credits },
        });
        return { success: false, reason: "send_failed", error: error.message };
      }

      await ctx.runMutation(internal.emailEvents.trackEmailSent, {
        userId: args.userId,
        email: args.userEmail,
        sequenceId,
        stepNumber: 0,
        emailType,
        resendId: data?.id,
        metadata: { credits: args.credits },
      });

      return { success: true, resendId: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Low credits email error:", message);
      await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
        userId: args.userId,
        email: args.userEmail,
        sequenceId,
        stepNumber: 0,
        emailType,
        failureReason: message,
        metadata: { credits: args.credits },
      });
      return { success: false, reason: "exception", error: message };
    }
  },
});

// ============================================
// 2. Support Ticket Notification
// ============================================

/**
 * Send admin notification for a new support ticket.
 * Sends to SUPPORT_EMAIL env var (or fallback).
 */
export const sendSupportTicketNotification = internalAction({
  args: {
    ticketId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    subject: v.string(),
    description: v.string(),
    priority: v.string(),
  },
  handler: async (_ctx, args) => {
    const adminEmail =
      process.env.SUPPORT_EMAIL || "support@yourdomain.com";

    try {
      const html = emailLayout({
        title: "New Support Ticket",
        footerText: `Reply to this ticket by responding to ${args.userEmail}`,
        body: `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e4e4e7; border-radius: 4px; overflow: hidden;">
            <tr>
              <td style="padding: 12px 16px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7; width: 120px;">
                <p style="margin: 0; color: #71717a; font-size: 12px; font-weight: 600; text-transform: uppercase;">Priority</p>
              </td>
              <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #171717; font-size: 14px; font-weight: 600;">${args.priority.toUpperCase()}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #71717a; font-size: 12px; font-weight: 600; text-transform: uppercase;">User</p>
              </td>
              <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #171717; font-size: 14px;"><strong>${args.userName}</strong></p>
                <p style="margin: 4px 0 0 0; color: #71717a; font-size: 14px;">${args.userEmail}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #71717a; font-size: 12px; font-weight: 600; text-transform: uppercase;">Subject</p>
              </td>
              <td style="padding: 12px 16px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #171717; font-size: 14px; font-weight: 600;">${args.subject}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background-color: #fafafa;">
                <p style="margin: 0; color: #71717a; font-size: 12px; font-weight: 600; text-transform: uppercase;">Ticket ID</p>
              </td>
              <td style="padding: 12px 16px; background-color: #ffffff;">
                <p style="margin: 0; color: #71717a; font-size: 14px; font-family: monospace;">${args.ticketId}</p>
              </td>
            </tr>
          </table>

          <div style="padding: 16px; background-color: #fafafa; border-radius: 4px; border-left: 3px solid #171717;">
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; font-weight: 600; text-transform: uppercase;">Description</p>
            <p style="margin: 0; color: #171717; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${args.description}</p>
          </div>
        `,
      });

      const { error } = (await resend.emails.send({
        from: FROM_ADDRESS,
        to: adminEmail,
        subject: `[Support] ${args.subject} (${args.priority})`,
        replyTo: args.userEmail,
        html,
      })) as ResendEmailResponse;

      if (error) {
        if (isRateLimitError(error)) {
          console.error("Resend rate limit hit for support ticket email");
        }
        console.error("Failed to send support ticket notification:", error.message);
        return { success: false, reason: "send_failed", error: error.message };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Support ticket email error:", message);
      return { success: false, reason: "exception", error: message };
    }
  },
});

// ============================================
// 3. Onboarding Reminder Emails
// ============================================

const ONBOARDING_EMAILS: Record<
  number,
  { subject: string; title: string; body: (name: string) => string }
> = {
  // Reminder 1: gentle nudge
  1: {
    subject: "Finish setting up your account",
    title: "You're almost there",
    body: (name) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Looks like you started setting up your account but didn't quite finish. It only takes a minute to complete, and you'll be ready to go.
      </p>
      <p style="margin: 0 0 24px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Pick up where you left off:
      </p>
      ${ctaButton("Complete Setup", `${APP_URL}/onboarding`)}
    `,
  },
  // Reminder 2: value reminder
  2: {
    subject: "Don't miss out on what's waiting for you",
    title: "Your account is ready for you",
    body: (name) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        We noticed you haven't finished setting up yet. Once you complete onboarding, you'll have access to everything the platform offers.
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        It takes less than a minute:
      </p>
      ${ctaButton("Finish Onboarding", `${APP_URL}/onboarding`)}
    `,
  },
  // Reminder 3: last chance
  3: {
    subject: "Last reminder: your setup is incomplete",
    title: "One last nudge",
    body: (name) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        This is our last reminder &mdash; your account setup is still incomplete. We'd love for you to give it a try, but we won't keep bugging you after this.
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        If you have any questions or ran into issues, just reply to this email. We're happy to help.
      </p>
      ${ctaButton("Complete Setup", `${APP_URL}/onboarding`)}
    `,
  },
};

/**
 * Send onboarding completion reminder email.
 * Called from userEngagement.ts cron. 3 variants based on reminderNumber.
 */
export const sendOnboardingReminderEmail = internalAction({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    reminderNumber: v.number(),
  },
  handler: async (ctx, args): Promise<EmailSendResult> => {
    const emailType = `onboarding_reminder_${args.reminderNumber}` as string;
    const sequenceId = EMAIL_SEQUENCES.ONBOARDING;

    try {
      // Check if already sent
      const alreadySent = await ctx.runQuery(
        internal.emailEvents.hasEmailBeenSent,
        { userId: args.userId, emailType }
      );

      if (alreadySent) {
        return { success: false, reason: "already_sent", error: "Email already sent" };
      }

      // Check preferences
      const user = await ctx.runQuery(internal.users.getUser, {
        subject: args.userId,
      });

      if (!user) {
        return { success: false, reason: "user_not_found", error: "User not found" };
      }

      const prefs = user.emailPreferences || getDefaultPrefs();

      if (!prefs.allEmails || !prefs.engagementEmails) {
        await ctx.runMutation(internal.emailEvents.trackEmailSkipped, {
          userId: args.userId,
          email: args.userEmail,
          sequenceId,
          stepNumber: args.reminderNumber,
          emailType,
          skipReason: "unsubscribed",
          metadata: { reminderNumber: args.reminderNumber },
        });
        return { success: false, reason: "unsubscribed", error: "User unsubscribed" };
      }

      // Unsubscribe token
      let unsubscribeToken = user.emailUnsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = await ctx.runMutation(
          internal.emailPreferences.generateUnsubscribeToken,
          { userId: user._id }
        );
      }

      const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}&category=engagement`;
      const template = ONBOARDING_EMAILS[args.reminderNumber] || ONBOARDING_EMAILS[1];

      const html = emailLayout({
        title: template.title,
        unsubscribeUrl,
        body: template.body(args.userName),
      });

      const { data, error } = (await resend.emails.send({
        from: FROM_ADDRESS,
        to: args.userEmail,
        subject: template.subject,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        html,
      })) as ResendEmailResponse;

      if (error) {
        if (isRateLimitError(error)) {
          console.error("Resend rate limit hit for onboarding reminder");
        }
        await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
          userId: args.userId,
          email: args.userEmail,
          sequenceId,
          stepNumber: args.reminderNumber,
          emailType,
          failureReason: error.message,
          metadata: { reminderNumber: args.reminderNumber },
        });
        return { success: false, reason: "send_failed", error: error.message };
      }

      await ctx.runMutation(internal.emailEvents.trackEmailSent, {
        userId: args.userId,
        email: args.userEmail,
        sequenceId,
        stepNumber: args.reminderNumber,
        emailType,
        resendId: data?.id,
        metadata: { reminderNumber: args.reminderNumber },
      });

      return { success: true, resendId: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Onboarding reminder email error:", message);
      await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
        userId: args.userId,
        email: args.userEmail,
        sequenceId,
        stepNumber: args.reminderNumber,
        emailType,
        failureReason: message,
        metadata: { reminderNumber: args.reminderNumber },
      });
      return { success: false, reason: "exception", error: message };
    }
  },
});

// ============================================
// 4. Inactive User Re-engagement Emails
// ============================================

const INACTIVE_EMAILS: Record<
  number,
  { subject: string; title: string; body: (name: string, days: number) => string }
> = {
  // Email 1 (~7 days): gentle check-in
  1: {
    subject: "It's been a while - everything okay?",
    title: "We noticed you've been away",
    body: (name, days) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        It's been about ${days} days since you last logged in. Just checking in to make sure everything is working well for you.
      </p>
      <p style="margin: 0 0 24px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        If you ran into any issues, feel free to reply to this email. We're here to help.
      </p>
      ${ctaButton("Log Back In", APP_URL)}
    `,
  },
  // Email 2 (~14 days): value reminder
  2: {
    subject: "Your account is waiting for you",
    title: "Pick up where you left off",
    body: (name, days) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        It's been ${days} days since your last visit. Your account and data are still right where you left them.
      </p>
      <p style="margin: 0 0 24px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Jump back in whenever you're ready:
      </p>
      ${ctaButton("Open Your Dashboard", APP_URL)}
    `,
  },
  // Email 3 (~30 days): last chance
  3: {
    subject: "Quick question about your account",
    title: "We'd love your feedback",
    body: (name, days) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        It's been ${days} days since you've logged in, and we wanted to reach out one last time.
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        If there's something we could do better, we'd genuinely love to hear about it. Just reply to this email with any thoughts.
      </p>
      <p style="margin: 0 0 24px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Either way, your account will be here whenever you need it.
      </p>
      ${ctaButton("Visit Your Account", APP_URL)}
    `,
  },
};

/**
 * Send inactive user re-engagement email.
 * Called from userEngagement.ts cron. 3 variants based on reminderNumber.
 */
export const sendInactiveUserEmail = internalAction({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    reminderNumber: v.number(),
    daysSinceActive: v.number(),
  },
  handler: async (ctx, args): Promise<EmailSendResult> => {
    const emailType = `inactive_${args.reminderNumber === 1 ? "7d" : args.reminderNumber === 2 ? "14d" : "30d"}`;
    const sequenceId = EMAIL_SEQUENCES.INACTIVE_USER;

    try {
      // Check if already sent
      const alreadySent = await ctx.runQuery(
        internal.emailEvents.hasEmailBeenSent,
        { userId: args.userId, emailType }
      );

      if (alreadySent) {
        return { success: false, reason: "already_sent", error: "Email already sent" };
      }

      // Check preferences
      const user = await ctx.runQuery(internal.users.getUser, {
        subject: args.userId,
      });

      if (!user) {
        return { success: false, reason: "user_not_found", error: "User not found" };
      }

      const prefs = user.emailPreferences || getDefaultPrefs();

      if (!prefs.allEmails || !prefs.engagementEmails) {
        await ctx.runMutation(internal.emailEvents.trackEmailSkipped, {
          userId: args.userId,
          email: args.userEmail,
          sequenceId,
          stepNumber: args.reminderNumber,
          emailType,
          skipReason: "unsubscribed",
          metadata: { daysSinceActivity: args.daysSinceActive },
        });
        return { success: false, reason: "unsubscribed", error: "User unsubscribed" };
      }

      // Unsubscribe token
      let unsubscribeToken = user.emailUnsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = await ctx.runMutation(
          internal.emailPreferences.generateUnsubscribeToken,
          { userId: user._id }
        );
      }

      const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}&category=engagement`;
      const template = INACTIVE_EMAILS[args.reminderNumber] || INACTIVE_EMAILS[1];

      const html = emailLayout({
        title: template.title,
        unsubscribeUrl,
        body: template.body(args.userName, args.daysSinceActive),
      });

      const { data, error } = (await resend.emails.send({
        from: FROM_ADDRESS,
        to: args.userEmail,
        subject: template.subject,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        html,
      })) as ResendEmailResponse;

      if (error) {
        if (isRateLimitError(error)) {
          console.error("Resend rate limit hit for inactive user email");
        }
        await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
          userId: args.userId,
          email: args.userEmail,
          sequenceId,
          stepNumber: args.reminderNumber,
          emailType,
          failureReason: error.message,
          metadata: { daysSinceActivity: args.daysSinceActive },
        });
        return { success: false, reason: "send_failed", error: error.message };
      }

      await ctx.runMutation(internal.emailEvents.trackEmailSent, {
        userId: args.userId,
        email: args.userEmail,
        sequenceId,
        stepNumber: args.reminderNumber,
        emailType,
        resendId: data?.id,
        metadata: { daysSinceActivity: args.daysSinceActive },
      });

      return { success: true, resendId: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Inactive user email error:", message);
      await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
        userId: args.userId,
        email: args.userEmail,
        sequenceId,
        stepNumber: args.reminderNumber,
        emailType,
        failureReason: message,
        metadata: { daysSinceActivity: args.daysSinceActive },
      });
      return { success: false, reason: "exception", error: message };
    }
  },
});

// ============================================
// 5. Welcome Sequence Emails
// ============================================

const WELCOME_EMAILS: Record<
  number,
  { subject: string; title: string; body: (name: string) => string }
> = {
  // Step 0: immediate welcome
  0: {
    subject: `Welcome to ${APP_NAME}!`,
    title: "Welcome aboard",
    body: (name) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Thanks for signing up! We're glad to have you.
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Your account is all set up and ready to go. If you haven't already, the best next step is to complete your onboarding so everything is configured for you.
      </p>
      ${ctaButton("Get Started", `${APP_URL}/onboarding`)}
      <p style="margin: 24px 0 0 0; color: #71717a; font-size: 14px; line-height: 22px;">
        If you have any questions, just reply to this email. We're here to help.
      </p>
    `,
  },
  // Step 1: tips (day 2)
  1: {
    subject: "A few tips to get the most out of your account",
    title: "Quick tips to get started",
    body: (name) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        Now that you've had a chance to look around, here are a few tips to help you get the most value:
      </p>
      <div style="margin: 0 0 16px 0; padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #171717; font-size: 14px; font-weight: 600;">1. Complete your project setup</p>
        <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 22px;">
          Make sure your project details are filled in so everything works smoothly.
        </p>
      </div>
      <div style="margin: 0 0 16px 0; padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #171717; font-size: 14px; font-weight: 600;">2. Explore the dashboard</p>
        <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 22px;">
          Your dashboard gives you a quick overview of everything happening in your account.
        </p>
      </div>
      <div style="margin: 0 0 24px 0; padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #171717; font-size: 14px; font-weight: 600;">3. Invite your team</p>
        <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 22px;">
          Collaborate with your team by inviting them from your project settings.
        </p>
      </div>
      ${ctaButton("Open Dashboard", APP_URL)}
    `,
  },
  // Step 2: check-in (day 5)
  2: {
    subject: "How's everything going?",
    title: "Quick check-in",
    body: (name) => `
      <p style="margin: 0 0 16px 0; color: #171717; font-size: 16px; line-height: 24px;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        You've been with us for a few days now, and we wanted to check in. How's everything going so far?
      </p>
      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 16px; line-height: 24px;">
        If you've run into any questions or issues, feel free to reply to this email or reach out through our help center. We read every message.
      </p>
      ${ctaButton("Visit Help Center", `${APP_URL}/help`)}
      <p style="margin: 24px 0 0 0; color: #71717a; font-size: 14px; line-height: 22px;">
        Thanks for being here. We're building this for people like you, and your feedback makes a real difference.
      </p>
    `,
  },
};

/**
 * Send welcome sequence email.
 * Called from emailAutomation triggers. Steps: 0 = welcome, 1 = tips (day 2), 2 = check-in (day 5).
 */
export const sendWelcomeEmail = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    stepNumber: v.number(),
  },
  handler: async (ctx, args): Promise<EmailSendResult> => {
    const emailType =
      args.stepNumber === 0
        ? EMAIL_TYPES.WELCOME_DAY_0
        : args.stepNumber === 1
          ? EMAIL_TYPES.WELCOME_DAY_2
          : EMAIL_TYPES.WELCOME_DAY_5;
    const sequenceId = EMAIL_SEQUENCES.WELCOME;

    try {
      // Check if already sent
      const alreadySent = await ctx.runQuery(
        internal.emailEvents.hasEmailBeenSent,
        { userId: args.userId, emailType }
      );

      if (alreadySent) {
        return { success: false, reason: "already_sent", error: "Email already sent" };
      }

      // Check preferences
      const user = await ctx.runQuery(internal.users.getUser, {
        subject: args.userId,
      });

      if (!user) {
        return { success: false, reason: "user_not_found", error: "User not found" };
      }

      const prefs = user.emailPreferences || getDefaultPrefs();

      if (!prefs.allEmails || !prefs.engagementEmails) {
        await ctx.runMutation(internal.emailEvents.trackEmailSkipped, {
          userId: args.userId,
          email: args.email,
          sequenceId,
          stepNumber: args.stepNumber,
          emailType,
          skipReason: "unsubscribed",
        });
        return { success: false, reason: "unsubscribed", error: "User unsubscribed" };
      }

      // Unsubscribe token
      let unsubscribeToken = user.emailUnsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = await ctx.runMutation(
          internal.emailPreferences.generateUnsubscribeToken,
          { userId: user._id }
        );
      }

      const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}&category=engagement`;
      const template = WELCOME_EMAILS[args.stepNumber] || WELCOME_EMAILS[0];
      const displayName = args.name || "there";

      const html = emailLayout({
        title: template.title,
        unsubscribeUrl,
        body: template.body(displayName),
      });

      const { data, error } = (await resend.emails.send({
        from: FROM_ADDRESS,
        to: args.email,
        subject: template.subject,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        html,
      })) as ResendEmailResponse;

      if (error) {
        if (isRateLimitError(error)) {
          console.error("Resend rate limit hit for welcome email");
        }
        await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
          userId: args.userId,
          email: args.email,
          sequenceId,
          stepNumber: args.stepNumber,
          emailType,
          failureReason: error.message,
        });
        return { success: false, reason: "send_failed", error: error.message };
      }

      await ctx.runMutation(internal.emailEvents.trackEmailSent, {
        userId: args.userId,
        email: args.email,
        sequenceId,
        stepNumber: args.stepNumber,
        emailType,
        resendId: data?.id,
      });

      return { success: true, resendId: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Welcome email error:", message);
      await ctx.runMutation(internal.emailEvents.trackEmailFailed, {
        userId: args.userId,
        email: args.email,
        sequenceId,
        stepNumber: args.stepNumber,
        emailType,
        failureReason: message,
      });
      return { success: false, reason: "exception", error: message };
    }
  },
});
