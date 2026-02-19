# Error Handling System

> **Status**: Fully Implemented ✅
> **Last Updated**: 2025-01-24

## Overview

This document describes the unified error handling system. The system provides:

1. **Backend**: Throws structured errors using `ConvexError` with typed error codes
2. **Frontend Hook**: `useQueryWithStatus` returns `{ data, isPending, isError, error }`
3. **Frontend Component**: `QueryState` handles all states (loading, error, success) in one place

---

## Architecture

```
Backend (Convex)                      Frontend (React)
────────────────                      ────────────────
1. Validate auth/access               1. Call useQueryWithStatus(query, args)
2. If error → throw ConvexError       2. Pass result to <QueryState>
3. If valid → return data             3. QueryState renders appropriate UI
                                         - isPending → Skeleton
                                         - isError → Error UI based on code
                                         - isSuccess → Children with data
```

---

## Error Codes

We use 5 simple error codes:

```typescript
export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",   // User not logged in
  UNAUTHORIZED: "UNAUTHORIZED",          // User lacks permission
  NOT_FOUND: "NOT_FOUND",                // Resource doesn't exist
  VALIDATION_ERROR: "VALIDATION_ERROR",  // Invalid input
  SERVER_ERROR: "SERVER_ERROR",          // Unexpected failures
} as const;
```

| Error Code | When Backend Throws | Frontend Shows |
|------------|---------------------|----------------|
| `UNAUTHENTICATED` | User not logged in, session expired | Redirect to sign-in |
| `UNAUTHORIZED` | Not project member, not owner, feature not on plan | Access Denied page |
| `NOT_FOUND` | Project/article/keyword doesn't exist | Not Found page |
| `VALIDATION_ERROR` | Invalid input, missing required fields | Toast with message |
| `SERVER_ERROR` | Database errors, external API failures | Generic error page |

---

## File Structure

```
convex/
  lib/
    errors.ts              # createAppError utility + error codes

src/
  hooks/
    use-query-with-status.ts   # Wrapper hook for useQuery

  components/
    query/
      query-state.tsx          # Handles loading/error/success states
      query-error.tsx          # Renders error UI based on error code
      not-authorized.tsx       # Access denied component
      unknown-error.tsx        # Generic error component

  app/
    not-found.tsx              # Global 404 page
    error.tsx                  # Global error boundary
    global-error.tsx           # Root error boundary
    (app)/
      not-found.tsx            # App 404 (with sidebar)
      error.tsx                # App error boundary
```

---

## Backend Implementation

### 1. Error Creation Utility

```typescript
// convex/lib/errors.ts
import { ConvexError } from "convex/values";

export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface AppErrorData {
  code: ErrorCode;
  message?: string;
}

export function createAppError(code: ErrorCode, message?: string): ConvexError<AppErrorData> {
  return new ConvexError({ code, message });
}

// Convenience functions
export function throwUnauthenticated(): never {
  throw createAppError("UNAUTHENTICATED", "Please sign in to continue");
}

export function throwUnauthorized(message?: string): never {
  throw createAppError("UNAUTHORIZED", message ?? "You don't have access to this resource");
}

export function throwNotFound(resource?: string): never {
  throw createAppError("NOT_FOUND", resource ? `${resource} not found` : "Resource not found");
}

export function throwValidationError(message: string): never {
  throw createAppError("VALIDATION_ERROR", message);
}
```

### 2. Authentication Guard

```typescript
// convex/lib/errors.ts (continued)
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export async function requireAuth(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throwUnauthenticated();
  }
  return identity.subject; // Returns Clerk ID
}
```

### 3. Query/Mutation Pattern

```typescript
// convex/articles.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, throwNotFound, throwUnauthorized } from "./lib/errors";
import { getUserByClerkId } from "./lib/teamAuth";

export const get = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const clerkId = await requireAuth(ctx);

    // 2. Get user
    const user = await getUserByClerkId(ctx, clerkId);
    if (!user) {
      throwUnauthenticated();
    }

    // 3. Get resource
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throwNotFound("Article");
    }

    // 4. Check authorization
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", article.projectId).eq("userId", user._id)
      )
      .unique();

    if (!membership) {
      throwUnauthorized("You don't have access to this article");
    }

    // 5. Return data
    return article;
  },
});
```

---

## Frontend Implementation

### 1. Install convex-helpers

```bash
npm install convex-helpers
```

### 2. Query Hook with Status

```typescript
// src/hooks/use-query-with-status.ts
import { useQuery } from "convex/react";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { FunctionReference } from "convex/server";

// Create the hook using convex-helpers
export const useQueryWithStatus = makeUseQueryWithStatus(useQuery);

// Type for the query result
export type QueryResult<T> = {
  status: "pending" | "success" | "error";
  data: T | undefined;
  error: Error | undefined;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
};
```

### 3. Error Type Checker

```typescript
// src/lib/errors/error-helpers.ts
import { ConvexError } from "convex/values";

export interface AppErrorData {
  code: string;
  message?: string;
}

export function isAppError(error: unknown): error is ConvexError<AppErrorData> {
  return error instanceof ConvexError &&
         typeof (error.data as AppErrorData)?.code === "string";
}

export function getErrorCode(error: Error | undefined): string | null {
  if (!error) return null;
  if (isAppError(error)) {
    return error.data.code;
  }
  return "SERVER_ERROR";
}

export function getErrorMessage(error: Error | undefined): string {
  if (!error) return "";
  if (isAppError(error)) {
    return error.data.message ?? "An error occurred";
  }
  return error.message ?? "An unexpected error occurred";
}
```

### 4. QueryState Component

**IMPORTANT**: `QueryState` should be the ONLY pattern for handling query states. Never use manual `if (query.isPending)` or `if (query.isError)` checks scattered throughout components.

```typescript
// src/components/query/query-state.tsx
"use client";

import { ReactNode } from "react";
import { QueryError } from "./query-error";
import { getErrorCode } from "@/lib/errors/error-helpers";

interface QueryStateProps<TData> {
  query: {
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: TData | undefined;
    error: Error | undefined;
  };
  pending: ReactNode;
  children: (data: TData) => ReactNode;
  /**
   * Content to show when data is empty/null/undefined but no error.
   * If not provided, defaults to NOT_FOUND error UI.
   * Use `null` to render nothing for empty data.
   */
  empty?: ReactNode;
  /**
   * Custom error renderer. Use this if you need custom error handling.
   * Return undefined to use the default QueryError component.
   */
  renderError?: (error: Error | undefined, code: string | null) => ReactNode | undefined;
}

export function QueryState<TData>({
  query,
  pending,
  children,
  empty,
  renderError,
}: QueryStateProps<TData>) {
  // Loading state
  if (query.isPending) {
    return <>{pending}</>;
  }

  // Error state
  if (query.isError) {
    const errorCode = getErrorCode(query.error);

    // Allow custom error handling
    if (renderError) {
      const customErrorUI = renderError(query.error, errorCode);
      if (customErrorUI !== undefined) {
        return <>{customErrorUI}</>;
      }
    }

    return <QueryError code={errorCode} error={query.error} />;
  }

  // No data - use custom empty state or default to NOT_FOUND error
  if (query.data === undefined || query.data === null) {
    // If empty prop is explicitly provided (even as null), use it
    if (empty !== undefined) {
      return <>{empty}</>;
    }
    // Default: show NOT_FOUND error
    return <QueryError code="NOT_FOUND" />;
  }

  // Success - render children with data
  return <>{children(query.data)}</>;
}
```

### 5. QueryError Component

```typescript
// src/components/query/query-error.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotAuthorized } from "./not-authorized";
import { UnknownError } from "./unknown-error";
import { NotFoundError } from "./not-found-error";

interface QueryErrorProps {
  code: string | null;
  error?: Error;
}

export function QueryError({ code, error }: QueryErrorProps) {
  const router = useRouter();

  // Handle unauthenticated - redirect to sign in
  useEffect(() => {
    if (code === "UNAUTHENTICATED") {
      router.push("/sign-in");
    }
  }, [code, router]);

  switch (code) {
    case "UNAUTHENTICATED":
      return null; // Redirecting...

    case "UNAUTHORIZED":
      return <NotAuthorized />;

    case "NOT_FOUND":
      return <NotFoundError />;

    case "VALIDATION_ERROR":
      return <UnknownError message="Invalid request. Please check your input." />;

    default:
      return <UnknownError error={error} />;
  }
}
```

### 6. Error UI Components

```typescript
// src/components/query/not-authorized.tsx
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NotAuthorized({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto rounded-full bg-gray-100 p-4 w-fit">
          <ShieldX className="h-12 w-12 text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">
          {message ?? "You don't have permission to access this resource. Contact the project owner for an invitation."}
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
```

```typescript
// src/components/query/unknown-error.tsx
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UnknownError({ error, message }: { error?: Error; message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto rounded-full bg-red-50 p-4 w-fit">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Something Went Wrong</h2>
        <p className="text-gray-600">
          {message ?? "We encountered an unexpected error. Please try again."}
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
```

```typescript
// src/components/query/not-found-error.tsx
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NotFoundError({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto rounded-full bg-gray-100 p-4 w-fit">
          <FileQuestion className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Not Found</h2>
        <p className="text-gray-600">
          {message ?? "The resource you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
```

---

## Usage Pattern

### Basic Page Component

```typescript
// src/app/(app)/articles/[articleId]/page.tsx
"use client";

import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "@/convex/_generated/api";
import { QueryState } from "@/components/query";
import { ArticleSkeleton } from "./components/article-skeleton";
import { ArticleContent } from "./components/article-content";

export default function ArticlePage({ params }: { params: { articleId: string } }) {
  const articleQuery = useQueryWithStatus(api.articles.get, {
    articleId: params.articleId as Id<"articles">
  });

  return (
    <QueryState query={articleQuery} pending={<ArticleSkeleton />}>
      {(article) => <ArticleContent article={article} />}
    </QueryState>
  );
}
```

### With Empty State (e.g., optional data)

```typescript
// Credit display - render nothing if no data
export function CreditDisplay() {
  const creditsQuery = useQueryWithStatus(api.users.getCredits, {});

  return (
    <QueryState
      query={creditsQuery}
      pending={<CreditDisplayLoading />}
      empty={null}  // Renders nothing if no credits data
    >
      {(credits) => <CreditDisplayContent credits={credits} />}
    </QueryState>
  );
}
```

### With Custom Empty Component

```typescript
// Keywords page - show custom empty state
export function KeywordsPage() {
  const keywordsQuery = useQueryWithStatus(api.keywords.list, { projectId });

  return (
    <QueryState
      query={keywordsQuery}
      pending={<KeywordsSkeleton />}
      empty={<NoKeywordsYet />}  // Custom empty state component
    >
      {(keywords) => <KeywordsList keywords={keywords} />}
    </QueryState>
  );
}
```

### With Conditional Query (using "skip")

When the query depends on another value (like project selection), use a wrapper component pattern to avoid React hooks rules violations:

```typescript
// WRONG - hooks called conditionally
export default function Page() {
  const { currentProject } = useProject();

  if (!currentProject) {
    return <LoadingState />;
  }

  // ❌ This violates React hooks rules!
  const dataQuery = useQueryWithStatus(api.data.get, { projectId: currentProject.id });
  // ...
}

// CORRECT - separate component for conditional rendering
function DataWithProject({
  project
}: {
  project: NonNullable<ReturnType<typeof useProject>["currentProject"]>
}) {
  const dataQuery = useQueryWithStatus(api.data.get, {
    projectId: project.id as Id<"projects">
  });

  return (
    <QueryState query={dataQuery} pending={<LoadingSkeleton />}>
      {(data) => <DataContent data={data} />}
    </QueryState>
  );
}

export default function Page() {
  const { currentProject } = useProject();

  if (!currentProject) {
    return <LoadingState />;
  }

  return <DataWithProject project={currentProject} />;
}
```

### Mutation Error Handling

For mutations, use try-catch with toast:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isAppError, getErrorMessage } from "@/lib/errors/error-helpers";
import { toast } from "sonner";

function DeleteButton({ articleId }: { articleId: Id<"articles"> }) {
  const deleteArticle = useMutation(api.articles.remove);

  async function handleDelete() {
    try {
      await deleteArticle({ articleId });
      toast.success("Article deleted");
    } catch (error) {
      toast.error(getErrorMessage(error as Error));
      console.error("Delete failed:", error);
    }
  }

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

---

## Migration Checklist

### Phase 1: Backend Setup ✅
- [x] Create `convex/lib/errors.ts` with error utilities
- [x] Update `convex/lib/teamAuth.ts` to use new error utilities

### Phase 2: Frontend Setup ✅
- [x] Install `convex-helpers`
- [x] Create `src/hooks/use-query-with-status.ts`
- [x] Create `src/lib/errors/error-helpers.ts`
- [x] Create `src/components/query/query-state.tsx`
- [x] Create `src/components/query/query-error.tsx`
- [x] Create `src/components/query/not-authorized.tsx`
- [x] Create `src/components/query/unknown-error.tsx`
- [x] Create `src/components/query/not-found-error.tsx`

### Phase 3: Backend Migration (convex/) ✅
All files updated to use typed error utilities:
- [x] Replace `return null` with `throwNotFound()` or `throwUnauthorized()`
- [x] Use `requireAuth()` instead of manual identity checks
- [x] Use `createAppError()` for all error cases

Files updated:
- [x] `convex/articles.ts`
- [x] `convex/keywords.ts`
- [x] `convex/projects.ts`
- [x] `convex/integrations.ts`
- [x] `convex/autopilot.ts`
- [x] `convex/webhooks.ts`
- [x] `convex/users.ts`
- [x] `convex/postIndex.ts`
- [x] `convex/articleHistory.ts`
- [x] `convex/publishingLogs.ts`
- [x] `convex/glossary.ts`

### Phase 4: Frontend Migration ✅
All pages/components migrated to use `useQueryWithStatus` with `QueryState`:
- [x] Replace `useQuery` with `useQueryWithStatus`
- [x] Wrap queries with `<QueryState>` component (no manual `isPending`/`isError` checks)
- [x] Use `empty` prop for components that should render nothing when data is null
- [x] Extract content to separate components when needed for React hooks rules

Files migrated:
- [x] `src/app/(app)/layout.tsx`
- [x] `src/contexts/project-context.tsx`
- [x] `src/app/(app)/articles/page.tsx`
- [x] `src/app/(app)/articles/[articleId]/page.tsx`
- [x] `src/app/(app)/keywords/page.tsx`
- [x] `src/app/(app)/calendar/page.tsx`
- [x] `src/app/(app)/growth-projections/page.tsx`
- [x] `src/app/(app)/onboarding/page.tsx`
- [x] `src/app/(app)/settings/billing/page.tsx`
- [x] `src/app/(app)/settings/team/page.tsx`
- [x] `src/app/(app)/settings/integrations/page.tsx`
- [x] `src/app/(app)/settings/logs/page.tsx`
- [x] `src/app/(app)/settings/email-preferences/page.tsx`
- [x] `src/app/invite/accept/page.tsx`
- [x] `src/app/unsubscribe/page.tsx`
- [x] `src/components/app/credit-display.tsx`
- [x] `src/components/app/credit-warning-banner.tsx`
- [x] `src/components/app/referral-link.tsx`
- [x] `src/components/app/notification-bell.tsx`
- [x] `src/components/app/generate-keywords-confirm-modal.tsx`
- [x] `src/app/components/Footer.tsx`

---

## Design Decisions

### 1. ConvexError with Structured Data
Using `ConvexError` with `{ code, message }` instead of string matching. This is explicit, typed, and doesn't rely on parsing error messages.

### 2. QueryState Component (MANDATORY)
Single component handles all query states. **Never use manual `if (query.isPending)` / `if (query.isError)` checks** - always use `QueryState` to wrap query results. This ensures consistent error handling across the app.

### 3. QueryError Component
Centralized error UI rendering based on error code. Add new error types in one place.

### 4. Automatic UNAUTHENTICATED Redirect
When error code is `UNAUTHENTICATED`, automatically redirect to sign-in. No manual handling needed.

### 5. Keep Toast for Mutations
Mutations use toast notifications for errors. This provides immediate feedback without replacing the UI.

---

## Special Cases

### Context Providers

Context providers (like `ProjectProvider`) may use manual `isPending` checks when they need to:
1. Transform data internally (not render different UIs)
2. Expose `isLoading` state to consumers
3. Perform side effects based on query state

This is acceptable because the provider isn't rendering different UI states - it's managing internal state.

### Paginated Queries

For paginated queries with "Load More" functionality (like `articles/page.tsx`), a hybrid approach is acceptable:
- Use `QueryState` for error handling
- Use manual `isPending` check only for initial load (when accumulated data is empty)
- This allows showing existing data while fetching more

---

## Anti-Patterns (DO NOT DO)

```typescript
// ❌ WRONG - Manual state checks scattered in component
export default function Page() {
  const dataQuery = useQueryWithStatus(api.data.get, {});

  if (dataQuery.isPending) {
    return <Loading />;
  }

  if (dataQuery.isError) {
    return <Error />;
  }

  // Rest of component...
}

// ✅ CORRECT - Use QueryState
export default function Page() {
  const dataQuery = useQueryWithStatus(api.data.get, {});

  return (
    <QueryState query={dataQuery} pending={<Loading />}>
      {(data) => <Content data={data} />}
    </QueryState>
  );
}
```

```typescript
// ❌ WRONG - Using QueryState just for error display
if (query.isError) {
  return (
    <QueryState query={query} pending={<Loading />}>
      {() => null}
    </QueryState>
  );
}

// ✅ CORRECT - QueryState handles everything
return (
  <QueryState query={query} pending={<Loading />}>
    {(data) => <Content data={data} />}
  </QueryState>
);
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-01-24 | **Unified QueryState Pattern**: Removed all manual isPending/isError checks, QueryState is now mandatory |
| 2025-01-24 | Added `empty` and `renderError` props to QueryState for flexible handling |
| 2025-01-24 | **Phase 3 & 4 Complete**: All backend files and frontend pages migrated |
| 2025-01-24 | Rewritten with unified QueryState pattern |
| 2025-01-24 | Updated to backend-first approach |
| 2025-01-24 | Initial documentation created |
