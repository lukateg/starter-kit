# Environment Setup Guide

> **Purpose**: Step-by-step instructions for configuring each environment variable. Claude Code reads this after building to tell the user exactly what to set up.

## Tier 1: Required (App Won't Start)

### Convex

1. Run `npx convex dev` — this creates a Convex project and auto-sets:
   - `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
   - `CONVEX_DEPLOYMENT` in `.env.local`
2. That's it. Convex is ready for development.

**For production**: Run `npx convex deploy` to create a production deployment.

### Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Choose your sign-in methods (Google OAuth recommended + email)
3. Copy the **Publishable Key** from the API Keys page → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy the **Secret Key** → `CLERK_SECRET_KEY`
5. Set up webhook:
   - Go to **Webhooks** in the Clerk dashboard
   - Click **Add Endpoint**
   - URL: `https://[your-convex-url].convex.site/clerk-webhook`
     - Find your Convex site URL in the Convex dashboard under Settings > URL & Deploy Key
     - It looks like `https://your-deployment.convex.site`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`
6. **For local development**: Add `http://localhost:3000` to Clerk's allowed origins

**Where to put these**: Add to `.env.local` file. Also set `CLERK_WEBHOOK_SECRET` as a Convex environment variable via `npx convex env set CLERK_WEBHOOK_SECRET whsec_...`

---

## Tier 2: Core Features

### Resend (Email)

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys** and create a new key → `RESEND_API_KEY` (starts with `re_`)
3. Set as Convex env var: `npx convex env set RESEND_API_KEY re_...`

**Optional**: Add your verified domain under **Domains** in Resend. Without a custom domain, you can only send emails to the account email.

### Lemon Squeezy (Payments)

1. Go to [lemonsqueezy.com](https://www.lemonsqueezy.com) and create an account
2. Create a **Store**
3. Create **Products** (credit packages or subscription plans)
4. Go to **Settings > API** and create an API key → `LEMONSQUEEZY_API_KEY`
5. Note your **Store ID** (visible in the URL or settings) → `LEMONSQUEEZY_STORE_ID`
6. Set up webhook:
   - Go to **Settings > Webhooks**
   - URL: `https://[your-convex-url].convex.site/lemonsqueezy-webhook`
   - Subscribe to: `order_created`, `subscription_created`, `subscription_updated`, `subscription_cancelled`
   - Copy the **Signing Secret** → `LEMONSQUEEZY_WEBHOOK_SECRET`
7. Get **Variant IDs** for each product (visible in product settings):
   - `NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID`
   - `NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID`

**For testing**: Use Lemon Squeezy test mode (toggle in dashboard).

### PostHog (Analytics)

1. Go to [posthog.com](https://posthog.com) and create an account (EU or US)
2. Create a project
3. Go to **Settings > Project** and copy the **API Key** → `NEXT_PUBLIC_POSTHOG_KEY` (starts with `phc_`)
4. Set the host:
   - EU: `NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com`
   - US: `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`

**Note**: The Next.js config includes a reverse proxy for PostHog to avoid ad blockers.

---

## Tier 3: Optional Enhancements

### Meta Pixel (Conversion Tracking)

1. Go to [Meta Business Suite](https://business.facebook.com) > Events Manager
2. Create a new Pixel → `NEXT_PUBLIC_META_PIXEL_ID`
3. Generate a **Conversion API Access Token** → `META_CONVERSION_API_ACCESS_TOKEN`

See `DOCS/CORE/META_PIXEL_SETUP.md` for integration details.

### Cloudflare R2 (Storage)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > R2
2. Create a bucket → `R2_BUCKET_NAME`
3. Note your Account ID → `R2_ACCOUNT_ID`
4. Create API tokens with read/write access:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
5. Set `AWS_REGION=auto`
6. Set your public URL: `R2_PUBLIC_URL=https://your-bucket.r2.dev`

### AI SDKs

Add API keys for the providers you plan to use:

| Provider | Env Var | Get it from |
|----------|---------|-------------|
| Google Gemini | `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| Anthropic | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

Set these as Convex env vars if using them in backend actions: `npx convex env set GEMINI_API_KEY ...`

---

## Where Variables Go

| Variable prefix | Where to set |
|----------------|--------------|
| `NEXT_PUBLIC_*` | `.env.local` (needed by frontend) |
| Backend-only vars | Convex dashboard or `npx convex env set` |
| Both | `.env.local` AND Convex env vars |

**Convex env vars**: Variables used in `convex/` functions must be set via `npx convex env set VAR_NAME value` or in the Convex dashboard under Settings > Environment Variables.

## `.env.example`

The repo includes `.env.example` with all variables organized by tier. Copy it to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```
