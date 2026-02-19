"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/auth-context";
import { ProjectProvider } from "@/contexts/project-context";
import { AppSidebar, MobileHeader } from "@/components/app/app-sidebar";
import { SupportModal } from "@/components/app/support-modal";
import { FeedbackButton } from "@/components/app/feedback-button";
import { CreditWarningBanner } from "@/components/app/credit-warning-banner";
import { Loader2 } from "lucide-react";

/**
 * Helper to get the current projectId from the URL pathname.
 */
function getProjectIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get projectId from URL (URL is the source of truth for current project)
  const projectId = getProjectIdFromPathname(pathname);

  // Check if user is on onboarding page
  const isOnboarding = pathname === "/onboarding";

  // Listen for custom event from best practices page to open feedback modal
  useEffect(() => {
    const handleOpenSupport = () => {
      setFeedbackModalOpen(true);
    };

    window.addEventListener("openSupportModal", handleOpenSupport);
    return () =>
      window.removeEventListener("openSupportModal", handleOpenSupport);
  }, []);

  return (
    <>
      {isOnboarding ? (
        // Onboarding: No sidebar or header
        <div className="min-h-screen">{children}</div>
      ) : (
        // Regular app layout with sidebar only (modern design)
        <div className="h-screen flex flex-col">
          {/* Mobile header - only visible on mobile */}
          <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
          <CreditWarningBanner />
          <div className="flex-1 flex overflow-hidden">
            <AppSidebar
              mobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
            <main
              key={projectId || "no-project"}
              className="flex-1 overflow-hidden bg-muted"
            >
              {children}
            </main>
          </div>
          <FeedbackButton onClick={() => setFeedbackModalOpen(true)} />
          <SupportModal
            open={feedbackModalOpen}
            onOpenChange={setFeedbackModalOpen}
          />
        </div>
      )}
    </>
  );
}

function AppLayoutWrapperInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  // Only query projects when authenticated to avoid "Unauthenticated" errors
  const projectsQuery = useQueryWithStatus(api.projects.list, isAuthenticated ? {} : "skip");
  const projects = projectsQuery.data;

  // Check if user is on onboarding page
  const isOnboarding = pathname === "/onboarding";

  // Check if user is accessing email preferences with a token (allows unauthenticated access)
  // Check both old and new URL patterns
  const isEmailPreferencesWithToken =
    (pathname === "/settings/email-preferences" ||
      pathname.match(/^\/projects\/[^/]+\/settings\/email-preferences$/)) &&
    searchParams.get("token");

  useEffect(() => {
    // Allow access to email preferences page with token, otherwise require authentication
    if (!isLoading && !isAuthenticated && !isEmailPreferencesWithToken) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router, isEmailPreferencesWithToken]);

  // Redirect to onboarding if user has no projects
  useEffect(() => {
    if (!isLoading && isAuthenticated && projects !== undefined) {
      if (projects.length === 0 && !isOnboarding) {
        // Clear any stale localStorage before redirecting to onboarding
        // This prevents infinite loops when user has a stale projectId stored
        localStorage.removeItem("current_project");
        router.push("/onboarding");
      }
    }
  }, [isLoading, isAuthenticated, projects, isOnboarding, router]);

  // Show loading while checking authentication or projects
  if (isLoading || projectsQuery.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow email preferences page with token even if not authenticated
  if (!isAuthenticated && isEmailPreferencesWithToken) {
    // Render a simplified layout for token-based email preferences access
    return (
      <div className="min-h-screen bg-muted">
        <main className="container mx-auto p-6 max-w-7xl">{children}</main>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render content while redirecting to onboarding
  if (projects && projects.length === 0 && !isOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ProjectProvider>
  );
}

function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AppLayoutWrapperInner>{children}</AppLayoutWrapperInner>
    </Suspense>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutWrapper>{children}</AppLayoutWrapper>;
}
