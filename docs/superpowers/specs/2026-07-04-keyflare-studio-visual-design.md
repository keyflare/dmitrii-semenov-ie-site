# Keyflare Studio Visual Design Specification

Date: 2026-07-04
Status: approved for implementation planning

## Purpose

This document defines the visual direction for the Keyflare Studio website after the static
architecture and product customization model have been established.

The design should make Keyflare Studio feel like an independent software studio with a strong
designerly point of view, not a generic legal hub or SaaS landing page. It must still support the
site's practical role as a stable source of product, privacy, support, legal, sitemap, and
`app-ads.txt` URLs.

## Selected Direction

The approved direction is **Studio System + Themed Product Chassis**.

Keyflare Studio uses a **Chromatic Poster** identity:

- loud front-of-site pages;
- angular designer display typography;
- bold color and hard-edged gradients;
- poster-like graphic composition;
- confident product tiles and launch surfaces;
- calm, readable document pages for privacy, support, legal, and data deletion.

The system should feel like "tiny apps, loud ideas": compact products with a strong visual spark.

## Design Principles

1. **Authorial, not corporate**
   Keyflare Studio should look like a small independent maker/publisher with taste and intent.
   Avoid default startup polish, generic blue SaaS styling, and purely bureaucratic legal-site
   presentation.

2. **Bold front, calm documents**
   The homepage, product catalog, and product overview pages may be visually loud. Privacy, support,
   legal, and data deletion pages should be quieter, more scannable, and document-like while still
   sharing the same brand DNA.

3. **Products can have their own worlds**
   Product overview pages may differ significantly by product type, genre, assets, and content
   density. The studio identity should provide a recognizable shell, not force every product into
   the same visual mood.

4. **Static and store-safe**
   Design must preserve prerendered, directly reachable URLs for store-facing and compliance-facing
   pages. No visual decision should depend on runtime content loading, a backend, client-only
   routing, or hash routes.

5. **Structured expressiveness**
   The site should use strong graphic rules: hard color blocks, angled bands, poster frames,
   product media, numbered modules, and typographic contrast. Avoid decorative gradient orbs, bokeh,
   and purely atmospheric backgrounds.

## Typography

The chosen typography character is **Angular Art-School**.

Recommended implementation direction:

- Display font: a sharp, expressive geometric or art-school display face, with `Syne` as the first
  candidate.
- Body/UI font: a practical grotesk with good readability, with `Space Grotesk` as the first
  candidate.
- System fallback: preserve sensible system fallbacks for reliability.

Usage rules:

- Use the display font for homepage hero headings, product names, poster modules, major catalog
  titles, and brand moments.
- Use the body/UI font for navigation, metadata, legal text, support text, privacy sections,
  buttons, forms, and dense product details.
- Keep letter spacing at `0`; do not rely on negative tracking for style.
- Avoid viewport-width font scaling. Use `clamp()` with stable minimum and maximum sizes.
- Document pages should use smaller, calmer headings than homepage and product hero pages.

## Color And Graphics

The visual system should use a light warm base with sharp chromatic accents.

Recommended palette roles:

- Warm base: off-white or pale poster paper.
- Ink: near-black for text, outlines, and poster borders.
- Accent red/pink: energetic launch and product highlights.
- Accent amber/yellow: warmth and poster impact.
- Accent green: playful software/product signal.
- Accent blue: technical trust and link/action states.

Gradient usage:

- Use hard-edged or directional chromatic gradients as poster bands, strips, frames, and section
  markers.
- Avoid soft decorative orbs, blurred blobs, and bokeh fields.
- Do not make the homepage hero a gradient-only surface. It should include product/studio visual
  content such as screenshots, generated bitmap imagery, product tiles, or an immersive poster
  composition with concrete product signals.

## Layout System

The site should keep a stable studio shell:

- recognizable Keyflare Studio header;
- clear primary navigation;
- footer with legal operator identity;
- stable product/privacy/support/legal links;
- constrained reading widths for document pages;
- wider poster layouts for homepage and product overview pages.

Front-of-site pages may use:

- asymmetric hero composition;
- large display headings;
- framed poster modules;
- product tiles;
- angled color bands;
- numbered launch/product blocks;
- visible product media when available.

Document pages should use:

- calm single-column or two-column reading layouts;
- clear section hierarchy;
- strong link affordances;
- subtle chromatic left rails, top strips, or section markers;
- no oversized hero typography inside dense policy text.

Cards and framed UI elements should use tight radii, no more than `8px`, unless a product-specific
custom overview has a strong reason to diverge.

## Product Page Model

The design must build on the current product customization implementation on `main`.

Current code already supports:

- `presentation.overview.mode: "standard"`;
- `presentation.overview.mode: "standard-with-mdx"`;
- `presentation.overview.mode: "custom"`;
- `presentation.support.mode: "standard" | "mdx"`;
- `presentation.privacy.mode: "generated" | "generated-with-mdx"`;
- explicit custom overview registration in `app/content/products/customOverviewPages.tsx`;
- explicit MDX content registration in `app/content/products/customMdxContent.ts`;
- shared MDX rendering components in `app/content/products/mdxComponents.tsx`;
- draft `Palette Master` product using a custom overview and MDX support/privacy additions.

Design should map onto these levels:

### Standard Product Pages

Standard pages use the shared Keyflare product chassis:

- studio header and footer;
- product hero with type, platforms, summary, and primary links;
- store/support/privacy/data deletion link cluster;
- optional media or feature blocks when product metadata later supports them.

This mode is best for simple utilities, small apps, and early product pages.

### Standard With MDX

Standard-with-MDX pages keep the same chassis but allow richer sections:

- screenshots or product story blocks;
- FAQ;
- feature details;
- support notes;
- product-specific privacy additions.

The MDX components should receive branded typography, spacing, callouts, links, and media rules so
custom content still looks like part of Keyflare Studio.

### Custom Overview Pages

Custom overview pages may have product-specific composition, theme colors, media rhythm, and visual
personality. They should still preserve:

- direct `/products/:slug/` routing;
- visible links to privacy and support;
- optional data deletion link when required;
- metadata from the product registry;
- publication guards through `findPublishedProduct()`;
- the studio's footer/legal identity.

Custom overview pages are the correct place for highly distinctive product launches, games, or apps
with their own visual universe.

## Product Theming

Future implementation should introduce product theme tokens rather than one-off CSS drift.

Recommended token categories:

- `productAccentPrimary`;
- `productAccentSecondary`;
- `productAccentTertiary`;
- `productInk`;
- `productSurface`;
- `productGradient`;
- `productDisplayFontRole` or equivalent class hook;
- `productMediaTreatment`;
- `productVisualVolume` with values such as `calm`, `poster`, and `immersive`.

These tokens can be defined in product metadata later or colocated with custom overview components,
depending on the implementation plan. The design requirement is that product differentiation remains
intentional and inspectable.

## Page Requirements

### Homepage

The homepage should be the loudest studio-level page.

It should communicate:

- Keyflare Studio as the public brand;
- independent software publisher identity;
- apps, games, tools, and desktop/mobile products;
- a memorable visual point of view;
- featured or published products when available;
- polished empty state when no products are published.

The first viewport should make the brand unmistakable. It should also hint at product/catalog
content below the fold on common desktop and mobile viewport sizes.

### Product Catalog

The catalog should feel like a product wall or launch board, not a plain list.

Each product card should support:

- product name;
- product type;
- platforms;
- short description;
- overview/privacy/support links;
- product accent color or marker;
- clear draft/fixture exclusion from public rendering.

### Product Overview

Product overview pages should be allowed to vary more than other page types.

Shared requirements:

- clear product name and purpose;
- platform/store links when available;
- support and privacy links;
- data deletion link when required;
- strong product-specific visual identity when configured;
- no bypassing product publication rules.

### Privacy, Support, Legal, And Data Deletion

These pages should use calm document mode.

They should:

- preserve generated compliance sections;
- keep policy and support text highly readable;
- use restrained brand accents;
- avoid large decorative modules inside dense legal text;
- keep contact and operator identity clear.

## First Implementation Scope

The first visual implementation should focus on the shared studio system and the current product
customization surfaces:

- global tokens for color, typography, spacing, borders, and layout;
- font loading and fallbacks;
- redesigned `SiteShell`;
- redesigned `PageHeader`;
- redesigned `ProductCard`;
- homepage poster composition;
- product catalog launch-board layout;
- standard product overview chassis;
- calm document styling for privacy/support/legal/data deletion;
- branded MDX component styling;
- initial custom `Palette Master` overview direction while it remains a draft product.

Do not attempt to create a full bespoke design for every future product in the first pass.

## Out Of Scope

The visual design pass should not introduce:

- backend services;
- CMS packages;
- runtime content loading;
- client-only public URLs;
- hash routes;
- unrelated product publication changes;
- final legal/privacy copy review.

## Verification Expectations

Because this work changes user-facing UI and route surfaces, implementation should include:

- TypeScript checks;
- lint;
- formatting checks;
- Vitest coverage for product publication/customization behavior where touched;
- static build;
- route output checks;
- browser verification of desktop and mobile layouts;
- visual inspection that homepage, catalog, product overview, privacy, support, legal, and draft
  custom product surfaces do not overlap or break.

Before merging or pushing to `main`, run `npm run check`.
