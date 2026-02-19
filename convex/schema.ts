import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // CORE USER MANAGEMENT
  // ============================================

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Credits (one-time purchase model)
    credits: v.number(),

    // Onboarding
    hasCompletedOnboarding: v.optional(v.boolean()),

    // Referral (see DOCS/FOUNDER/REFERRAL_SYSTEM.md)
    referralCode: v.optional(v.string()),
    referredBy: v.optional(v.string()),

    // Email preferences
    emailUnsubscribeToken: v.optional(v.string()),
    unsubscribedFromAll: v.optional(v.boolean()),
    emailPreferences: v.optional(
      v.object({
        productUpdates: v.boolean(),
        engagementEmails: v.boolean(),
        allEmails: v.boolean(),
        updatedAt: v.number(),
      })
    ),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.optional(v.number()), // Used for inactivity detection cron
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ============================================
  // PROJECTS (generic multi-tenant container)
  // ============================================

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(), // Clerk user ID
    createdAt: v.number(),
    updatedAt: v.number(),
    // Add your project-specific fields here during build
  })
    .index("by_owner", ["ownerId"])
    .index("by_created", ["createdAt"]),

  // ============================================
  // TEAM ACCESS
  // ============================================

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_user", ["projectId", "userId"])
    .index("by_project_role", ["projectId", "role"]),

  projectInvitations: defineTable({
    projectId: v.id("projects"),
    type: v.union(v.literal("email"), v.literal("link")),

    // For email invites
    email: v.optional(v.string()),

    // For link invites (reusable until revoked)
    token: v.string(),

    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("revoked"),
      v.literal("expired")
    ),

    // Email invites expire after 7 days, link invites don't (until revoked)
    expiresAt: v.optional(v.number()),

    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("users")),
  })
    .index("by_project", ["projectId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_project_type", ["projectId", "type"]),

  // ============================================
  // PAYMENT: CREDITS
  // ============================================

  creditTransactions: defineTable({
    userId: v.string(), // Clerk user ID
    amount: v.number(), // Positive for additions, negative for deductions
    type: v.union(
      v.literal("initial_grant"),
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("bonus"),
      v.literal("refund")
    ),
    description: v.string(),
    balanceAfter: v.number(),
    metadata: v.optional(
      v.object({
        orderId: v.optional(v.string()),
        eventId: v.optional(v.string()), // For Meta Purchase event deduplication
      })
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["userId", "type"])
    .index("by_created", ["userId", "createdAt"]),

  // ============================================
  // PAYMENT: SUBSCRIPTIONS (dedicated table)
  // See DOCS/CORE/PRICING.md for full documentation
  // ============================================

  subscriptions: defineTable({
    userId: v.string(), // Clerk user ID
    lemonsqueezyId: v.string(), // Lemon Squeezy subscription ID
    lemonsqueezyPriceId: v.optional(v.string()),
    status: v.string(), // active, cancelled, expired, past_due, paused
    planId: v.optional(v.string()),
    amount: v.optional(v.number()), // Price in cents
    currency: v.optional(v.string()),
    interval: v.optional(v.string()), // month, year
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    canceledAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_provider", ["lemonsqueezyId"]),

  // ============================================
  // WEBHOOK AUDIT TRAIL
  // Logs every payment/webhook event for debugging
  // ============================================

  webhookEvents: defineTable({
    type: v.string(), // Event type (e.g., "subscription_created", "order_created")
    providerEventId: v.string(), // Provider's unique event ID
    data: v.string(), // JSON stringified event payload for debugging
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_provider_event", ["providerEventId"]),

  // ============================================
  // NOTIFICATIONS
  // ============================================

  notifications: defineTable({
    userId: v.string(), // Clerk user ID
    type: v.string(), // "referral_reward" | "credits_low" | etc.
    title: v.string(),
    message: v.string(),
    metadata: v.optional(
      v.object({
        credits: v.optional(v.number()),
        referredUserId: v.optional(v.string()),
        referredUserName: v.optional(v.string()),
      })
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_created", ["userId", "createdAt"]),

  // ============================================
  // SUPPORT
  // ============================================

  supportTickets: defineTable({
    userId: v.string(), // Clerk user ID
    userEmail: v.string(),
    userName: v.string(),
    subject: v.string(), // "technical" | "billing" | "feature" | "other"
    description: v.string(),
    priority: v.string(), // "low" | "normal" | "urgent"
    status: v.string(), // "open" | "in_progress" | "resolved" | "closed"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"]),

  // ============================================
  // EMAIL AUTOMATION
  // See DOCS/CORE/EMAIL-AUTOMATIONS.md
  // ============================================

  emailEvents: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(),
    sequenceId: v.string(), // "welcome", "inactive_user", etc.
    stepNumber: v.number(),
    emailType: v.string(), // Full identifier: "welcome_day_0", "inactive_day_7", etc.
    status: v.string(), // "sent", "failed", "skipped"
    sentAt: v.optional(v.number()),
    resendId: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        projectName: v.optional(v.string()),
        credits: v.optional(v.number()),
        daysSinceActivity: v.optional(v.number()),
        reminderNumber: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "emailType"])
    .index("by_user_sequence", ["userId", "sequenceId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // ============================================
  // BLOG (Convex DB-backed)
  // See DOCS/CORE/BLOG_SYSTEM.md
  // ============================================

  blogArticles: defineTable({
    title: v.string(),
    content: v.string(), // HTML content
    excerpt: v.string(),
    slug: v.string(),
    featuredImage: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.string(),
    tableOfContents: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          level: v.number(),
        })
      )
    ),
    status: v.string(), // "published" | "draft"
    publishDate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_publish_date", ["status", "publishDate"]),
});
