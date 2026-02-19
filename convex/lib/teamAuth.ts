/**
 * Team Authorization Helpers
 *
 * Helper functions for checking project membership and permissions
 * in the team collaboration system.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";
import { throwUnauthorized, throwNotFound } from "./errors";

/** Maximum number of members allowed per project */
export const MAX_TEAM_MEMBERS = 6;

/** Email invite expiration in milliseconds (7 days) */
export const EMAIL_INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Result of a membership check
 */
export interface MembershipResult {
  /** The membership record */
  membership: Doc<"projectMembers">;
  /** The user's role in the project */
  role: "owner" | "admin" | "member";
  /** Whether the user is the owner */
  isOwner: boolean;
}

/**
 * Get the membership record for a user in a project
 *
 * @returns The membership record if user is a member, null otherwise
 */
export async function getProjectMembership(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
): Promise<MembershipResult | null> {
  const membership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_user", (q) =>
      q.eq("projectId", projectId).eq("userId", userId)
    )
    .unique();

  if (!membership) {
    return null;
  }

  return {
    membership,
    role: membership.role,
    isOwner: membership.role === "owner",
  };
}

/**
 * Check if a user has access to a project (is a member)
 */
export async function hasProjectAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
): Promise<boolean> {
  const membership = await getProjectMembership(ctx, projectId, userId);
  return membership !== null;
}

/**
 * Check if a user is the owner of a project
 */
export async function isProjectOwner(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
): Promise<boolean> {
  const membership = await getProjectMembership(ctx, projectId, userId);
  return membership?.isOwner ?? false;
}

/**
 * Get the owner of a project
 *
 * @returns The owner's user ID, or null if no owner found (shouldn't happen)
 */
export async function getProjectOwner(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<Id<"users"> | null> {
  const ownerMembership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_role", (q) =>
      q.eq("projectId", projectId).eq("role", "owner")
    )
    .first();

  return ownerMembership?.userId ?? null;
}

/**
 * Get all members of a project
 */
export async function getProjectMembers(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<Doc<"projectMembers">[]> {
  return await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();
}

/**
 * Get the count of members in a project
 */
export async function getProjectMemberCount(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<number> {
  const members = await getProjectMembers(ctx, projectId);
  return members.length;
}

/**
 * Check if a project can accept more members
 */
export async function canAddMember(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<boolean> {
  const memberCount = await getProjectMemberCount(ctx, projectId);
  return memberCount < MAX_TEAM_MEMBERS;
}

/**
 * Get remaining slots available for new members
 */
export async function getRemainingSlots(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<number> {
  const memberCount = await getProjectMemberCount(ctx, projectId);
  return Math.max(0, MAX_TEAM_MEMBERS - memberCount);
}

/**
 * Get all projects where a user is a member
 */
export async function getUserProjects(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<Array<{ project: Doc<"projects">; role: "owner" | "admin" | "member" }>> {
  const memberships = await ctx.db
    .query("projectMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const projects: Array<{ project: Doc<"projects">; role: "owner" | "admin" | "member" }> = [];

  for (const membership of memberships) {
    const project = await ctx.db.get(membership.projectId);
    if (project) {
      projects.push({
        project,
        role: membership.role,
      });
    }
  }

  return projects;
}

/**
 * Check if a user is already a member of a project by email
 * (useful for preventing duplicate invites)
 */
export async function isEmailAlreadyMember(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  email: string
): Promise<boolean> {
  // Find user by email
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
    .first();

  if (!user) {
    return false;
  }

  // Check if user is a member
  return await hasProjectAccess(ctx, projectId, user._id);
}

/**
 * Check if there's a pending invite for an email
 */
export async function hasPendingInvite(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  email: string
): Promise<boolean> {
  const pendingInvite = await ctx.db
    .query("projectInvitations")
    .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
    .filter((q) =>
      q.and(
        q.eq(q.field("projectId"), projectId),
        q.eq(q.field("status"), "pending"),
        q.eq(q.field("type"), "email")
      )
    )
    .first();

  return pendingInvite !== null;
}

/**
 * Get the active invite link for a project (if any)
 */
export async function getActiveInviteLink(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<Doc<"projectInvitations"> | null> {
  return await ctx.db
    .query("projectInvitations")
    .withIndex("by_project_type", (q) =>
      q.eq("projectId", projectId).eq("type", "link")
    )
    .filter((q) => q.eq(q.field("status"), "pending"))
    .first();
}

/**
 * Validate that a user can perform member-level actions on a project
 * Throws an UNAUTHORIZED error if not a member
 */
export async function requireProjectAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
): Promise<MembershipResult> {
  const membership = await getProjectMembership(ctx, projectId, userId);

  if (!membership) {
    throwUnauthorized("You don't have access to this project");
  }

  return membership;
}

/**
 * Validate that a user is the owner of a project
 * Throws an UNAUTHORIZED error if not owner
 */
export async function requireProjectOwner(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
): Promise<MembershipResult> {
  const membership = await requireProjectAccess(ctx, projectId, userId);

  if (!membership.isOwner) {
    throwUnauthorized("Only the project owner can perform this action");
  }

  return membership;
}

/**
 * Get user by their Clerk ID
 */
export async function getUserByClerkId(
  ctx: QueryCtx | MutationCtx,
  clerkId: string
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}

/**
 * Generate a secure random token for invite links
 */
export function generateInviteToken(): string {
  return crypto.randomUUID();
}

/**
 * Get the owner's Clerk ID for a project (for credit charging)
 *
 * This is used to determine who to charge credits for project actions.
 * Falls back to project.userId if no owner found in projectMembers
 * (for backward compatibility during migration).
 */
export async function getProjectOwnerClerkId(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<string> {
  // First, try to get the owner from projectMembers
  const ownerMembership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_role", (q) =>
      q.eq("projectId", projectId).eq("role", "owner")
    )
    .first();

  if (ownerMembership) {
    // Get the user's Clerk ID
    const owner = await ctx.db.get(ownerMembership.userId);
    if (owner) {
      return owner.clerkId;
    }
  }

  // Fallback: get from project.userId (the original creator)
  const project = await ctx.db.get(projectId);
  if (!project) {
    throwNotFound("Project");
  }

  return project.ownerId;
}
