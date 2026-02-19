import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
} from "./_generated/server";
import {
  getUserByClerkId,
  getProjectMembership,
  requireProjectAccess,
  requireProjectOwner,
  getUserProjects,
} from "./lib/teamAuth";
import {
  throwUnauthenticated,
  throwUnauthorized,
  throwNotFound,
} from "./lib/errors";

// Query to get all projects for the current user (includes projects where user is a member)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    // Get user from database
    const user = await getUserByClerkId(ctx, identity.subject);

    // If user doesn't exist in DB yet (new user), fall back to legacy query
    if (!user) {
      // Fallback for users not yet in projectMembers (pre-migration)
      return await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
        .order("desc")
        .collect();
    }

    // Get all projects where user is a member (including owned projects)
    const userProjects = await getUserProjects(ctx, user._id);

    // Sort by creation date descending and return projects with role info
    return userProjects
      .map(({ project, role }) => ({
        ...project,
        _userRole: role, // Include role for UI purposes
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Query to get a single project by ID
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throwNotFound("Project");
    }

    // Get user from database
    const user = await getUserByClerkId(ctx, identity.subject);

    // Check membership if user exists in DB
    if (user) {
      const membership = await getProjectMembership(ctx, args.projectId, user._id);
      if (membership) {
        return {
          ...project,
          _userRole: membership.role,
        };
      }
    }

    // Fallback: check legacy ownerId field (for pre-migration compatibility)
    if (project.ownerId === identity.subject) {
      return {
        ...project,
        _userRole: "owner" as const,
      };
    }

    throwUnauthorized();
  },
});

// Internal query to get a project by ID (no auth check - for use in API routes)
export const getInternal = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

// Internal query to get all projects for a user
export const getByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();
  },
});

// Mutation to create a new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      ownerId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner in projectMembers table
    const user = await getUserByClerkId(ctx, identity.subject);
    if (user) {
      await ctx.db.insert("projectMembers", {
        projectId,
        userId: user._id,
        role: "owner",
        joinedAt: now,
      });
    }

    return projectId;
  },
});

// Mutation to update an existing project
// Any project member (owner or member) can update project settings
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throwNotFound("Project");
    }

    // Get user from database
    const user = await getUserByClerkId(ctx, identity.subject);

    // Check authorization - any project member can update settings
    if (user) {
      await requireProjectAccess(ctx, args.projectId, user._id);
    } else {
      // Fallback for pre-migration: check legacy ownerId
      if (project.ownerId !== identity.subject) {
        throwUnauthorized();
      }
    }

    const { projectId, ...updates } = args;

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Mutation to delete a project and all related data (owner only)
export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwUnauthenticated();
    }

    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throwNotFound("Project");
    }

    // Get user and check ownership
    const user = await getUserByClerkId(ctx, identity.subject);
    if (user) {
      await requireProjectOwner(ctx, args.projectId, user._id);
    } else if (project.ownerId !== identity.subject) {
      throwUnauthorized();
    }

    // Delete all related data in proper order (cascading delete)

    // 1. Delete project members
    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const member of projectMembers) {
      await ctx.db.delete(member._id);
    }

    // 2. Delete project invitations
    const projectInvitations = await ctx.db
      .query("projectInvitations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const invitation of projectInvitations) {
      await ctx.db.delete(invitation._id);
    }

    // 3. Finally, delete the project itself
    await ctx.db.delete(args.projectId);
  },
});

/**
 * Internal query to get the project owner's Clerk ID
 *
 * This is used for operations that need to identify the project owner.
 * Handles both:
 * - New system: Gets owner from projectMembers table
 * - Legacy system: Falls back to project.ownerId for pre-migration projects
 */
export const getProjectOwnerClerkId = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // First, try to get the owner from projectMembers
    const ownerMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_role", (q) =>
        q.eq("projectId", args.projectId).eq("role", "owner")
      )
      .first();

    if (ownerMembership) {
      // Get the user's Clerk ID
      const owner = await ctx.db.get(ownerMembership.userId);
      if (owner) {
        return owner.clerkId;
      }
    }

    // Fallback: get from project.ownerId (the original creator)
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throwNotFound("Project");
    }

    return project.ownerId;
  },
});
