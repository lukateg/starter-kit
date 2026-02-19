# Retention Mechanisms

> **Status**: Code ready, opt-in (not active by default)
> **Last Updated**: 2026-02-17

## Overview

The starter kit ships with retention mechanisms that are **commented out or disabled by default**. Enable what you need when you're ready.

Each mechanism is documented here with enable instructions so you (or Claude Code) can activate them easily.

## Mechanisms

### 1. Subscription Cancellation UX

**What it does**: When a user clicks "Cancel Subscription" in billing settings, they see a feedback form asking why they're leaving, followed by a discount offer to retain them.

**Flow**:
```
Cancel button → Feedback form (reason selection) → Discount offer → Confirm cancel
```

**Status**: Active in billing settings page.

**Components**:
- Settings > Billing > Cancel button → AlertDialog with feedback form
- Cancellation reason stored in `subscriptions.cancellationReason`
- Optional discount checkout link for retention

**Customizing**: Update the cancellation reasons and discount offer in the billing settings component.

### 2. Inactivity Detection + Re-Engagement Emails

**What it does**: A cron job checks `users.lastActiveAt` against a configurable threshold. Inactive users receive a re-engagement email sequence.

**Status**: Commented out. Enable by uncommenting the cron in `convex/crons.ts`.

**How to enable**:

1. Uncomment the inactivity cron in `convex/crons.ts`:
```typescript
// Uncomment to enable inactivity detection (runs daily)
// crons.daily("check-inactive-users", { hourUTC: 10, minuteUTC: 0 }, internal.userEngagement.checkInactiveUsers);
```

2. Configure thresholds in `convex/userEngagement.ts`:
```typescript
const INACTIVITY_THRESHOLD_DAYS = 7; // Days of inactivity before triggering
```

3. Set up the re-engagement email sequence in `convex/emailAutomation/config.ts`:
```typescript
{
  id: "inactive-reengagement",
  trigger: "user_inactive",
  emails: [
    { delay: 0, template: "we-miss-you" },
    { delay: 3 * 24 * 60 * 60 * 1000, template: "whats-new" }, // 3 days later
  ],
}
```

**The `lastActiveAt` field** is already on the users table. Update it whenever the user performs a meaningful action:
```typescript
await ctx.db.patch(userId, { lastActiveAt: Date.now() });
```

### 3. Credit Threshold Warnings

**What it does**: Shows a warning banner when user credits drop below configurable thresholds. Optionally sends a low-credit email.

**Status**: Banner is active. Email is commented out.

**Components**:
- `src/components/app/credit-warning-banner.tsx` — Shows in app when credits are low
- Thresholds configured in `src/lib/pricing/index.ts`:
  ```typescript
  CREDIT_THRESHOLDS = {
    LOW_CREDITS_WARNING: 50,   // Yellow warning
    CRITICAL_CREDITS: 20,      // Red critical
  }
  ```

**To enable email notification**: Uncomment the low-credit email trigger in the credit deduction logic in `convex/users.ts`.

## Enabling a Mechanism

For each mechanism:
1. Read the relevant section above
2. Uncomment the code indicated
3. Configure thresholds/copy for your app
4. Test the flow end-to-end

## Important Notes

- **Retention should only be enabled after product-market fit signals.** Don't try to retain users who haven't found value yet.
- **Email sequences use the config-driven engine** in `convex/emailAutomation/`. See `DOCS/CORE/EMAIL_AUTOMATIONS.md`.
- **All timestamps are UTC**. `lastActiveAt` stores `Date.now()` (Unix ms).
- **No extra schema fields needed** — `lastActiveAt` is already on the users table and serves both activity display and inactivity detection.
