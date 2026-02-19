/**
 * Team Invitations Backend
 *
 * Handles project invitations via email and Sharable links.
 * - Email invites expire after 7 days
 * - Link invites are unlimited until revoked
 * - Only project owners can invite new members
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import {
  getUserByClerkId,
  requireProjectOwner,
  requireProjectAccess,
  hasProjectAccess,
  canAddMember,
  getRemainingSlots,
  isEmailAlreadyMember,
  hasPendingInvite,
  getActiveInviteLink,
  generateInviteToken,
  EMAIL_INVITE_EXPIRY_MS,
  MAX_TEAM_MEMBERS,
} from "./lib/teamAuth";

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Invite a user to the project by email
 *
 * - Creates a pending email invitation
 * - Email invites expire after 7 days
 * - Only owners can invite
 * - Validates email isn't already a member or has pending invite
 */
export const inviteByEmail = mutation({
  args: {
    projectId: v.id("projects"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user and verify ownership
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    await requireProjectOwner(ctx, args.projectId, user._id);

    // Normalize email
    const normalizedEmail = args.email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error("Invalid email format");
    }

    // Check if user is inviting themselves
    if (normalizedEmail === user.email.toLowerCase()) {
      throw new Error("You cannot invite yourself");
    }

    // Check if project can accept more members
    if (!(await canAddMember(ctx, args.projectId))) {
      throw new Error(`Project has reached the maximum of ${MAX_TEAM_MEMBERS} members`);
    }

    // Check if email is already a member
    if (await isEmailAlreadyMember(ctx, args.projectId, normalizedEmail)) {
      throw new Error("This user is already a member of the project");
    }

    // Check if there's already a pending invite for this email
    if (await hasPendingInvite(ctx, args.projectId, normalizedEmail)) {
      throw new Error("An invitation has already been sent to this email");
    }

    const now = Date.now();
    const token = generateInviteToken();

    // Create the invitation
    const invitationId = await ctx.db.insert("projectInvitations", {
      projectId: args.projectId,
      type: "email",
      email: normalizedEmail,
      token,
      invitedBy: user._id,
      status: "pending",
      expiresAt: now + EMAIL_INVITE_EXPIRY_MS,
      createdAt: now,
    });

    // TODO: Trigger email sending via action
    // For now, return the invitation details
    return {
      invitationId,
      token,
      email: normalizedEmail,
      expiresAt: now + EMAIL_INVITE_EXPIRY_MS,
    };
  },
});

/**
 * Generate a Sharable invite link for the project
 *
 * - Creates or returns existing active link invite
 * - Link invites don't expire (until revoked)
 * - Only owners can generate links
 */
export const generateInviteLink = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user and verify ownership
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    await requireProjectOwner(ctx, args.projectId, user._id);

    // Check if there's already an active link invite
    const existingLink = await getActiveInviteLink(ctx, args.projectId);
    if (existingLink) {
      return {
        invitationId: existingLink._id,
        token: existingLink.token,
        isNew: false,
      };
    }

    const now = Date.now();
    const token = generateInviteToken();

    // Create the link invitation
    const invitationId = await ctx.db.insert("projectInvitations", {
      projectId: args.projectId,
      type: "link",
      token,
      invitedBy: user._id,
      status: "pending",
      // No expiresAt for link invites - they're valid until revoked
      createdAt: now,
    });

    return {
      invitationId,
      token,
      isNew: true,
    };
  },
});

/**
 * Revoke an invitation (email or link)
 *
 * - Marks the invitation as revoked
 * - Only owners can revoke
 */
export const revokeInvite = mutation({
  args: {
    invitationId: v.id("projectInvitations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Get user and verify ownership of the project
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    await requireProjectOwner(ctx, invitation.projectId, user._id);

    // Only pending invitations can be revoked
    if (invitation.status !== "pending") {
      throw new Error("Only pending invitations can be revoked");
    }

    await ctx.db.patch(args.invitationId, {
      status: "revoked",
    });

    return { success: true };
  },
});

/**
 * Regenerate the Sharable invite link
 *
 * - Revokes the existing link (if any) and creates a new one
 * - Only owners can regenerate
 */
export const regenerateInviteLink = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user and verify ownership
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    await requireProjectOwner(ctx, args.projectId, user._id);

    // Revoke existing link invite if any
    const existingLink = await getActiveInviteLink(ctx, args.projectId);
    if (existingLink) {
      await ctx.db.patch(existingLink._id, {
        status: "revoked",
      });
    }

    const now = Date.now();
    const token = generateInviteToken();

    // Create new link invitation
    const invitationId = await ctx.db.insert("projectInvitations", {
      projectId: args.projectId,
      type: "link",
      token,
      invitedBy: user._id,
      status: "pending",
      createdAt: now,
    });

    return {
      invitationId,
      token,
    };
  },
});

/**
 * Accept an invitation and join the project
 *
 * - Works for both email and link invites
 * - Validates the token and checks project capacity
 * - Creates a projectMember entry
 */
export const acceptInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    // Find the invitation by token
    const invitation = await ctx.db
      .query("projectInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invalid invitation link");
    }

    // Check invitation status
    if (invitation.status !== "pending") {
      if (invitation.status === "revoked") {
        throw new Error("This invitation has been revoked");
      }
      if (invitation.status === "expired") {
        throw new Error("This invitation has expired");
      }
      throw new Error("This invitation is no longer valid");
    }

    // For email invites, check expiration
    if (invitation.type === "email" && invitation.expiresAt) {
      if (Date.now() > invitation.expiresAt) {
        // Mark as expired
        await ctx.db.patch(invitation._id, { status: "expired" });
        throw new Error("This invitation has expired");
      }

      // For email invites, verify the email matches
      if (invitation.email && invitation.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new Error("This invitation was sent to a different email address");
      }
    }

    // Check if user is already a member
    if (await hasProjectAccess(ctx, invitation.projectId, user._id)) {
      throw new Error("You are already a member of this project");
    }

    // Check if project can accept more members
    if (!(await canAddMember(ctx, invitation.projectId))) {
      throw new Error(`Project has reached the maximum of ${MAX_TEAM_MEMBERS} members`);
    }

    const now = Date.now();

    // Add user as member
    await ctx.db.insert("projectMembers", {
      projectId: invitation.projectId,
      userId: user._id,
      role: "member",
      joinedAt: now,
      invitedBy: invitation.invitedBy,
    });

    // Update invitation status
    // For email invites, mark as accepted
    // For link invites, keep as pending (can be used multiple times)
    if (invitation.type === "email") {
      await ctx.db.patch(invitation._id, {
        status: "accepted",
        acceptedAt: now,
        acceptedBy: user._id,
      });
    }

    // Get project info for return
    const project = await ctx.db.get(invitation.projectId);

    return {
      success: true,
      projectId: invitation.projectId,
      projectName: project?.name ?? "Unknown Project",
    };
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all invitations for a project (for team management UI)
 *
 * - Returns pending email invites and active link invite
 * - Only accessible by project members
 */
export const getProjectInvitations = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user and verify access
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    await requireProjectAccess(ctx, args.projectId, user._id);

    // Get all pending invitations
    const invitations = await ctx.db
      .query("projectInvitations")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "pending")
      )
      .collect();

    // Get inviter information for each invitation
    const invitationsWithInviters = await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await ctx.db.get(inv.invitedBy);
        return {
          ...inv,
          inviterName: inviter?.name ?? "Unknown",
          inviterEmail: inviter?.email ?? "",
        };
      })
    );

    // Separate email and link invites
    const emailInvites = invitationsWithInviters.filter((inv) => inv.type === "email");
    const linkInvite = invitationsWithInviters.find((inv) => inv.type === "link");

    return {
      emailInvites,
      linkInvite: linkInvite ?? null,
      remainingSlots: await getRemainingSlots(ctx, args.projectId),
    };
  },
});

/**
 * Get invitation details by token (for accept invite page)
 *
 * - Public query - anyone with the token can view basic info
 * - Used to show project name before accepting
 */
export const getInviteByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("projectInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return null;
    }

    // Get project info
    const project = await ctx.db.get(invitation.projectId);
    if (!project) {
      return null;
    }

    // Get inviter info
    const inviter = await ctx.db.get(invitation.invitedBy);

    // Check if expired (for email invites)
    let isExpired = false;
    if (invitation.type === "email" && invitation.expiresAt) {
      isExpired = Date.now() > invitation.expiresAt;
    }

    return {
      projectId: invitation.projectId,
      projectName: project.name,
      inviterName: inviter?.name ?? "Unknown",
      type: invitation.type,
      status: invitation.status,
      isExpired,
      // For email invites, include the expected email (partially masked)
      email: invitation.email ? maskEmail(invitation.email) : undefined,
    };
  },
});

/**
 * Get all members of a project (for team management UI)
 *
 * - Returns member info including role, join date, and inviter
 * - Only accessible by project members
 */
export const getProjectMembers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user and verify access
    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    await requireProjectAccess(ctx, args.projectId, user._id);

    // Get all members
    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const memberUser = await ctx.db.get(member.userId);
        const inviter = member.invitedBy ? await ctx.db.get(member.invitedBy) : null;

        return {
          memberId: member._id,
          userId: member.userId,
          name: memberUser?.name ?? "Unknown",
          email: memberUser?.email ?? "",
          imageUrl: memberUser?.imageUrl,
          role: member.role,
          joinedAt: member.joinedAt,
          invitedBy: inviter
            ? {
                name: inviter.name,
                email: inviter.email,
              }
            : null,
          isCurrentUser: member.userId === user._id,
        };
      })
    );

    // Sort: owner first, then by join date
    membersWithDetails.sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (a.role !== "owner" && b.role === "owner") return 1;
      return a.joinedAt - b.joinedAt;
    });

    return {
      members: membersWithDetails,
      totalMembers: membersWithDetails.length,
      maxMembers: MAX_TEAM_MEMBERS,
      remainingSlots: MAX_TEAM_MEMBERS - membersWithDetails.length,
    };
  },
});

// ============================================================================
// MEMBER MANAGEMENT MUTATIONS
// ============================================================================

/**
 * Remove a member from the project
 *
 * - Only owners can remove members
 * - Owner cannot be removed (must transfer ownership first)
 */
export const removeMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user and verify ownership
    const currentUser = await getUserByClerkId(ctx, identity.subject);
    if (!currentUser) {
      throw new Error("User not found");
    }

    await requireProjectOwner(ctx, args.projectId, currentUser._id);

    // Find the member to remove
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("User is not a member of this project");
    }

    // Cannot remove the owner
    if (membership.role === "owner") {
      throw new Error("Cannot remove the owner. Transfer ownership first.");
    }

    // Remove the member
    await ctx.db.delete(membership._id);

    // Get removed user info for return
    const removedUser = await ctx.db.get(args.userId);

    return {
      success: true,
      removedUserName: removedUser?.name ?? "Unknown",
    };
  },
});

/**
 * Transfer ownership to another member
 *
 * - Only current owner can transfer
 * - Target must be an existing member
 * - Current owner becomes a member
 */
export const transferOwnership = mutation({
  args: {
    projectId: v.id("projects"),
    newOwnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user and verify ownership
    const currentUser = await getUserByClerkId(ctx, identity.subject);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const currentOwnerMembership = await requireProjectOwner(
      ctx,
      args.projectId,
      currentUser._id
    );

    // Cannot transfer to yourself
    if (args.newOwnerId === currentUser._id) {
      throw new Error("You are already the owner");
    }

    // Find the new owner's membership
    const newOwnerMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.newOwnerId)
      )
      .unique();

    if (!newOwnerMembership) {
      throw new Error("User is not a member of this project");
    }

    // Transfer ownership: update both memberships
    await ctx.db.patch(currentOwnerMembership.membership._id, {
      role: "member",
    });

    await ctx.db.patch(newOwnerMembership._id, {
      role: "owner",
    });

    // Update the project's legacy userId field for backward compatibility
    const newOwner = await ctx.db.get(args.newOwnerId);
    if (newOwner) {
      await ctx.db.patch(args.projectId, {
        ownerId: newOwner.clerkId,
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      newOwnerName: newOwner?.name ?? "Unknown",
    };
  },
});

/**
 * Leave a project (for members, not owners)
 *
 * - Members can leave at any time
 * - Owners cannot leave (must transfer ownership first or delete project)
 */
export const leaveProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const currentUser = await getUserByClerkId(ctx, identity.subject);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Find user's membership
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", currentUser._id)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this project");
    }

    // Owner cannot leave
    if (membership.role === "owner") {
      throw new Error(
        "As the owner, you cannot leave the project. Transfer ownership to another member first, or delete the project."
      );
    }

    // Remove membership
    await ctx.db.delete(membership._id);

    return { success: true };
  },
});

// ============================================================================
// INTERNAL MUTATIONS (for scheduled jobs)
// ============================================================================

/**
 * Expire old email invitations
 *
 * Called by scheduled job to mark expired invitations
 */
export const expireOldInvitations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all pending email invitations that have expired
    const pendingEmailInvites = await ctx.db
      .query("projectInvitations")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "email"),
          q.eq(q.field("status"), "pending"),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .collect();

    let expiredCount = 0;

    for (const invite of pendingEmailInvites) {
      await ctx.db.patch(invite._id, { status: "expired" });
      expiredCount++;
    }

    console.log(`Expired ${expiredCount} old email invitations`);

    return { expiredCount };
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mask an email for privacy (show first 2 chars and domain)
 * e.g., "john.doe@example.com" -> "jo***@example.com"
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  const visibleChars = Math.min(2, localPart.length);
  const masked = localPart.slice(0, visibleChars) + "***";
  return `${masked}@${domain}`;
}
