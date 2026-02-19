import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create or update a blog article from webhook
 */
export const upsertBlogArticle = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    slug: v.string(),
    featuredImage: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.string(),
    publishDate: v.number(),
    tableOfContents: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          level: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Check if article with this slug already exists
    const existing = await ctx.db
      .query("blogArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        featuredImage: args.featuredImage,
        tags: args.tags,
        category: args.category,
        publishDate: args.publishDate,
        tableOfContents: args.tableOfContents,
        status: "published",
        updatedAt: now,
      });

      return { articleId: existing._id, action: "updated" };
    } else {
      const articleId = await ctx.db.insert("blogArticles", {
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        slug: args.slug,
        featuredImage: args.featuredImage,
        tags: args.tags,
        category: args.category,
        publishDate: args.publishDate,
        tableOfContents: args.tableOfContents,
        status: "published",
        createdAt: now,
        updatedAt: now,
      });

      return { articleId, action: "created" };
    }
  },
});

/**
 * Delete a blog article
 */
export const deleteBlogArticle = mutation({
  args: { id: v.id("blogArticles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Get all published blog articles, sorted by publish date (newest first)
 */
export const getPublishedArticles = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("blogArticles")
      .withIndex("by_publish_date", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

/**
 * Get a single blog article by slug
 */
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blogArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
