# Keyflare Studio Site Concept Specification

Date: 2026-07-03
Status: approved for implementation planning

## Purpose

This document defines the concept and information architecture for the Keyflare Studio website.
The site is a product-first static website for mobile apps, desktop apps, and other software products.
It must provide stable public URLs required by app stores, ad networks, users, and business contacts.

The site is not intended to be a CMS, blog, or full marketing portal in the first phase.
The first goal is to prepare the repository and website structure so future products can be added safely and consistently.

## Public Identity

The public brand is **Keyflare Studio**.

The legal operator is **Dmitrii Semenov, Individual Entrepreneur, Armenia**.

The website should present Keyflare Studio as the user-facing product identity while keeping the legal operator clearly available in footer, legal pages, and product privacy policies.

## External Requirements

The site should support the practical requirements of Google Play, App Store Connect, App Review, and Google AdMob.

Reference requirements:

- Google Play requires app privacy policy URLs and expects privacy disclosures to match app behavior and Data safety declarations: <https://support.google.com/googleplay/android-developer/answer/10144311?hl=en>
- App Store Connect requires a privacy policy URL for apps: <https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/>
- Apple App Review expects functional user support and privacy links: <https://developer.apple.com/distribute/app-review/>
- AdMob uses an `app-ads.txt` file hosted at the root of the app developer website domain: <https://support.google.com/admob/answer/9363762?hl=en>

These references should guide the structure, but the website content still needs product-specific review before each product is published.

## Content Language

The canonical site content will be English.

The first version will not include localized routes. The site should still be structured so future localization can be added without changing the core URL model or content architecture.

Initial URL examples:

```text
/
/products/
/products/:slug/
/products/:slug/privacy/
/products/:slug/support/
/legal/
/legal/privacy/
```

Future localization may add routes such as `/ru/...`, while English remains the default canonical content.

## Site Structure

The site should use a product-first structure.

```text
/
  Keyflare Studio homepage.
  Introduces the studio as a software product publisher.
  Shows featured or published products when available.
  Links to products, about, and legal pages.

/products/
  Catalog of published products.
  Supports mobile apps, desktop apps, tools, and future software products.
  If no products are published yet, shows a polished empty state.

/products/:slug/
  Product overview page.
  Includes product name, type, short description, platform/store links,
  and links to product-specific support and privacy pages.

/products/:slug/privacy/
  Product-specific privacy policy.
  This is the URL intended for Google Play, App Store Connect, and in-app privacy links.

/products/:slug/support/
  Product-specific support page.
  This is the URL intended for app store support links.

/products/:slug/data-deletion/
  Optional product-specific data deletion page.
  Generated only for products that actually need it.

/legal/
  Legal hub.
  Provides operator identity, business contact, and links to legal/privacy pages.

/legal/privacy/
  Website privacy policy for the Keyflare Studio website itself.
  Separate from product-specific privacy policies.

/about/
  About Keyflare Studio as a product studio.
  Includes light legal attribution without turning the page into a legal record.

/contact/
  General business contact page.
  Not the primary support page for individual products.

/app-ads.txt
  Root-level AdMob file.
```

## Product Pages

Every published product should have:

- A product overview page.
- A product-specific privacy policy page.
- A product-specific support page.
- Platform and store links when available.
- Product metadata for SEO and Open Graph.

The product overview page should not duplicate the full privacy or support content.
It should act as the human-readable entry point for the product and link to the relevant compliance pages.

The support page should be product-specific rather than a shared support center.
It may include support email, platform information, troubleshooting notes, FAQ entries, known issues, and links to privacy or data deletion pages.

The data deletion page should be generated only when the product has accounts, server-side user data, or another reason to provide a dedicated deletion flow.
Privacy policies may still include a data retention and deletion section even when no separate data deletion page exists.

## Legal Information Model

The site should separate brand presentation from legal identity.

Expected placement:

- Header and main navigation use **Keyflare Studio**.
- Footer states that Keyflare Studio is operated by Dmitrii Semenov, Individual Entrepreneur, Armenia.
- `/about/` explains the studio in human terms.
- `/legal/` contains operator identity and business contact information.
- Product privacy policies explicitly identify the operator or responsible contact.
- Product support pages stay focused on support for that product.

The site should avoid exposing more personal or business details than are intentionally public.
The exact public legal/contact details should be reviewed before implementation and before deployment.

## Privacy Policy Model

Privacy policy pages should be product-specific.

The public URL model is:

```text
/products/:slug/privacy/
```

Internally, policy pages should be assembled from structured reusable disclosure sections plus product-specific metadata.
This avoids copy-paste drift while still producing normal human-readable privacy policy pages.

Reusable disclosure sections may cover:

- Operator and contact.
- Data collection summary.
- Advertising SDKs, including AdMob when relevant.
- Analytics SDKs.
- Crash reporting.
- In-app purchases or subscriptions.
- Account systems.
- Data retention and deletion.
- Third-party service providers.
- Children privacy.
- International processing.
- Policy updates and `lastUpdated`.

Products may define custom overrides or additional Markdown/MDX sections when the standard blocks are not enough.

## Content Architecture

The site should use a hybrid content model:

- Typed product registry for structured metadata.
- Markdown or MDX for longer support, FAQ, legal, and product-specific override content.
- Reusable structured privacy disclosure blocks for compliance-related text.

The product registry should be the source of truth for published product routes and metadata.

Example content concepts:

```text
product identity:
  name
  slug
  status
  type
  shortDescription
  platforms
  storeLinks
  supportEmail
  lastUpdated

privacy profile:
  usesAdMob
  usesAnalytics
  usesCrashReporting
  hasAccounts
  collectsPersonalData
  requiresDataDeletionPage
  thirdPartyServices
```

The exact file layout will be decided in the implementation plan.

## Draft And Fixture Products

The repository may contain a development fixture product.
It should be used to build and test page templates before real products are added.

Fixture or draft products must not appear in production routes, sitemap, public catalog, or generated metadata.

Published products must be complete and pass validation.

## Build-Time Validation

The build should fail for incomplete published products.

Validation should check at least:

- Unique product slugs.
- Required product metadata.
- Required product overview, privacy, and support routes.
- Valid external URLs when store links are present.
- Valid `lastUpdated` values for policy pages.
- Required data deletion page when `requiresDataDeletionPage` is enabled.
- Exclusion of draft and fixture products from production public output.
- Presence of `app-ads.txt` when AdMob support is enabled for published products.

AdMob validation may initially warn until the real publisher ID and final `app-ads.txt` contents are known.
Once configured, invalid or missing `app-ads.txt` should be treated as a build error.

## Technical Stack

The selected stack is:

- React.
- TypeScript.
- React Router framework mode with prerender.
- Static build output suitable for GitHub Pages.
- CSS Modules for component styles.
- Global CSS design tokens for colors, typography, spacing, layout, radius, shadows, and breakpoints.
- GitHub Actions for checks and deployment.
- GitHub Pages with a custom domain.

The site must remain fully static:

- No backend.
- No CMS.
- No admin panel.
- No runtime server requirement.

All source content lives in the repository and is versioned with git.

## Routing And Prerendering

All store-facing and compliance-facing pages must be directly accessible as static prerendered pages.

This includes:

- `/products/:slug/`
- `/products/:slug/privacy/`
- `/products/:slug/support/`
- `/products/:slug/data-deletion/` when enabled
- `/legal/`
- `/legal/privacy/`
- `/about/`
- `/contact/`

The site should not rely on hash routes for public store URLs.
The site should avoid fragile single-page-app fallback behavior for privacy and support pages.

## Generated Metadata

The site should automatically generate public metadata from site config and product registry.

Generated outputs should include:

- Sitemap.
- Robots file.
- Canonical URLs.
- Page titles and descriptions.
- Open Graph metadata.
- Product page metadata.

Draft and fixture products must be excluded from sitemap and public metadata.

## Repository Preparation Goals

The first implementation phase should prepare the repository for future content.
It should not require final product data or final visual design.

Expected repository preparation:

- Initialize the selected React/TypeScript/React Router static stack.
- Add project scripts for validation, typecheck, lint, format check, build, and route checks.
- Add a content registry structure.
- Add a fixture product excluded from production.
- Add layouts and placeholder page templates.
- Add initial legal/about/contact page placeholders.
- Add support for `app-ads.txt` at root output.
- Add generated metadata infrastructure.
- Add GitHub Actions checks and GitHub Pages deployment flow.
- Document how to add a future product.

## Checks And Quality Gates

Initial checks should include:

- TypeScript typecheck.
- Lint.
- Format check.
- Static build.
- Content validation.
- Route output validation after build.
- Basic internal link validation where practical.

Playwright or visual browser tests are intentionally out of scope for the first phase.
They can be added later when visual design work begins.

## Out Of Scope For This Specification

The following are intentionally deferred:

- Final visual design.
- Product-specific content.
- Legal review of final policy text.
- Localization implementation.
- Blog or changelog.
- CMS or admin panel.
- Backend services.
- Playwright visual tests.
- Product marketing copy beyond structural placeholders.

## Open Decisions For Later

These decisions are intentionally left for later phases:

- Exact public legal/contact details to show.
- Final domain and canonical URL configuration.
- Exact `app-ads.txt` contents.
- Exact product registry file layout.
- Exact styling and visual direction.
- Whether to add localized content after the English-first version is stable.

