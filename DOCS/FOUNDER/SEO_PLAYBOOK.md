# SEO Playbook

> **Purpose**: How to use the pre-built blog and SEO foundations to drive organic traffic

## Why SEO Matters for SaaS

- Organic traffic compounds over time (unlike paid, which stops when you stop paying)
- Blog content builds authority and trust
- Long-tail keywords bring high-intent visitors
- Internal linking between blog posts and product pages improves rankings

## The Strategy: Bottom-Up Content

Start with **bottom-of-funnel** content (high intent, closer to purchase), then work up to **top-of-funnel** (awareness, broader topics).

### Content Funnel

```
Top of Funnel (TOFU)     → "What is [problem]?"
                         → "How to [solve problem]"
                         → "Best practices for [topic]"

Middle of Funnel (MOFU)  → "[Your category] comparison"
                         → "How to choose a [tool type]"
                         → "[Product] vs [Competitor]"

Bottom of Funnel (BOFU)  → "[Your product] for [use case]"
                         → "How to [specific task] with [your product]"
                         → "[Your product] alternatives"  ← Write this yourself
```

**Start with BOFU.** These articles target people already looking for a solution. They convert better and build foundation for broader content later.

## Keyword Research (Manual Approach)

Without tools, you can identify keywords using:

1. **Google Autocomplete**: Type your topic and see what Google suggests
2. **"People Also Ask"**: Questions that appear in search results
3. **Competitor blogs**: What are similar products writing about?
4. **Reddit/forums**: What questions do your target users ask?
5. **Google Search Console** (after you have some traffic): See what queries bring impressions

### Evaluating Keywords

Good keywords for early-stage SaaS:
- Specific enough to rank (not "project management" but "project management for freelancers")
- Have clear search intent (someone searching this would benefit from your product)
- Low competition (fewer established pages ranking for this term)

## Using the Blog System

The starter kit's blog is Convex DB-backed. See `DOCS/CORE/BLOG_SYSTEM.md`.

### Adding Posts
- Use the webhook endpoint for automated publishing
- Or add directly via Convex mutations/dashboard

### SEO for Each Post
- Title tag: Include primary keyword, under 60 characters
- Meta description: Include keyword, compelling summary, under 155 characters
- H1: Matches or closely matches the title tag
- URL slug: Short, keyword-rich, hyphen-separated
- Internal links: Link to other blog posts and product pages
- JSON-LD Article schema: Automatically included per blog post page

## Internal Linking Strategy

Link between:
- Blog posts on related topics (creates topic clusters)
- Blog posts → relevant product pages (drives sign-ups)
- Product pages → blog posts (provides context and value)

A good rule: Every blog post should have 2-3 internal links to other posts or product pages.

## Measuring Performance

With PostHog (already set up):
- **Blog traffic**: Page views per post
- **Conversion**: Blog → sign-up rate
- **Engagement**: Time on page, scroll depth

With Google Search Console (set up after launch):
- **Impressions**: How often your pages appear in search
- **Clicks**: How many people click through
- **Position**: Average ranking position
- **Query data**: What people search to find your pages

## When to Start

**Day 1.** SEO is a long game — it takes 3-6 months for content to rank. The sooner you start, the sooner you see results. Even 1 post per week compounds significantly over time.

## Quick Wins

1. Write your "[Product] vs [Top Competitor]" comparison page
2. Write a "How to [core use case] with [Product]" tutorial
3. Write an "[Product] alternatives" page (yes, rank for your own alternatives query)
4. Answer 5 questions from "People Also Ask" in your niche
5. Set up Google Search Console and submit your sitemap
