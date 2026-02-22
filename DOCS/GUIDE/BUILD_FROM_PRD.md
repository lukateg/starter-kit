# Building Your App from a PRD

> **Purpose**: This is the master workflow Claude Code follows when a user provides a PRD, MVP spec, or says "build this app."

## Execution Options

| Approach | Best for | How |
|----------|----------|-----|
| **Interactive** | Small apps, learning the kit | Work through steps below with the user in one session |
| **Ralph Loop** | Full MVPs, large PRDs | Break PRD into atomic tasks → user runs `./ralph.sh` autonomously. See `DOCS/GUIDE/RALPH_LOOP.md` |

If the user asks to "one-shot" the app, wants to run it overnight, or the PRD has 10+ features, recommend the Ralph Loop approach. Break the PRD into tasks in `.ralph/TASKS.md` and let the user run the loop.

## Before You Start

1. Read the full PRD/MVP spec
2. Identify: core entities, user actions, data relationships
3. Note which pre-built features the app needs (auth, payments, blog, email, etc.)
4. Check what's already built — don't rebuild what the starter kit provides

## Step 1: Schema Design

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

## Step 2: Onboarding Design

Read `DOCS/CORE/ONBOARDING.md` first.

Design onboarding steps that collect the **minimum data** needed for the user to start using the app. Each step should map to a real schema field.

Example for a task management app:
1. "Name your workspace" → creates project
2. "What are you working on?" → creates first task/board
3. Done → redirect to workspace

## Step 3: Backend Functions

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

## Step 4: App Pages

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

## Step 5: Forms & Validation

Use React Hook Form + Zod. Define shared validators in `convex/utils/validators.ts`. See `DOCS/CORE/FORMS_VALIDATION.md`.

## Step 6: Landing Page

Customize the existing landing page for your product:
1. Update hero headline and CTA
2. Replace feature sections with your product's features
3. Update pricing display
4. Update FAQ section
5. Read `DOCS/CORE/LANDING_PAGE.md`

## Step 7: Sidebar Navigation

Update `src/components/app/app-sidebar.tsx` with your app's navigation items. Map each nav item to your new pages.

## Step 8: Settings

The kit ships with: personal, team, billing, notifications. Add app-specific settings pages under `projects/[projectId]/settings/` if needed.

## Step 9: Post-Build Checklist

After building, present the user with:

### Required Environment Variables
List which env vars they need to configure based on the features used. Reference `DOCS/GUIDE/ENV_SETUP.md` for step-by-step instructions.

### Convex Deployment
```bash
npx convex deploy  # Deploy backend to production
```

### Webhook Setup
- Clerk webhook → `https://[convex-url]/clerk-webhook`
- Payment webhook → `https://[convex-url]/lemonsqueezy-webhook`

### Next Steps
Point to `DOCS/FOUNDER/` for growth guidance:
- "Your app is running. When you're ready to think about growth, check `DOCS/FOUNDER/` for SEO, blog strategy, and launch guidance."
