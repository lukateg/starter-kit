# Blog System

> **Status**: Active
> **Last Updated**: 2026-02-17

## Overview

The blog is backed by Convex DB — no static files, no build step for new posts. Posts are stored in the `blogArticles` table and rendered dynamically.

## Schema

```
blogArticles:
  title         — Post title
  slug          — URL-friendly slug (unique)
  content       — Full post content (HTML or Markdown)
  excerpt       — Short description for listings and SEO
  coverImage    — Optional cover image URL
  author        — Author name
  publishedAt   — Publication timestamp (Unix ms)
  tags          — Optional array of tag strings
```

Index: `by_slug` for fast slug-based lookups.

## Pages

| Route | Purpose |
|-------|---------|
| `(marketing)/blog/page.tsx` | Blog listing with tag filters |
| `(marketing)/blog/[id]/page.tsx` | Individual post with JSON-LD Article schema |

## Adding Blog Posts

### Option 1: Webhook Ingestion (Automated)

The starter kit ships a webhook endpoint for external publishers to POST blog articles:

**Endpoint**: `POST /blog-webhook`

**Authentication**: API key in the `Authorization` header.

**Payload**:
```json
{
  "title": "Post Title",
  "slug": "post-title",
  "content": "<p>Full HTML content</p>",
  "excerpt": "Short description",
  "coverImage": "https://example.com/image.jpg",
  "author": "Author Name",
  "tags": ["tag1", "tag2"]
}
```

The webhook handler upserts by slug — if a post with that slug exists, it's updated. Otherwise, a new post is created.

**Setup**: Set the `BLOG_WEBHOOK_API_KEY` environment variable in your Convex dashboard. The webhook handler validates this key.

### Option 2: Direct Convex Mutations

For admin interfaces or scripts:

```typescript
await ctx.db.insert("blogArticles", {
  title: "My Post",
  slug: "my-post",
  content: "<p>Content here</p>",
  excerpt: "Short description",
  author: "Your Name",
  publishedAt: Date.now(),
  tags: ["update"],
});
```

### Option 3: Convex Dashboard

Use the Convex dashboard data browser to manually add/edit posts during development.

## SEO

Each blog post page should include:
- `Article` JSON-LD structured data (headline, description, datePublished, author)
- `BreadcrumbList` JSON-LD (Home → Blog → Post Title)
- Open Graph meta tags with title, description, and cover image
- Canonical URL

See `DOCS/CORE/SEO.md` for implementation patterns.

## Blog as an SEO Growth Tool

See `DOCS/FOUNDER/SEO_PLAYBOOK.md` for strategy on using the blog for organic traffic growth.
