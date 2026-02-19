import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Create a new support ticket
 */
export const create = mutation({
  args: {
    subject: v.string(),
    description: v.string(),
    priority: v.string(), // "low" | "normal" | "urgent"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Get user details
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    const ticketId = await ctx.db.insert("supportTickets", {
      userId,
      userEmail: user.email,
      userName: user.name || "User",
      subject: args.subject,
      description: args.description,
      priority: args.priority,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Send admin notification email
    await ctx.scheduler.runAfter(0, internal.emails.sendSupportTicketNotification, {
      ticketId: ticketId.toString(),
      userEmail: user.email,
      userName: user.name || "User",
      subject: args.subject,
      description: args.description,
      priority: args.priority,
    });

    return ticketId;
  },
});

/**
 * Get all support tickets for the current user
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return tickets;
  },
});

/**
 * Get a single support ticket by ID
 */
export const get = query({
  args: { ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Ensure user can only access their own tickets
    if (ticket.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return ticket;
  },
});

/**
 * Create a demo request (no authentication required)
 * Used by the "Book a Demo" widget on the landing page
 */
export const createDemoRequest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    preferredDate: v.string(),
    preferredTime: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const description = [
      `Preferred date: ${args.preferredDate}`,
      `Preferred time: ${args.preferredTime}`,
      args.message ? `Message: ${args.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const ticketId = await ctx.db.insert("supportTickets", {
      userId: "anonymous",
      userEmail: args.email,
      userName: args.name,
      subject: "demo",
      description,
      priority: "normal",
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendSupportTicketNotification,
      {
        ticketId: ticketId.toString(),
        userEmail: args.email,
        userName: args.name,
        subject: "Demo Request",
        description,
        priority: "normal",
      }
    );

    return ticketId;
  },
});

/**
 * Update support ticket status (admin only - not implemented yet)
 */
export const updateStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.string(), // "open" | "in_progress" | "resolved" | "closed"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // TODO: Add admin role check here when roles are implemented

    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
