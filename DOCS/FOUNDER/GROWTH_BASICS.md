# Growth Basics

> **Purpose**: Practical growth guidance for early-stage products

## The Conversion Funnel

Every SaaS follows this funnel. Measure each step:

```
Visitor → Sign-up → Onboarding → Activation → Payment → Retention
```

**Activation** = the moment the user gets value. Define this for YOUR product (e.g., "created first project", "generated first report", "invited a team member"). This is the most important metric to optimize.

## Setting Up PostHog

PostHog is pre-configured. Here's what to track from day 1:

### Key Events
```typescript
// Track in your app code:
posthog.capture("user_signed_up");
posthog.capture("onboarding_completed");
posthog.capture("activation_event", { type: "first_project_created" });
posthog.capture("feature_used", { feature: "your_core_feature" });
posthog.capture("purchase_completed", { plan: "standard", amount: 69 });
```

### Key Dashboards to Create
1. **Signup → Activation funnel**: What % of signups reach activation?
2. **Feature usage**: Which features are most/least used?
3. **Retention**: How many users return after day 1, 7, 30?
4. **Revenue**: MRR, purchases per week, average revenue per user

### Feature Flags
Use PostHog feature flags for gradual rollouts and A/B tests. Keep flag usage minimal — consolidate to as few callsites as possible.

## Landing Page Optimization

### What to Measure
- **Bounce rate**: If > 70%, your hero isn't compelling enough
- **CTA click rate**: If < 2%, your value proposition isn't clear
- **Sign-up conversion**: Visitors → sign-ups (benchmark: 2-5% for SaaS)
- **Scroll depth**: How far do visitors scroll? If they stop before pricing, your feature sections aren't engaging

### What to Test
- **Hero headline**: Test different value propositions (not features, benefits)
- **CTA text**: "Get Started Free" vs "Try It Now" vs "Start Building"
- **Social proof**: Add testimonials, logos, or metrics when you have them
- **Pricing display**: Test showing vs hiding prices, annual vs monthly default

## Email Automation Value

The kit ships with email automation (see `DOCS/CORE/EMAIL_AUTOMATIONS.md`). Key sequences:

### Welcome Flow (Active)
User signs up → welcome email → tips email (day 2) → check-in (day 5)

**Why it matters**: Users who receive a welcome sequence are 33% more likely to activate than those who don't.

### Re-Engagement (Opt-In)
User inactive for 7 days → "We miss you" email → "What's new" email

**Enable when**: You have enough users to justify it (50+). See `DOCS/CORE/RETENTION.md`.

## Meta Pixel (Paid Acquisition)

Don't start paid acquisition until:
1. Your landing page converts at 2%+ organically
2. You have a clear activation metric
3. You understand your customer acquisition cost (CAC) budget

When ready: Set up Meta Pixel for conversion tracking. The kit supports both client-side and server-side (Conversion API) tracking. See `DOCS/CORE/META_PIXEL_SETUP.md`.

## Referral Program

The starter kit has `referralCode` and `referredBy` schema fields ready. Don't build the full referral flow until:
- You have product-market fit signals (users are returning and paying)
- Users organically recommend your product (the referral program amplifies this, it doesn't create it)

When ready: See `DOCS/FOUNDER/REFERRAL_SYSTEM.md` for implementation guide.

## Organic vs Paid: When to Start What

| Stage | Focus |
|-------|-------|
| Pre-launch | SEO blog content (start now, it takes months to rank) |
| 0-100 users | Organic channels: blog, social media, communities, Product Hunt |
| 100-1000 users | Consider paid acquisition if unit economics work |
| 1000+ users | Diversify: SEO + paid + referrals + partnerships |

**The blog is your best friend early on.** It's free, it compounds, and it builds authority. See `DOCS/FOUNDER/SEO_PLAYBOOK.md`.

## Metrics That Matter (Early Stage)

Don't track everything. Focus on:

1. **Activation rate**: % of signups who reach your activation event
2. **Week 1 retention**: % of users who return after 7 days
3. **Revenue**: Total and per user (when you have paying users)

Everything else is secondary until these three are healthy.
