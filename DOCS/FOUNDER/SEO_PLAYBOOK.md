# SEO Playbook

> **Purpose**: How to use the pre-built blog and SEO foundations to drive organic traffic
>
> **Related docs**: Code-level SEO rules → `DOCS/CORE/SEO_BEST_PRACTICES.md` | Authority & backlinks → `DOCS/FOUNDER/SEO_AUTHORITY_BUILDING.md` | Programmatic SEO → `DOCS/FOUNDER/PSEO_REFERENCE.md`

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

## Finding Keyword Gaps (SERP Analysis)

A keyword gap is a search term where Google's existing results don't properly serve the searcher. These are your highest-ROI opportunities — they require less content, fewer backlinks, and rank faster because Google is desperate for quality content to fill the gap.

> **With DataForSEO MCP**: This entire analysis can be automated. Use SERP API to pull top results for a keyword, Keywords Data API for volume/difficulty, and On-Page API to audit competitor content depth. The manual process below is what the MCP automates.

### What a keyword gap actually is

A keyword gap is NOT just "low domain authority sites are ranking." It's specifically about **optimization and intent satisfaction**:

- The exact keyword (or close variation) is **missing from the 5 key placements** in the top results
- The content that IS ranking is **thin** — doesn't actually satisfy what the searcher wants
- The content is **fluffy** — buries the answer in padding instead of delivering value fast

A close variation counts. If you're targeting "email client for privacy" and a result has "private email client" optimized well, that's close enough — the gap is smaller.

### The 5 placements (in priority order)

When analyzing competitors in the SERP, check these in order of importance:

1. **Page title** — most important. First thing searchers see in results. If the keyword isn't here, many searchers won't even click. A competitor missing the keyword in the title = big opportunity.
2. **H1** — first thing seen after clicking. Confirms "this page is for me." Less important than title (searcher already clicked), but critical for on-page assurance.
3. **First sentence** — at the beginning, not buried. When the keyword opens the first sentence, you're forced to deliver value immediately.
4. **URL slug** — visible in search results, signals topic match.
5. **Meta description** — reinforces relevance in the SERP snippet. Optional (Google sometimes rewrites these), but still worth optimizing.

### How to evaluate a SERP for gaps

Search your target keyword and check results manually (or via DataForSEO SERP API):

**Step 1: Check optimization of top 10 results**
For each result, check: Is the exact keyword or close variation in the page title? In the H1? In the URL? If most results are missing it from 2+ of these places, there's a gap.

**Step 2: Check content quality**
Click into the top 3-5 results:
- Is the page **thin**? (A paragraph or two, no real depth)
- Is the answer **buried in fluff**? (Thousands of words of filler before the actual value)
- Does the page **actually address the search intent**? (Sometimes a page ranks for a keyword by accident — the topic is adjacent but doesn't really answer what the searcher wants)

**Step 3: Check authority levels**
- Is there at least one **low domain authority site** ranking in the top 10? If so, Google is desperate for content on this keyword and will accept new, low-authority sites.
- Are there Reddit/forum results ranking? That's often a sign of a content gap — Google has nothing better to show.

### Degrees of keyword gaps

Not all gaps are equal:

| Gap size | What you see in the SERP | What it means |
|----------|-------------------------|---------------|
| **Big gap** | No results have keyword in title, content is thin, low-authority sites ranking | Easy win. Minimal content and no backlinks needed. |
| **Medium gap** | Keyword in some titles but content is thin or doesn't satisfy intent | Winnable with better-optimized, deeper content. |
| **Small gap** | Top result is well-optimized + authoritative, but positions 2-10 are weak | You can likely get position 2-3. Position 1 requires more authority. |
| **No gap** | Multiple well-optimized, authoritative, deep-content results | Hard to compete. Find a different keyword or a long-tail variation. |

### Real example: "growth hacking newsletter"

The #1 result was growthhackers.com/newsletter (domain authority ~65). It had the keyword variation in the title, seemed hard to beat. But the page itself was thin — just a headline, one sentence, and a signup form. No examples of what you'd get, no social proof, no benefits listed.

By making a page with the keyword in all 5 places PLUS real depth (examples of growth hacks, credentials, benefits of subscribing) + submitting to a few free newsletter directories, it was enough to rank #1. The high-authority competitor lost because their content was thin despite good optimization.

### Why keyword difficulty scores from SEO tools are misleading

SEO tools calculate difficulty based on domain authority and backlinks of ranking pages. They completely miss the content dimension. A keyword might show "high difficulty" because authoritative sites appear in results, but if those authoritative sites have thin or off-topic content, you can outrank them with a well-optimized, genuinely deep page.

**Always check the SERP yourself** (or via DataForSEO). Don't trust the difficulty number alone.

### How to fill a keyword gap

1. **Optimize for the keyword** in all 5 places (title, URL, meta description, H1, first sentence) — see `DOCS/CORE/SEO_BEST_PRACTICES.md` section 2
2. **Satisfy search intent immediately** — answer/value above the fold, not buried
3. **Then go deep** — provide extra detail, context, examples, social proof below the fold
4. **Don't pad with fluff** — depth beats length. A focused 800-word page that nails intent beats a 3,000-word page of filler
5. **Use natural language** in headings — see `DOCS/CORE/SEO_BEST_PRACTICES.md` section 3

### Using DataForSEO MCP for keyword gap analysis

Once DataForSEO MCP is connected, you can automate this entire workflow:

1. **SERP API** → Pull top 10 results for your target keyword. Check titles, URLs, descriptions for keyword presence.
2. **Keywords Data API** → Get search volume, CPC, competition level. Focus on bottom-of-funnel keywords with purchase/use intent.
3. **On-Page API** → Crawl competitor pages to check content depth, H1 optimization, word count, and whether they actually address the intent.
4. **Domain Analytics** → Check your own domain authority vs. competitors in the SERP.
5. **Related Keywords** → Find long-tail variations of keywords that have even bigger gaps.

This turns a manual 30-minute-per-keyword process into something you can run across hundreds of keywords to find the best opportunities.

---

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
