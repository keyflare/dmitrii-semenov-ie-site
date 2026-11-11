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
- page ownership and presentation mode.

Public registry status and customer-facing release stage are separate concerns. A product may use
the optional `releaseStage: "in-development"` value while remaining `published` so its overview and
compliance URLs are public. In-development products must not render store controls that imply a
download is available.

Published products must be complete and pass validation.

## Product Statuses

Product statuses:

- `published`: public, included in the catalog, build output, sitemap, and route checks.
- `draft`: not public.
- `fixture`: development/test-only and not public.

Never let `draft` or `fixture` products render through public product routes.

Studio-rendered product routes use `findPublishedLocalProduct()`. Imported sites are staged for
products selected by `getPublishedStaticProducts()`.

`getPrerenderPaths()` includes studio pages and studio-rendered published product pages.
`getPublicPaths()` also includes the declared pages of published imported sites. Use it for the
sitemap and final build-output checks. Both functions exclude draft and fixture products.

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

The `Product Privacy Policies` index on the website-level `/privacy/` page must include every
published product. Keep that index registry-driven with `getPublishedProducts()`; do not maintain a
separate manual list. Its focused test must enumerate the current published registry and assert
exactly one `/products/:slug/privacy/` link and policy label for every published product.

A studio-rendered product with `presentation.terms` or an imported product with
`staticSite.hasTerms` has a public `/products/:slug/terms/` page and conditional Terms links.
Products without Terms return `404` at that route.

The product overview page should link to privacy, support, and data deletion pages when applicable.
It should not duplicate full privacy or support content.

## Project-Owned Static Sites

Each project owns its source, design system, assets and build. It delivers a complete static export
with `index.html`, `privacy/index.html` and `support/index.html`. Include `terms/index.html` and
`data-deletion/index.html` when configured for the product. Use relative URLs for product assets and
navigation so the export can run on its own and at `/products/:slug/`.

Keyflare keeps the catalog entry and publication status. For every published product with a
`staticSite` entry, `product-sites.json` identifies the GitHub `owner/repository`, tag, and full
SHA of the commit pointed to by the tag. The root of the tagged tree holds the finished export.

`npm run sync:product-sites` fetches each published product's selected tag and checks its commit
before extracting the tree to the generated `.product-sites/` directory. Dev and build both run
this step. The studio build validates the expected HTML and copies the export into its product
directory. Studio links into an imported site use document navigation.

Ratebench is maintained in `keyflare/exchange` under `site/`. Create a site release with
`node site/release.mjs site-v1.0.0` (use the next version), push the tag, and update the tag and
export commit in `product-sites.json`. Run `npm run check` and submit the Keyflare change in a PR.
To roll back, revert the config change. Palette Master uses the studio-rendered model below.

## Studio-Rendered Products

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

Focused route coverage should also verify that the website-level privacy index stays complete when
a product changes to `published`. Adding a published product without its entry in `/privacy/` is a
release-blocking regression.

When changing the product model, routing, publication guards, privacy profile, prerendering, or
metadata generation, add or update focused Vitest coverage and run `npm run check`.
