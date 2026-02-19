"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Users,
  Plus,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { CreditDisplay } from "./credit-display";
import { NotificationBell } from "./notification-bell";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: NavItem[];
}

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Helper to get the current projectId from the URL pathname.
 */
function getProjectIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Helper to get the relative page path from URL.
 */
function getRelativePagePath(pathname: string): string {
  const projectMatch = pathname.match(/^\/projects\/[^/]+\/(.+)$/);
  if (projectMatch) {
    return projectMatch[1];
  }
  return pathname.slice(1) || "dashboard";
}

/**
 * Helper to get the base section path without entity IDs.
 * When switching projects, we want to navigate to the section root,
 * not preserve specific entity IDs that don't exist in the new project.
 *
 * Examples:
 * - "articles/abc123" -> "articles"
 * - "articles" -> "articles"
 * - "settings/billing" -> "settings/billing"
 * - "calendar" -> "calendar"
 */
function getBaseSectionPath(pathname: string): string {
  const relativePath = getRelativePagePath(pathname);

  // Known sections that can have entity IDs as the second segment
  // These sections follow the pattern: section/[entityId]
  // Add your own sections here as needed (e.g., ["items", "records"])
  const sectionsWithEntityIds: string[] = [];

  const segments = relativePath.split("/");
  const firstSegment = segments[0];

  // If first segment is a section that has entity IDs, only keep the first segment
  if (sectionsWithEntityIds.includes(firstSegment) && segments.length > 1) {
    return firstSegment;
  }

  // Otherwise keep the full path (e.g., "settings/billing", "calendar")
  return relativePath;
}

export function AppSidebar({ mobileOpen = false, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { projects } = useProject();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["settings"])
  );

  // Get projectId from URL
  const projectId = getProjectIdFromPathname(pathname);
  const activeProject = projectId
    ? projects.find((p) => p._id === projectId)
    : null;

  // Build full href for a nav item
  const buildHref = (path: string): string => {
    if (projectId) {
      return `/projects/${projectId}/${path}`;
    }
    // Fallback to /app which will redirect to the appropriate project
    return "/app";
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const isPathActive = (path: string): boolean => {
    const currentRelativePath = getRelativePagePath(pathname);
    return currentRelativePath === path || currentRelativePath.startsWith(path + "/");
  };

  const handleSwitchProject = (newProjectId: string) => {
    // Use base section path to avoid navigating to entity IDs that don't exist in the new project
    const basePath = getBaseSectionPath(pathname);
    router.push(`/projects/${newProjectId}/${basePath}`);
    onMobileClose?.();
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const logoHref = projectId ? `/projects/${projectId}/dashboard` : "/app";

  const navItems: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
    {
      label: "Settings",
      icon: Settings,
      path: "settings",
      children: [
        { label: "Project", icon: Settings, path: "settings/project" },
        { label: "Billing", icon: CreditCard, path: "settings/billing" },
        { label: "Team", icon: Users, path: "settings/team" },
      ],
    },
  ];

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const Icon = item.icon;
    const href = buildHref(item.path);
    const isActive = isPathActive(item.path);
    const isExpanded = expandedItems.has(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.path)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/5 text-primary"
                  : "text-foreground/80 hover:bg-accent"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded ? "rotate-180" : ""
                    )}
                  />
                </>
              )}
            </button>
            {(!collapsed || isMobile) && isExpanded && (
              <div className="ml-4 mt-1 ">
                {item.children!.map((child) => {
                  const ChildIcon = child.icon;
                  const childHref = buildHref(child.path);
                  const isChildActive = isPathActive(child.path);

                  return (
                    <Link
                      key={child.path}
                      href={childHref}
                      onClick={isMobile ? onMobileClose : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isChildActive
                          ? "bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <ChildIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Link
            href={href}
            onClick={isMobile ? onMobileClose : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/5 text-primary"
                : "text-foreground/80 hover:bg-accent"
            )}
            title={collapsed && !isMobile ? item.label : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="flex-1">{item.label}</span>
            )}
          </Link>
        )}
      </div>
    );
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Header Section - Logo & Project Switcher */}
      <div className="p-4 space-y-2">
        {/* Logo */}
        <Link
          href={logoHref}
          onClick={isMobile ? onMobileClose : undefined}
          className="flex items-center gap-2.5"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-foreground text-lg">Starter</span>
          )}
        </Link>

        {/* Project Switcher */}
        {(!collapsed || isMobile) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal h-10"
              >
                <span className="truncate text-sm">
                  {activeProject?.name || "Select Project"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px] bg-white">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Switch project
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project._id}
                  onClick={() => handleSwitchProject(project._id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm">{project.name}</span>
                  </div>
                  {project._id === projectId && (
                    <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                      Current
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push("/onboarding");
                  onMobileClose?.();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto">
        <nav>
          {navItems.map((item) => renderNavItem(item, isMobile))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t px-3 py-2">
        {/* Credits & Notifications */}
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80">
            <CreditDisplay />
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
        )}

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
                collapsed && !isMobile ? "justify-center" : ""
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed && !isMobile ? "center" : "start"}
            side="top"
            className="w-56 bg-white mb-2"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push(buildHref("settings/project"));
                onMobileClose?.();
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push(buildHref("settings/billing"));
                onMobileClose?.();
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Collapse Button (Desktop only) */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-muted-foreground/60 hover:text-muted-foreground h-7 mt-1"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent(true)}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "border-r bg-white transition-all duration-300 hidden md:flex flex-col",
          collapsed ? "w-[72px]" : "w-72"
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}

/**
 * Mobile header bar - only shows hamburger menu on mobile
 */
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="border-b bg-white md:hidden">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center gap-2 ml-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-foreground">Starter</span>
        </Link>
      </div>
    </header>
  );
}
