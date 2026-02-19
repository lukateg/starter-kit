"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { useProject } from "@/contexts/project-context";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { QueryState } from "@/components/query";
import { getErrorCode } from "@/lib/errors/error-helpers";
import { Loader2 } from "lucide-react";

function ProjectLayoutSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading project...</p>
      </div>
    </div>
  );
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { projects, isLoading: projectsLoading } = useProject();

  // Check if the URL projectId exists in the user's projects list
  // This prevents unnecessary API calls for invalid/stale projectIds
  const projectExistsInList = useMemo(() => {
    if (projectsLoading) return undefined; // Don't know yet
    return projects.some((p) => p._id === projectId);
  }, [projects, projectsLoading, projectId]);

  // Only query the specific project if it exists in the user's project list
  // Skip the query if we know the project doesn't exist (prevents error spam)
  const projectQuery = useQueryWithStatus(
    api.projects.get,
    projectExistsInList === false
      ? "skip"
      : { projectId: projectId as Id<"projects"> }
  );

  // Handle invalid projectId - redirect before even making the query
  useEffect(() => {
    if (projectsLoading) return; // Wait for projects list to load
    if (projectExistsInList) return; // Project exists, no need to redirect

    // Project doesn't exist in user's list - redirect
    // Clear stale localStorage to prevent infinite redirect loop
    localStorage.removeItem("current_project");

    if (projects.length > 0) {
      // User has other projects, redirect to the first one
      const firstProjectId = projects[0]._id;
      localStorage.setItem("current_project", firstProjectId);
      const pathParts = window.location.pathname.split("/");
      const currentPage = pathParts.slice(3).join("/") || "dashboard";
      router.replace(`/projects/${firstProjectId}/${currentPage}`);
    } else {
      // No projects at all - redirect to onboarding
      router.replace("/onboarding");
    }
  }, [projectsLoading, projectExistsInList, projects, router]);

  // Handle query errors (e.g., unauthorized access to a shared project)
  useEffect(() => {
    if (!projectQuery.isError) return;

    const code = getErrorCode(projectQuery.error);
    if (code !== "NOT_FOUND" && code !== "UNAUTHORIZED") return;

    // Clear stale localStorage
    localStorage.removeItem("current_project");

    if (projectsLoading) return;

    if (projects.length > 0) {
      const firstProjectId = projects[0]._id;
      localStorage.setItem("current_project", firstProjectId);
      const pathParts = window.location.pathname.split("/");
      const currentPage = pathParts.slice(3).join("/") || "dashboard";
      router.replace(`/projects/${firstProjectId}/${currentPage}`);
    } else {
      router.replace("/onboarding");
    }
  }, [projectQuery.isError, projectQuery.error, projects, projectsLoading, router]);

  // Show loading while checking projects list or if project doesn't exist
  if (projectsLoading || projectExistsInList === false) {
    return <ProjectLayoutSkeleton />;
  }

  return (
    <QueryState
      query={projectQuery}
      pending={<ProjectLayoutSkeleton />}
      renderError={(_error, code) => {
        // For auth/access errors, show loading while redirecting
        if (code === "NOT_FOUND" || code === "UNAUTHORIZED") {
          return <ProjectLayoutSkeleton />;
        }
        // Let default error handling take over for other errors
        return undefined;
      }}
    >
      {() => <>{children}</>}
    </QueryState>
  );
}
