# /brand — Brand Identity Generator

Generate a complete visual identity from a primary color, font, and brand tone. Updates CSS variables, font imports, and the design system doc.

## How to Use

User invokes `/brand` and provides:
1. **Primary color** — a hex value (e.g., `#2563eb`)
2. **Font** — a Google Font name (e.g., `"DM Sans"`, `"Inter"`, `"Outfit"`)
3. **Brand tone** — one of: `clean` | `bold` | `warm` | `playful` | `editorial`

Example: `/brand #2563eb "DM Sans" clean`

If any input is missing, ask the user for it. All three are required.

---

## Step 1: Generate Color Palette

From the primary hex, generate the full set of CSS variables. Use HSL manipulation — no external API calls.

### Primary Palette (50-950 scale)

Convert the input hex to HSL. Generate a 50-950 scale by adjusting lightness:

| Step | Lightness Adjustment | Usage |
|------|---------------------|-------|
| 50 | 96% L | Lightest tint (`bg-primary/5` replacement) |
| 100 | 92% L | Light background |
| 200 | 84% L | Light accent |
| 300 | 72% L | Medium light |
| 400 | 58% L | Medium |
| 500 | Input L (or ~45%) | **Base — this is `--primary`** |
| 600 | Input L - 8% | Hover state |
| 700 | Input L - 16% | Active state |
| 800 | Input L - 24% | Dark accent |
| 900 | Input L - 32% | Darkest usable |
| 950 | 10% L | Near-black |

Keep the hue (H) and saturation (S) from the input. Only adjust lightness (L). If the input color is very dark (L < 20%) or very light (L > 80%), adjust the scale center accordingly.

### Derived Colors

Generate these from the primary palette:

| Variable | Derivation |
|----------|-----------|
| `--background` | `#ffffff` (light mode always white) |
| `--foreground` | Primary 950 or `#171717` (near-black with a hint of the brand hue) |
| `--muted` | Primary 50 with very low saturation (almost gray, slight brand tint) |
| `--muted-foreground` | `#71717a` (neutral gray — don't tint this) |
| `--border` | Primary 100 desaturated to ~10% saturation |
| `--primary` | The input hex value directly |
| `--primary-foreground` | White (`#fafafa`) if primary L < 55%, dark (`#1a1a1a`) if primary L >= 55% |
| `--card` | `#ffffff` |
| `--accent` | Same as `--muted` |
| `--success` | `#16a34a` (keep consistent — don't derive from brand) |
| `--warning` | `#f59e0b` (keep consistent) |
| `--danger` | `#dc2626` (keep consistent) |
| `--info` | `#3b82f6` (keep consistent) |

### Sidebar Colors

Derive sidebar colors from the primary palette:

| Variable | Value |
|----------|-------|
| `--sidebar` | Primary 50 (very light brand tint) |
| `--sidebar-foreground` | Primary 900 |
| `--sidebar-primary` | Primary 700 |
| `--sidebar-primary-foreground` | `#fafafa` |
| `--sidebar-accent` | Primary 100 |
| `--sidebar-accent-foreground` | Primary 900 |
| `--sidebar-border` | Primary 200 desaturated |

---

## Step 2: Determine Tone-Based Tokens

The brand tone controls border radius, shadows, and typography weight:

### `clean`
- Border radius: cards `rounded-md` (6px), buttons `rounded-md` (6px)
- Shadows: `shadow-sm` on cards, `shadow-md` on hover
- Typography: `font-normal` body, `font-semibold` headings
- Spacing: standard (follow DESIGN_SYSTEM.md defaults)
- Overall feel: professional, precise, minimal

### `bold`
- Border radius: cards `rounded-md` (6px), buttons `rounded-md` (6px)
- Shadows: `shadow-md` on cards, `shadow-lg` on hover
- Typography: `font-medium` body, `font-bold` headings
- Spacing: slightly more generous (`gap-8` between sections instead of `gap-6`)
- Overall feel: confident, high-contrast, strong presence

### `warm`
- Border radius: cards `rounded-lg` (8px), buttons `rounded-lg` (8px)
- Shadows: `shadow-sm` on cards, soft and diffused
- Typography: `font-normal` body, `font-semibold` headings
- Spacing: generous padding inside cards (`p-8` instead of `p-6`)
- Overall feel: approachable, friendly, inviting

### `playful`
- Border radius: cards `rounded-lg` (8px), buttons `rounded-full` for CTAs, `rounded-lg` for secondary
- Shadows: `shadow-md` with slight color tint
- Typography: `font-normal` body, `font-bold` headings
- Spacing: generous, breathing room
- Overall feel: energetic, fun, youthful (but NOT childish — still professional)

### `editorial`
- Border radius: cards `rounded-sm` (2px), buttons `rounded-sm` (2px)
- Shadows: none or `shadow-sm` only. Rely on borders instead.
- Typography: `font-normal` body, `font-semibold` headings, `tracking-tight` on all headings
- Spacing: tight, dense, information-rich
- Overall feel: magazine-like, content-first, authoritative

**NEVER use `rounded-2xl` or `rounded-3xl` on cards or containers regardless of tone.** Max is `rounded-lg` (8px).

---

## Step 3: Apply Changes

### 3a. Update `src/app/globals.css`

Update the `:root` block with all new color values. Update the `@theme inline` block to match. Keep the existing structure — only change values.

Update the `--sidebar-*` variables to use the derived sidebar colors.

**Do NOT change:**
- The `@import "tailwindcss"` line
- The `@theme inline` structure (just update values)
- The `@keyframes` definitions
- The `.blog-content` styles
- The `@layer base` block

### 3b. Update Font in `src/app/layout.tsx`

1. Import the chosen font from `next/font/google`
2. Initialize it with `variable: "--font-brand"` and `subsets: ["latin"]`
3. Add it to the `<body>` className alongside existing font variables
4. Keep Geist Sans and Geist Mono (they're used for code/fallback)
5. Remove the old font import if the user chose a different font

Update the `@theme inline` block in `globals.css`:
```css
--font-sans: var(--font-brand);
```

Update the `body` rule in `globals.css`:
```css
body {
  font-family: var(--font-brand);
}
```

### 3c. Update `components.json` (if it exists)

If `components.json` has a `cssVariables` or `style.theme` section, update border radius values to match the tone.

---

## Step 4: Regenerate `DOCS/CORE/DESIGN_SYSTEM.md`

Rewrite the design system doc with:
- New color values in the CSS Variables table
- New font name in Typography section
- New border radius values based on tone
- New shadow values based on tone
- Keep the same document structure, sections, and anti-patterns

This ensures the doc always matches reality.

---

## Step 5: Verify

1. Run `npm run typecheck` to ensure the font import is valid
2. Confirm `--primary-foreground` has sufficient contrast against `--primary`
3. Confirm `--foreground` is readable on `--background`
4. Confirm status colors (success, warning, danger) are visually distinct from the primary color

---

## What This Skill Does NOT Do

- Does not change page layout or section structure
- Does not modify component logic or props
- Does not touch marketing copy or content
- Does not add dark mode (use `/redesign` for that)
- Does not install new packages (Google Fonts are loaded via `next/font/google` which is already available)

## Relationship to Other Tools

- **`/brand`** (this skill) → Sets the design tokens. Run once per project.
- **`/redesign`** → More freeform visual changes. Can be run after `/brand` for further customization.
- **`/preview-brands`** → Visual comparison of brand directions. Run before `/brand` to pick a winner.
