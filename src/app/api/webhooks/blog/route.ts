import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface WebhookPayload {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  tags: string[];
  category: string;
  publish_date: string; // ISO 8601 date string
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate request with API key
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = process.env.WEBHOOK_API_KEY;

    if (!expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error: WEBHOOK_API_KEY not set" },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing API key" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const payload: WebhookPayload = await req.json();

    const requiredFields = [
      "title",
      "content",
      "excerpt",
      "slug",
      "tags",
      "category",
      "publish_date",
    ];
    const missingFields = requiredFields.filter((field) => !(field in payload));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Parse publish date
    const publishDate = new Date(payload.publish_date).getTime();
    if (isNaN(publishDate)) {
      return NextResponse.json(
        { success: false, error: "Invalid publish_date format. Expected ISO 8601 date string" },
        { status: 400 }
      );
    }

    // 4. Save article to Convex
    const result = await convex.mutation(api.blogArticles.upsertBlogArticle, {
      title: payload.title,
      content: payload.content,
      excerpt: payload.excerpt,
      slug: payload.slug,
      featuredImage: payload.featured_image,
      tags: payload.tags,
      category: payload.category,
      publishDate,
    });

    return NextResponse.json({
      success: true,
      articleId: result.articleId,
      action: result.action,
      message: `Article ${result.action} successfully`,
    });
  } catch (error) {
    console.error("[WEBHOOK] Blog webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Return 405 for other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
