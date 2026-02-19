"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../convex/_generated/api";

/**
 * Smart App Resolver
 *
 * This page serves as the entry point after authentication.
 * It determines where to redirect the user based on their projects:
 *
 * 1. If user has no projects → redirect to /onboarding
 * 2. If user has projects → redirect to /projects/[firstProjectId]/[page]
 *
 * Supports a `redirect` query parameter to specify the target page:
 * - /app → /projects/[projectId]/calendar (default)
 * - /app?redirect=settings/billing → /projects/[projectId]/settings/billing
 * - /app?redirect=calendar → /projects/[projectId]/calendar
 *
 * This eliminates the need for hardcoded routes like /calendar or /dashboard
 * which no longer exist after the URL-based project routing migration.
 */
function AppResolverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectsQuery = useQueryWithStatus(api.projects.list);

  // Get the redirect target from query params, default to "calendar"
  const redirectTarget = searchParams.get("redirect") || "calendar";

  useEffect(() => {
    // Wait for projects to load
    if (projectsQuery.isPending) return;

    // Handle error case - redirect to onboarding as fallback
    if (projectsQuery.isError) {
      console.error("Failed to load projects:", projectsQuery.error);
      router.replace("/onboarding");
      return;
    }

    const projects = projectsQuery.data ?? [];

    if (projects.length === 0) {
      // No projects - send to onboarding
      router.replace("/onboarding");
    } else {
      // Has projects - redirect to the first project's target page
      // TODO: Could use localStorage to remember last used project
      const firstProject = projects[0];
      router.replace(`/projects/${firstProject._id}/${redirectTarget}`);
    }
  }, [projectsQuery.isPending, projectsQuery.isError, projectsQuery.data, projectsQuery.error, router, redirectTarget]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your workspace...</p>
      </div>
    </div>
  );
}

export default function AppResolver() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your workspace...</p>
          </div>
        </div>
      }
    >
      <AppResolverContent />
    </Suspense>
  );
}
