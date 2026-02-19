# Email Automation System

> **Status**: Active
> **Last Updated**: 2026-02-17

## Overview

The email automation system is a config-driven engine for sending timed email sequences. It ships with a **welcome flow** as a working example. Additional sequences (re-engagement, onboarding nudges, etc.) can be added as config + templates.

## Architecture

```
convex/emailAutomation/
├── index.ts        # Module exports
├── config.ts       # Sequence definitions (data-driven)
├── templates.ts    # Email HTML templates
├── queries.ts      # Find users pending their next email
├── sequences.ts    # CRON processor - sends pending emails
└── triggers.ts     # Event handlers to start sequences
```

**How it works:**
1. A **trigger** (signup, inactivity, purchase) starts a sequence for a user
2. A **CRON job** runs periodically, finds users due for their next email
3. The CRON job sends the email using Resend and logs it in `emailEvents`
4. The next email in the sequence is scheduled based on delay config

## Email Provider: Resend

All emails are sent via [Resend](https://resend.com) using `convex/emails.ts`.

### Setup
1. Create a Resend account
2. Get API key (starts with `re_`)
3. Set as Convex env var: `npx convex env set RESEND_API_KEY re_...`
4. (Optional) Verify a custom domain for better deliverability

## Shipped Sequences

### Welcome Flow (Active)

Triggered when a new user signs up.

| Step | Timing | Purpose |
|------|--------|---------|
| 0 | Immediate | Welcome email — introduce the product, key features |
| 1 | Day 2 | Tips email — quick wins to drive activation |
| 2 | Day 5 | Check-in — encourage engagement, link to help |

### Inactivity Re-Engagement (Opt-In)

Triggered when a user is inactive for N days. **Commented out by default.**

| Step | Timing | Purpose |
|------|--------|---------|
| 0 | Immediate | "We miss you" — highlight what's new |
| 1 | Day 3 | "What's new" — feature updates, content updates |

See `DOCS/CORE/RETENTION.md` for how to enable.

## Config-Driven Sequences

Sequences are defined as data in `config.ts`:

```typescript
export const SEQUENCES = {
  welcome: {
    id: "welcome",
    name: "Welcome Flow",
    description: "Onboarding sequence for new users",
    steps: [
      {
        stepNumber: 0,
        delayDays: 0,
        isImmediate: true,
        templateKey: "welcome_day0",
        subject: "Welcome to [Your App]!",
        emailType: "welcome_day0",
      },
      {
        stepNumber: 1,
        delayDays: 2,
        isImmediate: false,
        templateKey: "welcome_day2",
        subject: "Quick wins to get started",
        emailType: "welcome_day2",
      },
      {
        stepNumber: 2,
        delayDays: 5,
        isImmediate: false,
        templateKey: "welcome_day5",
        subject: "How's it going?",
        emailType: "welcome_day5",
      },
    ],
  },
};
```

## Template System

Templates in `templates.ts` are functions that return HTML:

```typescript
export const TEMPLATES: Record<string, TemplateFunction> = {
  welcome_day0: (ctx: { userName: string; appUrl: string }) => `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome, ${ctx.userName}!</h1>
        <p>Thanks for signing up. Here's how to get started...</p>
        <a href="${ctx.appUrl}">Open Your Dashboard</a>
      </body>
    </html>
  `,
};
```

## Adding a New Sequence

1. **Define config** in `config.ts` — add sequence ID, steps with delays and template keys
2. **Create templates** in `templates.ts` — add HTML templates for each step
3. **Add trigger** in `triggers.ts` — define what event starts the sequence
4. **Add query** in `queries.ts` — query to find users due for next email
5. The existing CRON in `sequences.ts` will pick up the new sequence automatically

## Email Event Tracking

Every sent email is logged in the `emailEvents` table:

```
emailEvents:
  userId       — Who received it
  emailType    — Which template was sent
  sentAt       — When it was sent
  sequenceId   — Which sequence it belongs to
```

This prevents duplicate sends and enables analytics on email performance.

## Unsubscribe System

The kit includes an unsubscribe mechanism:
- Each user has an `emailUnsubscribeToken` (generated at signup)
- Unsubscribe link in email footer: `/unsubscribe?token={token}`
- Unsubscribe page at `src/app/unsubscribe/page.tsx`
- When unsubscribed, `unsubscribedFromAll` is set on the user
- The CRON checks this flag before sending any email

## Email Preferences

Users can manage email preferences in Settings > Email Preferences:
- Product updates
- Engagement emails
- Master "all emails" switch

## Important Notes

- **Resend rate limits**: Be aware of Resend's rate limits (varies by plan)
- **Test in development**: Use Resend's test mode or a test email address
- **Email footer**: All emails should include an unsubscribe link (CAN-SPAM compliance)
- **Deliverability**: Verify a custom domain in Resend for better inbox placement
- **No scattered email sending**: All emails go through the automation engine or `convex/emails.ts`. Never send emails from random mutation files.
