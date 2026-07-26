# Ratebench Product Pages Design

## Summary

Publish Ratebench as an in-development mobile app in the Keyflare Studio product catalog. The
product must have directly reachable static overview, Privacy Policy, Terms of Service, and Support
pages for Android and iOS.

Ratebench is a financial reference and calculation tool, so its custom overview will use the
approved **Studio Ledger** direction: the existing Keyflare Studio typography and hard-edged design
language, with a more restrained grid, neutral palette, and data-oriented composition than the
Palette Master page.

## Source Material

Product facts come from the Ratebench repository at `/Users/dmitry/Projects/exchange`, including:

- the Ratebench Android and iOS application source;
- the shared product strings and feature modules;
- the AppMetrica integration and service implementation;
- `tmp/privacy-policy.md`;
- `tmp/terms-of-service.md`;
- the existing Ratebench logo assets.

The legal drafts are source material, not publishable copy. The site versions must remove every
placeholder and omit unsupported or unnecessarily detailed statements.

## Product Scope

Ratebench is a mobile app under active development for Android and iOS. It provides:

- fiat and crypto-asset reference rates;
- simple conversion calculations;
- multi-step exchange calculations with user-entered rates and fees;
- effective-rate comparison;
- crypto-asset search;
- locally stored calculation history, optional notes, selected assets, and preferences;
- cached rates for degraded or offline conditions;
- a planned paid subscription delivered through Apple and Google in-app purchases.

Ratebench does not:

- execute exchanges or transfers;
- hold money, crypto-assets, wallets, keys, or accounts;
- provide financial, investment, tax, accounting, or legal advice;
- contain third-party advertising;
- require a Ratebench user account.

## Publication And Routes

Ratebench will use the site's existing `published` registry status because its pages must be visible
in the catalog, prerender output, route checks, and sitemap. Product copy must separately show the
customer-facing status **In development**.

The product type will gain an optional `releaseStage: "in-development"` field. Ratebench configures
it and shared catalog UI uses it for the status label. Existing products may omit it, so Palette
Master's mixed platform availability remains unchanged.

The public routes are:

```text
/products/ratebench/
/products/ratebench/privacy/
/products/ratebench/terms/
/products/ratebench/support/
```

The new Terms route is a reusable, optional product capability:

- `presentation.terms` is an optional MDX configuration with a registered content key;
- a product with configured Terms content gets a prerendered `/products/:slug/terms/` page;
- Terms links render only for products that configure the document;
- a published product without Terms content returns `404` at that route;
- draft and fixture products remain unavailable through every public product route;
- Palette Master behavior and URLs remain unchanged.

The privacy profile will gain `usesSubscriptions: boolean` so validation and future content work do
not need to infer subscription use from prose.

## Overview Page

Ratebench uses a custom React overview component registered by a static key. It must remain fully
prerenderable and must not fetch live rate data.

### Studio Ledger Visual Direction

The page retains the Keyflare Studio identity through:

- `Syne` for large display headings;
- `Space Grotesk` for body and UI copy;
- hard edges and the existing small-radius rules;
- one controlled chromatic strip;
- the real Ratebench logo;
- the standard studio shell and footer.

The stricter product character comes from:

- white and near-black primary surfaces;
- neutral gray dividers and panels;
- Ratebench blue for actions;
- Ratebench green for positive/result signals;
- an amber accent used sparingly;
- a measured grid and tabular values;
- no rotated screenshots, carousel, playful color-card sequence, or decorative gradient field.

### Overview Structure

The custom overview contains:

1. A hero with the Ratebench name, concise purpose, Android/iOS context, and **In development**
   status.
2. Links to feedback, Privacy, Terms, and Support.
3. A static exchange-ledger composition that demonstrates a multi-step calculation without implying
   real-time or actionable market data.
4. Three feature modules:
   - fiat and crypto reference/conversion;
   - multi-step exchange calculations with fees;
   - local calculation history.
5. A short financial disclaimer stating that Ratebench is an informational calculator, not a
   financial service or adviser.
6. Android and iOS availability presented as in development, with no store links.

The product catalog card must also communicate **In development** and must not imply that either
platform can currently be downloaded.

## Privacy Policy

The Privacy Policy will be English MDX rendered in the existing calm `DocumentPage`. It will use the
operator identity and contact details already configured on the site:

- Dmitrii Semenov, Individual Entrepreneur, Armenia;
- `support@keyflare.studio`;
- `https://www.keyflare.studio`.

It will describe:

- local calculation history, notes, selected assets, preferences, and cached data;
- rate-pair and crypto-search requests sent to the supporting service;
- technical request and security logs processed by the service and hosting provider;
- AppMetrica product analytics, diagnostics, identifiers, IP-derived information, and crash data;
- the application's deliberate exclusion of advertising identifiers and advertising;
- email content voluntarily sent for support;
- operating-system backup and transfer behavior;
- Apple/Google in-app purchase processing for the planned subscription;
- receipt, transaction, entitlement, or subscription-status information needed to verify and
  restore access;
- the fact that Ratebench does not directly receive payment-card or bank-account details;
- relevant third-party categories and current providers, including AppMetrica/Yandex, Render,
  CoinGecko, Frankfurter, optional Open Exchange Rates, Apple, and Google;
- purposes, disclosures, general retention principles, security, user choices and rights,
  international processing, policy changes, and contact.

The policy must not invent exact retention periods, a street address, a representative, a fixed
minimum age, a hosting country, or other facts that are not confirmed.

## Terms Of Service

The Terms of Service will be English MDX rendered in `DocumentPage`. It will be shorter and clearer
than the source draft while retaining the provisions that matter for a financial reference tool:

- Ratebench's informational and calculation-only purpose;
- a prominent financial disclaimer;
- limitations of indicative, cached, delayed, rounded, or incomplete market data;
- user responsibility for entered values, fees, notes, and device security;
- permitted use and concise prohibited conduct;
- intellectual property and feedback;
- third-party data sources and service availability;
- app updates, changes, suspension, and discontinuation;
- reasonable warranty and liability limitations subject to non-waivable law;
- changes to the Terms and contact details.

The subscription section will explain:

- subscriptions are purchased and billed by Apple or Google;
- renewal, billing, and cancellation are managed through the user's store account;
- access may depend on a valid subscription status;
- price changes follow the notice or consent flow required by the store and applicable law;
- refunds are handled under store rules and applicable law;
- purchase restoration is available through the relevant platform mechanisms.

The Terms will not invent a price, billing period, free trial, paid feature list, liability cap,
exclusive court, arbitration clause, or jurisdiction-specific waiver.

## Support Page

The Support page will include:

- `support@keyflare.studio` with a Ratebench-specific email subject;
- the current **In development** status for Android and iOS;
- a bug-report checklist covering platform, OS version, app version/build, affected feature, steps,
  expected result, and actual result;
- guidance for stale/offline rates and temporary service unavailability;
- clarification that history and notes are stored locally and may be affected by clearing data or
  uninstalling;
- subscription help, including purchase restoration and store-account subscription management;
- links to Ratebench Privacy Policy and Terms of Service.

## Components And Data Flow

All product content remains source-controlled and statically imported:

```text
product registry
  -> published-product guard
  -> prerender paths / sitemap / route checks
  -> custom overview or MDX document renderer
  -> static HTML output
```

There is no runtime CMS, backend dependency, live rate request, or client-only public route.

The custom overview consumes the registry `Product` object and local static assets. Privacy, Terms,
and Support content are registered MDX modules. The optional Terms route uses the same
`findPublishedProduct()` guard as other product routes and additionally verifies that Terms content
is configured.

## Error Handling And Publication Guards

- Unknown, draft, and fixture product slugs return `404`.
- A published product without configured Terms returns `404` on the Terms route.
- Validation fails for unknown custom overview or MDX keys.
- Validation fails if a published Ratebench entry is incomplete.
- Empty store links are never rendered.
- Ratebench's in-development platforms render as status text, not links or disabled controls that
  suggest an available download.
- Compliance pages contain no bracketed drafting instructions or unresolved placeholders.

## Testing And Verification

Implementation will use focused tests for:

- Ratebench registry metadata, platform status, subscription profile, and third-party services;
- optional Terms configuration and validation;
- published-only lookup and `404` behavior;
- Ratebench overview, Privacy, Terms, and Support server rendering;
- Ratebench prerender paths and sitemap participation;
- Palette Master routes remaining unchanged;
- fixture and draft exclusion;
- presence of the financial disclaimer and subscription disclosures;
- absence of source-draft placeholders.

Run the full release gate:

```bash
npm run check
```

Then run the production preview and visually inspect:

- product catalog;
- Ratebench overview at desktop and mobile widths;
- Privacy, Terms, and Support readability;
- direct loading of every Ratebench route;
- expected root files in the build output.

## Non-Goals

This work does not:

- launch the Ratebench apps or add store URLs;
- set subscription price, period, trial, or entitlement details;
- add live market data to the website;
- add accounts, checkout, payments, or a backend to the website;
- localize the product pages;
- change Palette Master content or visual design;
- constitute final jurisdiction-specific legal review.
