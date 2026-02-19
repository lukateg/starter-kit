# Referral System

> **Purpose**: Guide for implementing a referral program. Schema fields are ready, code is built when needed.

## Why Referrals Work for SaaS

- Lower CAC than paid acquisition (word-of-mouth is free)
- Higher trust: referred users convert and retain better
- Compounds over time: each referral can generate more referrals

## What's Already in the Kit

### Schema Fields (on `users` table)
```
referralCode    — Unique code generated at signup (optional)
referredBy      — The referral code used during signup (optional)
```

These fields are already in the schema. No UI or flow ships by default — this doc guides you (or Claude Code) to build it when you're ready.

## When to Build It

**NOT before product-market fit.** Referral programs amplify existing demand — they don't create it. Build a referral system when:

- Users are returning regularly (week 1 retention > 30%)
- Some users are paying
- Users organically mention your product to others
- You want to accelerate growth without increasing ad spend

## Referral Models

### 1. Credit-Based Rewards
Both referrer and invitee get bonus credits.

```
Referrer gets: 50 bonus credits when invitee signs up
Invitee gets: 20 bonus credits on signup
```

**Best for**: Credit-based pricing models. Low cost, easy to implement.

### 2. Mutual Discounts
Both parties get a discount on their next purchase or subscription.

```
Referrer gets: 20% off next purchase
Invitee gets: 10% off first purchase
```

**Best for**: Subscription models. Creates urgency to purchase.

### 3. Tiered Bonuses
Rewards increase with more referrals.

```
1-5 referrals: 50 credits each
6-20 referrals: 75 credits each
21+ referrals: 100 credits each + "Ambassador" badge
```

**Best for**: Power users and community building.

## Implementation Guide

### Step 1: Generate Referral Codes

When a user signs up, generate a unique referral code:

```typescript
// In convex/users.ts, during user creation:
const referralCode = `${username}-${generateShortId()}`; // e.g., "john-x7k2m"
await ctx.db.patch(userId, { referralCode });
```

### Step 2: Capture Referrals at Signup

Add a `ref` query parameter to your signup URL:

```
https://yourapp.com/sign-up?ref=john-x7k2m
```

In the sign-up flow, read the `ref` param and store it:
```typescript
const searchParams = useSearchParams();
const referralCode = searchParams.get("ref");
// Pass to Clerk's signUp or store in metadata
```

When the webhook creates the user, save `referredBy`:
```typescript
await ctx.db.patch(newUserId, { referredBy: referralCode });
```

### Step 3: Trigger Rewards

When a referral is confirmed (signup, or payment for higher-value rewards):

```typescript
// Find the referrer
const referrer = await ctx.db
  .query("users")
  .filter((q) => q.eq(q.field("referralCode"), referredBy))
  .first();

if (referrer) {
  // Add bonus credits
  await ctx.db.patch(referrer._id, {
    credits: referrer.credits + REFERRAL_BONUS_CREDITS,
  });

  // Log the transaction
  await ctx.db.insert("creditTransactions", {
    userId: referrer.clerkId,
    type: "bonus",
    amount: REFERRAL_BONUS_CREDITS,
    balanceAfter: referrer.credits + REFERRAL_BONUS_CREDITS,
    description: `Referral bonus for inviting ${inviteeEmail}`,
    createdAt: Date.now(),
  });

  // Notify the referrer
  await ctx.db.insert("notifications", {
    userId: referrer._id,
    title: "Referral Reward",
    message: `You earned ${REFERRAL_BONUS_CREDITS} credits for referring a friend!`,
    type: "referral",
    isRead: false,
    createdAt: Date.now(),
  });
}
```

### Step 4: Sharing UI

Build a referral sharing component (in settings or a dedicated page):

```typescript
function ReferralShare({ referralCode }: { referralCode: string }) {
  const referralUrl = `${window.location.origin}/sign-up?ref=${referralCode}`;

  return (
    <div>
      <Label>Your referral link</Label>
      <div className="flex gap-2">
        <Input value={referralUrl} readOnly />
        <Button onClick={() => navigator.clipboard.writeText(referralUrl)}>
          Copy
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Share this link. You both earn credits when they sign up.
      </p>
    </div>
  );
}
```

## Measuring Referral Health

Track with PostHog:
- **Referral signups**: How many signups come from referral links
- **Referral conversion rate**: Referral link clicks → signups
- **Viral coefficient**: Average referrals per user (>1 means viral growth)
- **Referral revenue**: Revenue from referred users vs. organic

A healthy referral program: 10-20% of new signups come from referrals.
