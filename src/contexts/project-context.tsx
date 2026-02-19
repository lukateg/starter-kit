"use client";

import React, { createContext, useContext } from "react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

/**
 * Extended project type returned by projects.list query
 * Includes _userRole which is added by the query handler
 */
export type ProjectWithRole = Doc<"projects"> & {
  _userRole?: "owner" | "admin" | "member";
};

/**
 * ProjectContext now only provides:
 * - projects: List of all projects (for the project switcher dropdown)
 * - isLoading: Whether the project list is still loading
 *
 * The current project is determined by the URL (/projects/[projectId]/...)
 * and is NOT managed by this context.
 */
interface ProjectContextType {
  projects: ProjectWithRole[];
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const convexProjectsQuery = useQueryWithStatus(api.projects.list);
  const projects = (convexProjectsQuery.data ?? []) as ProjectWithRole[];

  const isLoading = convexProjectsQuery.isPending;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
