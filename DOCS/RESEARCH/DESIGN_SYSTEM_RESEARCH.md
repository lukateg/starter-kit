# Design System Research — Copy, Conversion & Visual Consistency

> **Purpose**: Research findings for building a unified marketing page design system. This doc captures frameworks, tools, and specific rules we'll use to create `DOCS/CORE/MARKETING_PAGES.md` and a `/brand` skill.
>
> **Status**: Research complete. Implementation pending.

---

## The Problem

Solo founders building SaaS products face three separate disciplines that need to work together:

1. **Copywriting** — what to say, how to say it, how much to say
2. **Visual design** — layout, spacing, typography, colors, imagery
3. **Conversion optimization** — structure, CTAs, trust signals, flow

Without a unified system, each gets solved ad-hoc: copying a landing page here, using shadcn defaults there, mixing inspiration from multiple sites. The result is inconsistency — public pages that look like they were designed by different people, AI-generated copy that sounds generic, and conversion patterns that work against each other.

---

## The Solution (4 Steps)

### Step 1: `DOCS/CORE/MARKETING_PAGES.md`

A mandatory doc (wired into CLAUDE.md) encoding copy formulas, section blueprints, and visual constraints from the research below. Read before touching any public page. No tools to install, immediately effective.

### Step 2: Install the Anthropic `frontend-design` Plugin

The plugin handles **visual quality** — anti-AI-slop rules, distinctive typography, spatial composition, motion. It is designed to produce different designs each time, which is fine as long as conversion rules are enforced separately. The plugin has zero conversion awareness, so it needs `MARKETING_PAGES.md` as a companion.

### Step 3: Build `/brand` Skill

A skill that takes 3 inputs (primary color hex, font name, brand tone) and generates a complete `globals.css` `@theme` block + updates the design system doc. No existing tool does this end-to-end, but it's buildable by combining tints.dev API + a type scale formula + the existing CSS variable architecture.

### Step 4: Test on a Real MVP

Generate 2-3 landing page variants for a real app idea and compare. See "Testing Methodology" section below.

### Optional: Superdesign MCP

The `superdesign_extract_system` tool can analyze a screenshot and extract colors/typography/spacing into JSON. Useful when you find a site you like — screenshot it instead of trying to describe it.

---

## How the Pieces Fit Together

The three tools serve **different, non-overlapping purposes**:

| Tool | What It Handles | Conflict? |
|------|----------------|-----------|
| **`MARKETING_PAGES.md`** | Conversion structure: section order, copy rules, specific numbers (6-10 word headlines, 3-5 bullets, CTA placement) | No — this is the foundation everything else builds on |
| **Anthropic `frontend-design` plugin** | Visual quality: distinctive typography, spatial composition, motion, anti-AI-slop | No — it handles *how it looks*, not *what goes where* |
| **`/brand` skill** | Token generation: colors, fonts, radii, shadows from 3 inputs | No — it handles *the palette*, not layout or copy |

**They complement, not conflict.** The plugin produces genuinely good, different-each-time visual designs. The marketing pages doc ensures conversion-critical structure is always followed. The brand skill ensures color/font consistency within a project.

### The Key Insight

Being "wildly different each time" is actually **better** than reusing one template — as long as the conversion structure stays constant. Every product gets its own visual identity, but every landing page follows the same proven blueprint. This is how real design agencies work: the structure is formulaic, the styling is creative.

The Anthropic plugin's philosophy ("never repeat, always surprise") is only a problem if there are no guardrails. `MARKETING_PAGES.md` provides the guardrails. The plugin provides the visual creativity. Together they produce professional, non-AI-slop landing pages that convert.

---

## Testing Methodology

### How to Validate the System

1. **Pick a real MVP app idea** — real content matters, not lorem ipsum
2. **Generate 2-3 landing pages** with different setups:
   - **Setup A**: Plugin only (no conversion rules) — baseline visual quality
   - **Setup B**: Plugin + `MARKETING_PAGES.md` — visual quality + conversion structure
   - **Setup C**: Plugin + conversion rules + `/brand` skill — the full stack
3. **Judge each on 3 criteria**:
   - Does it look professional / non-AI? (visual quality — the plugin's job)
   - Does it follow the conversion blueprint? (right sections, right order, right copy density — the doc's job)
   - Is the copy concrete and specific? (passes the grunt test, no vague claims — the doc's job)
4. **The winner** is the setup that consistently scores well across all 3 criteria

This can be done in a single afternoon. Generate, screenshot, compare side by side.

---

## Part 1: Copywriting Frameworks (Specific Rules)

### Harry Dry / Marketing Examples

**Above the Fold (5 steps):**

| # | Element | Rule |
|---|---------|------|
| 1 | **Headline** | A caveman should glance at it and immediately grunt back what you offer. You have 5 seconds. Three approaches: (a) explain what you do simply if unique, (b) use a hook addressing the biggest objection, (c) own your niche with conviction. |
| 2 | **Subtitle** | Get specific and introduce the product. Explain *how* it creates the value promised in the title. |
| 3 | **Visual** | Show the product in all its glory. Prioritize reality over fancy illustrations. Display the product in action. |
| 4 | **Social proof** | Instant credibility above the fold. Use specific numbers (e.g., "18,000+ reviews"). Tangible metrics. |
| 5 | **CTA button** | Three types: (a) Call to value — emphasize value over action, (b) Objection handler — address the main barrier to clicking, (c) Email capture + CTA paired to reduce friction. |

**Below the Fold (5 steps):**

| # | Element | Rule |
|---|---------|------|
| 6 | **Features & Objections** | Make concrete the value promised above. Handle recurring objections using the customer's own language. |
| 7 | **Social proof (deeper)** | Shift from credibility to inspiring action. Use customers to demonstrate the promised value. |
| 8 | **FAQ** | Include features and objections that don't fit neatly elsewhere. Reframe into question-and-answer format. |
| 9 | **Second CTA** | Remind the customer why clicking matters. Explain benefits, not just the action. |
| 10 | **Founder's note** | Tell a story: their shoes → their problem → take ownership → happy ending. "People buy from people." |

**3 Core Copy Rules:**
1. **"Can I visualize it?"** — If the audience cannot picture it, they will not remember it. Use concrete nouns and active verbs.
2. **"Can I falsify it?"** — Statements must be provably true or false. Replace vague claims with specific data.
3. **"Can nobody else say this?"** — If a competitor could write the same sentence, cut it.

**Source**: [marketingexamples.com/landing-page/guide](https://marketingexamples.com/landing-page/guide)

---

### Julian Shapiro / Demand Curve

**Above-the-Fold: 5 Required Pieces** — header, subheader, call to action, social proof, and a visual.

**Header Rules:**
- Must be fully descriptive of what you sell. Litmus test: "If the visitor reads only this text on your page, will they know exactly what you sell?"
- Avoid slogans like "Improve your workflow!" or "Supercharge your collaboration!"
- Spend **50% of total page-writing time** on the header alone.
- **Value prop exercise**: (1) What bad alternative do people use without your product? (2) How is yours better? (3) Turn step 2 into an action statement.

**Subheader Rules:**
- Maximum 1-2 sentences.
- Spend **25% of total page-writing time** on the subheader.
- First sentence: what the product is. Second sentence: how the header's claim is possible.

**CTA Button Rules:**
- Must feel like "the actionable next step to fulfilling the claim in your header."
- Avoid vague copy like "Request a meeting." Use "Find food," "Start learning."

**Feature Section Rules:**
- 3 to 6 features per page.
- Each ties back to the hero value prop through a "running narrative."
- Feature headers: write a short value prop — avoid vague language like "Empower your sales."

**Full Page Section Order:** Navbar → Hero → Social proof (logos) → CTA + incentive → Features and objections → Repeat CTA → Footer

**Conversion Formula:** Purchase Rate = Desire - (Labor + Confusion)

**Source**: [julian.com/guide/startup/landing-pages](https://www.julian.com/guide/startup/landing-pages)

---

### StoryBrand Framework (Donald Miller)

**The 7-Part Story Framework:**

| Element | Role | Rule |
|---------|------|------|
| Character | The customer | Define ONE primary desire. |
| Problem | What blocks them | Address 3 levels: External (tangible), Internal (emotional), Philosophical (injustice). |
| Guide | Your brand | Express exactly 2 things: Empathy + Authority. |
| Plan | How it works | 3-4 steps maximum. Jargon-free. |
| Call to Action | What to do next | 2 types: Primary CTA + Transitional CTA (free guide, quiz). |
| Failure | If they don't act | Consequences — emotional but realistic. No fear-mongering. |
| Success | Life after | Paint the transformation clearly. |

**The 3-Second Grunt Test:** Show someone unfamiliar the header for 3 seconds. They must answer: (1) What do you offer? (2) How does it make my life better? (3) What do I need to do to get it?

**StoryBrand 10-Section Website Wireframe:**

| # | Section | Content |
|---|---------|---------|
| 1 | Header | Headline passing grunt test + CTA button twice (top-right AND center). Visual of happy customers or product. |
| 2 | Value Stack | 3 icons with short text describing success outcomes. Benefits, not features. |
| 3 | Stakes | Opening question resonating with audience. Outline consequences of current path. |
| 4 | Value Proposition | Icons/images showcasing services. Connect offerings to customer needs. |
| 5 | Guide | Empathize with struggles. Demonstrate authority (testimonials, stats, logos). |
| 6 | Pricing | Optional on landing page. Transparency benefits product-based businesses. |
| 7 | 3-Step Plan | Step 1: Direct CTA. Step 2: Clarify process. Step 3: Success outcome. |
| 8 | Explanatory Paragraph | Detailed descriptions. Brand story. Closing CTA. Benefits over features. |
| 9 | Lead Magnet | Downloadable resource. Must feel like "I can't believe this is free." |
| 10 | Footer | Privacy, terms, contact, social icons, sitemap. |

**Source**: [creativeo.co/post/storybrand-framework](https://www.creativeo.co/post/storybrand-framework)

---

### PAS, AIDA, and Other Formulas

**PAS (Problem-Agitate-Solution) mapped to landing page:**

| Section | Placement | Rules |
|---------|-----------|-------|
| Problem | After hero | 1-2 sentences. Single primary problem. Customer's own language. |
| Agitate | After problem | Blend concrete disadvantages with emotional appeals. Avoid melodrama. Real customer language. |
| Solution | After agitation | 1:1 mappings between pain points and solutions. Features as direct answers to frustrations. |

**AIDA mapped to landing page:**

| Letter | Section | What It Does |
|--------|---------|--------------|
| Attention | Hero + social proof | Grabs attention with bold headline and credibility |
| Interest | Benefits/outcomes | Builds interest with what the product achieves |
| Desire | Features showing pathway | Makes outcomes believable |
| Action | Case studies + CTA | Drives conversion with proof and clear next step |

**Other useful formulas:**
- **Before-After-Bridge**: Before (current pain) → After (imagined relief) → Bridge (your product)
- **4 Ps (Ray Edwards)**: Problem → Promise → Proof → Proposal
- **Star Story Solution**: Introduce relatable protagonist → Share narrative → Present solution

---

## Part 2: Specific Numbers (Copy Constraints)

### Headlines
- **6-10 words** in the headline
- **Under 60 characters** for SEO display
- **Subheadline: 10-30 words** (1-2 sentences)
- Spend **50%** of total writing time on headline, **25%** on subheadline

### CTA Buttons
- **2-4 words** optimal. 24 characters max.
- Average of 90 high-converting CTAs: **3.4 words**
- Most common words in high-converting CTAs: "now" (22/90), "get" (21/90), "free" (19/90)
- First-person CTAs ("Start my free trial") boost CTR by up to **90%** over second-person
- Action verbs ("get," "buy," "download") should lead

### Features
- **3-6 features** per page. 4 appears most commonly in high-converting SaaS pages.
- Each feature: Title (benefit statement) + Description (how it solves) + Benefit (emotional/practical result)

### Benefits / Bullet Points
- **3-5 benefit bullets** above the fold
- Strongest bullets in **first and last positions** (bookend effect)
- Each bullet: primary benefit + secondary benefit

### Social Proof
- Logo bar **immediately below hero**
- **3-5 testimonials** in dedicated section
- Each testimonial: **30-50 words** max
- Include photo, full name, job title/company
- Optimal star rating perception: **4.0-4.7 stars** (5.0 triggers skepticism)

### FAQ
- **5-8 questions**
- Place near bottom, before final CTA
- Use "you" and "your" extensively
- Cover: free trial, upgrades/downgrades, cancellation, security

### Page Length
- **400-1,000 words** for most landing pages
- Distribution: 10-15% headline/intro, 70-80% body, 10-15% conclusion/CTA

### Emotional Language
- If even **1%** of page copy evokes anger/fear, conversion drops up to **25%**
- Trust words should be **under 3%** of total copy

**Sources**: KlientBoost, HubSpot, Intuit Content Design, Strong Testimonials, LanderLab, adevolver.com

---

## Part 3: Pricing Page Copy Rules

### Headline
- Never use generic labels like "Pricing" or "Pick Your Plan"
- Formulas: "Eliminate [pain] and create [outcome]" / "[Verb] and [benefit]" / "Cheaper than [cost of doing nothing]"

### Pricing Cards
- Add customer-focused blurb to every card: "Best for [persona]" or "For [persona] looking to [goal]"
- Price anchoring: place expensive tiers first
- Strategic strikethrough pricing (~~$79~~ $59)
- First-person CTAs: "Start my free trial" not "Start your free trial"

### Tactical Rules (Amelie Pollak / Copyhackers)
1. Start sentences with conjunctions (And/But) for conversational flow
2. Use sentence fragments for rhythm
3. Ditch corporate-speak for everyday language
4. Use contractions ("we'll" not "we will")
5. Use power words: Instantly, Unlimited, Exclusive, Guaranteed, Proven
6. Ask rhetorical questions matching pain points
7. Replace generic social proof with specific metrics: "Teams save 11.5 hours/week"
8. Crush objections proactively: "No credit card required"

**Sources**: [copyhackers.com](https://copyhackers.com/2025/03/saas-pricing-page-checklist/), [ameliepollak.com](https://www.ameliepollak.com/blog/13-copywriting-hacks-for-your-saas-pricing-page)

---

## Part 4: Visual Design Rules (Specific Numbers)

### Typography
- **Body text**: 18-20px for marketing pages (larger than app UI's 14-16px)
- **Line height**: 1.4-1.6 for body, 1.1-1.2 for headings
- **Marketing heading scale**: 36-48px desktop, 28-36px mobile
- **Line length**: 50-75 characters per line (600-680px max-width for text)

### Spacing
- **Section padding**: 80-120px vertical on desktop, 48-64px on mobile
- **Between elements within section**: 16-32px
- **Content max-width**: 1200-1400px for full layouts, 680px for text-heavy content
- **Use consistent spacing scale**: 8px base unit (8, 16, 24, 32, 48, 64, 80, 96, 120)

### Layout Patterns
- **2-column grid**: Feature comparison, pricing side-by-side
- **3-column grid**: "How it works" steps, feature cards
- **4-column grid**: Feature overview, stats
- **Alternating left/right**: Feature deep-dives with screenshots
- **F-pattern**: Text-heavy informational pages
- **Z-pattern**: Marketing/conversion pages (hero → logo bar → features → CTA)

### Colors
- **Dominant + accent**: One primary color used sparingly (CTA, links, key highlights). Mostly neutral backgrounds.
- **Background alternation**: Alternate white/light-gray between sections for visual rhythm
- **CTA contrast**: Button color must have 4.5:1 contrast ratio minimum against background

### Border Radius
- **4-8px**: Professional, sharp look (Stripe, Linear, Vercel)
- **12-16px**: Friendly, modern (but approaching template territory)
- **16px+**: Looks AI-generated / template-ish. Avoid for SaaS.

### What Makes Sites Look "AI-Generated" (Anti-Patterns)
- Icon grids with no real imagery (just rows of Lucide icons with captions)
- Generic gradient backgrounds (especially purple → blue)
- Oversized border radius on everything
- Inter/Roboto as the only font
- Symmetrical everything — no visual hierarchy or tension
- Generic stock photos or no photos at all
- Cookie-cutter card layouts without variation
- Full-width text stretching across the viewport

### What Makes Sites Look Professional
- Real product screenshots (not mockups)
- Founder photos with testimonials
- Trust logos from recognizable platforms
- Asymmetric layouts with clear visual hierarchy
- Distinctive typography (at least one non-default font)
- Restraint — fewer sections, more white space, less text
- Real numbers and metrics instead of vague claims
- Payment method icons (signals legitimacy)

**Sources**: Baymard Institute, NNG, Laws of UX (lawsofux.com), Cortes Design, Pimp My Type, Learn UI Design, Smashing Magazine, Vandelay Design

---

## Part 5: Composite Section Blueprint

Synthesized from all frameworks above — the universal SaaS landing page structure:

| # | Section | Copy Formula | Constraints |
|---|---------|-------------|-------------|
| 1 | **Navbar** | Logo + 2-4 links + CTA button | Fewer links = higher conversion |
| 2 | **Hero** | Header (value prop, 6-10 words) + Subheader (1-2 sentences, 10-30 words) + Visual (product in action) + CTA (2-4 words, first-person) | Must pass 5-second grunt test |
| 3 | **Social proof bar** | 4-6 company logos + metric ("Trusted by 10,000+ teams") | Recognizable brands. No testimonials here. |
| 4 | **Problem / Stakes** | 1-2 sentences naming the pain. Customer's own language. | Single primary problem. Conversational. |
| 5 | **Solution / How it works** | 3-4 step plan. Each: icon + short title + 1 sentence. | Jargon-free. Scannable. |
| 6 | **Features** | 3-6 features. Each: benefit headline + short paragraph + visual. | Each ties to hero value prop. |
| 7 | **Deep social proof** | 3-5 testimonials (30-50 words) with photo + name + title. | Present tense. Quantitative outcomes. |
| 8 | **Pricing** | Outcome-oriented headline. Customer blurb per tier. Recommended plan highlighted. | First-person CTAs. Specific metrics. |
| 9 | **FAQ** | 5-8 questions. | Cover objections, trial, cancellation, security. |
| 10 | **Final CTA** | Remind why it matters + benefit statement + CTA button. | Different framing from hero CTA. |
| 11 | **Footer** | Links, legal, contact, social icons. | Support SEO with internal links. |

---

## Part 6: Tools & Plugins Evaluated

### Anthropic `frontend-design` Plugin

**What it is**: A SKILL.md file loaded into context when Claude works on frontend code. No configuration, no parameters — pure prompt text.

**What it does well**: Guidelines on typography pairing, spatial composition, motion choreography, and detail quality. Explicitly fights "AI slop" aesthetics.

**Why it doesn't fit our use case as-is**: Its core philosophy is "be wildly creative and different every time." It says "No design should be the same," "NEVER converge on common choices," and picks a random bold aesthetic direction each time. This is the **opposite** of brand consistency.

**Revised assessment**: The plugin's "wildly different each time" philosophy is actually fine — and potentially better than reusing one template. Each product gets its own visual identity. The key is that it needs **conversion guardrails** (from `MARKETING_PAGES.md`) to ensure the creative output still follows proven structure. Without those guardrails, the plugin produces beautiful pages that may not convert. With them, it produces beautiful pages that follow the blueprint.

**The winning combination**: Plugin handles visual creativity + `MARKETING_PAGES.md` handles conversion structure + `/brand` skill handles color/font consistency. They don't conflict.

**Can it be configured with brand inputs?** No. But it's just a markdown file. You can fork it, add brand parameters at the top, and replace "pick a random extreme tone" with "use the brand's defined tone, colors, and fonts." Or override it via CLAUDE.md, which takes precedence. For our use case, the `/brand` skill handles tokens and `MARKETING_PAGES.md` handles structure — the plugin just needs to respect both, which it will since CLAUDE.md instructions take precedence over plugin instructions.

**Source**: [github.com/anthropics/claude-code/tree/main/plugins/frontend-design](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design)

---

### Community Design Skills

| Skill | What It Does | Useful? |
|-------|-------------|---------|
| **Tokyn** | Opinionated design system with automated installer. Stores tokens as CSS files (`primitives.css`, `semantic.css`). Five-phase workflow. | Yes — token approach aligns with our CSS variable architecture |
| **bencium-claude-code-design-skill** | 800+ line accessibility guide, responsive design specs, design system template. Two modes: "Controlled" and "Innovative". | Maybe — the "Controlled" mode could be useful |
| **claude-designer-skill** | "Jobs-style perfectionism and Rams-style functionalism." | Worth evaluating |
| **interface-design** | Design engineering focused on craft, memory, and enforcement. | Worth evaluating |

**Sources**: [github.com/jshmllr/tokyn](https://github.com/jshmllr/tokyn), [github.com/travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)

---

### MCP Servers

| Server | What It Does | Useful? |
|--------|-------------|---------|
| **Superdesign MCP** | `superdesign_extract_system` analyzes a screenshot → extracts design system JSON (colors, typography, spacing). Also generates UI specs. No API key. | Yes — screenshot a site you like, get tokens back |
| **Design System Analyzer MCP** | Reads your actual React codebase, tells AI about existing components and tokens. | Maybe — ensures AI uses your tokens not hardcoded values |
| **Figma MCP** | Extracts variables/styles from Figma into code. | Only if using Figma |
| **southleft/design-systems-mcp** | 188+ curated entries on W3C, WCAG, ARIA, 10+ design systems. | Reference, not generation |

**Sources**: [pulsemcp.com/servers/jonthebeef-superdesign](https://www.pulsemcp.com/servers/jonthebeef-superdesign), [github.com/yajihum/design-system-mcp](https://github.com/yajihum/design-system-mcp)

---

### Design Token Generators

| Tool | What It Does | API? |
|------|-------------|------|
| **tints.dev** | Give one hex → get full 50-950 Tailwind palette. Open source. | Yes — `/api` endpoint returns JSON |
| **UI Colors** | Same concept, also has API at `uicolors.app/api`. | Yes |
| **Realtime Colors** | Visualize palette on a real website mockup. Pick colors + font, see live. | Export only |
| **design-tokens.dev** | Full token set generation: colors, typography scales, spacing. | Export only |
| **Style Dictionary** | Industry standard for transforming JSON tokens → CSS variables, Tailwind config, etc. | Build tool |

**Sources**: [tints.dev](https://www.tints.dev/), [uicolors.app](https://uicolors.app/generate), [styledictionary.com](https://styledictionary.com/)

---

### Marketing Component Libraries (shadcn-compatible)

| Library | What It Is |
|---------|-----------|
| **Launch UI** | Hand-crafted (not AI) marketing components for SaaS. shadcn/ui + Tailwind. Heroes, pricing, features, CTAs. |
| **Page UI (Shipixen)** | Copy-paste landing page components on shadcn/ui. Fully themeable. Open source. |
| **ConvertFast UI** | CLI-driven marketing page generator. `npx convertfast-ui@latest init`. MIT. |
| **HyperUI** | Free open-source Tailwind CSS v4 marketing components. |

**Sources**: [launchuicomponents.com](https://www.launchuicomponents.com/), [pageui.shipixen.com](https://pageui.shipixen.com/), [ui.convertfa.st](https://ui.convertfa.st/), [hyperui.dev](https://www.hyperui.dev/)

---

## Part 7: The `/brand` Skill — How It Would Work

**No existing tool does this end-to-end.** But the pieces exist to build it:

### Inputs (3 things the user provides)
1. **Primary color** — one hex value (e.g., `#2563eb`)
2. **Font** — one Google Font name or system font (e.g., `"DM Sans"`)
3. **Brand tone** — one of: `clean` | `bold` | `warm` | `playful` | `editorial`

### What the Skill Generates
1. **Full color palette** — primary 50-950 scale (via tints.dev API or built-in algorithm), plus derived success/danger/warning colors
2. **`globals.css` `@theme` block** — all CSS variables populated from the palette
3. **Typography configuration** — font import, type scale (using modular scale: minor third for clean, perfect fourth for bold/editorial)
4. **Border radius set** — derived from tone (clean = 4-6px, warm/playful = 8-10px, editorial = 2px)
5. **Shadow set** — subtle for clean/editorial, medium for warm, pronounced for bold
6. **Updated `DESIGN_SYSTEM.md`** — reflecting the generated tokens

### Pipeline
```
User runs `/brand`
  → Prompted for hex, font, tone
  → tints.dev API generates palette (or built-in HSL calculation)
  → Type scale calculated from tone choice
  → Border radius, shadows, spacing derived from tone
  → globals.css @theme block written
  → DESIGN_SYSTEM.md updated
  → Done — all future pages use these tokens automatically
```

### Why This Works
- Tailwind CSS 4's `@theme` means every utility class reads from CSS variables
- shadcn/ui components already use CSS variables (`--primary`, `--background`, etc.)
- The existing starter kit architecture is already token-based
- Once tokens are set, Claude just uses `bg-primary`, `text-foreground`, etc. — consistency is automatic

---

## Implementation Plan

### Step 1: Write `DOCS/CORE/MARKETING_PAGES.md` (Foundation)
Encode Part 2 (copy numbers), Part 4 (visual rules), and Part 5 (section blueprint) into a mandatory reference doc. Wire into CLAUDE.md. This is the foundation that everything else depends on — conversion rules that must always be followed regardless of visual approach.

### Step 2: Install Anthropic `frontend-design` Plugin
Install via `/plugin install`. Test it raw on an MVP landing page to see baseline visual quality. The plugin provides anti-AI-slop enforcement and creative visual design. It will be constrained by the conversion rules in `MARKETING_PAGES.md` (since CLAUDE.md instructions override plugin instructions).

### Step 3: Build `/brand` Skill
The custom skill from Part 7. Takes primary color + font + tone → generates complete token set. Ensures color/font consistency within a project while the plugin handles visual creativity.

### Step 4: Test on a Real MVP
Generate 2-3 landing page variants using the full stack (plugin + conversion doc + brand skill). Compare visual quality, conversion structure compliance, and copy specificity. See "Testing Methodology" section above for criteria.

### Optional: Superdesign MCP
Add to `.mcp.json` for screenshot-to-tokens capability. Low priority — nice to have when finding inspiration sites.
