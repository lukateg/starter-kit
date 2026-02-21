# CLAUDE.md

This is a SaaS starter kit built with Next.js 15, React 19, Convex, Clerk, and Tailwind CSS 4. It ships pre-built features (auth, payments, blog, email, onboarding, settings, SEO) so you only need to build the product-specific logic.

## Purpose of This Kit

- **What's pre-built**: Auth, app shell, landing page, blog, payments (credits + subscriptions), email automation, onboarding wizard, settings, error handling, SEO foundations, analytics, retention mechanisms, changelog
- **What you build**: Your app's core pages inside `src/app/(app)/projects/[projectId]/`, your schema extensions in `convex/schema.ts`, and your business logic in `convex/`
- **Who it's for**: Developer-founders who want to skip boilerplate and ship fast

## Development Commands

```bash
npm run dev          # Start Next.js dev server (Turbopack)
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npx convex dev       # Start Convex dev server (run alongside npm run dev)
```

## Tech Stack

Next.js 15 (App Router) | React 19 | Tailwind CSS 4 | shadcn/ui | Convex | Clerk | Resend | Lemon Squeezy | PostHog | Meta Pixel | React Hook Form + Zod

## Architecture Overview

```
src/app/
├── (marketing)/          # Public: landing, blog, privacy, terms, changelog
├── (auth)/               # Clerk sign-in/sign-up (catch-all routes)
├── (app)/                # Protected app pages
│   ├── onboarding/       # Multi-step wizard (renders without sidebar)
│   └── projects/[projectId]/
│       ├── settings/     # Personal, team, billing, notifications
│       └── [your-pages]/ # Build your app here
└── api/                  # Webhooks, checkout routes

convex/
├── schema.ts             # DB schema (users, projects, teams, credits, subscriptions, blog, etc.)
├── lib/errors.ts         # Typed error codes: UNAUTHENTICATED, UNAUTHORIZED, NOT_FOUND, VALIDATION_ERROR, SERVER_ERROR
├── lib/teamAuth.ts       # Team authorization helpers
├── emailAutomation/      # Config-driven email sequences
└── utils/validators.ts   # Shared Zod validators (used by both backend + frontend)
```

**Path alias**: `@/*` maps to `src/` — use `import { Button } from "@/components/ui/button"`

## MCP Servers

Configured in `.mcp.json`: **Convex MCP** (schema exploration, data querying) and **PostHog MCP** (analytics, feature flags). Use these tools when working with the database or analytics. See `DOCS/CORE/MCP_SETUP.md` for setup.

## Core Documentation (MANDATORY)

Before building or modifying ANY feature with a corresponding DOCS/CORE/ file, you MUST read that file first.

| When you're working on... | Read this first |
|---------------------------|-----------------|
| Error handling, query states, loading/error UI | `DOCS/CORE/ERROR_HANDLING.md` |
| UI components, colors, spacing, layout | `DOCS/CORE/DESIGN_SYSTEM.md` |
| Payments, credits, subscriptions, billing | `DOCS/CORE/PRICING.md` |
| AI features, structured output, streaming | `DOCS/CORE/AI_INTEGRATIONS.md` |
| Forms, validation, Zod schemas | `DOCS/CORE/FORMS_VALIDATION.md` |
| SEO, meta tags, JSON-LD, structured data | `DOCS/CORE/SEO.md` |
| Blog posts, content management, webhook ingestion | `DOCS/CORE/BLOG_SYSTEM.md` |
| Authentication, Clerk, webhooks, team invites | `DOCS/CORE/AUTHENTICATION.md` |
| Onboarding flow, new user experience | `DOCS/CORE/ONBOARDING.md` |
| Landing page sections, conversion patterns | `DOCS/CORE/LANDING_PAGE.md` |
| Marketing page copy, conversion rules, visual constraints | `DOCS/CORE/MARKETING_PAGES.md` |
| Email sending, automation sequences | `DOCS/CORE/EMAIL_AUTOMATIONS.md` |
| Performance, Core Web Vitals | `DOCS/CORE/TECHNICAL_SEO_PERFORMANCE.md` |
| Meta Pixel, conversion tracking | `DOCS/CORE/META_PIXEL_SETUP.md` |
| Retention, cancellation, inactivity, re-engagement | `DOCS/CORE/RETENTION.md` |
| MCP server configuration | `DOCS/CORE/MCP_SETUP.md` |
| Any public-facing page (SEO copywriting, keywords, pSEO) | `DOCS/CORE/SEO_BEST_PRACTICES.md` |

## Building a New App from a PRD

When a user provides a PRD, MVP spec, or asks you to "build this app", read `DOCS/GUIDE/BUILD_FROM_PRD.md` FIRST. It contains the step-by-step workflow for turning a product spec into a working app using this kit's conventions.

## Post-Build Guidance

After the app is built, if the user asks "what now?", "how do I grow?", or similar:
- Launch checklist → `DOCS/FOUNDER/LAUNCH_CHECKLIST.md`
- Digital presence & press kit → `DOCS/FOUNDER/DIGITAL_PRESENCE.md`
- SEO and blog strategy → `DOCS/FOUNDER/SEO_PLAYBOOK.md`
- Programmatic SEO → `DOCS/FOUNDER/PSEO_REFERENCE.md`
- Growth and analytics → `DOCS/FOUNDER/GROWTH_BASICS.md`
- Referral program → `DOCS/FOUNDER/REFERRAL_SYSTEM.md`
- SEO authority, backlinks & E-E-A-T → `DOCS/FOUNDER/SEO_AUTHORITY_BUILDING.md`

## Convex Runtime Rules

**Queries and mutations** run in Convex's V8 runtime (NOT Node.js):
- No `Buffer`, `fs`, `path`, `crypto`, or Node.js built-ins
- No `fetch` — HTTP calls are NOT allowed in queries/mutations
- Use `btoa()` for base64

**Actions** run in Node.js (`"use node"` directive). Use for:
- External API calls (Resend, Lemon Squeezy, AI SDKs, any HTTP request)
- Anything requiring Node.js modules

**Webhook safety**: NEVER forward raw external payloads to Convex mutations. Convex strict argument validation will crash with `ArgumentValidationError` if the external source adds new fields. Always destructure and extract only the fields you need:

```typescript
// BAD — will break if Clerk adds new fields
await ctx.runMutation(internal.users.upsertUser, clerkUserData);

// GOOD — extract only what you need
const userData = { clerkId: clerkUserData.id, email: clerkUserData.email_addresses[0]?.email_address };
await ctx.runMutation(internal.users.upsertUser, userData);
```

## Time Handling (STRICT)

Store UTC, display local. No exceptions.
- **Storage**: Always `Date.now()` (Unix milliseconds). Never formatted strings.
- **Backend**: All calculations in UTC. Crons run in UTC.
- **Display**: Convert to local ONLY at the UI layer with `date-fns` or `Intl.DateTimeFormat`. Never format dates in Convex functions.
- **Comparison**: Compare as numbers (`a > b`), never as strings.

## Error Display (No Layout Shifts)

- **Action errors** (API failures): Show in **toast** (sonner)
- **Input validation errors**: Show in **tooltip** on `AlertTriangle` icon positioned absolutely inside the input. Do NOT use inline text below inputs.
- **Page-level errors**: Handled by `QueryState` component (replaces content area)

## Code Quality Requirements

- **TypeScript strict**: The `any` type is NOT allowed
- **No console.log in frontend**: Remove before finishing. Only `console.error` for genuinely unexpected errors. Backend can use console logs.
- **Verify no errors**: Run `npm run typecheck` for frontend. Check Convex dev server output for backend.

## UI Rules

- **Always use CSS variables** (`bg-primary`, `text-foreground`, `border-border`) instead of hardcoded Tailwind colors (`bg-blue-50`, `text-gray-700`). Use opacity modifiers for lighter variations: `bg-primary/10`, `bg-danger/20`.
- **Always use shadcn/ui components**: Tabs for toggles, Dialog for modals, DropdownMenu for menus, Button for actions. Don't create custom implementations.
- **Destructive actions**: Use `variant="danger"` (soft red). NEVER use hard red (`bg-red-600`). ALWAYS show `AlertDialog` confirmation first.
- **Forbidden icon**: `Sparkles` from lucide-react is banned. Use `Wand2` (AI), `RefreshCw` (refresh), `Zap` (quick), `Star` (highlight).
- **Info tooltips**: Non-obvious features/settings should have an `Info` icon with tooltip explaining the benefit. Lead with "why it matters", be concise.
- **Internal links**: Always use `<Link>` from `next/link`, never `<a>` for internal routes.
- **useSearchParams**: Always wrap in a `Suspense` boundary.
- Read `DOCS/CORE/DESIGN_SYSTEM.md` before building any new UI.

## Architecture Standards

- **Thin pages**: `page.tsx` does `useParams()` + `useQueryWithStatus()` + `<QueryState>`. All UI in `components/` subfolder.
- **Component location**: Reusable across pages → `src/components/app/`. Page-specific → `src/app/(app)/[page]/components/`.
- **Small components**: Split at 200+ lines. One responsibility per component.
- **URL as source of truth**: Entity IDs in URL (`/projects/[projectId]/...`), not in React context.
- **Convex types**: Use `Doc<"tableName">` and `Id<"tableName">` from `convex/_generated/dataModel`. Don't create duplicate frontend types.
- **Shared validators**: Define Zod schemas in `convex/utils/validators.ts`, import in both backend mutations and frontend forms.

## QueryState Pattern (MANDATORY)

```typescript
import { QueryState } from "@/components/query/query-state";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";

const dataQuery = useQueryWithStatus(api.myModule.getData, { id });

return (
  <QueryState query={dataQuery} pending={<LoadingSkeleton />}>
    {(data) => <MyComponent data={data} />}
  </QueryState>
);
```

Do NOT use manual `if (query.isPending)` / `if (query.isError)` checks. See `DOCS/CORE/ERROR_HANDLING.md` for full API.

## Available Skills

- `/preview-brands` — Generate 3 brand direction previews as standalone HTML files for visual comparison. See `.claude/skills/preview-brands.md`.
- `/brand` — Generate a complete visual identity from a primary color, font, and brand tone. Updates CSS variables, font imports, and design system doc. See `.claude/skills/brand.md`.
- `/redesign` — Redesign the app's visual identity while preserving structure and conversion patterns. See `.claude/skills/redesign.md`.

## Prohibited Actions

- Do not run `git commit`, `git push`, or any git commands that modify repository history
- Do not run `npx convex deploy` or any production deployment commands
- Only the project owner commits, pushes, and deploys

## Production Safety

Before modifying existing schema fields, API contracts, auth logic, or indexes — **stop and ask**. Adding new `v.optional()` fields, new tables, new indexes, and new API endpoints is always safe. Renaming, removing, or changing types of existing fields requires a data migration.
