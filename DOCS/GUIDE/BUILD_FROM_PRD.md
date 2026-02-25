# Building Your App from a PRD

> **Purpose**: This is the master workflow Claude Code follows when a user provides a PRD, MVP spec, or says "build this app."

## The Flow

```
PRD provided
    ↓
Phase 1: Brand & Design  →  Pick a visual identity before writing any code
    ↓
Phase 2: Apply Brand     →  Update CSS, fonts, design system doc
    ↓
Phase 3: Build           →  Schema → Backend → Pages → Landing page
```

**Always follow this order.** Design decisions affect every page you build. Don't start coding with the default blue starter kit theme — the user should see their brand from the first page.

## Execution Options

| Approach | Best for | How |
|----------|----------|-----|
| **Interactive** | Small apps, learning the kit | Work through phases below with the user in one session |
| **Ralph Loop** | Full MVPs, large PRDs | Complete Phases 1-2 interactively, then break Phase 3 into atomic tasks → user runs `./ralph.sh` autonomously. See `DOCS/GUIDE/RALPH_LOOP.md` |

If the user asks to "one-shot" the app, wants to run it overnight, or the PRD has 10+ features, recommend the Ralph Loop approach for Phase 3.

---

## Phase 1: Brand & Design

**Before writing any code, establish the visual identity.**

### Step 1: Generate Brand Previews

Run the `/preview-brands` skill (see `.claude/skills/preview-brands.md`).

1. Read the PRD to understand the product, audience, and personality
2. Generate 3 fundamentally different brand direction HTML previews
3. Open them in the browser for the user to compare
4. Ask the user to pick their favorite (or mix elements from multiple)

**This is not optional.** The default starter kit theme is a placeholder. Every app should have its own brand identity before building begins.

### Step 2: Apply the Chosen Brand

Run the `/brand` skill (see `.claude/skills/brand.md`).

1. Extract the primary color, font, and tone from the chosen direction
2. Update `src/app/globals.css` with the new CSS variables
3. Update `src/app/layout.tsx` with the new font import
4. Regenerate `DOCS/CORE/DESIGN_SYSTEM.md` to match the new brand

After this step, `npm run dev` should show the new brand on every page.

### Step 3: Confirm with the User

Run the dev server and ask the user to verify the brand looks right on the existing starter kit pages (landing page, auth pages, settings). Fix any issues before moving to Phase 3.

---

## Phase 2: Plan the Build

1. Read the full PRD/MVP spec
2. Identify: core entities, user actions, data relationships
3. Note which pre-built features the app needs (auth, payments, blog, email, etc.)
4. Check what's already built — don't rebuild what the starter kit provides

### For Ralph Loop builds:

Break the PRD into atomic tasks in `.ralph/TASKS.md`:
- Each task = one schema file, one backend module, or one page
- Tasks in correct order: schema → backend → frontend → landing page
- Each task references which DOCS/CORE/ files to read
- 15-20 tasks typical for an MVP
- See `DOCS/GUIDE/RALPH_LOOP.md` for task writing guidelines

Hand off to the user: "Your task list is ready. Run `./ralph.sh` to start the autonomous build."

### For interactive builds:

Continue with Phase 3 steps below.

---

## Phase 3: Build the App

### Step 1: Schema Design

Start from the existing `convex/schema.ts`. It already has:
- `users` — Auth, credits, referral, email preferences
- `projects` — Generic project container
- `projectMembers` / `projectInvitations` — Team access
- `creditTransactions` — Credit audit trail
- `subscriptions` — Subscription lifecycle
- `webhookEvents` — Payment webhook audit
- `notifications` — In-app notifications
- `supportTickets` — Support system
- `emailEvents` — Email tracking
- `blogArticles` — Blog content

**ADD your app-specific tables.** Don't modify existing starter kit tables unless truly necessary.

```typescript
// Example: Adding a tasks feature
tasks: defineTable({
  projectId: v.id("projects"),
  title: v.string(),
  status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
  assigneeId: v.optional(v.id("users")),
  createdBy: v.id("users"),
  createdAt: v.number(),
}).index("by_project", ["projectId"])
  .index("by_assignee", ["assigneeId"]),
```

**Rules:**
- Use `Id<"tableName">` for foreign keys, not strings
- Add indexes for every field you'll query/filter by
- Use `v.optional()` for fields that aren't always present
- Store timestamps as `Date.now()` (Unix milliseconds)
- Use Convex types (`Doc<"tableName">`) as single source of truth — don't create duplicate frontend types

### Step 2: Onboarding Design

Read `DOCS/CORE/ONBOARDING.md` first.

Design onboarding steps that collect the **minimum data** needed for the user to start using the app. Each step should map to a real schema field.

Example for a task management app:
1. "Name your workspace" → creates project
2. "What are you working on?" → creates first task/board
3. Done → redirect to workspace

### Step 3: Backend Functions

Create Convex queries, mutations, and actions for your app logic.

**Follow these patterns:**
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/errors";
import { requireProjectAccess } from "./lib/teamAuth";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { user } = await requireProjectAccess(ctx, args.projectId);
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
```

**Error handling**: Use `throwNotFound()`, `throwUnauthorized()`, `throwValidationError()` from `convex/lib/errors.ts`. See `DOCS/CORE/ERROR_HANDLING.md`.

**For AI features**: Use actions with `"use node"` directive. See `DOCS/CORE/AI_INTEGRATIONS.md`.

### Step 4: App Pages

Build inside `src/app/(app)/projects/[projectId]/`.

**Page structure:**
```
src/app/(app)/projects/[projectId]/tasks/
├── page.tsx              # Thin: useParams + useQueryWithStatus + QueryState
└── components/
    ├── tasks-content.tsx  # Main UI
    ├── tasks-loading.tsx  # Loading skeleton
    ├── task-card.tsx      # Individual task
    └── create-task-dialog.tsx
```

**Thin page pattern:**
```typescript
"use client";
import { useParams } from "next/navigation";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { QueryState } from "@/components/query/query-state";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { TasksContent } from "./components/tasks-content";
import { TasksLoading } from "./components/tasks-loading";

export default function TasksPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const tasksQuery = useQueryWithStatus(api.tasks.list, {
    projectId: projectId as Id<"projects">,
  });

  return (
    <QueryState query={tasksQuery} pending={<TasksLoading />}>
      {(tasks) => <TasksContent tasks={tasks} projectId={projectId} />}
    </QueryState>
  );
}
```

**UI rules**: Read `DOCS/CORE/DESIGN_SYSTEM.md`. Use CSS variables, shadcn components, no hardcoded colors.

### Step 5: Forms & Validation

Use React Hook Form + Zod. Define shared validators in `convex/utils/validators.ts`. See `DOCS/CORE/FORMS_VALIDATION.md`.

### Step 6: Landing Page

Customize the existing landing page for your product:
1. Update hero headline and CTA (use messaging from PRD positioning section if available)
2. Replace feature sections with your product's features
3. Update pricing display
4. Update FAQ section
5. Read `DOCS/CORE/LANDING_PAGE.md`

### Step 7: Sidebar Navigation

Update `src/components/app/app-sidebar.tsx` with your app's navigation items. Map each nav item to your new pages.

### Step 8: Settings

The kit ships with: personal, team, billing, notifications. Add app-specific settings pages under `projects/[projectId]/settings/` if needed.

### Step 9: Post-Build Checklist

After building, present the user with:

#### Required Environment Variables
List which env vars they need to configure based on the features used. Reference `DOCS/GUIDE/ENV_SETUP.md` for step-by-step instructions.

#### Convex Deployment
```bash
npx convex deploy  # Deploy backend to production
```

#### Webhook Setup
- Clerk webhook → `https://[convex-url]/clerk-webhook`
- Payment webhook → `https://[convex-url]/lemonsqueezy-webhook`

#### Next Steps
Point to `DOCS/FOUNDER/` for growth guidance:
- "Your app is running. When you're ready to think about growth, check `DOCS/FOUNDER/` for SEO, blog strategy, and launch guidance."
