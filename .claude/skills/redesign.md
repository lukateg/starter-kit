# /redesign — Visual Redesign Skill

Redesign the app's visual identity while preserving structure, conversion-critical elements, and component architecture.

## How to Use

User invokes `/redesign` and describes their desired look. Examples:
- "Dark mode with purple accents"
- "Minimal, lots of whitespace, warm tones"
- "Bold and modern, blue primary"
- "Light and airy, pastel colors"

## What You CHANGE (Visual Properties)

- CSS variables in `src/app/globals.css` (colors, fonts, shadows)
- shadcn component theme in `components.json` and component base styles
- Marketing page visual styling (hero backgrounds, section colors, card styles)
- Font imports in `src/app/layout.tsx`
- Typography hierarchy (sizes, weights, line-heights)

## What You PRESERVE (Structure & Conversion)

- Landing page section order (hero → features → pricing → FAQ → CTA)
- Conversion widgets: CTAs, pricing cards, social proof, FAQ
- Navigation structure (header nav, footer links, sidebar nav items)
- Component composition and props (Button variants, Card structure)
- Responsive breakpoints and layout patterns
- JSON-LD structured data and SEO elements
- All business logic and data fetching
- Error display patterns (toasts, tooltips)

## Workflow

1. **Read current state**:
   - Read `DOCS/CORE/DESIGN_SYSTEM.md` (current design source of truth)
   - Read `src/app/globals.css` (current CSS variables)
   - Read `src/app/layout.tsx` (current font imports, metadata)

2. **Propose changes**:
   - Present new color palette (with hex values)
   - Propose typography changes (if any)
   - Describe the overall vibe

3. **Apply changes**:
   - Update CSS variables in `globals.css` (`:root` and `.dark` sections)
   - Update `@theme inline` block to match new variables
   - Update shadcn component base styles if needed (e.g., border radius in `components.json`)
   - Update font imports in `layout.tsx` if changing fonts
   - Update marketing page section styling for visual elements that go beyond CSS variables (backgrounds, decorative elements)

4. **Regenerate DESIGN_SYSTEM.md**:
   - Rewrite `DOCS/CORE/DESIGN_SYSTEM.md` with the new values
   - Keep the same document structure (sections, patterns, anti-patterns)
   - Update all color values, font names, spacing values to match the new design
   - Update the "Last Updated" date at the top
   - This ensures the design doc always matches reality

5. **Verify consistency**:
   - Run `npm run typecheck` to ensure no import errors
   - Both `/app` pages and marketing pages should look cohesive
   - Check that status colors (success, warning, danger) still have good contrast
   - Ensure text is readable on all backgrounds

## CSS Variable Structure

The key variables to update in `globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #030711;
  --muted: #f4f4f6;
  --muted-foreground: #71717a;
  --border: #e9eaed;
  --primary: #1e40af;        /* Main brand color */
  --primary-foreground: #fafafa;
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;
  --info: #3b82f6;
  --card: #ffffff;
  --popover: #ffffff;
  --accent: var(--muted);
  --ring: var(--primary);
}
```

The `@theme inline` block maps these to Tailwind's color system. Update both sections.

## Sidebar Variables

The sidebar has its own CSS variables that should harmonize with the main theme:

```css
--sidebar: #eef1fc;
--sidebar-foreground: #060e23;
--sidebar-primary: #122968;
--sidebar-accent: #dce4f9;
--sidebar-border: #d0d3dc;
```

## Important Notes

- Always maintain sufficient contrast ratios (WCAG AA minimum)
- Status colors (success, warning, danger) should remain distinguishable from each other
- The `--primary` color is used extensively — choose something that works for both text and backgrounds with opacity modifiers
- Test both light backgrounds and dark text, and the inverse
- If adding dark mode: define `.dark` class overrides in `globals.css`
