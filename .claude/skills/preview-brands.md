# /preview-brands — Brand Preview Generator

Generate 3 brand direction previews as standalone HTML files for visual comparison before committing to a design.

## How to Use

User invokes `/preview-brands` and provides a PRD, product description, or app idea. Claude derives 3 brand directions and generates HTML previews.

Example: `/preview-brands` then paste a PRD or describe the product.

Alternatively, provide 3 explicit directions:
```
/preview-brands
1. #1e40af "Space Grotesk" clean
2. #ea580c "DM Sans" bold
3. #0d9488 "Outfit" warm
```

---

## Before You Start: Read These

1. `DOCS/PRD.md` (or user-provided spec) — product name, value prop, pricing, features, target audience
2. `DOCS/CORE/DESIGN_SYSTEM.md` — CSS variable architecture, component patterns
3. `DOCS/RESEARCH/DESIGN_SYSTEM_RESEARCH.md` — copy frameworks, visual rules, anti-AI-slop guidelines

---

## CRITICAL: What "Different Designs" Means

Different directions means **fundamentally different visual identities**:

- Different **layout philosophies** — asymmetric vs grid vs brutalist vs data-dense vs editorial
- Different **visual structures** — how sections are composed, not just what color they are
- Different **information hierarchy** — timeline steps vs numbered rows vs code blocks vs horizontal strips vs alternating rows
- Different **personality** — editorial magazine vs professional tool vs Swiss minimal vs warm craft vs dark terminal
- Different **component patterns** — pricing as table vs cards vs inline. Testimonials as one big quote vs grid vs side-stack. Features as alternating rows vs dense list vs card grid vs numbered detail blocks.

### What "Different Designs" Does NOT Mean

- Swapping CSS variables (colors, fonts, border-radius) on the same HTML template
- Same section order, same card grids, same spacing with different tokens
- That is a "design system token showcase", not brand exploration

---

## Step 1: Derive 3 Brand Directions

From the product description, generate 3 distinct brand directions. Each must have:
- **Primary color** — one hex value
- **Google Font pairing** — display font + body font (can be the same if intentional)
- **Tone** — one of: `clean` | `bold` | `warm` | `playful` | `editorial`
- **Layout archetype** — each direction MUST use a different archetype (see below)

Rules for picking directions:
- Directions should feel **meaningfully different** — different layout structure, not 3 shades of blue
- Consider the product's audience, market positioning, and personality
- Each direction should be defensible — explain *why* it fits the product
- Present all 3 as a summary table before generating

### Tone Definitions

| Tone | Border Radius | Shadows | Headings | Body | Feel |
|------|--------------|---------|----------|------|------|
| `clean` | `6px` | `shadow-sm` / `shadow-md` | `font-semibold` | `font-normal` | Professional, precise |
| `bold` | `6px` | `shadow-md` / `shadow-lg` | `font-bold` | `font-medium` | Confident, high-contrast |
| `warm` | `8px` | `shadow-sm` (soft) | `font-semibold` | `font-normal` | Approachable, friendly |
| `playful` | `8px` (buttons: `rounded-full`) | `shadow-md` (color-tinted) | `font-bold` | `font-normal` | Energetic, fun |
| `editorial` | `2px` | none / `shadow-sm` | `font-semibold tracking-tight` | `font-normal` | Magazine-like, authoritative |

---

## Step 2: Generate Color Palette

For each direction, generate the full CSS variable set from the primary hex. See `/brand` skill (`.claude/skills/brand.md`) for the complete palette generation algorithm:
- Convert hex to HSL
- Generate 50-950 scale by adjusting lightness
- Derive `--foreground`, `--muted`, `--border`, sidebar colors
- Keep status colors consistent: success `#16a34a`, warning `#f59e0b`, danger `#dc2626`, info `#3b82f6`

---

## Step 3: Assign Layout Archetypes

**START WITH LAYOUT, NOT COLOR.** Decide how the page is structured before picking any palette. Each direction MUST use a different archetype. Never use the same archetype twice in a batch.

### Archetype: Asymmetric Editorial
- Serif display font + tight sans-serif body
- Left-heavy asymmetric layouts with generous whitespace
- Warm, textured backgrounds (cream/paper tones)
- Oversized pull quotes, numbered feature rows, editorial grid
- Hero: 2-col asymmetric (60/40) with text left, product mock right
- Features: numbered rows with detail blocks, NOT card grids
- Pricing: table layout, NOT cards
- Testimonials: one big quote + small side-stack
- Personality: premium magazine, thoughtful, craft

### Archetype: Dense Data Tool
- Sans-serif + monospace pairing (e.g., Inter + JetBrains Mono)
- Dark-mode-first, terminal/IDE aesthetic
- Split hero with live data simulation (scan results, API responses, dashboards)
- Code-block styled problem section, pipeline visualizations
- Features: dense 2-column list with monospace labels, NOT card grids
- Pricing: stacked full-width cards with feature comparison
- Testimonials: compact inline quotes with company badges
- Personality: powerful developer tool, data-forward

### Archetype: High-Contrast Minimal (Swiss/Brutalist)
- Geometric sans-serif + serif italic accent (e.g., Space Grotesk + Newsreader)
- Strict 2-3 color palette (black + white + one accent), 0px border radius
- Massive mixed-weight typography (~96px hero), hard edges, grid discipline
- Hero: full-width oversized type with mixed weights and italic serif
- Features: alternating left/right rows with mini data visualizations
- Pricing: stark comparison table with bold dividers
- Testimonials: large single quote on contrasting background
- Personality: confident, no-nonsense, design-forward

### Archetype: Centered Clean
- Modern sans-serif, light and airy
- Centered layouts, balanced symmetry, generous padding
- Hero: centered text, CTA below, product screenshot full-width beneath
- Features: 3-column card grid (equal height)
- Pricing: 2-column side-by-side cards with recommended highlight
- Testimonials: horizontal scrolling cards
- Personality: professional SaaS, approachable, trustworthy

### Archetype: Full-Bleed Immersive
- Bold font choices, high contrast
- Full-width background sections alternating light/dark
- Hero: full-bleed muted background, oversized headline, screenshot overlapping into next section
- Features: 2-column flat layout (no cards, icon + title above description)
- Pricing: horizontal comparison table
- Testimonials: full-width quote on primary background
- Personality: bold, modern, immersive

### Archetype: Monochrome Technical
- Single hue palette (all blues, all greens) with extreme value range
- Diagram-heavy sections, flowcharts, architectural layouts
- Hero: split with architectural diagram or flowchart right
- Features: tabular data presentation, comparison matrices
- Pricing: feature matrix with checkmarks
- Testimonials: compact cards with metric callouts
- Personality: enterprise, systematic, trustworthy

Pick 3 archetypes that are maximally different from each other. **Never pick archetypes that would produce similar-looking pages.**

---

## Step 4: Generate HTML Preview Files

Create `DOCS/` directory files. Delete any existing preview files first:
```bash
rm -f DOCS/brand-direction-*.html
```

Generate 3 files:
- `DOCS/brand-direction-A.html`
- `DOCS/brand-direction-B.html`
- `DOCS/brand-direction-C.html`

### Each HTML File Must Include

**Full landing page** with all sections composed according to the assigned archetype:
- Navbar: logo + 3-4 nav links + CTA button
- Hero (per archetype — MUST be structurally different across directions)
- Social proof bar (varied: logo bar vs inline text vs metric callouts)
- How it works / Process (3-4 steps — varied: timeline vs numbered vs pipeline vs code blocks)
- Features (3-6 features — varied: cards vs rows vs alternating vs dense list)
- Pricing (2 tiers — varied: cards vs table vs stacked vs horizontal comparison)
- Testimonials (varied: big quote vs grid vs side-stack vs inline)
- FAQ (4 items — varied: accordion vs 2-column grid vs inline)
- Final CTA (varied: centered vs left-aligned vs full-bleed)
- Footer (3-column)

**Component showcase** at the bottom of each file:
- Buttons (primary, secondary, outline, ghost, danger)
- Badges (default, success, warning, danger)
- Input field with label
- Card example
- Typography scale (h1 through body + small text)

### Content Rules

- Use **realistic content derived from the PRD** — not lorem ipsum
- Real pricing, real feature names, real value props
- Follow copy constraints:
  - Headlines: 6-10 words
  - CTAs: 2-4 words, action verb, first-person preferred
  - Feature titles: benefit-oriented
  - FAQ: 4-8 questions using "you" and "your"
- Placeholder images: styled boxes with centered label text (not gray — match the direction's palette)
- Inline SVG icons where needed — no external icon library

### Technical Requirements

- Fully self-contained HTML — inline CSS only (no external stylesheets except Google Fonts)
- Load fonts from Google Fonts CDN (`<link>`)
- Responsive (collapse to single column at 768px, functional at mobile)
- CSS custom properties for all design tokens
- No JavaScript dependencies

### Anti-Patterns to Avoid

- Symmetrical everything across all 3 directions
- Icon grids with captions in every direction
- Cookie-cutter 3-column card layouts repeated across all directions
- Generic gradient backgrounds
- Same hero layout with different colors
- Same section order and composition across all directions
- Using the same fonts across directions (each should have its own type pairing)
- Same border-radius across all directions

---

## Step 5: Present for Selection

After generating, open all files:
```bash
open DOCS/brand-direction-A.html DOCS/brand-direction-B.html DOCS/brand-direction-C.html
```

Tell the user:
1. **What each direction is:** Name, archetype, and why it fits their product
2. **What to compare:** Layout structure, typography, component patterns, overall personality
3. **How to apply:** Run `/brand` with the chosen direction's values to apply it to the codebase

---

## What This Skill Does NOT Do

- Does not modify `globals.css`, `layout.tsx`, or any source files
- Does not modify `DESIGN_SYSTEM.md`
- Does not install packages
- Application of the chosen variant is done via `/brand`

## Relationship to Other Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/preview-brands` (this) | Compare brand directions visually | Starting a new project, exploring options |
| `/brand` | Apply chosen tokens to codebase | After picking a direction from previews |
| `/redesign` | Freeform visual changes | Tweaking an existing design |
