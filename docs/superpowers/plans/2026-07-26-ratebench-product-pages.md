# Ratebench Product Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish static Ratebench overview, Privacy Policy, Terms of Service, and Support pages with an in-development Studio Ledger presentation and subscription disclosures.

**Architecture:** Extend the product registry with optional release-stage and Terms metadata, then reuse the existing published-product guard and static MDX registries. Ratebench gets a custom prerender-safe overview component and three statically imported document modules; no website backend or runtime market-data request is introduced.

**Tech Stack:** React 19, React Router 8 framework mode, TypeScript, MDX, CSS Modules, Vitest, static prerendering.

---

## File Structure

**Create:**

- `app/routes/product-terms.tsx` — optional product Terms route and published/configured guard.
- `app/content/products/ratebench/Overview.tsx` — Ratebench Studio Ledger overview.
- `app/content/products/ratebench/Overview.module.css` — strict product-specific responsive styling.
- `app/content/products/ratebench/privacy.mdx` — concise factual Privacy Policy.
- `app/content/products/ratebench/terms.mdx` — concise Terms with financial and subscription provisions.
- `app/content/products/ratebench/support.mdx` — development support, troubleshooting, and subscription help.
- `public/products/ratebench/ratebench-logo.svg` — Ratebench logo copied from the product repository.
- `tests/content/ratebench-product.test.tsx` — focused registry, route, rendering, and placeholder tests.

**Modify:**

- `app/routes.ts` — register `/products/:slug/terms`.
- `app/content/products/types.ts` — add release stage, subscriptions, Terms presentation, and Ratebench keys.
- `app/content/products/registry.ts` — publish Ratebench and conditionally prerender Terms.
- `app/content/products/validate.ts` — validate optional Terms keys.
- `app/content/products/customOverviewPages.tsx` — register Ratebench overview.
- `app/content/products/customMdxContent.ts` — register Ratebench MDX documents.
- `app/components/ProductLinks.tsx` — conditionally link Terms and render in-development platform status.
- `app/components/ProductCard.tsx` — show Ratebench in-development status and avoid misleading platform controls.
- `app/routes/product-support.tsx` — conditionally link configured Terms.
- `tests/content/validate-products.test.ts` — cover Terms validation and required subscription profile field.
- `tests/content/product-routes.test.ts` — cover Terms publication guards.
- `tests/content/product-customization.test.ts` — update existing fixture shape.
- `tests/ui/visual-components.test.tsx` — update shared test products and cover conditional Terms links.
- `tests/static-routes.test.ts` — expect Ratebench prerender output.
- `.ai/SITE.md` — document the Terms URL.
- `.ai/PRODUCT_PAGES.md` — document release stage, subscriptions, and optional Terms.

**Remove after verified implementation:**

- `docs/superpowers/specs/2026-07-26-ratebench-product-pages-design.md`
- `docs/superpowers/plans/2026-07-26-ratebench-product-pages.md`

### Task 1: Add Optional Terms And Product Lifecycle Metadata

**Files:**

- Modify: `app/content/products/types.ts`
- Modify: `app/content/products/registry.ts`
- Modify: `app/content/products/validate.ts`
- Modify: `app/routes.ts`
- Create: `app/routes/product-terms.tsx`
- Test: `tests/content/validate-products.test.ts`
- Test: `tests/content/product-routes.test.ts`

- [ ] **Step 1: Write failing type/validation/route tests**

Add `usesSubscriptions: false` to all existing test privacy profiles, then add:

```ts
test("rejects published products with unknown Terms MDX content keys", () => {
  const productWithUnknownTerms: Product = {
    ...baseProduct,
    presentation: {
      ...baseProduct.presentation,
      terms: { mode: "mdx", contentKey: "missing-terms" as never },
    },
  };

  expect(validateProducts([productWithUnknownTerms])).toContain(
    "Published product sample references unknown MDX content: missing-terms",
  );
});
```

Extend `tests/content/product-routes.test.ts` with `getProductTermsProduct` in the fixture `404`
matrix and:

```ts
test("returns 404 for published products without configured Terms", () => {
  expectRoute404(getProductTermsProduct, "palette-master");
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
npm test -- tests/content/validate-products.test.ts tests/content/product-routes.test.ts
```

Expected: FAIL because `usesSubscriptions`, `presentation.terms`, and
`app/routes/product-terms.tsx` do not exist.

- [ ] **Step 3: Implement the minimal product types**

In `app/content/products/types.ts`, add:

```ts
export type ProductReleaseStage = "in-development";

export type ProductTermsPresentation = {
  mode: "mdx";
  contentKey: ProductMdxContentKey;
};
```

Add `usesSubscriptions: boolean` to `PrivacyProfile`, optional
`terms?: ProductTermsPresentation` to `ProductPresentation`, and optional
`releaseStage?: ProductReleaseStage` to `Product`. Add `"ratebench"` to
`productCustomOverviewKeys` and these keys to `productMdxContentKeys`:

```ts
"ratebench-privacy",
"ratebench-terms",
"ratebench-support",
```

- [ ] **Step 4: Implement Terms validation and routing**

In `validatePresentation()` validate `presentation.terms?.contentKey` with the same known-key
check used by support. Add the route:

```ts
route("products/:slug/terms", "./routes/product-terms.tsx"),
```

Create `app/routes/product-terms.tsx` with:

```tsx
import { createElement } from "react";
import type { Route } from "./+types/product-terms";
import { DocumentPage } from "~/components/DocumentPage";
import { PageHeader } from "~/components/PageHeader";
import { getProductMdxContent } from "~/content/products/customMdxContent";
import { productMdxComponents } from "~/content/products/mdxComponents";
import { findPublishedProduct } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: Route.MetaFunction = ({ params }) => {
  const product = findPublishedProduct(params.slug);

  return [
    {
      title: product
        ? `${product.name} Terms of Service - ${siteConfig.brandName}`
        : `Terms of Service - ${siteConfig.brandName}`,
    },
    {
      name: "description",
      content: product ? `Terms of Service for ${product.name}.` : "Terms of Service.",
    },
  ];
};

export function getProductTermsProduct(slug: string) {
  const product = findPublishedProduct(slug);

  if (!product?.presentation.terms) {
    throw new Response("Product terms not found", { status: 404 });
  }

  return product;
}

export function ProductTermsContent({
  product,
}: {
  product: ReturnType<typeof getProductTermsProduct>;
}) {
  const terms = product.presentation.terms;

  if (!terms) {
    throw new Response("Product terms not found", { status: 404 });
  }

  return (
    <>
      <PageHeader
        title={`${product.name} Terms of Service`}
        description={product.shortDescription}
        variant="document"
      />
      <DocumentPage>
        {createElement(getProductMdxContent(terms.contentKey), {
          components: productMdxComponents,
        })}
      </DocumentPage>
    </>
  );
}

export default function ProductTermsRoute({ params }: Route.ComponentProps) {
  const product = getProductTermsProduct(params.slug);
  return <ProductTermsContent product={product} />;
}
```

Conditionally append `/products/${product.slug}/terms` in `getPrerenderPaths()`.

- [ ] **Step 5: Run focused tests and commit**

Run the focused tests from Step 2. Expected: PASS.

```bash
git add app/content/products/types.ts app/content/products/registry.ts app/content/products/validate.ts app/routes.ts app/routes/product-terms.tsx tests/content/validate-products.test.ts tests/content/product-routes.test.ts
git commit -m "Add optional product terms pages"
```

### Task 2: Register Ratebench And Its Static Content

**Files:**

- Modify: `app/content/products/registry.ts`
- Modify: `app/content/products/customOverviewPages.tsx`
- Modify: `app/content/products/customMdxContent.ts`
- Create: `app/content/products/ratebench/privacy.mdx`
- Create: `app/content/products/ratebench/terms.mdx`
- Create: `app/content/products/ratebench/support.mdx`
- Create: `tests/content/ratebench-product.test.tsx`

- [ ] **Step 1: Write the failing Ratebench registry tests**

Create a focused test that expects:

```ts
expect(ratebench).toMatchObject({
  status: "published",
  slug: "ratebench",
  name: "Ratebench",
  type: "mobile-app",
  platforms: ["android", "ios"],
  releaseStage: "in-development",
  storeLinks: {},
  presentation: {
    overview: { mode: "custom", componentKey: "ratebench" },
    privacy: { mode: "mdx", contentKey: "ratebench-privacy" },
    terms: { mode: "mdx", contentKey: "ratebench-terms" },
    support: { mode: "mdx", contentKey: "ratebench-support" },
  },
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: true,
    usesCrashReporting: true,
    usesSubscriptions: true,
    hasAccounts: false,
    collectsPersonalData: true,
    requiresDataDeletionPage: false,
  },
});
```

Also assert all four Ratebench paths, registered content keys, and `validateProducts(products)` is
empty.

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
npm test -- tests/content/ratebench-product.test.tsx
```

Expected: FAIL because Ratebench is absent.

- [ ] **Step 3: Add the registry entry**

Add Ratebench after Palette Master:

```ts
{
  status: "published",
  slug: "ratebench",
  name: "Ratebench",
  type: "mobile-app",
  shortDescription:
    "A reference and calculation tool for comparing fiat and crypto exchange outcomes.",
  platforms: ["android", "ios"],
  releaseStage: "in-development",
  supportEmail: "support@keyflare.studio",
  lastUpdated: "2026-07-26",
  storeLinks: {},
  presentation: {
    overview: { mode: "custom", componentKey: "ratebench" },
    support: { mode: "mdx", contentKey: "ratebench-support" },
    privacy: { mode: "mdx", contentKey: "ratebench-privacy" },
    terms: { mode: "mdx", contentKey: "ratebench-terms" },
  },
  theme: {
    accentPrimary: "#196dff",
    accentSecondary: "#3cb200",
    accentTertiary: "#fea00a",
    ink: "#161618",
    surface: "#ffffff",
    gradient: "linear-gradient(90deg, #196dff 0 78%, #3cb200 78% 91%, #fea00a 91%)",
    visualVolume: "calm",
  },
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: true,
    usesCrashReporting: true,
    usesSubscriptions: true,
    hasAccounts: false,
    collectsPersonalData: true,
    requiresDataDeletionPage: false,
    thirdPartyServices: [
      "AppMetrica",
      "Render",
      "CoinGecko",
      "Frankfurter",
      "Open Exchange Rates",
      "Apple App Store",
      "Google Play",
    ],
  },
},
```

Set `usesSubscriptions: false` on the fixture and Palette Master.

- [ ] **Step 4: Register content modules**

Statically import `RatebenchOverview`, `RatebenchPrivacy`, `RatebenchTerms`, and
`RatebenchSupport`, and add their exact keys to the corresponding registries. Create initially
minimal MDX documents containing their final headings and `Last updated: July 26, 2026` footer so
imports compile before the content task.

- [ ] **Step 5: Run focused tests and commit**

Run:

```bash
npm test -- tests/content/ratebench-product.test.tsx tests/content/validate-products.test.ts
```

Expected: PASS.

```bash
git add app/content/products tests/content/ratebench-product.test.tsx
git commit -m "Register Ratebench product content"
```

### Task 3: Build The Studio Ledger Overview

**Files:**

- Create: `app/content/products/ratebench/Overview.tsx`
- Create: `app/content/products/ratebench/Overview.module.css`
- Create: `public/products/ratebench/ratebench-logo.svg`
- Modify: `app/components/ProductCard.tsx`
- Modify: `app/components/ProductLinks.tsx`
- Test: `tests/content/ratebench-product.test.tsx`
- Test: `tests/ui/visual-components.test.tsx`

- [ ] **Step 1: Write failing rendering assertions**

Assert the rendered custom overview contains:

```ts
expect(html).toContain("In development");
expect(html).toContain("Compare every step");
expect(html).toContain("Fiat & crypto");
expect(html).toContain("Multi-step calculations");
expect(html).toContain("Local history");
expect(html).toContain("not a financial institution");
expect(html).toContain("/products/ratebench/privacy/");
expect(html).toContain("/products/ratebench/terms/");
expect(html).toContain("/products/ratebench/support/");
expect(html).toContain("/products/ratebench/ratebench-logo.svg");
expect(html).not.toContain(">Android coming soon<");
expect(html).not.toContain(">iOS coming soon<");
```

Render `ProductCard` and `ProductLinks` for Ratebench and assert the status appears while store
actions do not.

- [ ] **Step 2: Run rendering tests and verify failure**

Run:

```bash
npm test -- tests/content/ratebench-product.test.tsx tests/ui/visual-components.test.tsx
```

Expected: FAIL because the final overview and shared stage behavior are missing.

- [ ] **Step 3: Copy the approved logo asset**

Read
`/Users/dmitry/Projects/exchange/app/ios/ios/Assets.xcassets/main_screen_logo.imageset/logo_light.svg`
and add the same SVG markup to `public/products/ratebench/ratebench-logo.svg` with `apply_patch`.
The file must preserve the source `viewBox`, paths, gray frame, black symbols, and Ratebench green
arrow. The asset is source-controlled product artwork from the owner's Ratebench repository.

- [ ] **Step 4: Implement the overview markup**

Build a semantic static article with:

- hero copy and `In development` pill;
- feedback, Privacy, Terms, and Support links;
- a labeled static example ledger using `1,000.00 USD`, `USD → EUR`, `EUR → USDT`, and
  `981.24 USDT`;
- feature sections for fiat/crypto, multi-step calculations, and local history;
- a financial disclaimer;
- non-interactive Android and iOS development status panels.

Use `product.name`, `product.slug`, and product theme CSS custom properties. Do not fetch rates,
start timers, or render values as live data.

- [ ] **Step 5: Implement Studio Ledger CSS**

Use a responsive two-column hero above 840px and one column below it. Apply:

```css
.overview {
  --ratebench-blue: var(--product-accent-primary, #196dff);
  --ratebench-green: var(--product-accent-secondary, #3cb200);
  --ratebench-amber: var(--product-accent-tertiary, #fea00a);
  display: grid;
  gap: var(--space-8);
  color: var(--product-ink, #161618);
}

.title,
.feature h2,
.disclaimer h2 {
  font-family: var(--font-display);
  letter-spacing: 0;
  text-transform: uppercase;
}

.ledgerValue {
  font-variant-numeric: tabular-nums;
}
```

Use thin neutral rules, white surfaces, one controlled product strip, tight radii, and a single
hard shadow. Add visible focus states and a reduced-motion-safe hover treatment.

- [ ] **Step 6: Implement shared release-stage behavior**

In both shared link components, if `product.releaseStage === "in-development"`:

- render one `In development · Android / iOS` status;
- do not render per-platform coming-soon buttons;
- still render feedback, Privacy, Terms, Support, and data deletion where configured.

For all other products, preserve existing store and coming-soon behavior. Render Terms only when
`product.presentation.terms` exists.

- [ ] **Step 7: Run tests and commit**

Run the tests from Step 2. Expected: PASS.

```bash
git add app/components app/content/products/ratebench public/products/ratebench tests
git commit -m "Build Ratebench Studio Ledger overview"
```

### Task 4: Write Final Privacy, Terms, And Support Documents

**Files:**

- Modify: `app/content/products/ratebench/privacy.mdx`
- Modify: `app/content/products/ratebench/terms.mdx`
- Modify: `app/content/products/ratebench/support.mdx`
- Modify: `app/routes/product-support.tsx`
- Test: `tests/content/ratebench-product.test.tsx`

- [ ] **Step 1: Write failing compliance-content tests**

Render the three documents and assert:

```ts
expect(privacyHtml).toContain("Information stored on your device");
expect(privacyHtml).toContain("AppMetrica");
expect(privacyHtml).toContain("Apple");
expect(privacyHtml).toContain("Google");
expect(privacyHtml).toContain("payment card");
expect(termsHtml).toContain("Important financial disclaimer");
expect(termsHtml).toContain("Subscriptions and billing");
expect(termsHtml).toContain("automatically renew");
expect(supportHtml).toContain("Restore purchases");
expect(supportHtml).toContain("In development");

for (const html of [privacyHtml, termsHtml, supportHtml]) {
  expect(html).not.toMatch(/\[(?:[A-Z][A-Z _-]+)\]/);
  expect(html).not.toContain("Drafting note");
}
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
npm test -- tests/content/ratebench-product.test.tsx
```

Expected: FAIL because the initial MDX documents are incomplete.

- [ ] **Step 3: Write the final Privacy Policy**

Use concise sections:

1. About this policy and operator.
2. Information stored on the device.
3. Rate requests, search, and service logs.
4. AppMetrica analytics and diagnostics.
5. Subscription purchase information processed through Apple/Google.
6. Support communications.
7. Information not requested.
8. Purposes and disclosures.
9. Retention and security without invented durations.
10. Choices, rights, children, international processing, changes, contact.

State that Ratebench may receive transaction, receipt, entitlement, and subscription-status data
needed to verify access, but does not directly receive the user's payment-card or bank-account
details.

- [ ] **Step 4: Write the final Terms of Service**

Use concise sections:

1. About Ratebench.
2. Important financial disclaimer.
3. Rates and calculations.
4. Eligibility and permitted use.
5. User inputs, local history, and device security.
6. Subscriptions and billing.
7. Prohibited conduct.
8. Third-party services and intellectual property.
9. Availability and changes.
10. Warranty/liability limits subject to non-waivable law.
11. Changes and contact.

Explain automatic renewal, store-account billing/cancellation, restoration, store/applicable-law
refund rules, and price-change notices without specifying price, period, trial, or paid features.

- [ ] **Step 5: Write final Support and cross-links**

Include the bug-report checklist, offline/stale-rate behavior, local history caveat, restore purchase
guidance, and Apple/Google subscription management guidance. In `ProductSupportContent`, add the
conditional Terms link beside Privacy.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- tests/content/ratebench-product.test.tsx tests/ui/visual-components.test.tsx
```

Expected: PASS.

```bash
git add app/content/products/ratebench app/routes/product-support.tsx tests
git commit -m "Add Ratebench legal and support documents"
```

### Task 5: Complete Route, Metadata, And Durable Guidance Coverage

**Files:**

- Modify: `tests/static-routes.test.ts`
- Modify: `tests/content/product-customization.test.ts`
- Modify: `tests/ui/visual-components.test.tsx`
- Modify: `.ai/SITE.md`
- Modify: `.ai/PRODUCT_PAGES.md`

- [ ] **Step 1: Add failing full-route expectations**

Expect:

```ts
"/products/ratebench",
"/products/ratebench/privacy",
"/products/ratebench/terms",
"/products/ratebench/support",
```

Also assert Palette Master has no Terms prerender path and fixture Terms are not public.

- [ ] **Step 2: Run the affected suite and verify failure**

Run:

```bash
npm test -- tests/static-routes.test.ts tests/content/product-customization.test.ts tests/ui/visual-components.test.tsx
```

Expected: FAIL until all existing fixtures and expectations match the expanded model.

- [ ] **Step 3: Update existing fixtures and expectations**

Add `usesSubscriptions: false` to all shared test product objects. Add conditional Terms assertions
without changing existing Palette Master overview and privacy expectations.

- [ ] **Step 4: Update durable documentation**

Add `/products/:slug/terms/` to the route model in `.ai/SITE.md`. In
`.ai/PRODUCT_PAGES.md`, document:

- optional `releaseStage: "in-development"`;
- optional Terms MDX presentation and conditional route generation;
- `usesSubscriptions` privacy metadata;
- store billing disclosures and the rule that Terms remain published-only and statically imported.

- [ ] **Step 5: Run tests and commit**

Run the affected suite from Step 2. Expected: PASS.

```bash
git add .ai tests
git commit -m "Document Ratebench product routing"
```

### Task 6: Full Verification, Visual QA, And Temporary-Document Cleanup

**Files:**

- Remove: `docs/superpowers/specs/2026-07-26-ratebench-product-pages-design.md`
- Remove: `docs/superpowers/plans/2026-07-26-ratebench-product-pages.md`

- [ ] **Step 1: Run the full release gate**

Run:

```bash
npm run check
```

Expected: content validation, typecheck, lint, formatting, tests, build, and route checks all pass.
Confirm `build/client/products/ratebench/index.html`, `privacy/index.html`, `terms/index.html`, and
`support/index.html` exist, along with `build/client/CNAME` and `build/client/app-ads.txt`.

- [ ] **Step 2: Start a production preview**

Run:

```bash
npm run preview -- --listen tcp://127.0.0.1:4173
```

Expected: local preview listens on port 4173.

- [ ] **Step 3: Perform browser visual and route QA**

Inspect at desktop and mobile widths:

```text
/products/
/products/ratebench/
/products/ratebench/privacy/
/products/ratebench/terms/
/products/ratebench/support/
```

Verify no horizontal overflow, readable documents, visible focus treatment, no store download
claim, correct `In development` status, and the approved Syne-led Studio Ledger hierarchy.

- [ ] **Step 4: Re-run targeted checks after any visual corrections**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

Expected: PASS.

- [ ] **Step 5: Remove temporary superpowers documents**

Delete the design spec and this plan after implementation is verified, preserving durable decisions
in `.ai/`.

- [ ] **Step 6: Run the final release gate and commit**

Run:

```bash
npm run check
git status --short
```

Expected: release gate PASS; only intended Ratebench changes and temporary-document deletions remain.

```bash
git add -A
git commit -m "Finalize Ratebench product pages"
```
