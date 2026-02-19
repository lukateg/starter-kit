/**
 * Referral System
 *
 * Handles referral tracking and rewards.
 * The referral code is the user's Clerk ID.
 * Referral rewards are tracked via creditTransactions (type: "bonus").
 *
 * See DOCS/FOUNDER/REFERRAL_SYSTEM.md for implementation guide.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const REFERRAL_REWARD_CREDITS = 600;

// Get user's referral code (the link is built on the client side)
export const getReferralLink = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return {
      referralCode: identity.subject,
    };
  },
});

// Get referral stats for current user
export const getReferralStats = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find all users referred by this user
    const referredUsers = await ctx.db
      .query("users")
      .collect()
      .then((users) =>
        users.filter((user) => user.referredBy === identity.subject)
      );

    // Count successful referrals by checking creditTransactions for referral bonuses
    const referralBonuses = await ctx.db
      .query("creditTransactions")
      .withIndex("by_type", (q) =>
        q.eq("userId", identity.subject).eq("type", "bonus")
      )
      .collect();

    const successfulReferrals = referralBonuses.filter((t) =>
      t.description.includes("Referral bonus")
    ).length;

    return {
      totalReferrals: referredUsers.length,
      successfulReferrals,
      pendingReferrals: referredUsers.length - successfulReferrals,
      totalCreditsEarned: successfulReferrals * REFERRAL_REWARD_CREDITS,
    };
  },
});

// Internal mutation to process referral reward when referred user makes first purchase
export const processReferralReward = internalMutation({
  args: {
    userId: v.string(), // The user who made the purchase (referred user)
  },
  async handler(ctx, args) {
    // Get the user who made the purchase
    const purchasingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .unique();

    if (!purchasingUser) {
      console.log("User not found:", args.userId);
      return { success: false, error: "User not found" };
    }

    // Check if this user was referred by someone
    if (!purchasingUser.referredBy) {
      return { success: false, error: "User was not referred" };
    }

    // Check if referral reward was already given (by looking at credit transactions)
    const existingBonus = await ctx.db
      .query("creditTransactions")
      .withIndex("by_type", (q) =>
        q.eq("userId", purchasingUser.referredBy!).eq("type", "bonus")
      )
      .collect()
      .then((txns) =>
        txns.find((t) =>
          t.description.includes(purchasingUser.name || args.userId)
        )
      );

    if (existingBonus) {
      console.log("Referral reward already given for user:", args.userId);
      return { success: false, error: "Reward already given" };
    }

    const referredBy = purchasingUser.referredBy;

    // Get the referrer
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", referredBy))
      .unique();

    if (!referrer) {
      console.log("Referrer not found:", referredBy);
      return { success: false, error: "Referrer not found" };
    }

    // Add credits to referrer
    await ctx.runMutation(internal.users.addCreditsInternal, {
      userId: referrer.clerkId,
      amount: REFERRAL_REWARD_CREDITS,
      type: "bonus",
      description: `Referral bonus - ${purchasingUser.name || "A user"} made their first purchase`,
    });

    // Create notification for referrer
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: referrer.clerkId,
      type: "referral_reward",
      title: "Referral Reward Earned!",
      message: `You earned ${REFERRAL_REWARD_CREDITS} credits because ${purchasingUser.name || "someone you referred"} made their first purchase!`,
      metadata: {
        credits: REFERRAL_REWARD_CREDITS,
        referredUserId: purchasingUser.clerkId,
        referredUserName: purchasingUser.name,
      },
    });

    console.log(
      `Referral reward processed: ${REFERRAL_REWARD_CREDITS} credits given to ${referrer.clerkId} for referring ${args.userId}`
    );

    return { success: true };
  },
});
