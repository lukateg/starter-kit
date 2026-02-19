# SEO & Structured Data

> **Status**: Active
> **Last Updated**: 2026-02-17

## Overview

Every public-facing page must include appropriate JSON-LD structured data for search visibility and rich snippets. The starter kit ships with SEO foundations: `robots.ts`, `sitemap.ts`, meta tag patterns, and JSON-LD examples.

## Required Schema Types by Page

| Page Type | Required JSON-LD | Location |
|-----------|-----------------|----------|
| All pages | Organization, WebSite | Root layout `src/app/layout.tsx` |
| Homepage | FAQ (if FAQ section) | `src/app/(marketing)/page.tsx` |
| Blog listing | CollectionPage | `src/app/(marketing)/blog/page.tsx` |
| Blog posts | Article, BreadcrumbList | `src/app/(marketing)/blog/[id]/page.tsx` |
| Pricing | Product, Offer | Pricing page |
| Changelog | WebPage | `src/app/(marketing)/changelog/page.tsx` |

## JSON-LD Implementation

Add JSON-LD scripts to page components:

```typescript
// Static schema (root layout)
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Your App Name",
      "url": "https://yourdomain.com",
      "logo": "https://yourdomain.com/logo.png",
    })
  }}
/>

// Dynamic schema (blog post)
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.excerpt,
  "datePublished": new Date(post.publishedAt).toISOString(),
  "author": { "@type": "Person", "name": post.author },
};
```

## Meta Tags Pattern

Use Next.js metadata API:

```typescript
// Static metadata
export const metadata: Metadata = {
  title: "Page Title | Your App",
  description: "Page description for search results",
  openGraph: {
    title: "Page Title",
    description: "Page description",
    images: ["/og-image.png"],
  },
};

// Dynamic metadata (for pages with params)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  };
}
```

## Static SEO Files

### `src/app/robots.ts`
Dynamic robots.txt generation. Allows all crawlers, points to sitemap.

### `src/app/sitemap.ts`
Dynamic sitemap generation. Include all public pages and blog posts.

### `public/llms.txt`
Instructions for AI crawlers about what content they can access.

## Checklist for New Public Pages

1. Add appropriate JSON-LD structured data
2. Set `metadata` or `generateMetadata` with title, description, Open Graph
3. Add page to sitemap in `src/app/sitemap.ts`
4. Ensure page is accessible to crawlers (not blocked in robots.ts)
5. Test with [Google Rich Results Test](https://search.google.com/test/rich-results)

## Performance Impact on SEO

See `DOCS/CORE/TECHNICAL_SEO_PERFORMANCE.md` for Core Web Vitals optimization. Google uses page speed as a ranking factor.
