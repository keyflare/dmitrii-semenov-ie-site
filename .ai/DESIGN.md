# Design Guidance

## Direction

The approved direction is **Studio System + Themed Product Chassis**.

Keyflare Studio uses a **Chromatic Poster** identity:

- loud front-of-site pages;
- angular designer display typography;
- bold color and hard-edged gradients;
- poster-like graphic composition;
- confident product tiles and launch surfaces;
- calm, readable document pages for privacy, support, legal, and data deletion.

The system should feel like "tiny apps, loud ideas": compact products with a strong visual spark.

## Principles

1. **Authorial, not corporate**
   Keyflare Studio should look like a small independent maker/publisher with taste and intent. Avoid
   default startup polish, generic blue SaaS styling, and purely bureaucratic legal-site
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
   Use strong graphic rules: hard color blocks, angled bands, poster frames, product media, numbered
   modules, and typographic contrast. Avoid decorative gradient orbs, bokeh, blurred blobs, and
   purely atmospheric backgrounds.

## Typography

The chosen typography character is **Angular Art-School**.

- Display font: `Syne`.
- Body/UI font: `Space Grotesk`.
- System fallbacks should remain sensible for reliability.

Use the display font for homepage hero headings, product names, poster modules, major catalog
titles, and brand moments.

Use the body/UI font for navigation, metadata, legal text, support text, privacy sections, buttons,
forms, and dense product details.

Keep letter spacing at `0`; do not rely on negative tracking for style.

Avoid viewport-width font scaling. Use stable minimum and maximum sizes.

Document pages should use smaller, calmer headings than homepage and product hero pages.

## Color And Graphics

The visual system uses a light warm base with sharp chromatic accents:

- warm poster-paper base;
- near-black ink for text, outlines, and poster borders;
- red/pink for energetic highlights;
- amber/yellow for warmth and poster impact;
- green for playful product signal;
- blue for technical trust and link/action states.

Use hard-edged or directional chromatic gradients as poster bands, strips, frames, and section
markers.

Do not make the homepage hero a gradient-only surface. It should include concrete studio/product
signals such as product tiles, poster modules, screenshots, or other inspectable visual content.

## Layout

Keep a stable studio shell:

- recognizable Keyflare Studio header;
- clear primary navigation;
- footer with legal operator identity;
- stable product/privacy/support/legal links;
- constrained reading widths for document pages;
- wider poster layouts for homepage and product overview pages.

Front-of-site pages may use asymmetric hero composition, large display headings, framed poster
modules, product tiles, angled color bands, numbered launch/product blocks, and visible product
media when available.

Document pages should use calm single-column or two-column reading layouts, clear hierarchy, strong
link affordances, and restrained chromatic rails or section markers.

Cards and framed UI elements should use tight radii, no more than `8px`, unless a product-specific
custom overview has a strong reason to diverge.

Do not put cards inside cards. Do not make page sections look like floating card stacks.

## Product Theming

Product differentiation should be intentional and inspectable rather than one-off CSS drift.

Product theme metadata may define:

- `accentPrimary`;
- `accentSecondary`;
- `accentTertiary`;
- `ink`;
- `surface`;
- `gradient`;
- `visualVolume` with values such as `calm`, `poster`, and `immersive`.

Custom overview pages may have product-specific composition, theme colors, media rhythm, and visual
personality. They must still preserve:

- direct `/products/:slug/` routing;
- visible links to privacy and support;
- optional data deletion link when required;
- metadata from the product registry;
- publication guards through `findPublishedProduct()`;
- the studio footer/legal identity.

## Page Guidance

The homepage should be the loudest studio-level page and make the Keyflare Studio brand
unmistakable in the first viewport.

The catalog should feel like a product wall or launch board, not a plain list.

Product overview pages may vary more than other page types, but must keep clear product purpose,
platform/store links when available, support and privacy links, and publication guards.

Privacy, support, legal, and data deletion pages should preserve generated compliance sections, keep
text highly readable, use restrained brand accents, and avoid oversized decorative modules inside
dense policy text.
