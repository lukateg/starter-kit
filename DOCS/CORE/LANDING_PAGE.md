# Landing Page

> **Status**: Structure ready
> **Last Updated**: 2026-02-17

## Overview

The landing page at `src/app/(marketing)/page.tsx` ships with a conversion-optimized section structure. Customize the content for your product while preserving the structure.

## Section Architecture

The landing page follows a proven conversion structure:

```
1. Hero Section          — Value proposition + primary CTA
2. Social Proof          — Logos, testimonials, or metrics
3. Feature Sections      — 3-4 key features with visuals
4. Pricing Section       — Credit packages or subscription plans
5. FAQ Section           — Common questions (also adds FAQ JSON-LD)
6. Final CTA Section     — Re-state value prop + CTA
```

**Do not rearrange the section order.** This order is optimized for conversion: hook → validate → explain → price → overcome objections → convert.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/(marketing)/page.tsx` | Main landing page (assembles sections) |
| `src/app/(marketing)/layout.tsx` | Marketing layout (header + footer) |
| `src/app/(marketing)/components/` | Section-specific components |
| `src/app/components/Header.tsx` | Marketing header/nav |
| `src/app/components/Footer.tsx` | Marketing footer |

## Customizing

### Hero Section
Update the headline, subheadline, and CTA. The hero should:
- Communicate what the product does in one sentence
- Show the primary benefit (not features)
- Have one clear CTA ("Get Started", "Try Free", etc.)

### Feature Sections
Replace with your product's key features. Each feature should:
- Have a clear benefit-oriented headline
- Include a visual (screenshot, illustration, or demo)
- Be concise — one paragraph max

### Pricing Section
Points to `src/lib/pricing/index.ts` for package configuration. See `DOCS/CORE/PRICING.md`.

### FAQ Section
Update with your product's common questions. The FAQ also generates JSON-LD for Google FAQ rich results.

### Header Navigation
Update nav items in `Header.tsx`. Keep it minimal — 3-5 links max. The CTA button should stand out.

### Footer
Update links in `Footer.tsx`. Include: product links, legal pages, social links.

## Styling

Read `DOCS/CORE/DESIGN_SYSTEM.md` before making visual changes. The landing page uses CSS variables from `globals.css` for theming. Use `/redesign` skill for full visual redesign.

## Legal Pages

Template pages are included:
- `(marketing)/privacy/page.tsx` — Privacy policy template
- `(marketing)/terms/page.tsx` — Terms of service template
- `(marketing)/refund/page.tsx` — Refund policy template

Update these with your actual legal content before launching.

## Changelog

The public changelog at `(marketing)/changelog/` renders entries from `src/lib/changelog.ts`. Add entries as a simple TypeScript array — no DB needed.
