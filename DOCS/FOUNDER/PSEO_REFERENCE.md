# Programmatic SEO Reference

> **Purpose**: A thinking framework for evaluating pSEO opportunities. Not a specific play — a framework for brainstorming.

## What is pSEO?

Creating many pages at scale, each targeting a real search query with genuinely useful content. NOT keyword stuffing. NOT thin pages.

## The Core Principle

**Every page must answer a real search query with unique, useful content.** Google rewards pSEO that follows this. Google penalizes pSEO that doesn't.

## The Peter Levels Model

The most cited success case: a job platform that mapped companies to positions. Each page (`{Company} {Position} Remote Jobs`) served a real need. 200k+ indexed pages, massive organic traffic. Everyone happy — users found real jobs, Google showed useful results.

**The key insight**: The data itself was the value, not the page count.

## What Makes a Good pSEO Play

1. **Real search intent exists** for the page pattern (people actually search for this)
2. **Each page has genuinely unique, useful content** (not just a template with swapped keywords)
3. **The data is the moat** — more data = more value = more pages = more traffic
4. **Natural funnel**: Page content → CTA → your product
5. **User-generated scaling**: Users create demand for new pages (flywheel)
6. **Pages are linkable assets** — people naturally share/link to them

## Evaluating Your Product for pSEO

Ask yourself:

- Does your product produce data that people search for?
- Can you create a page template that maps data to real search queries?
- Is each page genuinely useful standalone (not just a thin wrapper)?
- Does more usage create more data, creating more pages? (flywheel)
- Would YOU bookmark one of these pages?

## Examples

### Good pSEO
- **City-specific salary data** → "Software Engineer Salary in Austin" — unique data per city, real search intent
- **Product comparison pages** → "[Product A] vs [Product B]" — genuine analysis, high purchase intent
- **Niche keyword databases** → "Low-KD Keywords for Dog Training" — unique data, clear value
- **API documentation** → "{API Name} {Endpoint} Examples" — developers search for this constantly

### Bad pSEO
- Auto-generated pages with no real content (template with swapped city names but same text)
- Keyword-stuffed pages targeting similar queries (cannibalization)
- Pages that exist only for page count, not user value
- Thin pages that could be a paragraph, not a page

## Red Flags (Your pSEO Might Fail If...)

- Each page could be a paragraph, not a page (thin content)
- Pages overlap significantly (keyword cannibalization)
- Data goes stale and you have no refresh pipeline
- The CTA gap is too wide (browsing → buying feels forced)
- Free alternatives already exist and are better established
- You can't get the data without significant cost/effort

## Implementation Pattern

If you decide to pursue pSEO:

1. **Validate demand**: Search for 10-20 variations of your page pattern. Do results exist? Are they weak?
2. **Build a prototype**: Create 5-10 pages manually. Do they rank? Do they get traffic?
3. **Automate generation**: Build the page template and data pipeline
4. **Submit to Search Console**: Submit sitemap with all pages
5. **Monitor**: Track indexing rate, impressions, clicks, rankings
6. **Iterate**: Improve pages that get impressions but low clicks (title/description optimization)

## Using This Kit for pSEO

The starter kit's blog system and dynamic routing support pSEO pages:
- Create dynamic routes: `src/app/(marketing)/[category]/[slug]/page.tsx`
- Generate pages from data (Convex queries)
- Include proper JSON-LD, meta tags, and sitemaps
- See `DOCS/CORE/SEO.md` for structured data patterns
