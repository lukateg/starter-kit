# Authentication

> **Status**: Active
> **Last Updated**: 2026-02-17

## Overview

Authentication uses **Clerk** with webhook sync to Convex. Users authenticate via Clerk's hosted UI, and user data is synced to the Convex `users` table via webhooks.

## Architecture

```
User → Clerk (sign-in/sign-up) → Webhook → Convex users table
                                              ↓
                                  Frontend reads user via auth context
```

## Components

### Clerk Integration
- **ClerkProvider** wraps the app in root layout
- **ConvexProviderWithClerk** connects Clerk auth to Convex client
- **Sign-in/Sign-up pages**: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `sign-up/`

### Webhook Sync (`convex/http.ts`)

Clerk webhooks are verified using SVIX signatures and route to `convex/users.ts`:

| Event | Action |
|-------|--------|
| `user.created` | Create user record with initial credits |
| `user.updated` | Update user fields (email, name, image) |
| `user.deleted` | Handle user deletion |

**Webhook safety**: The handler destructures only needed fields from the Clerk payload. Never forward the raw payload — Clerk may add new fields that break Convex validation.

### Middleware (`src/middleware.ts`)

Uses `clerkMiddleware` to protect routes:

- **Public routes**: `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/blog(.*)`, `/privacy`, `/terms`, `/changelog`, `/api/webhooks/(.*)`
- **Protected routes**: Everything under `(app)/` redirects to `/sign-in` if not authenticated

### Auth Context (`src/contexts/auth-context.tsx`)

Maps the Clerk user to the app's User type from Convex:

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user, isLoading } = useAuth();
  // user has full Convex user data (credits, email, etc.)
}
```

### Auth Guard in Backend (`convex/lib/errors.ts`)

```typescript
import { requireAuth } from "./lib/errors";

export const myQuery = query({
  handler: async (ctx) => {
    const clerkId = await requireAuth(ctx);
    // User is authenticated
  },
});
```

## Team Invitations

The kit supports team-based access via project invitations:

### Schema
- `projectMembers` — Tracks who has access to which projects (userId, projectId, role)
- `projectInvitations` — Pending invites (email-based or link-based)

### Flow
1. Project owner sends invite (by email or shareable link)
2. Invitation stored with status `pending` and expiration
3. Invitee accepts via `/invite/accept?token=...`
4. `projectMembers` entry created with appropriate role
5. Invitee can now access the project

### Team Auth Helper (`convex/lib/teamAuth.ts`)

Checks if a user has access to a project:

```typescript
import { requireProjectAccess } from "./lib/teamAuth";

export const getProjectData = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { user, member } = await requireProjectAccess(ctx, args.projectId);
    // User has access, member.role tells you their role
  },
});
```

## Setup Instructions

See `DOCS/GUIDE/ENV_SETUP.md` for step-by-step Clerk configuration:
1. Create Clerk app
2. Configure OAuth providers
3. Set up webhook endpoint
4. Add env vars

## Important Notes

- **Onboarding redirect**: After first sign-up, users are redirected to `/onboarding` if `hasCompletedOnboarding` is false
- **URL-based project scoping**: Current project is determined by URL (`/projects/[projectId]/...`), not stored in context
- **Role types**: `owner` and `member` (extensible to `admin` if needed)
