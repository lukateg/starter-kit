# Technical SEO & Page Performance Guide

Reference document for building and refactoring public-facing pages. These rules are derived from real PageSpeed Insights audits and should be followed on every marketing/public page.

---

## Core Web Vitals Targets

| Metric | Target | What It Measures |
|--------|--------|------------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | How fast the main content loads |
| **TBT** (Total Blocking Time) | < 200ms | How long JS blocks the main thread |
| **CLS** (Cumulative Layout Shift) | < 0.1 | How much the layout moves during load |
| **FCP** (First Contentful Paint) | < 1.8s | How fast first content appears |
| **Speed Index** | < 3.4s | How quickly content is visually displayed |

---

## Images

### Use Next.js `<Image>` Correctly

Every `<Image>` on a public page must have:

```tsx
// For background/cover images (absolute positioned):
<Image
  src={wallpaper}
  alt=""
  fill                    // REQUIRED for absolute-positioned images
  sizes="100vw"           // REQUIRED — tells Next.js what size to generate
  loading="lazy"          // For below-fold images
  // OR
  priority                // For above-fold LCP candidates only
  fetchPriority="high"    // Only on the single LCP element
/>

// For inline images with known dimensions:
<Image
  src="/avatar.jpg"
  alt="User"
  width={40}              // Explicit width
  height={40}             // Explicit height — prevents CLS
  loading="lazy"
/>
```

### Image Size Rules

| Use Case | Max Resolution | Max File Size |
|----------|---------------|---------------|
| Avatars (displayed < 50px) | 80px (2x retina) | < 5 KB |
| Card backgrounds | 800px | < 100 KB |
| Hero/full-width backgrounds | 1920px | < 300 KB |
| Blog content images | 800px | < 200 KB |
| Logos/icons (SVG preferred) | Vector | < 10 KB |

**Before adding any image to `public/`:**
1. Resize to the max resolution it will ever be displayed at (2x for retina)
2. Compress with quality 60-80 for JPEG, or use WebP/AVIF
3. Verify file size is within the limits above
4. Use `sips -Z [maxDimension] image.jpg --setProperty formatOptions 70` on macOS

### Next.js `<Image>` vs Raw `<img>` — Two Different Worlds

**Next.js `<Image>` (used in components)** handles optimization automatically:
- Converts to WebP/AVIF at serve time
- Generates responsive sizes based on the `sizes` prop
- The file size in `public/` matters less — Next.js generates optimized variants server-side
- A 1 MB PNG used with `<Image width={40} height={40}>` will be served as a ~2 KB WebP
- **Do NOT over-compress source files** in `public/` just for PageSpeed — Next.js will optimize them. Keep originals at reasonable quality so they don't look blurry.

**Raw `<img>` tags (in `dangerouslySetInnerHTML`)** have NO optimization:
- Served exactly as-is — the browser downloads the full file
- This is the case for article previews, generated article content, and any HTML injected via `dangerouslySetInnerHTML`
- These images **MUST** use Cloudflare Image Transformation URLs (see below)
- This is typically the biggest PageSpeed "Improve image delivery" culprit

### Cloudflare Image Transformations

Images stored on R2 (`assets.yourdomain.com`) can be served through Cloudflare's edge transformation layer. This converts PNGs to WebP/AVIF on-the-fly with zero storage duplication.

**URL pattern:**
```
Original:    https://assets.yourdomain.com/images/xyz.png
Transformed: https://assets.yourdomain.com/cdn-cgi/image/format=auto,quality=80,width=800/images/xyz.png
```

**Parameters:**
- `format=auto` — serves WebP or AVIF to browsers that support it (5-10x smaller than PNG)
- `quality=80` — visually identical, much smaller file size
- `width=800` — resize to max display width (use 1024 for article content, 800 for previews)

**Where this is applied:**
1. **Markdown→HTML converters** (`convex/lib/markdown.ts` and `src/lib/markdown/converter.ts`) — automatically transform `yourdomain.com` and `assets.yourdomain.com` image URLs at conversion time via `toCloudflareImageUrl()`
2. **Hardcoded HTML strings** (like `article-preview-data.ts`) — URLs must be manually written with the `/cdn-cgi/image/` path since they bypass the converter

**Where this does NOT apply:**
- Images in `public/` used with Next.js `<Image>` — these are already optimized by Next.js
- External images from other domains — only `yourdomain.com` and `assets.yourdomain.com` are transformed

**Key rule:** Any `<img>` tag rendered via `dangerouslySetInnerHTML` with a `assets.yourdomain.com` URL **MUST** use the Cloudflare transformation URL. Raw PNG URLs in `dangerouslySetInnerHTML` are the #1 cause of "Improve image delivery" warnings in PageSpeed.

### Never Serve Oversized Images

A 4.5MB avatar displayed at 40px is a critical performance bug. Always check: **what is the largest CSS size this image will ever be?** Then serve at 2x that size, no more.

---

## JavaScript Budget

### Third-Party Scripts

| Script | Impact | Rule |
|--------|--------|------|
| **YouTube iframes** | ~2,700 KiB JS | Significant cost but kept for universal blog compatibility (see "YouTube Embed Decision" below) |
| **PostHog recorder** | ~51 KiB | Disable on landing pages with `disable_session_recording: true` |
| **PostHog surveys** | ~25 KiB | Disable on landing pages with `disable_surveys: true` |
| **Clerk SDK** | ~288 KiB | Unavoidable on authenticated pages, but minimal on marketing pages |

### YouTube Embed Decision

YouTube iframes load ~2,700 KiB of JS. A facade pattern (thumbnail + CSS play button) was implemented and tested but **reverted back to iframes** for these reasons:

1. **User blog compatibility**: Articles are delivered to user blogs via webhook/Shopify. Facades require custom CSS that user sites don't have — the play button would be invisible.
2. **Shopify strips custom HTML**: Shopify's `body_html` sanitizer removes custom `<div>` structures and CSS classes, breaking the facade layout.
3. **Universal portability**: `<iframe>` is standard HTML that renders correctly on any platform without dependencies.

**Current approach:**
- Articles use standard YouTube `<iframe>` embeds via `[[youtube:URL]]` syntax
- Users who want YouTube videos accept the performance trade-off
- For the app's own blog, avoid embedding YouTube videos to keep scores high
- On marketing/landing pages, still use static placeholder divs for demo content (no real iframes)

### Lazy-Load Below-Fold Components

Use `next/dynamic` for heavy components that are not visible on initial viewport:

```tsx
import dynamic from "next/dynamic";

// Below-fold heavy component with its own data imports
const ArticlePreviewWindow = dynamic(
  () => import("./components/article-preview-window").then((mod) => ({ default: mod.ArticlePreviewWindow })),
  { ssr: false }
);
```

**Rules:**
- Only lazy-load components that are **below the fold** (not visible without scrolling)
- NEVER lazy-load above-fold components — this causes layout shift (CLS regression)
- `ssr: false` is appropriate for interactive components that don't need SEO indexing
- Components with SEO-relevant text should use `{ ssr: true }` (default) to keep SSR

### What NOT to Lazy-Load

- Hero section components
- Any component whose content contributes to LCP
- Components with text that search engines should index
- Navigation, header, footer

---

## LCP Optimization Checklist

The LCP element is usually the hero image or hero heading. To optimize:

1. **Identify the LCP element** — Run PageSpeed Insights, check "Largest Contentful Paint element"
2. **Add `priority` prop** to the LCP `<Image>` component
3. **Add `fetchPriority="high"`** to the LCP image
4. **Never lazy-load the LCP element** — no `loading="lazy"`, no `dynamic` with `ssr: false`
5. **Minimize image file size** — compress and serve at appropriate resolution
6. **Use `sizes` prop** — tells Next.js to generate appropriately sized images
7. **Avoid chaining requests** — the LCP image should be discoverable from the HTML, not loaded via JS
8. **Only ONE image should have `priority`** — multiple `priority` images compete for bandwidth and slow down LCP. If an image is hidden on certain viewports (e.g., `lg:hidden`), use `loading="lazy"` instead of `priority` so it doesn't compete with the actual LCP element on other viewports

---

## CLS Prevention

- Every `<Image>` must have either `width`+`height` or `fill` — never omit both
- Never use `dynamic(() => ..., { ssr: false })` for above-fold components
- Reserve explicit dimensions on containers that will be filled by async content
- Fonts: Use `next/font` (already configured) — prevents FOUT/FOIT layout shift

---

## TBT / Main Thread Work Reduction

- Avoid `dangerouslySetInnerHTML` with large HTML strings that contain iframes or scripts
- PostHog: Keep `autocapture: true` but disable recording/surveys on marketing pages
- Code-split heavy component trees with `next/dynamic`
- Avoid heavy computations during render — use `useMemo` for expensive calculations

---

## Interval State & Dynamic Components

**Never put `setInterval` / frequent `setState` calls in a parent component that renders `dynamic()` children.** Each parent re-render can cause dynamic components to remount, producing visible glitches (scroll resets, flashing content).

```tsx
// ❌ BAD — interval re-renders the entire page every 2s, dynamic children glitch
export default function Page() {
  const [index, setIndex] = useState(0);
  useEffect(() => { setInterval(() => setIndex(i => i + 1), 2000); }, []);
  return (
    <>
      <Logo index={index} />
      <DynamicHeavySection />  {/* remounts every 2s! */}
    </>
  );
}

// ✅ GOOD — isolate the interval into its own component
function RotatingLogo() {
  const [index, setIndex] = useState(0);
  useEffect(() => { setInterval(() => setIndex(i => i + 1), 2000); }, []);
  return <Logo index={index} />;
}

export default function Page() {
  return (
    <>
      <RotatingLogo />
      <DynamicHeavySection />  {/* stable, no remounts */}
    </>
  );
}
```

---

## Preconnect & DNS Prefetch

Add `<link rel="preconnect">` for critical third-party origins that the page will connect to. This saves the browser a full round-trip (DNS + TCP + TLS) before the first request.

```tsx
// In root layout <head>:
<link rel="preconnect" href="https://clerk.yourdomain.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://clerk.yourdomain.com" />
<link rel="preconnect" href="https://assets.yourdomain.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://assets.yourdomain.com" />
```

**Rules:**
- Only preconnect to origins the page **will** use (not "might" use)
- Limit to 4 preconnects max — each one costs a connection
- Always pair `preconnect` with `dns-prefetch` as a fallback for older browsers
- **Always add `crossOrigin="anonymous"`** — without it, PageSpeed flags the preconnect as "unused" because cross-origin requests need CORS hints to match the preconnected socket
- PageSpeed Insights reports preconnect candidates under "Preconnect to required origins"

**Current preconnects in this app:**
- `clerk.yourdomain.com` — Clerk auth SDK (~310ms LCP saving)
- `assets.yourdomain.com` — R2 image CDN (~300ms LCP saving)

---

## Link Text & Accessibility

**Every link must have descriptive, unique text.** Search engines and screen readers use link text to understand what the destination is about.

```tsx
// ❌ BAD — generic, repeated across page
<Link href="/app">Learn more</Link>
<Link href="/app">Learn more</Link>
<Link href="/app">Learn more</Link>

// ✅ GOOD — unique, describes the action
<Link href="/app">Try AI content generation</Link>
<Link href="/app">Set up auto-publishing</Link>
<Link href="/app">Start keyword research</Link>
```

If multiple links go to the same destination, each should still have unique text describing the specific feature or context.

---

## HTML Semantics & Landmarks

### `<main>` Landmark

Every page must have exactly one `<main>` element wrapping the primary content. This is required for accessibility and flagged by PageSpeed.

```tsx
// Marketing layout:
<>
  <Header />
  <main>{children}</main>
  <Footer />
</>
```

### Heading Hierarchy

Headings must follow strict descending order: `h1` → `h2` → `h3` → etc. Never skip levels or place a higher heading after a lower one.

**Rules:**
- Exactly one `<h1>` per page (the main title)
- Every `<h2>` must come after `<h1>`
- Every `<h3>` must be inside a section that has an `<h2>` above it
- Never use empty heading tags (`<h2></h2>`) — remove them
- **Decorative UI mockups** (fake browser windows, cards) must NOT use heading tags. Use `<p>` or `<div>` with font styling instead:

```tsx
// ❌ BAD — decorative card title as heading (breaks hierarchy)
<h4 className="text-lg font-semibold">Add Your Website</h4>

// ✅ GOOD — styled paragraph, not in heading hierarchy
<p className="text-lg font-semibold">Add Your Website</p>
```

---

## Server Components for Public Pages

**All public-facing pages MUST be server components (no `"use client"` directive).** This ensures the full HTML is generated at build time and served immediately to crawlers and users — critical for SEO indexing and LCP.

### Why Server Components Matter

- **Static prerendering** — Next.js generates the complete HTML at build time (`○` in build output). Crawlers see the full content without executing JS.
- **Smaller JS bundle** — Only interactive parts ship JS to the client. Static text, images, and layout cost zero client-side JS.
- **Faster LCP** — The browser renders HTML immediately instead of waiting for a JS bundle to download, parse, and execute.

### Convention

```
src/app/(marketing)/
├── page.tsx                          # Server component (NO "use client")
└── components/
    ├── rotating-platform-logo.tsx    # "use client" — uses useState/useEffect
    ├── numbers-section.tsx           # "use client" — uses IntersectionObserver
    ├── calendar-preview.tsx          # Server component — pure static HTML
    ├── add-website-card.tsx          # Server component — pure static HTML
    └── ...
```

**Rules:**
1. The `page.tsx` file must NEVER have `"use client"` — it must be a server component
2. Extract any code that uses React hooks (`useState`, `useEffect`, `useRef`, etc.) into separate client components in the `components/` folder
3. Client components must have `"use client"` at the top and be imported normally into the server page
4. Static content (text, images, layout) stays in the server component — it renders as pure HTML with zero JS cost
5. React automatically handles the server/client boundary when you import a `"use client"` component from a server component

### What Goes in Client Components

Only extract to a `"use client"` component when the code **requires browser APIs or React hooks**:

| Needs Client Component | Stays in Server Component |
|------------------------|---------------------------|
| `useState`, `useEffect`, `useRef` | Static text and headings |
| `setInterval`, `setTimeout` | `<Image>` components |
| IntersectionObserver | Layout and grid structures |
| Event handlers (`onClick`, etc.) | Static data arrays (FAQ items, features) |
| Browser APIs (`window`, `document`) | Imported client components (just the import) |

### No More `next/dynamic` for Code-Splitting

In a server component, `next/dynamic` with `{ ssr: false }` is unnecessary for normal client components:

```tsx
// ❌ OLD — client component page with dynamic imports
"use client";
const FeatureSection = dynamic(
  () => import("./components/feature-section"),
  { ssr: false }
);

// ✅ NEW — server component page with normal imports
// Client components are automatically code-split by Next.js
import { FeatureSection } from "./components/feature-section";
```

Next.js automatically code-splits client components imported from server components. The JS for each client component is loaded as a separate chunk — no manual `dynamic()` needed.

### Exception: `dangerouslySetInnerHTML` with External Assets (Decorative Content Only)

**For non-SEO decorative content** (like landing page article previews), components that use `dangerouslySetInnerHTML` with uncontrolled external images/iframes can be lazy-loaded with `{ ssr: false }` via a thin `"use client"` wrapper:

```tsx
// components/lazy-article-preview.tsx — thin "use client" wrapper
"use client";
import dynamic from "next/dynamic";

export const LazyArticlePreviewWindow = dynamic(
  () => import("./article-preview-window").then((mod) => ({ default: mod.ArticlePreviewWindow })),
  { ssr: false }
);
```

**When to use this pattern:**
- Decorative content previews with `dangerouslySetInnerHTML` containing large external images (e.g., landing page demo)

**When NOT to use this pattern:**
- **SEO blog articles** — the article text MUST be SSR'd for crawlers. Instead, optimize the HTML at generation time (see "Article HTML Optimization" below)
- JSON-LD `<script>` tags — tiny and need SSR for SEO

### Article HTML Optimization (Generation Time)

For SEO-critical content like blog articles, the correct approach is to **optimize the HTML at generation time** in the Markdown→HTML converter (`convex/lib/markdown.ts`):

1. **Images**: All `<img>` tags include `loading="lazy"` and `width="1024" height="576"` (Gemini's output dimensions). This prevents eager loading and CLS.
2. **YouTube**: Uses standard `<iframe>` embeds for universal compatibility across user blogs. This is a conscious trade-off — see "YouTube Embed Decision" above.

This way the full article text is in the SSR HTML for crawlers, and images defer loading. YouTube iframes add JS weight but work on every platform.

---

## Browser Targets & Polyfills

A `.browserslistrc` file controls which JS polyfills are included. Without it, Next.js includes polyfills for old browsers (~23 KiB wasted).

**Current config** (`.browserslistrc`):
```
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not dead
```

This eliminates polyfills for `Array.prototype.at`, `Object.hasOwn`, `Math.trunc`, etc. that modern browsers support natively. Saved ~8 KiB from shared JS bundle.

**When to update:** Only broaden targets if analytics show significant traffic from older browsers.

---

## Structured Data (JSON-LD) for Blog Pages

### Article Schema — Current Issues

The Article JSON-LD on blog pages (`src/app/(marketing)/blog/[id]/page.tsx`) has issues flagged by Google's Rich Results Test:

**1. `datePublished` / `dateModified` missing timezone (less critical)**

Currently, `post.date` is a human-readable string like `"February 8, 2026"` generated via `toLocaleDateString()`. This is NOT valid ISO 8601. Google expects:

```
✅ "2026-02-08T00:00:00+00:00"   (ISO 8601 with timezone)
✅ "2026-02-08"                    (ISO 8601 date-only — also valid)
❌ "February 8, 2026"             (human-readable — not valid for schema)
```

**Fix:** Use `new Date(article.publishDate).toISOString()` for schema fields. Keep the human-readable format for display in the UI. The schema generation function (`generateArticleSchema`) should receive the raw timestamp, not the formatted date string.

**2. Author missing `url` field (less critical)**

Google recommends including a `url` for the author entity:

```typescript
author: {
  "@type": "Person",
  name: "Luka Tegeltija",
  jobTitle: "Founder @ the app",
  url: "https://www.yourdomain.com",  // ← missing
},
```

### FAQ Structured Data — Missing on Blog Pages

**Problem:** Every blog article has a FAQ section at the bottom (generated via `## FAQ` + `### Question?` + answer paragraphs in markdown). However, there is NO `FAQPage` JSON-LD schema on blog pages. Google requires explicit JSON-LD to recognize FAQ content for rich results — visual HTML alone is insufficient.

**Evidence:**
- Google Search Console shows FAQ recognition on only 2 pages: the meta title generator and meta description generator tool pages
- These 2 pages have hardcoded `FAQPage` JSON-LD in their layout files
- Blog pages have the same FAQ content visually but NO corresponding JSON-LD

**Fix needed:** Parse FAQ Q&A pairs from the article content (or store them separately during generation) and inject `FAQPage` JSON-LD on blog pages:

```typescript
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is keyword research?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Keyword research is the process of..."
      }
    },
    // ... more Q&A pairs
  ]
}
```

**Implementation options:**
1. **Parse from stored HTML** — Extract Q&A pairs from FAQ CSS classes in the article HTML at render time
2. **Store separately during generation** — Save FAQ pairs as structured data in the article document alongside the HTML content (cleaner, more reliable)

### BreadcrumbList Schema — Valid, GSC Delay

The `BreadcrumbList` JSON-LD on blog pages is correctly structured and validates in Google's Rich Results Test. GSC not showing breadcrumbs is likely an indexing/processing delay — no code changes needed. Monitor GSC over the next few weeks.

---

## Audit Checklist for New Public Pages

Before shipping any new marketing or public page:

- [ ] Run PageSpeed Insights on the deployed URL (mobile mode)
- [ ] LCP < 2.5s
- [ ] TBT < 200ms
- [ ] CLS < 0.1
- [ ] No images over 300 KB in `public/`
- [ ] All `<Image>` components have `width`+`height` or `fill`+`sizes`
- [ ] Hero/LCP image has `priority` and `fetchPriority="high"`
- [ ] Only ONE image has `priority` — no competing priority images (use `loading="lazy"` for viewport-hidden images)
- [ ] Below-fold images have `loading="lazy"`
- [ ] No YouTube iframes on marketing/landing pages (user article iframes are an accepted trade-off)
- [ ] Heavy below-fold sections are lazy-loaded with `next/dynamic`
- [ ] Decorative `dangerouslySetInnerHTML` (non-SEO) wrapped with `dynamic({ ssr: false })` via client wrapper
- [ ] All `assets.yourdomain.com` image URLs in `dangerouslySetInnerHTML` use Cloudflare transformation (`/cdn-cgi/image/format=auto,quality=80,width=800/`)
- [ ] SEO article content rendered server-side (NOT lazy-loaded) with optimized HTML (lazy images with dimensions)
- [ ] No unused JS warnings > 100 KiB in PageSpeed report
- [ ] All links have descriptive, unique text (no generic "Learn more")
- [ ] Page has `<main>` landmark wrapping content
- [ ] Heading hierarchy is strictly descending (`h1` → `h2` → `h3`...)
- [ ] No decorative UI elements using heading tags
- [ ] Preconnect hints added for critical third-party origins (with `crossOrigin="anonymous"`)
- [ ] No `setInterval`/frequent state updates in parent of `dynamic()` children
- [ ] Page is a server component (no `"use client"`) — client logic extracted to `components/`
- [ ] Article schema `datePublished`/`dateModified` use ISO 8601 format (not human-readable strings)
- [ ] Author schema includes `url` field
- [ ] Blog pages with FAQ sections have `FAQPage` JSON-LD schema
- [ ] Validate structured data with [Google Rich Results Test](https://search.google.com/test/rich-results) before shipping

---

## Lessons Learned

### Round 1 (Feb 2025) — Score: 39 → ~75

| Issue | Impact | Fix |
|-------|--------|-----|
| 3 YouTube iframes in article preview data | ~2,700 KiB unused JS, 1,900ms+ TBT | Replaced with static placeholder divs |
| Avatar images 740KB-4.5MB (displayed at 40px) | ~16 MB total transfer | Resized to 80px, compressed to ~2 KB each |
| Wallpaper images 2.2MB each | ~4.4 MB transfer | Resized to 1920px, compressed to 364-645 KB |
| Blog image 1.4MB | 1.4 MB transfer | Compressed to 296 KB |
| Missing `fill`+`sizes` on background images | Next.js couldn't optimize | Added `fill`, `sizes`, `loading="lazy"` |
| Missing `fetchPriority="high"` on hero | Browser didn't prioritize LCP | Added `fetchPriority="high"` |
| Heavy below-fold components loaded eagerly | Larger initial JS bundle | Lazy-loaded with `next/dynamic` |
| PostHog recorder + surveys loading on landing | ~76 KiB unused JS | Disabled with init options |

### Round 2 (Feb 2025) — Fine-tuning

| Issue | Impact | Fix |
|-------|--------|-----|
| Logo rotation `setInterval` re-rendering entire page | Dynamic children remounting every 2s | Extracted to isolated `RotatingPlatformLogo` component |
| Hero wallpaper still 645KB | Slow mobile LCP | Compressed to 231KB (1280px, quality 60) |
| wallpaper-second still 364KB | Slow below-fold loads | Compressed to 86KB (1280px, quality 60) |
| 3 "Learn more" links with identical generic text | SEO: non-descriptive link text | Changed to unique descriptive CTAs |
| No preconnect for `clerk.yourdomain.com` | ~90ms wasted on LCP | Added `<link rel="preconnect">` in root layout |
| Missing `<main>` landmark | Accessibility violation | Wrapped marketing content in `<main>` |
| Empty `<h2></h2>` tag | Broken heading hierarchy | Removed |
| Decorative UI mockups using `<h4>`, `<h5>` tags | Heading hierarchy violations | Changed to `<p>` tags |
| No `.browserslistrc` — old polyfills included | ~23 KiB unnecessary JS | Added modern browser targets, saved ~8 KiB shared |

### Round 3 (Feb 2025) — Server Component Conversion

| Issue | Impact | Fix |
|-------|--------|-----|
| Landing page was `"use client"` — entire page client-rendered | No static prerendering, crawlers had to execute JS to see content, larger JS bundle | Removed `"use client"`, made page a server component |
| `RotatingPlatformLogo` inline in page (uses `useState`/`useEffect`) | Forced entire page to be a client component | Extracted to `components/rotating-platform-logo.tsx` with `"use client"` |
| `NumbersSection` + `useCountUp` inline in page (uses hooks + IntersectionObserver) | Forced entire page to be a client component | Extracted to `components/numbers-section.tsx` with `"use client"` |
| `next/dynamic` with `{ ssr: false }` for below-fold components | Prevented SSR of those sections, added unnecessary dynamic import overhead | Replaced with normal imports — Next.js auto-code-splits client components |
| Build output changed from dynamic to static (`○`) | Page now prerendered at build time — full HTML served instantly to crawlers and users |

### Round 3.5 (Feb 2025) — LCP Regression from SSR of dangerouslySetInnerHTML

| Issue | Impact | Fix |
|-------|--------|-----|
| `ArticlePreviewWindow` using `dangerouslySetInnerHTML` with raw `<img>` tags to 1,400+ KiB PNGs on `assets.yourdomain.com` — now SSR'd after server component conversion | LCP jumped to 25.6s — browser discovered massive images in initial HTML | Created thin `"use client"` wrapper `lazy-article-preview.tsx` with `dynamic({ ssr: false })` |
| `ssr: false` not allowed directly in server components | Build failed: "ssr: false is not allowed with next/dynamic in Server Components" | Wrapper pattern: `"use client"` file does the `dynamic()` import, server component imports the wrapper |
| Page HTML size 34 KiB (contained full article preview HTML with image URLs) | Browser parsed image URLs from HTML and started downloading immediately | After lazy wrapper: page HTML dropped to 2.21 KiB — images only load after JS hydration |

### Round 4 (Feb 2025) — Blog Article Page Performance

| Issue | Impact | Fix |
|-------|--------|-----|
| Featured image (LCP element) missing `priority`, `fetchPriority="high"`, proper `sizes` | LCP 37.7s — image loaded lazily instead of prioritized | Added `priority`, `fetchPriority="high"`, `sizes="(max-width: 768px) 100vw, 50vw"` |
| Featured image had `loading="lazy"` (from Next.js default when no `priority`) | PageSpeed flagged: "lazy loading is applied" on LCP element | `priority` prop automatically removes lazy loading |
| Author avatar using `fill` without `sizes` — 750x748 PNG served at 48x48 display | 16 KiB wasted — oversized image for tiny display | Changed to `width={48} height={48}` instead of `fill` |
| Article content `dangerouslySetInnerHTML` with raw YouTube iframes | 858 KiB JS from YouTube embed player loaded immediately | Lazy-loaded article content with `ssr: false` wrapper |
| Article content `dangerouslySetInnerHTML` with raw `<img>` tags to 1,400+ KiB PNGs | 2,742 KiB of unoptimized images loaded immediately | Lazy-loaded via same wrapper — images only load when visible |
| Related article images missing `sizes` prop | Next.js generated oversized images (default `sizes="100vw"`) | Added `sizes="(max-width: 768px) 100vw, 50vw"` |
| `i.ytimg.com` preconnect flagged as unused | Wasted connection — injected by YouTube embed, not controllable | Preconnect comes from YouTube iframe in article content; fixed by lazy-loading content |
| "Related Articles" used `<h3>` with no `<h2>` ancestor | Heading hierarchy violation | Changed to `<h2>` |

### Round 5 (Feb 2025) — Generation-Time HTML Optimization

| Issue | Impact | Fix |
|-------|--------|-----|
| `<img>` tags in article HTML had no `loading="lazy"` | Browser eagerly loaded 1,400+ KiB PNGs, destroying LCP | Added `loading="lazy"` to image renderer in `convex/lib/markdown.ts` |
| `<img>` tags had no `width`/`height` attributes | CLS from images loading without reserved space | Added `width="1024" height="576"` (Gemini's 16:9 output dimensions) |
| Blog article content was lazy-loaded with `ssr: false` for performance | Crawlers couldn't see SEO-critical article text | Reverted to direct SSR — image `loading="lazy"` makes SSR safe for images |
| Round 4 lazy-load approach sacrificed SEO for performance | Article keywords invisible to Google without JS execution | Generation-time image fixes solve both: full text SSR'd, images deferred |

### Round 6 (Feb 2025) — YouTube Facade Revert

| Issue | Impact | Fix |
|-------|--------|-----|
| YouTube facade (thumbnail + CSS play button) required custom CSS classes | User blogs receiving articles via webhook/Shopify don't have the app CSS — play button invisible | Reverted to standard `<iframe>` embeds for universal compatibility |
| Shopify `body_html` sanitizes custom HTML structures | Facade `<div>` layout stripped by Shopify, breaking embed entirely | Standard `<iframe>` survives Shopify sanitization |
| YouTube facade experiment: performance vs portability trade-off | Facade saved ~858 KiB JS but only works on the app-controlled pages | Decision: iframes are the right choice — users who embed YouTube accept the cost; the app's own blog avoids YT videos |

**Key takeaway:** When article HTML is delivered to external platforms (webhooks, Shopify, WordPress), only universally supported HTML elements (`<iframe>`, `<img>`, `<table>`, etc.) are safe. Custom CSS-dependent patterns break on user sites. Optimize what's portable (`<img loading="lazy">`, `width`/`height`), accept trade-offs on what's not (`<iframe>`).

### Round 7 (Feb 2025) — Cloudflare Image Transformations & LCP Priority Fix — Score: 71 → 88

| Issue | Impact | Fix |
|-------|--------|-----|
| `assets.yourdomain.com` images in `dangerouslySetInnerHTML` served as raw 1,400+ KiB PNGs | PageSpeed: "Improve image delivery — 1,386 KiB savings" — #1 remaining issue | Added Cloudflare Image Transformations: `/cdn-cgi/image/format=auto,quality=80,width=800/` to all `assets.yourdomain.com` URLs in `article-preview-data.ts` |
| Markdown→HTML converters produced raw R2 image URLs | Generated articles served unoptimized PNGs to user blogs | Added `toCloudflareImageUrl()` helper to both converters (`convex/lib/markdown.ts` and `src/lib/markdown/converter.ts`) — auto-transforms `yourdomain.com` and `assets.yourdomain.com` URLs |
| `calendar-image.png` had `priority` on mobile (`lg:hidden` on desktop) | Competed with hero wallpaper for bandwidth on mobile, slowing LCP | Replaced `priority` with `loading="lazy"` — only the hero wallpaper now has `priority` |
| Missing preconnect for `assets.yourdomain.com` | ~300ms wasted on first image request | Added `<link rel="preconnect">` with `crossOrigin="anonymous"` in root layout |
| `clerk.yourdomain.com` preconnect missing `crossOrigin` | PageSpeed flagged as "unused preconnect" — wasted hint | Added `crossOrigin="anonymous"` to match CORS request pattern |
| Blog-image and calendar-image missing `sizes` prop | Next.js served oversized image variants | Added `sizes="(max-width: 768px) 100vw, 50vw"` and `sizes="(max-width: 768px) 100vw, 768px"` |

**Key takeaways:**
1. **Next.js `<Image>` optimizes images in `public/` automatically** — don't over-compress source files to the point of blurriness. Trust the `<Image>` component to generate WebP/AVIF at the right size. Focus on correct `sizes`, `priority`, and `loading` props instead.
2. **`dangerouslySetInnerHTML` images are the blind spot** — they bypass Next.js entirely. These raw `<img>` tags must use Cloudflare Image Transformation URLs, or they'll be served as full-size PNGs.
3. **Only one `priority` image per page** — multiple `priority` images compete for bandwidth on slow connections. Images hidden via CSS (`lg:hidden`) should use `loading="lazy"` regardless of their position, so they don't steal bandwidth from the actual LCP element.
4. **Preconnect needs `crossOrigin="anonymous"`** — without it, the browser creates a non-CORS connection that can't be reused for cross-origin image/font requests, making PageSpeed flag it as "unused."
5. **Mobile PageSpeed simulates Moto G Power on slow 4G** (1.6 Mbps, 150ms RTT) — scores of 85-90 are excellent for a real-world app with Clerk, PostHog, and web fonts. Desktop scores of 99 confirm the page is well-optimized; the mobile gap is mostly the harsh simulation environment.

### Round 8 (Feb 2025) — Structured Data Audit

| Issue | Impact | Fix |
|-------|--------|-----|
| Blog Article schema: `datePublished`/`dateModified` use human-readable strings ("February 8, 2026") | Rich Results Test flags "Invalid datetime value" — Google can't parse the date for rich snippets | Use `new Date(publishDate).toISOString()` for schema fields; keep human-readable format for UI display only |
| Blog Article schema: author missing `url` field | Rich Results Test flags "Missing field 'url'" on author — less critical but reduces schema completeness | Add `url: "https://www.yourdomain.com"` to author object in `generateArticleSchema()` |
| Blog FAQ sections have NO `FAQPage` JSON-LD | GSC shows FAQ recognition on 0 blog pages (only 2 hardcoded tool pages have it) — missing rich result eligibility for all blog content | Generate `FAQPage` JSON-LD from FAQ content and inject alongside Article schema |
| BreadcrumbList schema validates correctly | GSC not showing breadcrumbs despite valid schema — likely indexing/processing delay | No code change needed — monitor GSC over next few weeks |

**Key takeaways:**
1. **Visual HTML alone is insufficient for rich results** — Google requires explicit JSON-LD structured data. Having a beautifully styled FAQ section in HTML means nothing without the corresponding `FAQPage` schema.
2. **Schema field formats matter** — `datePublished` must be ISO 8601 (`2026-02-08T00:00:00.000Z`), not a display string. Always separate schema data from UI display data.
3. **Google Rich Results Test is essential** — GSC takes weeks to process schema changes. Use the Rich Results Test tool for immediate validation before deploying.
4. **Hardcoded tool pages work as proof** — The meta title/description generator pages have hardcoded `FAQPage` JSON-LD and Google recognizes them. This confirms the pattern works — it just needs to be applied dynamically to blog pages.
