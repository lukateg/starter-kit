# SaaS Starter Kit

A production-ready SaaS starter kit built with Next.js 15, Convex, Clerk, and Tailwind CSS 4. Clone it, paste your PRD, and let Claude Code build your app following battle-tested conventions.

## What's Pre-Built

- **Authentication** - Clerk with webhook sync to Convex, team invitations, middleware protection
- **App Shell** - Sidebar with project switcher, notifications, support widget, credit display
- **Landing Page** - Hero, features, pricing, FAQ, CTA sections with conversion-optimized structure
- **Blog System** - Convex DB-backed blog with webhook ingestion endpoint
- **Payments** - Lemon Squeezy with both credit-based and subscription models
- **Email Automation** - Resend integration with config-driven sequences and welcome flow
- **Onboarding** - Multi-step wizard framework with context-based state
- **Settings** - Personal, team, billing, notification preferences
- **Error Handling** - QueryState pattern, typed error codes, consistent error UI
- **SEO Foundations** - JSON-LD, robots.txt, sitemap.xml, Open Graph meta tags
- **Analytics** - PostHog (EU) + Meta Pixel with Conversion API
- **Retention** - Cancellation UX, inactivity detection, re-engagement emails (opt-in)
- **Public Changelog** - Config-driven timeline page
- **Legal Pages** - Privacy, terms, refund templates

## Quick Start

```bash
# 1. Clone this repo
git clone <your-repo-url> my-app
cd my-app

# 2. Install dependencies
npm install

# 3. Run the setup wizard
npm run setup
# Walks you through Convex, Clerk, and optional services with helpful links

# 4. Start development (two terminals)
npx convex dev     # Terminal 1: Convex backend
npm run dev        # Terminal 2: Next.js frontend
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, and [http://localhost:3000/sign-in](http://localhost:3000/sign-in) to test auth.

> **Re-run anytime:** `npm run setup` preserves existing values and lets you add services you skipped.

## Environment Setup

### Tier 1 - Required (app won't start without these)

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_CONVEX_URL` | Auto-set by `npx convex dev` |
| `CONVEX_DEPLOYMENT` | Auto-set by `npx convex dev` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) > Your app > API Keys |
| `CLERK_SECRET_KEY` | Same page as above |
| `CLERK_WEBHOOK_SECRET` | Clerk > Webhooks > Add endpoint: `https://[convex-url]/clerk-webhook` > Subscribe to: `user.created`, `user.updated`, `user.deleted` > Copy signing secret |

### Tier 2 - Core Features

| Variable | What it enables |
|----------|----------------|
| `RESEND_API_KEY` | Email sending (welcome flow, notifications) |
| `LEMONSQUEEZY_API_KEY` | Payments |
| `LEMONSQUEEZY_STORE_ID` | Payments |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Payment webhooks |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics |

### Tier 3 - Optional Enhancements

| Variable | What it enables |
|----------|----------------|
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta conversion tracking |
| `META_CONVERSION_API_ACCESS_TOKEN` | Server-side Meta tracking |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Cloudflare R2 storage |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | AI features |

See [DOCS/GUIDE/ENV_SETUP.md](DOCS/GUIDE/ENV_SETUP.md) for step-by-step instructions for each service.

## Building Your App

When you have a PRD or MVP spec:

1. Open this project in your IDE with Claude Code
2. Paste your PRD or describe your app
3. Claude Code reads `CLAUDE.md` and follows `DOCS/GUIDE/BUILD_FROM_PRD.md` to build your app:
   - Designs your schema (extending the existing tables)
   - Designs onboarding steps for minimum viable data collection
   - Builds app pages inside `src/app/(app)/projects/[projectId]/`
   - Customizes the landing page for your product
   - Configures sidebar navigation
4. After building, Claude presents the env var checklist for what you need to configure

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Frontend | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| Backend | Convex (real-time DB, functions, storage) |
| Auth | Clerk (OAuth + email) |
| Email | Resend |
| Payments | Lemon Squeezy |
| Analytics | PostHog (EU), Meta Pixel |
| Forms | React Hook Form + Zod |
| AI | Anthropic, Google, OpenAI SDKs + Vercel AI SDK |
| Charts | Recharts |
| Env Validation | @t3-oss/env-nextjs + Zod |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Public pages: landing, blog, privacy, terms, changelog
│   ├── (auth)/          # Clerk sign-in/sign-up
│   ├── (app)/           # Protected app pages
│   │   ├── onboarding/  # Multi-step onboarding wizard
│   │   └── projects/[projectId]/
│   │       ├── settings/  # Personal, team, billing, notifications
│   │       └── ...        # Your app pages go here
│   └── api/             # API routes (webhooks, checkout)
├── components/
│   ├── ui/              # shadcn/ui components (32+)
│   ├── app/             # App-specific components (sidebar, credit display, etc.)
│   └── query/           # QueryState error handling components
├── contexts/            # Auth + Project contexts
├── hooks/               # useQueryWithStatus, useDebounce, useMobile
└── lib/                 # Utilities (pricing, dates, cookie consent)

convex/
├── schema.ts            # Database schema (users, projects, teams, credits, subscriptions, etc.)
├── users.ts             # User management + credit system
├── projects.ts          # Project CRUD + team access
├── http.ts              # Webhook handlers (Clerk, Lemon Squeezy, blog ingestion)
├── emails.ts            # Resend email sending
├── emailAutomation/     # Config-driven email sequences
├── notifications.ts     # In-app notifications
├── supportTickets.ts    # Support system
├── teamInvitations.ts   # Team invite flow
├── blogArticles.ts      # Blog CRUD
├── lib/
│   ├── errors.ts        # Typed error codes + convenience functions
│   └── teamAuth.ts      # Team authorization helpers
└── utils/
    └── validators.ts    # Shared Zod validators (frontend + backend)

DOCS/
├── CORE/                # Deep reference docs for each system
├── GUIDE/               # AI build workflow + env setup
└── FOUNDER/             # Post-build growth guidance
```

## Development Commands

```bash
npm run setup        # Interactive env setup wizard
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npx convex dev       # Start Convex dev server (run alongside npm run dev)
npx convex deploy    # Deploy Convex to production
```

## Documentation

| Doc | Purpose |
|-----|---------|
| `CLAUDE.md` | AI coding conventions and rules (routing layer) |
| `DOCS/CORE/` | Deep reference for each major system (error handling, design system, pricing, auth, etc.) |
| `DOCS/GUIDE/BUILD_FROM_PRD.md` | Step-by-step workflow for building an app from a PRD |
| `DOCS/GUIDE/ENV_SETUP.md` | Detailed env var setup instructions |
| `DOCS/FOUNDER/` | Post-build guidance: launch checklist, SEO, growth, referrals |

## After Your App Is Built

Once your app is running, check `DOCS/FOUNDER/` for guidance on:

- **Launch Checklist** - Domain, production deployment, payment live mode, monitoring
- **SEO Playbook** - Blog strategy, keyword approach, internal linking
- **Programmatic SEO** - Framework for evaluating pSEO opportunities
- **Growth Basics** - Analytics setup, conversion funnels, email automation value
- **Referral System** - When and how to build a referral program (schema fields ready)

## MCP Servers

This project ships with `.mcp.json` configured for:
- **Convex MCP** - Database schema exploration, data querying, function debugging
- **PostHog MCP** - Analytics events, feature flags, user behavior

See [DOCS/CORE/MCP_SETUP.md](DOCS/CORE/MCP_SETUP.md) for configuration.
