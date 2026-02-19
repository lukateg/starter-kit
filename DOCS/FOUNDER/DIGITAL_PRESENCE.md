# Digital Presence & Press Kit Playbook

> Reusable template for building a complete online presence from scratch. Contains two parts: (1) the backlink/profile registry and (2) the press kit spec. When starting a new project, populate the tables, write the press kit content, and implement.

**Status**: Implement after your app is live and accepting users.

---

## Why This Matters

Google and LLMs determine your brand's legitimacy by finding consistent, verified mentions across trusted platforms. Every profile you create and link back to your site:

1. **Strengthens domain authority** — High-DA backlinks from G2, Capterra, Crunchbase
2. **Builds entity recognition** — Google's Knowledge Graph uses cross-platform presence to understand what your brand is
3. **Improves LLM representation** — LLMs do query fan-out across the web; consistent descriptions get used verbatim
4. **Drives conversion** — Trust logos on your landing page increase sign-up rates (the starter kit already has the logo bar ready)

---

# Part 1: Backlink & Profile Registry

The goal: get your brand listed on every relevant platform, then link to those profiles from your website (landing page, footer, structured data).

---

## Review Platforms (Mandatory)

Displayed as trust logos on the landing page and linked to real profile pages.

| Platform | Where to Create | Landing Page Logo | Notes |
|----------|----------------|:-----------------:|-------|
| G2 | [g2.com/products](https://www.g2.com/products) | Yes | Primary B2B review platform |
| Capterra | [capterra.com](https://www.capterra.com) | Yes | Gartner-owned, strong for SaaS |
| GetApp | [getapp.com](https://www.getapp.com) | Yes | Part of Gartner Digital Markets |
| Crunchbase | [crunchbase.com](https://www.crunchbase.com) | Yes | Company/funding profile |
| Trustpilot | [trustpilot.com](https://www.trustpilot.com) | Yes | Consumer-facing trust signal |

**Also consider:** TrustRadius, SoftwareAdvice, FinancesOnline.

---

## Social Media (Mandatory)

Linked in the website footer and included in Organization schema `sameAs` for entity recognition.

| Platform | What to Create | Footer Link | Schema `sameAs` |
|----------|---------------|:-----------:|:---------------:|
| X (Twitter) | Company account | Yes | Yes |
| LinkedIn | Company page | Yes | Yes |
| Facebook | Business page | Yes | Yes |
| Instagram | Business account | Yes | Yes |

**Optional:** YouTube, TikTok (if video content is planned).

---

## SaaS Directories (Recommended)

Strengthen domain authority through high-DA backlinks.

| Directory | Where to Submit | Footer Link |
|-----------|----------------|:-----------:|
| AlternativeTo | [alternativeto.net](https://alternativeto.net) | Yes |
| SaaSHub | [saashub.com](https://www.saashub.com) | Yes |
| StackShare | [stackshare.io](https://stackshare.io) | Yes |

**Also consider:** SourceForge, SaaSWorthy, Crozdesk, There's An AI For That, Toolify.ai, FutureTools.

---

## Startup / Launch Platforms (Optional)

| Platform | URL | Best For |
|----------|-----|----------|
| Product Hunt | [producthunt.com](https://www.producthunt.com) | Launch day traffic |
| BetaList | [betalist.com](https://betalist.com) | Early adopters |
| Launching Next | [launchingnext.com](https://www.launchingnext.com) | Startup directory |

---

## Where These Links Are Used in Your App

Every link from the registry above should be wired into these locations:

| Location | What's Linked | File |
|----------|---------------|------|
| Landing page — trust logos section | Review platforms (G2, Capterra, GetApp, Crunchbase, Trustpilot) | `src/app/(marketing)/page.tsx` |
| Footer — social icons (bottom bar) | Social media (X, LinkedIn, Facebook, Instagram) | `src/app/components/Footer.tsx` |
| Footer — "Find Us On" column | Review platforms + directories | `src/app/components/Footer.tsx` |
| Organization JSON-LD — `sameAs` | All profiles (review + social) | `src/app/layout.tsx` |
| Static SEO files | `llms.txt`, `humans.txt` | `public/` |

**Note:** The starter kit ships with placeholder `#` links in the trust logos, footer social icons, and "Find Us On" column. Replace these with your real profile URLs once you've created accounts on each platform.

---
---

# Part 2: Press Kit Specification

The press kit is a dedicated page on your website (`/press`) designed for journalists, bloggers, and LLMs researching your brand. Its purpose is to **control the narrative** — the exact language, links, and images that get used when someone writes about you.

## Why a Press Kit Matters

1. **Journalists copy-paste.** If your press kit has great copy, that's what gets published.
2. **LLMs do query fan-out.** They search Google, find your press kit, and may use your language verbatim.
3. **You control the links.** Strategic links in the press kit drive link juice to your most valuable SEO pages.
4. **Entity association.** The keywords surrounding your brand name in press coverage influence how Google associates your brand with topics.

## Press Kit Page Structure

### 1. SEO Metadata

| Field | Format |
|-------|--------|
| Page title | `Press Kit \| [Brand Name]` |
| Meta description | `Official press kit for [Brand Name]. Download brand assets, read our story, and get everything you need to write about us.` |
| OG image | Custom branded image |
| URL | `/press` |

### 2. Brand Boilerplate (Most Important)

This is the "about" paragraph journalists will copy-paste. Write it carefully:

- **2-3 paragraphs** describing what the product does, who it's for, and why it matters
- **Naturally embed target keywords** — these influence rankings when press coverage links to you
- **Include your best sales copy** — A/B tested language that converts
- **Write for copy-paste** — assume journalists will use it verbatim

**Template:**

> [Brand Name] is a [category] that helps [target audience] [achieve outcome]. [Key differentiator or unique approach].
>
> Founded in [year] in [location], [Brand Name] [traction metric]. The platform [explain core value prop in 1-2 sentences with natural keyword integration].
>
> [Optional third paragraph with vision, mission, or notable achievement].

### 3. Key Facts & Milestones

| Field | Value |
|-------|-------|
| Founded | [Year] |
| Headquarters | [City, Country] |
| Founder | [Name] |
| Category | [Your SaaS category] |
| Key metric | [e.g., "10,000+ users"] |
| Website | [Your URL] |
| Press contact | press@[yourdomain].com |

### 4. Strategic Links

These are the links you **want** journalists to include in articles. This is the key SEO play.

| Link | Purpose | Rotate? |
|------|---------|:-------:|
| Homepage | Default fallback | No |
| Pillar page 1 | Bottom-of-funnel SEO landing page | Yes |
| Pillar page 2 | Secondary topic cluster | Yes |
| Blog | Content hub | No |

**Rotation strategy:** Swap pillar page links every few months based on which keyword clusters you're actively targeting.

### 5. Brand Assets

| Asset | Formats | Notes |
|-------|---------|-------|
| Full logo | SVG, PNG (light + dark bg) | Primary brand mark |
| Icon/favicon | SVG, PNG | For small placements |
| Product screenshots | PNG | 2-3 key UI screenshots |
| Founder headshot | JPG/PNG | Professional quality |
| OG image | PNG (1200x630) | For social sharing |

All images must have descriptive alt text for Google Image discoverability. Files should be available as direct downloads and optionally as a ZIP.

### 6. Social Proof & Reviews

Link to review platform profiles:

- G2 rating + link
- Capterra rating + link
- Trustpilot rating + link
- Notable review quotes (1-2 sentences each)

### 7. Contact

- Press email address
- Social profile links
- Optional: Calendly/Cal.com link for press calls

---

## Implementation Checklist

When building your digital presence:

- [ ] Create accounts on all review platforms (G2, Capterra, GetApp, Crunchbase, Trustpilot)
- [ ] Create social media accounts (X, LinkedIn, Facebook, Instagram)
- [ ] Submit to SaaS directories (AlternativeTo, SaaSHub, StackShare)
- [ ] Write the brand boilerplate with target keywords
- [ ] Copy the boilerplate to every platform profile bio/description
- [ ] Replace placeholder `#` links in landing page trust logos with real URLs
- [ ] Replace placeholder `#` links in footer social icons with real URLs
- [ ] Replace placeholder `#` links in footer "Find Us On" column with real URLs
- [ ] Add all profile URLs to Organization JSON-LD `sameAs` in `src/app/layout.tsx`
- [ ] Update `llms.txt` and `humans.txt` with profile URLs
- [ ] Build the `/press` page using the press kit spec above
- [ ] Add "Press" link to the footer

## Unified Messaging Rule

**The press kit boilerplate is the canonical description of your brand.** When creating or updating profiles on any platform, always use the same description. This ensures:

1. Consistent language across the entire internet
2. Target keywords are associated with your brand everywhere
3. LLMs get a consistent signal about what your brand does
4. Google's entity recognition sees the same description across multiple high-authority domains
