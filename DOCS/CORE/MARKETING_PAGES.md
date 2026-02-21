# Marketing Pages — Conversion, Copy & Visual Rules

> **Status**: Active — mandatory reference for all public-facing pages
> **Last Updated**: 2026-02-21
> **Scope**: All pages under `(marketing)/` — landing page, blog, legal, and any future public pages
> **Research**: See `DOCS/RESEARCH/DESIGN_SYSTEM_RESEARCH.md` for sources and full framework analysis

This document contains **specific, numbered rules** for copy, layout, and conversion patterns. Read it before creating or modifying any public-facing page. Rules come from Harry Dry, Julian Shapiro, StoryBrand, Copyhackers, NNG, and Baymard Institute — not invented by AI.

**Relationship to other docs:**
- `DESIGN_SYSTEM.md` → colors, spacing scale, components (the visual tokens)
- `LANDING_PAGE.md` → section order and file locations
- **This doc** → copy constraints, conversion patterns, visual rules for marketing pages

---

## Universal Rules (Apply to Every Public Page)

### Copy Rules

| Rule | Constraint |
|------|-----------|
| **Headline length** | 6-10 words. Under 60 characters. |
| **Subheadline length** | 1-2 sentences. 10-30 words max. |
| **Body paragraphs** | Max 2-3 sentences per paragraph. Never more than 3 paragraphs per section. |
| **Bullet lists** | 3-7 items. Strongest items in first and last positions (bookend effect). |
| **CTA button text** | 2-4 words. Lead with an action verb. First-person preferred ("Start my trial" > "Start your trial"). |
| **Testimonials** | 30-50 words each. Include photo, full name, and title. Present tense. |
| **FAQ items** | 5-8 questions per page. Use "you" and "your" extensively. |

### The Grunt Test (Mandatory)

Every page header must pass this test: show it to someone unfamiliar for 5 seconds. They must answer:
1. What does this page/product offer?
2. How does it make my life better?
3. What do I do next?

If the answer to any is unclear, rewrite.

### Copy Quality Checks

Before finishing any public page copy, verify:
- **"Can I visualize it?"** — Every claim uses concrete nouns and active verbs. "Responds in under 10 minutes" beats "better service."
- **"Can I falsify it?"** — Every claim is provably true or false. "Rated 4.8 by 500 users" beats "our product is the best."
- **"Can nobody else say this?"** — If a competitor could write the same sentence, cut it or make it specific.

### Words and Tone

- Use contractions ("we'll" not "we will")
- Use everyday language, not corporate-speak
- Use sentence fragments for rhythm when appropriate
- Never use anger/fear language — even 1% drops conversion up to 25%
- Trust-reinforcing words ("guaranteed", "secure", "proven") should be under 3% of total copy
- Power words to use: Instantly, Unlimited, Exclusive, Guaranteed, Proven, Free

---

## Visual Layout Rules (All Marketing Pages)

### Typography

| Element | Desktop | Mobile | Weight |
|---------|---------|--------|--------|
| Page hero heading | `text-4xl` to `text-5xl` (36-48px) | `text-3xl` (28-36px) | `font-semibold` or `font-bold` |
| Section heading | `text-2xl` to `text-4xl` | `text-2xl` | `font-semibold` |
| Card/feature title | `text-lg` to `text-xl` | `text-lg` | `font-bold` or `font-semibold` |
| Body text | `text-base` to `text-lg` (16-18px) | `text-base` | `font-normal` |
| Small/caption | `text-sm` | `text-sm` | `font-normal` |

### Content Width

| Context | Max Width | Why |
|---------|-----------|-----|
| Full layout container | `max-w-7xl` (1280px) | Prevents elements from stretching too wide |
| Text-heavy content | `max-w-3xl` (768px) or `max-w-2xl` (672px) | 50-75 characters per line for readability |
| Pricing cards | `max-w-5xl` (1024px) | Enough for 2-3 column pricing |
| Legal page content | `max-w-4xl` (896px) | Readable width for long-form text |

**Critical rule**: Body text must NEVER stretch to `max-w-7xl`. Always constrain text blocks to `max-w-2xl` or `max-w-3xl`. Full-width text is the #1 readability killer.

### Section Spacing

| Context | Desktop | Mobile |
|---------|---------|--------|
| Between major sections | `py-16 md:py-20` (64-80px) | 64px |
| Section heading to content | `mb-12 md:mb-16` (48-64px) | 48px |
| Between cards in a grid | `gap-6` to `gap-8` (24-32px) | 24px |
| Between elements within a card | `space-y-3` to `space-y-4` (12-16px) | 12px |

### Background Alternation

Alternate section backgrounds for visual rhythm:
```
Section 1 (Hero):      bg-white / bg-background
Section 2 (Features):  bg-gray-50 / bg-muted
Section 3 (Details):   bg-white / bg-background
Section 4 (Pricing):   bg-primary/3 (subtle brand tint)
Section 5 (FAQ):       bg-white / bg-background
Section 6 (Final CTA): bg-primary (strong brand)
```

### Border Radius

| Element | Radius | Why |
|---------|--------|-----|
| Cards, containers | `rounded-sm` to `rounded-md` (4-6px) | Professional, sharp |
| Buttons | `rounded-md` (6px) | Matches card radius |
| Badges, pills | `rounded-full` | Standard pattern |
| Avatars | `rounded-full` | Always circular |

**Never use `rounded-2xl` or `rounded-3xl` on cards or sections.** 16px+ border radius on containers looks AI-generated.

### Anti-AI-Slop Patterns

These patterns make a page look AI-generated. Avoid them:

| Anti-Pattern | What To Do Instead |
|-------------|-------------------|
| Icon grids with no real imagery | Mix icons with product screenshots, founder photos, or real brand assets |
| Symmetrical everything | Use asymmetric layouts. Left-align some sections. Vary grid columns. |
| Generic gradient backgrounds | Use solid colors or subtle brand tints (`bg-primary/3`) |
| Only Lucide icons, no photos | Add real photos: product screenshots, founder headshot, customer logos |
| Full-width text | Constrain to `max-w-2xl` or `max-w-3xl` |
| Vague, interchangeable copy | Use specific numbers, real metrics, concrete outcomes |
| Identical card layouts everywhere | Vary section layouts: grid, alternating left/right, single-column features |

---

## Page Blueprints

### 1. Landing Page

**Section order** (do not rearrange — optimized for conversion):

| # | Section | Required Elements | Copy Constraints |
|---|---------|-------------------|-----------------|
| 1 | **Navbar** | Logo + 2-4 links + CTA button | Fewer links = higher conversion. Max 4 nav items. |
| 2 | **Hero** | Headline + subheadline + CTA + visual | Headline: 6-10 words. Subheadline: 1-2 sentences. CTA: 2-4 words. Must show product visual (screenshot, demo, or placeholder). |
| 3 | **Social proof bar** | 4-6 trust logos + optional metric | Logo bar immediately below hero. Use recognizable platform logos (G2, Capterra, etc.). Optional: "Trusted by X+ teams" |
| 4 | **How it works** | 3-4 steps with icons/visuals | Each step: short title + 1 sentence. Jargon-free. Scannable. |
| 5 | **Features** | 3-6 features with benefit headlines | Each feature: benefit-oriented title + short paragraph (1-2 sentences) + visual. Must tie back to hero value prop. |
| 6 | **Social proof (deep)** | 3-5 testimonials OR case study snippets | 30-50 words per testimonial. Photo + name + title. Present tense. Quantitative outcomes preferred. |
| 7 | **Pricing** | Outcome-oriented headline + tier cards | Never use "Pricing" as headline. Customer blurb per tier ("Best for..."). Payment icons. First-person CTAs. Founder testimonial adds trust. |
| 8 | **FAQ** | 5-8 questions | Cover: getting started, pricing/trial, cancellation, security. Place before final CTA to handle last objections. |
| 9 | **Final CTA** | Headline + benefit statement + CTA button | Different framing from hero CTA. Re-state the transformation. Contrasting background (primary color). |
| 10 | **Footer** | Links + legal + social + directory links | Product links, company links, "Find Us On" directory links, social icons. Latest blog posts column adds SEO value. |

**CTA placement**: Minimum 3 CTAs on the landing page — hero, pricing, and final section. Each should have different framing but point to the same action.

**Conversion formula**: `Purchase Rate = Desire - (Labor + Confusion)`. Increase desire (value props, social proof). Decrease labor (cut words, simplify CTAs). Decrease confusion (clear actions, obvious next step).

---

### 2. Blog Hub Page

**Section order:**

| # | Section | Required Elements | Copy Constraints |
|---|---------|-------------------|-----------------|
| 1 | **Featured article** | Hero image + title + excerpt + author + date | Title: 6-12 words. Excerpt: 1-2 sentences. Show reading time. |
| 2 | **Article grid** | Filterable grid of articles | Show: thumbnail, title, excerpt (truncated), category badge, date. Cards should be scannable — no long descriptions. |
| 3 | **Final CTA** | Standard CTA section | Same component as landing page. Converts blog readers to users. |

**Rules:**
- Blog hub title should be descriptive: "Blog" or "[Brand] Blog" is fine. Don't overcomplicate it.
- Category filters help users find relevant content — include if 3+ categories exist.
- Show 6-12 articles per page. Paginate or load-more for larger collections.
- Featured article at top creates visual hierarchy — don't show a flat grid of identical cards.

---

### 3. Individual Blog Post

**Section order:**

| # | Section | Required Elements | Copy Constraints |
|---|---------|-------------------|-----------------|
| 1 | **Header** | Breadcrumb + title + excerpt + metadata + author | Title: 6-14 words (optimized for SEO). Excerpt: 1-2 sentences. Show: date, reading time, category. |
| 2 | **Featured image** | Hero image filling content width | Alt text required. Descriptive, not "blog image." |
| 3 | **Article body** | Content + sidebar | Body text constrained to readable width (`max-w-3xl`). Sidebar with CTA widget. |
| 4 | **Related articles** | 2-3 related posts | Same category or topic. Drives further engagement. |
| 5 | **Final CTA** | Standard CTA section | Converts readers to users. |

**SEO requirements:**
- Full `<head>` metadata (title, description, OG image, Twitter card)
- Article JSON-LD schema
- Breadcrumb JSON-LD schema
- FAQ JSON-LD schema (if article contains Q&A content)
- Canonical URL

**Content rules:**
- Headings (H2, H3) break up content every 200-300 words
- Short paragraphs (2-4 sentences)
- Use subheadings that are scannable — a reader skimming headings should understand the article's structure
- Include internal links to other blog posts and product pages (SEO + engagement)

---

### 4. Legal Pages (Privacy, Terms, Refund)

**Section order:**

| # | Section | Required Elements |
|---|---------|-------------------|
| 1 | **Page header** | Title + last updated date |
| 2 | **Table of contents** | Linked list of sections (optional for short policies) |
| 3 | **Content sections** | Numbered sections with clear headings |
| 4 | **Contact** | Email address for inquiries |

**Rules:**
- Content width: `max-w-4xl` for readability
- Use clear section headings (numbered for easy reference)
- Plain language — avoid legalese where possible
- Include "Last Updated" date prominently
- No CTAs, no marketing copy, no social proof. These are utility pages.
- Minimal styling — clean, readable text. No cards, no grids, no icons.

---

### 5. Changelog Page

**Section order:**

| # | Section | Required Elements |
|---|---------|-------------------|
| 1 | **Page header** | Title + description |
| 2 | **Entries** | Date + version + description for each entry |

**Rules:**
- Reverse chronological (newest first)
- Each entry: date, brief title, 1-3 sentence description
- Optional: badge for entry type (Feature, Fix, Improvement)
- Keep entries scannable — users want to quickly see what changed

---

## Pricing Section Rules (Detailed)

The pricing section is the highest-leverage section for conversion. Extra rules:

### Headline
- **Never** use "Pricing", "Our Plans", or "Pick Your Plan" as the headline
- Use outcome-oriented formulas:
  - "Eliminate [pain] and create [outcome]"
  - "[Verb] and [benefit]"
  - "A small price for [outcome]"
  - Or state the pricing model: "Pay for What You Use. No Subscriptions."

### Per-Tier Copy
- Each tier needs a customer-focused blurb: "Best for [persona]" or "For [persona] looking to [goal]"
- Feature lists: 5-10 items. Strongest first. Each should be a concrete benefit, not a vague feature name.
- Highlight the recommended tier visually (border, badge, or background color)

### Trust Elements
- Payment method icons (Visa, Mastercard, Amex, etc.) — signals legitimacy
- Refund policy text — reduces purchase anxiety
- Founder testimonial with photo — "people buy from people"
- Star rating — optimal perception at 4.0-4.7 stars (5.0 triggers skepticism)

### Pricing Psychology
- Price anchoring: show original price with strikethrough (~~$138~~ $69)
- "One-time" or "per month" — always clarify billing model
- Objection crusher below CTA: "No credit card required" or "60-day money-back guarantee"

---

## Navigation Rules

### Header (All Marketing Pages)
- **Max 4 navigation items** — fewer links = higher conversion
- CTA button must be visually distinct (primary color, not ghost/outline)
- Sticky header with backdrop blur: `sticky top-0 backdrop-blur-md bg-background/95`
- Logo left, nav center or left-aligned, CTA right

### Footer (All Marketing Pages)
- Multi-column grid (5-7 columns on desktop)
- Required columns: Product links, Company links, Social icons
- Recommended columns: "Find Us On" (directory links), Latest Blog Posts, CTA
- Social icons: X, LinkedIn, Facebook, Instagram — use placeholder `#` links until profiles are created
- All links reference `DOCS/FOUNDER/DIGITAL_PRESENCE.md` for profile creation

---

## Shared Components

These components are reused across multiple marketing pages:

| Component | File | Used On |
|-----------|------|---------|
| Header | `src/app/components/Header.tsx` | All marketing pages |
| Footer | `src/app/components/Footer.tsx` | All marketing pages |
| FAQItem | `src/app/components/FAQItem.tsx` | Landing, potentially blog |
| FinalCTASection | `src/app/(marketing)/components/final-cta-section.tsx` | Landing, blog hub, blog post |
| TrackedCTALink | `src/components/app/tracked-cta-link.tsx` | All pages with CTA buttons |

### FinalCTASection Pattern
Every non-legal public page should end with a CTA section. This component:
- Uses contrasting background (primary color)
- Re-states the value proposition with different framing from hero
- Single CTA button
- Tracks clicks via `eventData.button_location`

---

## Quick Reference: Copy Formulas

### Hero Headline Formulas
- **What you do**: "[Product] helps [audience] [achieve outcome]"
- **Bold claim**: "[Specific metric] in [timeframe]"
- **Objection handler**: "No [common objection]. Just [benefit]."
- **Call to value**: "[Action verb] your [noun] [adverb]"

### CTA Button Formulas
- **"Get ___"**: Get Started, Get Access, Get Your Plan
- **"Start my ___"**: Start My Free Trial, Start My Project
- **Value-first**: "See My Results", "View My Dashboard"
- **Objection handler**: "Try Free — No Card Required"

### Feature Title Formulas
- **Outcome**: "Ship 3x Faster" (not "Speed Tools")
- **Verb + benefit**: "Automate Your Billing" (not "Billing Module")
- **Elimination**: "Never Worry About [Pain] Again"

### Testimonial Formula (Before-After-Experience)
Structure customer quotes as: what they worried about before → what they discovered after → how they feel now. Extract a punchy phrase for the testimonial header.
