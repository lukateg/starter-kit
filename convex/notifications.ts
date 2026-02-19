import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get unread notifications count
export const getUnreadCount = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", identity.subject).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});

// Get all notifications for current user
export const getNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", identity.subject).eq("isRead", false)
      )
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );
  },
});

// Internal mutation to create a notification
export const createNotification = internalMutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(
      v.object({
        credits: v.optional(v.number()),
        referredUserId: v.optional(v.string()),
        referredUserName: v.optional(v.string()),
      })
    ),
  },
  async handler(ctx, args) {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      metadata: args.metadata,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
