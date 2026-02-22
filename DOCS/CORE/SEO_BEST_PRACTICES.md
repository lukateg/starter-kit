# SEO Best Practices (Expert Knowledge Base)

> **Purpose**: Actionable SEO rules extracted from expert analysis. Consult this before building ANY public-facing page — landing pages, blog posts, marketing pages, pSEO pages. This is a living document; new findings are added per topic as they come in.

---

## 1. Doorway Pages vs. Legitimate pSEO

Google penalizes "doorway pages" (also called gateway pages). Understanding the line between doorway abuse and legitimate programmatic SEO is critical.

### What Google considers doorway abuse

A page is a doorway page if:
- It exists **solely to rank** for a specific keyword/location with no unique value
- The **only thing that changes** between pages is one variable (e.g., city name) while all other content is identical
- It **redirects users** to the actual useful page (intermediate page with no standalone value)
- It's **hidden from normal navigation** — not linked from the main site because the quality is too low to show real visitors
- Multiple similar pages exist that **don't reflect a browsable hierarchy**

### The penalty is real

> A regional HVAC company built hundreds of location pages with identical copy and minor location swaps. After the March 2024 core update, 80%+ of those pages lost rankings — 63% organic traffic drop in 30 days. Recovery only began after consolidating into pages with genuinely unique content per location.

### Doorway page red flags checklist

If you answer **yes** to these, you're building a doorway page:

1. Is the page solely designed to rank for a specific keyword or location?
2. Does it offer little or no unique content for users?
3. Does it immediately redirect visitors elsewhere?
4. Are there multiple similar pages where only a keyword or location name changes?
5. Are internal links to these pages hidden or not part of the main site navigation?
6. Do the pages exist as an "island" — impossible to navigate to from other parts of the site?
7. Would you be embarrassed to show these pages to a real visitor?

### What makes pSEO legitimate (not a doorway page)

The core difference: **legitimate pSEO pages have content dependencies on the variable that changes.**

If the variable is "Los Angeles", the page content must actually depend on Los Angeles:
- Why the service matters specifically in that location
- Location-specific data, reviews, or details
- Unique information that wouldn't apply to other locations
- Content that genuinely helps someone searching for that specific term

**Rule**: If you swap out the variable and the page still makes perfect sense, it's a doorway page. If swapping the variable would make the content wrong or irrelevant, it's legitimate pSEO.

---

## 2. On-Page Keyword Placement

### Where to place your target keyword (mandatory locations)

These 5 placements form an **assurance chain** — each one reassures the searcher that this page is for them:

1. **Page title** (`<title>` / metadata title) — first thing seen in search results; if the keyword isn't here, searchers won't click
2. **Meta description** — reinforces relevance in the SERP snippet
3. **URL slug** — visible in search results, signals topic match
4. **H1** (the main visible heading) — first thing seen after clicking; confirms "this page is for me"
5. **First sentence** of the body content — beginning of first sentence, not buried. This assures the searcher AND forces you to deliver value immediately

### Where NOT to over-optimize

After placing the keyword in the five locations above, **stop**. Do not:
- Stuff keyword variations into every H2
- Repeat the keyword unnaturally throughout the body
- Add a dozen keyword synonyms in subheadings

**Rule**: Keyword in 5 places, then focus on making the page genuinely useful. Google is smart enough to understand the topic from those placements.

### Satisfy intent fast, then go deep

Once the keyword is placed, structure content as:
1. **Answer/value above the fold** — give the searcher what they came for immediately
2. **Then go deep** — provide extra detail, context, examples below

Don't bury the answer in fluff. Pages that satisfy intent fast outrank pages with better domain authority but thin or padded content. A well-optimized page with real depth can beat a high-authority site that has a thin page on the same keyword.

---

## 3. Keyword Fragments vs. Natural Phrasing

### Never use keyword fragments as headings

Search keywords are often fragments: "HVAC repair Los Angeles". But your H1 and headings must use **natural language**:

- **Bad H1**: `HVAC repair Los Angeles` (fragment — reads as spammy)
- **Good H1**: `HVAC Repair in Los Angeles` (natural phrase)

- **Bad H1**: `best project management tool startups` (keyword fragment)
- **Good H1**: `The Best Project Management Tool for Startups` (natural)

**Rule**: Always convert keyword fragments into proper, readable sentences or phrases. Google and users both prefer natural language. Fragments signal spam.

---

## 4. Hub Pages for Bottom-of-Funnel Content

When you create multiple bottom-of-funnel landing pages (e.g., use-case pages, comparison pages, location pages), don't scatter them randomly. Organize them under a **hub page**.

### What a hub page is

A central page that links to all related sub-pages in a browsable hierarchy:
- `/use-cases` hub page → links to `/use-cases/marketing-teams`, `/use-cases/agencies`, etc.
- `/compare` hub page → links to `/compare/us-vs-competitor-a`, `/compare/us-vs-competitor-b`
- `/locations` hub page → links to all location-specific pages

### Why hub pages matter

- Proves to Google these pages are part of a real site structure (not doorway islands)
- Gives real users a way to discover and browse these pages
- Creates internal link equity flowing to all sub-pages
- You should be **proud** to feature the hub page in your footer or navigation

---

## 5. Content Differentiation for Similar Keywords

When targeting keywords that seem similar, **think deeply about what makes each one different**.

Example: "project management for agencies" vs. "project management for freelancers"
- Agencies have teams, client billing, multi-project views
- Freelancers need simplicity, time tracking, solo invoicing
- These are genuinely different needs — the pages should reflect that

**Rule**: For every similar keyword you target, identify the specific user behind that search and what makes their need unique. Then build the page around that unique need. If you can't find a genuine difference, consolidate into one page.

---

## 6. Durability Principle

SEO done right is durable — pages that genuinely serve users survive algorithm updates. Spammy tactics get wiped out by every core update.

**The test**: Would this page still be valuable if Google didn't exist? If someone shared it directly, would the recipient find it useful? If yes, it's durable. If it only makes sense as a search engine target, it's fragile.

---

## 7. URL Structure & Hierarchy

URL structure directly affects whether Google sees your pages as legitimate topical depth or keyword manipulation spam. This is one of the most impactful structural decisions.

### The two URL patterns (flat vs. hierarchical)

Imagine an email client app with use-case pages:

**Flat structure (risky):**
```
/uses/email-client-with-privacy
/uses/email-client-with-tracking
/uses/email-client-with-voice-notes
/uses/email-client-with-built-in-video-playback
```

**Hierarchical structure (correct):**
```
/uses/email-client/privacy
/uses/email-client/tracking
/uses/email-client/voice-notes
/uses/email-client/built-in-video-playback
```

### Why flat structure is dangerous

The flat pattern — one subfolder with many slugs that differ by a single keyword modifier — triggers Google's spam detection:

- It's the **exact pattern used by doorway pages**, affiliate spam, and scaled content farms
- When many slugs differ by only a keyword modifier, Google asks: "Is this page primarily created to rank for a query?"
- Even if the content is legitimate, **the URL pattern alone can raise red flags**
- Causes **ranking cannibalization** — the wrong page ranks, or pages compete with each other due to semantic overlap

### Why hierarchical structure works

The nested subfolder pattern (`/uses/email-client/privacy`) signals:

- **Clear parent-child hierarchy** — Google understands topic relationships
- **Topical depth, not keyword exploitation** — this is how documentation sites, product pages, and knowledge bases are structured
- **Less cannibalization** — grouped concepts help Google understand which page serves which intent
- **Easier link building** — building links to `/uses/email-client/` boosts all child pages, concentrating topical authority instead of spreading it thin

### Real-world proof

**NapLab** (mattress affiliate): Uses `/best-mattress/` as both a page (18,000-word article) and a subfolder for variations (`/best-mattress/memory-foam`, `/best-mattress/side-sleepers`, `/best-mattress/hybrid`). Result: ranks for 2,600+ keywords in positions 1-3 and 2,500+ keywords in positions 4-10.

**Legal SEO case**: `/chicago-car-accident-lawyer/` as both a page and subfolder for sub-types (`/hit-and-run`, `/rear-end-accident`, `/left-turn-accident`, `/t-bone`). The parent page ranks for the main keyword; child pages capture long-tail variations.

### The two-click rule

All variation pages should be **at most two clicks from the homepage**:

```
Homepage (click 1) → Hub page /uses (click 2) → Sub-page /uses/email-client/privacy
```

The hub page (`/uses`) should have a category section for each topic cluster (e.g., "Email Client") that links directly to all child pages. This way sub-pages benefit from the homepage's link equity flowing through the hub.

### Link equity flow

```
Homepage
  └── /uses (hub page — linked from main nav/footer)
        └── /uses/email-client (parent page — ranks for "email client")
              ├── /uses/email-client/privacy
              ├── /uses/email-client/tracking
              └── /uses/email-client/voice-notes
```

- Building links to `/uses/email-client/` strengthens ALL child pages
- The hub page passes homepage authority down to every sub-page
- You don't have to build links to each individual variation — topical authority concentrates naturally

### URL structure rules summary

1. **Use hierarchical subfolders** (`/category/topic/variation`) not flat slugs (`/category/topic-variation-keyword`)
2. **The parent path should be both a page and a subfolder** — it ranks for the broad keyword while children capture variations
3. **Never have many slugs that differ by only a keyword modifier** under the same flat directory
4. **All sub-pages must be reachable within 2 clicks** from the homepage via hub pages
5. **Hub pages must visibly categorize and link to all child pages** — not hidden, not orphaned

---

## 8. E-E-A-T: Code-Level Signals

E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) affects rankings in every niche. These are the signals we control in code.

> For off-site E-E-A-T (directories, social media, podcasts, backlinks, content strategy) see `DOCS/FOUNDER/SEO_AUTHORITY_BUILDING.md`.

### Page titles

**Structure**: `Target Keyword | Benefit | Brand Name`

The target keyword goes first — it's what makes someone click. The benefit distinguishes you from every other result on the SERP. The brand comes last (it's fine if Google truncates it).

**Always use `|` (vertical bar) as separator**, not dashes.

**Don't worry about the 60-character "rule"**. Google rewrites title tags anyway — what matters is giving Google more context and giving searchers a reason to click you instead of competitors. A title that exceeds 60 characters but has a clear keyword + compelling benefit will outperform a short title that plays it safe. The truncated part still helps Google understand relevance.

**Examples:**

```
Cloud-Based Sales Recording Software | Free 14-Day Trial | Acme Corp

SKU Generator | Create SKUs on Demand for Free | Acme Corp

How to Build AI Agents | Free Guide from Beginner to Implementation | Acme Corp
```

**What NOT to do — keyword stuffing in titles:**

```
❌ SKU Generator | Create SKUs on Demand for Free | Effortlessly Build SKUs for Your Entire Inventory | Acme Corp
```

Repeating the same concept ("SKU/SKUs") across multiple segments is keyword stuffing. Google understands the topic from one mention — use the extra space for a different benefit or related query, not keyword repetition. Stuffing includes similar-match repetition, not just exact-match.

**Rule**: Keyword first → benefit that differentiates → brand last. Extra length is fine if each segment adds new information. Extra length is bad if it repeats the same keyword in different forms.

### Author profiles (for blog content)

If the site has a blog with multiple authors:
- Create a dedicated **author profile page** for each writer
- Link from each profile to their **LinkedIn, X/Twitter, Bluesky, Threads** — all social profiles
- Include a **bio with credentials** (why this person is qualified to write about this topic)
- **Mention author credentials within blog posts** themselves, not just on the profile page

### Cite sources with dofollow links

When blog posts reference external information:
- **Link out to sources** — don't be afraid of outbound links
- Use **dofollow backlinks** (not nofollow) when citing sources
- This signals to Google that content is research-backed and trustworthy

### Essential trust pages

Every site must have these. Their absence actively hurts E-E-A-T:

- **About page** — Founders, team, mission, why you care about the space
- **Contact page** — Real way to reach the team
- **Terms of Service** and **Privacy Policy**
- **Homepage depth** — Not just a hero + CTA. Include: what you do, why you're great, who you are, testimonials, press mentions, awards, success stories

### Images

- **Use custom images** alongside stock — product screenshots, team photos, service images signal authenticity
- All images must have **descriptive alt text**

### Site hygiene

Every page and post must have:
- Page title (with brand name at end)
- Meta description
- H1
- Alt text on all images
- No `lorem ipsum` or placeholder text anywhere

---

## 9. Share Features on Interactive Tools

When building any public interactive tool (calculator, generator, analyzer), **always include a share feature** that creates a unique, linkable URL for each result. When users share results, each share is a backlink to your domain. This compounds domain authority massively.

> For the full linkable assets strategy and domain authority guidance, see `DOCS/FOUNDER/SEO_AUTHORITY_BUILDING.md`.

---

<!-- ## 10. UX Signals That Affect SEO -->
<!-- Reserved for future transcript findings -->

<!-- ## 11. Internal Linking Strategy -->
<!-- Reserved for future transcript findings -->

---

## Implementation Checklist for New Public Pages

When building any public page, verify:

**Keyword & content:**
- [ ] Target keyword is in title, meta description, URL slug, H1, and first sentence
- [ ] Keyword is at the **beginning** of the first sentence (not buried)
- [ ] Core value/answer is above the fold, then detailed info below
- [ ] No keyword stuffing beyond those 5 placements
- [ ] All headings use natural language (no keyword fragments)
- [ ] Page has genuinely unique content (not a template with one swapped variable)
- [ ] Similar pages are differentiated by the unique need behind each keyword
- [ ] Content would be useful even without search engines (durability test)
- [ ] If part of a pSEO set: content has real dependencies on the changing variable

**URL structure:**
- [ ] URL uses hierarchical subfolders (`/category/topic/variation`), not flat keyword-modifier slugs
- [ ] Parent path works as both a page and a subfolder (ranks for broad keyword)
- [ ] Page is reachable within 2 clicks from the homepage
- [ ] No flat directory has many slugs differing by only a keyword modifier
- [ ] Every intermediate subfolder in the URL path resolves to a real page (no 404s in the hierarchy)

**Site structure & navigation:**
- [ ] Page is linked from a hub page or main navigation (not an isolated island)

**E-E-A-T signals:**
- [ ] Page title follows format: `Keyword | Benefit | Brand Name` — keyword first, `|` separators, no keyword repetition across segments
- [ ] Blog posts have linked author profile with bio and social links
- [ ] Sources are cited with dofollow outbound links where applicable
- [ ] Custom images used (not only stock photos), all with alt text
- [ ] No placeholder text or missing meta tags on any page
- [ ] Essential trust pages exist: About, Contact, Terms, Privacy
- [ ] Homepage has depth: what you do, testimonials, press, awards

**Interactive tools:**
- [ ] Share feature generates a unique, linkable URL for each result
