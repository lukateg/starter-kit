# Pricing System

> **Status**: Active
> **Last Updated**: 2026-02-17
> **Single Source of Truth**: `src/lib/pricing/index.ts` for config, this doc for architecture

## Overview

The starter kit supports two payment models, both via **Lemon Squeezy**:

1. **Credits** — One-time purchases. Users buy credit packs, spend credits on actions.
2. **Subscriptions** — Recurring billing. Users subscribe to plans with monthly/yearly cycles.

You can use either model or both. The schema, webhook handling, and UI support both.

## Payment Provider: Lemon Squeezy

### Setup
1. Create an account at [lemonsqueezy.com](https://www.lemonsqueezy.com)
2. Create a Store
3. Create Products (credit packages or subscription plans)
4. Get your API key and Store ID
5. Set up webhook pointing to `https://[convex-site-url]/lemonsqueezy-webhook`
6. Set env vars: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`

### Webhook Events
The webhook handler in `convex/http.ts` validates HMAC-SHA256 signatures and routes events:

| Event | Action |
|-------|--------|
| `order_created` | Add credits to user (credit model) |
| `subscription_created` | Insert row in `subscriptions` table |
| `subscription_updated` | Patch subscription status/period |
| `subscription_cancelled` | Patch status, record cancellation reason |

### Webhook Security
All webhook payloads are verified using HMAC-SHA256 with `LEMONSQUEEZY_WEBHOOK_SECRET`. Never process unverified payloads.

## Credit Model

### Configuration (`src/lib/pricing/index.ts`)

This file is the **single source of truth** for all credit pricing:

```typescript
// Credit costs per action
export const CREDIT_COSTS = {
  YOUR_ACTION: 10,        // Define your action costs here
} as const;

// Free tier
export const FREE_TIER = {
  INITIAL_FREE_CREDITS: 60,
} as const;

// Warning thresholds
export const CREDIT_THRESHOLDS = {
  LOW_CREDITS_WARNING: 50,
  CRITICAL_CREDITS: 20,
} as const;

// Packages available for purchase
export const CREDIT_PACKAGES: CreditPackageConfig[] = [
  { id: "standard", name: "Standard", credits: 630, price: 69, ... },
  { id: "premium", name: "Premium", credits: 1800, price: 169, ... },
];
```

### How Credits Work

1. **New user signup** → Gets `INITIAL_FREE_CREDITS` via `users.ts` mutation
2. **User performs action** → Backend checks `canAfford()`, deducts credits, logs to `creditTransactions`
3. **Credits run low** → `credit-warning-banner.tsx` shows warning based on thresholds
4. **User purchases** → Lemon Squeezy checkout → webhook → credits added

### Schema (Credit-Related)

```
users.credits              — Current balance (number)
creditTransactions         — Audit trail (userId, amount, type, balanceAfter, createdAt)
```

Transaction types: `purchase`, `usage`, `bonus`, `refund`

### Frontend Components
- `src/components/app/credit-display.tsx` — Shows current balance in sidebar
- `src/components/app/credit-warning-banner.tsx` — Low credit warning
- Settings > Billing page — Purchase packages, view transaction history

### Helper Functions
```typescript
import { canAfford, formatCredits, getCreditColorClass } from "@/lib/pricing";

// Check if user can perform action
if (!canAfford(user.credits, "YOUR_ACTION")) { /* show upgrade prompt */ }

// Format for display
formatCredits(150) // "150 credits"

// Get color classes based on amount
getCreditColorClass(15) // { text: "text-danger", bg: "bg-danger/10", ... }
```

## Subscription Model

### Schema (`subscriptions` table)

Subscriptions live in a **dedicated table**, not on the users table:

```
subscriptions:
  userId              — Reference to users table
  lemonsqueezyId      — Provider's subscription ID
  status              — active | cancelled | expired | past_due | paused
  planId              — Which plan
  amount              — Price in cents
  currency            — USD, EUR, etc.
  interval            — month | year
  currentPeriodStart  — Billing period start (Unix ms)
  currentPeriodEnd    — Billing period end (Unix ms)
  cancelAtPeriodEnd   — Will cancel at end of current period
  canceledAt          — When cancellation was requested
  cancellationReason  — User-provided reason
  startedAt           — When subscription started
  endedAt             — When subscription ended
  createdAt           — Record creation time
```

Indexes: `by_user` (userId), `by_provider` (lemonsqueezyId)

### Why a Separate Table?
- Keeps users table lean
- Allows subscription history (multiple subscriptions per user)
- Webhooks update subscriptions independently
- Clean separation of concerns

### Checking Subscription Status
```typescript
// In a Convex query/mutation:
const subscription = await ctx.db
  .query("subscriptions")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .filter((q) => q.eq(q.field("status"), "active"))
  .first();

const isSubscribed = subscription !== null;
```

### Webhook Audit Trail (`webhookEvents` table)

Every payment webhook event is logged for debugging:

```
webhookEvents:
  type              — Event type (e.g., "subscription_created")
  providerEventId   — Provider's unique event ID (for deduplication)
  data              — Full event payload
  createdAt         — When received
```

## Customizing for Your App

1. **Credit model**: Update `CREDIT_COSTS` in `src/lib/pricing/index.ts` with your action costs
2. **Credit packages**: Update `CREDIT_PACKAGES` with your pricing tiers
3. **Subscription plans**: Create plans in Lemon Squeezy dashboard, update plan IDs in your code
4. **Choosing a model**: You can use credits only, subscriptions only, or both. Comment out what you don't need.

## Important Notes

- **Convex backend can't import from `src/`**: Credit costs used in backend are duplicated in `convex/users.ts`. Keep them in sync.
- **DOCS/CORE/PRICING.md is the architecture doc**. `src/lib/pricing/index.ts` is the code-level config.
- **Webhook idempotency**: Use `providerEventId` from `webhookEvents` to prevent duplicate processing.
