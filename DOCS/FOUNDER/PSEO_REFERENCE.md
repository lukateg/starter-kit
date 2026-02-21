# Programmatic SEO Reference

> **Purpose**: A thinking framework for evaluating pSEO opportunities. Not a specific play — a framework for brainstorming.
>
> **Related docs**: Code-level SEO rules (doorway pages, URL structure) → `DOCS/CORE/SEO_BEST_PRACTICES.md` | Authority & backlinks → `DOCS/FOUNDER/SEO_AUTHORITY_BUILDING.md`

## What is pSEO?

Creating many pages at scale, each targeting a real search query with genuinely useful content. NOT keyword stuffing. NOT thin pages.

## The Core Principle

**Every page must answer a real search query with unique, useful content.** Google rewards pSEO that follows this. Google penalizes pSEO that doesn't.

## The Peter Levels Model (Detailed Breakdown)

Peter Levels (indie hacking legend) runs multiple products where pSEO drives the majority of revenue — not his social media following. He confirmed this himself: "Everyone thinks it's followers, but most of my traffic is SEO and specifically programmatic SEO."

His followers DO matter as a **launch pad** — when he launches a product, it gets initial traffic, backlinks, branded searches, and engagement. This signals to Google that the site is important, which makes the pSEO pages rank. But after that initial boost, the pSEO engine runs on its own.

### The products and their scale

| Product | Indexed pages | Monthly organic traffic | What each page targets |
|---------|--------------|------------------------|----------------------|
| **RemoteOK** | 590,000 | ~21,000 visits/month | Every company, every job, every job seeker |
| **PhotoAI** | 61,000 | ~13,800 visits/month ($148k/mo revenue) | Every photo category, concept, user-generated image |
| **NomadList** | 20,000 | ~8,000 visits/month (~$4.9k ad value) | Every city and country with cost/internet/weather data |
| **InteriorAI** | 4,000 | — | Every interior design style and room type |

### How RemoteOK does it

It's not just "remote {tech} jobs" and "remote jobs in {location}" — that's the obvious layer. The deeper layers:

1. **A unique page for every company** that ever posted a job → "Remote jobs at {Company}" → ranks for branded company searches
2. **A profile page for every job seeker** → indexed by Google → recruiters find talent through Google
3. **The win-win flywheel**: Recruiters find talent → workers get visibility → RemoteOK gets the traffic → Google sees the site as valuable because users are satisfied

The key: these pages are genuinely useful to the searcher. A recruiter searching "remote jobs at Stripe" finds real data. A worker's profile page surfaces when their name is searched.

### How PhotoAI does it

"Squeeze every bit of structured and unstructured data into pages":

1. **Category pages** for every photo concept (anime characters, professional headshots, etc.)
2. **Inspiration pages** for every photo idea you might search
3. **User-generated image pages** — even free-plan prompts get their own indexed page

Each page captures a long-tail search (50-100 searches/month individually) but together they add up to massive traffic.

### How NomadList does it

Same blueprint: every data point becomes a standalone page.

- Every city gets a page with cost of living, internet speed, weather, safety
- Every country gets a page
- Each page has genuinely unique data — not the same template with a city name swapped

### The core principle: every data point = a page

The more variables and dependencies you have, the better:
- **Variables**: The things that change per page (city, company, category, user)
- **Dependencies**: Content that changes BASED on the variables (not just the variable itself swapped in)
- **AI augmentation**: Some content can be AI-generated based on the variables, but must be reviewed

## What Makes a Good pSEO Play

1. **Real search intent exists** for the page pattern (people actually search for this)
2. **Each page has genuinely unique, useful content** (not just a template with swapped keywords)
3. **The data is the moat** — more data = more value = more pages = more traffic
4. **Natural funnel**: Page content → CTA → your product
5. **User-generated scaling**: Users create demand for new pages (flywheel)
6. **Pages are linkable assets** — people naturally share/link to them
7. **Win-win for all parties**: The page serves the searcher, the searcher's activity creates more data, more data creates more pages (RemoteOK model)

## Prerequisites Before Scaling pSEO

**Don't start with 600,000 pages.** You need a foundation first:

1. **Domain authority / engagement / backlinks** — If your site is brand new with zero authority, Google won't index thousands of pages. Get initial traction first (launch to audience, submit to directories, get press, build links).
2. **Branded searches** — People searching for your brand signals to Google that you're legitimate.
3. **Scale slowly** — Start with 10-50 pages. See if they get indexed and rank. Then scale to hundreds, then thousands.

Without this foundation, thousands of pSEO pages will just waste crawl budget and potentially hurt your SEO.

## Evaluating Your Product for pSEO

Ask yourself:

- Does your product produce data that people search for?
- Can you create a page template that maps data to real search queries?
- Is each page genuinely useful standalone (not just a thin wrapper)?
- Does more usage create more data, creating more pages? (flywheel)
- Would YOU bookmark one of these pages?
- **Be harsh**: If you look at a generated page and it wouldn't help a real searcher, don't publish it. Most people aren't critical enough of their own pages.

## Examples

### Good pSEO
- **Job boards**: Every company + role combo gets a page (RemoteOK: 590k pages)
- **Photo/AI tools**: Every category, concept, and user creation gets a page (PhotoAI: 61k pages)
- **City/location data**: Every city with real unique data points (NomadList: 20k pages)
- **City-specific salary data** → "Software Engineer Salary in Austin" — unique data per city, real search intent
- **Product comparison pages** → "[Product A] vs [Product B]" — genuine analysis, high purchase intent
- **Niche keyword databases** → "Low-KD Keywords for Dog Training" — unique data, clear value
- **API documentation** → "{API Name} {Endpoint} Examples" — developers search for this constantly

### Bad pSEO
- Auto-generated pages with no real content (template with swapped city names but same text)
- Keyword-stuffed pages targeting similar queries (cannibalization)
- Pages that exist only for page count, not user value
- Thin pages that could be a paragraph, not a page
- Thousands of pages on a brand-new site with no authority (wastes crawl budget)

## Red Flags (Your pSEO Might Fail If...)

- Each page could be a paragraph, not a page (thin content)
- Pages overlap significantly (keyword cannibalization)
- Data goes stale and you have no refresh pipeline
- The CTA gap is too wide (browsing → buying feels forced)
- Free alternatives already exist and are better established
- You can't get the data without significant cost/effort
- Your site has no existing authority/backlinks/branded searches (need foundation first)
- You're not being harsh enough evaluating if pages actually serve searchers

## Case Study: Lovable.dev (What to Do and What NOT to Do)

Lovable.dev (AI vibe coding platform) went from 650 → 62,000 → 363,000 organic clicks/month in one year using bottom-of-funnel pSEO. The strategy is powerful, but their execution has specific mistakes that risk a manual penalty. This case study captures both the wins and the warnings.

### What they do (the strategy)

**Two types of pSEO pages:**

1. **Solutions pages** (use-case landing pages):
   - Hub page at `/solutions` listing all use cases with descriptions
   - Individual pages like "Build High-Converting Event Landing Pages with AI"
   - Each page: H1 with keyword → description → embedded product (you can start building immediately) → steps → testimonials → FAQ → CTA at bottom

2. **How-to pages** (tutorial landing pages):
   - Hub page at `/how-to` organized by category (AI & Machine Learning, E-commerce, etc.)
   - Sub-hub pages per category linking to individual how-to pages
   - Individual pages include copyable prompts and example projects you can preview

**Keywords they target**: Ultra-specific, long-tail, bottom-of-funnel with use intent. Examples:
- "DSA project tracker" / "pension management system project" / "automated time and attendance AI"
- "AI chatbot landing page" / "affiliate review and comparison sites" / "newsletter platforms"

These keywords have almost no competition because they're so specific, but the searchers have extreme intent — they know exactly what they want to build.

### What they do right

1. **Above-the-fold intent match**: The H1 targets the keyword. Right below, the product is embedded — you can immediately start building. The searcher gets what they want in seconds.
2. **Hub pages with descriptions**: The solutions hub page has a short description for each use case (not just a list of links). This helps Google and users understand what each sub-page is about.
3. **Social proof on every page**: Testimonials appear on each pSEO page, not just the homepage.
4. **FAQ sections**: Each page has relevant FAQs — extra keyword coverage and schema markup opportunity.
5. **Example projects**: How-to pages show real example projects you can preview. This adds genuine unique value beyond the template.
6. **Copyable prompts**: How-to pages include prompts to use with their product. This is functional content, not filler.
7. **Bottom CTA**: Every page ends with another call-to-action. Don't let users scroll to the bottom and leave.

### What they do WRONG (critical mistakes to avoid)

1. **404-ing intermediate subfolder**:
   - URL: `/solutions/use-case/event-landing-page`
   - But `/solutions/use-case/` returns a 404
   - **Rule**: Every subfolder in the URL path must be a real, working page. If you have `/a/b/c`, then `/a/`, `/a/b/`, and `/a/b/c` must all resolve. Never have dead intermediate paths.

2. **Too many hub layers (3+ clicks from homepage)**:
   - Their how-to pages go: Homepage → How-to hub → Category sub-hub → Individual page
   - That's 3 clicks from homepage. Each extra click dilutes link juice.
   - **Rule**: pSEO pages should be **max 2 clicks** from homepage. One click to the hub, second click to the page. See `DOCS/CORE/SEO_BEST_PRACTICES.md` section 7 (two-click rule).

3. **Sloppy AI-generated headings (not human-reviewed)**:
   - Example: "Example how to build AI agency and consulting projects projects" — the word "projects" doubled
   - Appears across many pages. Clearly no human review.
   - **Rule**: Every pSEO page MUST be reviewed or at minimum have quality checks (duplicate words, grammatical errors, keyword stuffing in H2s). The pages are short — review takes minutes.

4. **AI-obvious copy**:
   - Overuse of "leverage", generic descriptions, stilted phrasing
   - **Rule**: If a human reader can instantly tell it's AI-written, rewrite it. Doesn't need to be fully human-written, but must be human-edited for naturalness.

5. **Keyword jamming in subheadings**:
   - H2s force the full keyword into places where it reads unnaturally
   - **Rule**: The keyword goes in the 5 mandatory places (title, meta, URL, H1, first sentence). H2s should use natural language, not force the keyword in. See `DOCS/CORE/SEO_BEST_PRACTICES.md` sections 2 and 3.

### The risk they're taking

Despite these mistakes, they're still growing because:
- Domain authority is 42/100 with 16,800 referring domains
- The keywords are so low-competition that even sloppy pages rank
- Bottom-of-funnel keywords require less content to rank

**But**: Sloppy, unreviewed AI content at scale is exactly what triggers manual penalties. They could lose everything overnight. High domain authority doesn't protect against manual reviews.

### Key takeaways for our pSEO

| Do this | Don't do this |
|---------|---------------|
| Embed product/value above the fold | Rely purely on text descriptions |
| Include social proof on every pSEO page | Only put testimonials on the homepage |
| Add functional content (prompts, examples, previews) | Generate pure text-only pages |
| Human-review every page (they're short, it's fast) | Ship unreviewed AI output at scale |
| Keep pages max 2 clicks from homepage | Add unnecessary hub layers |
| Ensure every URL subfolder resolves to a page | Leave 404s in your URL hierarchy |
| Use natural H2s after placing keyword in the 5 spots | Jam the keyword into every heading |
| Add FAQ sections (extra keywords + schema) | Skip FAQs on pSEO pages |

---

## Implementation Pattern

If you decide to pursue pSEO:

1. **Validate demand**: Search for 10-20 variations of your page pattern. Do results exist? Are they weak? (Use DataForSEO SERP API to automate)
2. **Build a prototype**: Create 5-10 pages manually. Do they rank? Do they get traffic?
3. **Automate generation**: Build the page template and data pipeline
4. **Human review**: Review every generated page before publishing. They're short — this is fast.
5. **Submit to Search Console**: Submit sitemap with all pages
6. **Monitor**: Track indexing rate, impressions, clicks, rankings
7. **Iterate**: Improve pages that get impressions but low clicks (title/description optimization)

---

## pSEO Page Template (Based on What Works)

Based on the Lovable.dev analysis and best practices:

```
Above the fold:
├── H1 (keyword in natural language)
├── Subheading (benefit statement)
├── Primary CTA / embedded product / input
│
Scrolling:
├── Steps / How it works (H2s in natural language)
├── Example projects or previews (functional, not just text)
├── Copyable templates or prompts (if applicable)
├── Testimonials / social proof
├── FAQ section (related questions → extra keyword coverage + FAQ schema)
└── Bottom CTA (repeat the primary action)
```

Every pSEO page should follow this structure. The keyword appears in the 5 mandatory places (title, meta, URL, H1, first sentence) and nowhere else forced.

---

## Using This Kit for pSEO

The starter kit's blog system and dynamic routing support pSEO pages:
- Create dynamic routes: `src/app/(marketing)/[category]/[slug]/page.tsx`
- Generate pages from data (Convex queries)
- Include proper JSON-LD, meta tags, and sitemaps
- See `DOCS/CORE/SEO.md` for structured data patterns
- See `DOCS/CORE/SEO_BEST_PRACTICES.md` for URL structure (section 7), keyword placement (section 2), and doorway page avoidance (section 1)
