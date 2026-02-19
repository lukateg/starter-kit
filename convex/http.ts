import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Webhook } from "svix";
import { httpRouter } from "convex/server";

import type { WebhookEvent } from "@clerk/backend";

// ============================================
// CLERK WEBHOOK
// Handles user lifecycle events from Clerk
// ============================================

async function validateClerkRequest(
  req: Request
): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateClerkRequest(request);
  if (!event) {
    return new Response("Error occured", { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      // Extract only the fields we need from Clerk payload to avoid validation errors
      // if Clerk adds new fields in the future
      const clerkData = event.data;
      const structuredUser = {
        id: clerkData.id,
        email_addresses: (clerkData.email_addresses || []).map(
          (email: { id?: string; email_address?: string | null }) => ({
            id: email.id ?? "",
            email_address: email.email_address ?? null,
          })
        ),
        primary_email_address_id: clerkData.primary_email_address_id ?? null,
        first_name: clerkData.first_name ?? null,
        last_name: clerkData.last_name ?? null,
        username: clerkData.username ?? null,
        image_url: clerkData.image_url ?? null,
        created_at: clerkData.created_at ?? null,
        updated_at: clerkData.updated_at ?? null,
        unsafe_metadata: clerkData.unsafe_metadata ?? null,
      };

      await ctx.runMutation(internal.users.updateOrCreateUser, {
        clerkUser: structuredUser,
      });

      // Schedule welcome email sequence
      const userEmail = clerkData.email_addresses?.[0]?.email_address;
      if (userEmail) {
        ctx.scheduler.runAfter(
          0,
          internal.emailAutomation.triggers.triggerWelcomeSequence,
          {
            userId: clerkData.id,
            email: userEmail,
            name: structuredUser.first_name || "there",
          }
        );
      }

      break;
    }
    case "user.updated": {
      // Extract only the fields we need from Clerk payload to avoid validation errors
      // if Clerk adds new fields in the future
      const clerkData = event.data;
      const structuredUser = {
        id: clerkData.id,
        email_addresses: (clerkData.email_addresses || []).map(
          (email: { id?: string; email_address?: string | null }) => ({
            id: email.id ?? "",
            email_address: email.email_address ?? null,
          })
        ),
        primary_email_address_id: clerkData.primary_email_address_id ?? null,
        first_name: clerkData.first_name ?? null,
        last_name: clerkData.last_name ?? null,
        username: clerkData.username ?? null,
        image_url: clerkData.image_url ?? null,
        created_at: clerkData.created_at ?? null,
        updated_at: clerkData.updated_at ?? null,
        unsafe_metadata: clerkData.unsafe_metadata ?? null,
      };

      await ctx.runMutation(internal.users.updateOrCreateUser, {
        clerkUser: structuredUser,
      });
      break;
    }
    case "user.deleted": {
      const id = event.data.id!;
      await ctx.runMutation(internal.users.deleteUser, { id });
      break;
    }
    default: {
      console.log("Ignored Clerk webhook event:", event.type);
    }
  }

  return new Response(null, { status: 200 });
});

// ============================================
// LEMONSQUEEZY WEBHOOK
// Handles payment events from LemonSqueezy
// ============================================

const handleLemonSqueezyWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-signature");
  if (!signature) {
    console.error("Missing x-signature header");
    return new Response("Missing signature", { status: 401 });
  }

  const payloadString = await request.text();

  // Delegate validation and processing to a Node action (crypto not available in httpActions)
  const result = await ctx.runAction(
    internal.payments.processWebhook,
    {
      signature,
      payloadString,
    }
  );

  if (!result.success) {
    console.error("LemonSqueezy webhook processing failed:", result.error);
    return new Response(result.error || "Error occurred", { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// ============================================
// BLOG WEBHOOK
// Receives blog article content via API key-authenticated webhook
// ============================================

const handleBlogWebhook = httpAction(async (ctx, request) => {
  const startTime = Date.now();
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.WEBHOOK_API_KEY;

  // Validate API key
  if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
    console.error("Blog webhook: Unauthorized - invalid or missing API key");
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid or missing API key" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const payloadString = await request.text();
    const payload = JSON.parse(payloadString);

    // Validate required fields
    const requiredFields = [
      "title",
      "contentHtml",
      "contentMd",
      "metaDescription",
      "slug",
      "category",
      "publish_date",
    ];
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      console.error("Blog webhook:", errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate content fields
    if (!payload.contentHtml || !payload.metaDescription) {
      const errorMsg = `Missing content fields: ${!payload.contentHtml ? "contentHtml" : ""} ${!payload.metaDescription ? "metaDescription" : ""}`.trim();
      console.error("Blog webhook:", errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert or update the blog article
    const result = await ctx.runMutation(api.blogArticles.upsertBlogArticle, {
      title: payload.title,
      content: payload.contentHtml,
      excerpt: payload.metaDescription,
      slug: payload.slug,
      featuredImage: payload.featured_image,
      tags: payload.tags || [],
      category: payload.category,
      publishDate: payload.publish_date,
      tableOfContents: payload.toc,
    });

    const duration = Date.now() - startTime;
    console.log(`Blog webhook: Article ${result.action}: ${payload.title}`, {
      articleId: result.articleId,
      duration,
    });

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing blog webhook:", errorMsg, error);

    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ============================================
// HTTP ROUTER
// ============================================

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

http.route({
  path: "/lemonsqueezy-webhook",
  method: "POST",
  handler: handleLemonSqueezyWebhook,
});

http.route({
  path: "/blog-webhook",
  method: "POST",
  handler: handleBlogWebhook,
});

export default http;
