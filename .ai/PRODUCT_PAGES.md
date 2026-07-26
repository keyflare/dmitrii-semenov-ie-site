# Product Page Guidance

## Product Registry

Products are controlled by `app/content/products/registry.ts`.

The product registry is the source of truth for:

- product publication status;
- public product routes;
- prerender paths;
- sitemap inclusion;
- support/privacy/data deletion links;
- store links;
- product metadata and privacy profile;
- product presentation mode.

Public registry status and customer-facing release stage are separate concerns. A product may use
the optional `releaseStage: "in-development"` value while remaining `published` so its overview and
compliance URLs are public. In-development products must not render store controls that imply a
download is available.

Published products must be complete and pass validation.

## Product Statuses

Product statuses:

- `published`: public, included in product routes, prerender output, sitemap, and route checks.
- `draft`: not public.
- `fixture`: development/test-only and not public.

Never let `draft` or `fixture` products render through public product routes.

Public product routes must use `findPublishedProduct()` or an equivalent published-only guard.

`getPrerenderPaths()` must include:

- static public routes;
- product routes for `published` products only.

It must not include draft or fixture product paths.

## Public Product Routes

Current public product routes:

```text
/products/
/products/:slug/
/products/:slug/privacy/
/products/:slug/terms/
/products/:slug/support/
/products/:slug/data-deletion/
```

The data deletion route is public only when `product.privacyProfile.requiresDataDeletionPage` is
enabled.

Every published product should have:

- product overview page;
- product-specific privacy policy page;
- product-specific support page;
- platform and store links when available;
- product metadata for SEO and Open Graph.

Terms of Service are an optional product capability. A product with `presentation.terms` gets a
statically prerendered `/products/:slug/terms/` route and conditional Terms links. Products without
configured Terms content return `404` at that route.

The product overview page should link to privacy, support, and data deletion pages when applicable.
It should not duplicate full privacy or support content.

## Customization Model

Products support three overview levels:

1. `standard`
   - Uses the shared product overview template.
   - Best for simple apps, tools, and early product pages.

2. `standard-with-mdx`
   - Keeps the shared overview template.
   - Adds product-specific MDX sections for richer copy, FAQ, feature details, or media notes.

3. `custom`
   - Uses a product-specific React overview component for `/products/:slug/`.
   - Best for distinctive launches, games, or products with their own visual world.

Support pages support:

- `standard`;
- `mdx`.

Privacy pages support:

- `generated`;
- `generated-with-mdx`.

Terms pages support:

- `mdx`.

Custom overview pages and all overview, privacy, terms, and support MDX content must be statically
imported and explicitly registered. Do not add arbitrary dynamic imports, runtime content loading,
CMS behavior, or remote content loading.

## Privacy And Support Rules

Privacy policy pages should be product-specific:

```text
/products/:slug/privacy/
```

Privacy pages should keep generated compliance sections from structured product metadata. Optional
product-specific MDX may add context, but it must not replace required generated sections unless the
product compliance model is explicitly redesigned.

Reusable disclosure sections may cover:

- operator and contact;
- data collection summary;
- advertising SDKs such as AdMob;
- analytics SDKs;
- crash reporting;
- in-app purchases or subscriptions;
- account systems;
- data retention and deletion;
- third-party service providers;
- children privacy;
- international processing;
- policy updates and `lastUpdated`.

The structured privacy profile uses `usesSubscriptions` to make subscription disclosures
inspectable. Subscription products should explain that Apple or Google handles store billing, what
purchase or entitlement data the product processes, and that the product does not directly receive
full payment-card details.

Support pages should stay product-specific rather than becoming a shared support center. They may
include support email, platform information, troubleshooting notes, FAQ entries, known issues, and
links to privacy or data deletion pages.

The data deletion page should be generated only when the product has accounts, server-side user
data, or another reason to provide a dedicated deletion flow.

## Validation Expectations

The build should fail for incomplete published products.

Validation should check:

- unique product slugs;
- required product metadata;
- valid external URLs when store links are present;
- valid `lastUpdated` values for policy pages;
- known custom overview and MDX keys;
- optional Terms presentation keys;
- valid product theme values when present;
- required subscription privacy metadata;
- exclusion of draft and fixture products from production public output.

When changing the product model, routing, publication guards, privacy profile, prerendering, or
metadata generation, add or update focused Vitest coverage and run `npm run check`.
