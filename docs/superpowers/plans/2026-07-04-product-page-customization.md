# Product Page Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add standard/custom product page support and MDX-based custom content sections so each product can have either a shared template or a fully custom presentation.

**Architecture:** Keep the current product registry as the source of truth for publication, validation, metadata, and prerendering. Add a presentation layer that lets published products choose between the existing standard route template and a product-specific React overview component. Add MDX imports for optional overview, support, privacy, and data-deletion sections without introducing a CMS or runtime content loading.

**Tech Stack:** React, TypeScript, React Router framework mode, Vite, MDX via `@mdx-js/rollup`, CSS Modules, Vitest.

---

## Current Context

The repository currently has a static React Router foundation:

- Product registry: `app/content/products/registry.ts`
- Product types: `app/content/products/types.ts`
- Product validation: `app/content/products/validate.ts`
- Public product routes:
  - `app/routes/products-index.tsx`
  - `app/routes/product-overview.tsx`
  - `app/routes/product-privacy.tsx`
  - `app/routes/product-support.tsx`
  - `app/routes/product-data-deletion.tsx`
- Standard reusable privacy sections: `app/content/products/privacyBlocks.ts`
- Static metadata generation: `scripts/generate-static-metadata.ts`
- Route output checks: `scripts/check-routes.ts`

Important existing behavior:

- Only `published` products are public.
- `draft` and `fixture` products must not render through public product routes.
- `getPrerenderPaths()` must only include static public routes and published product routes.
- `npm run check` is the main local release check.

## Desired Behavior

Products should support three levels of customization:

1. **Standard product pages**
   - Use the shared product overview/support/privacy route templates.
   - Best for simple apps and tools.

2. **Standard pages with MDX sections**
   - Keep the shared route layout.
   - Add product-specific MDX sections for richer copy, FAQ, support notes, screenshots copy, or policy overrides.

3. **Fully custom overview page**
   - Use a product-specific React component for `/products/:slug/`.
   - Keep publication, metadata, validation, privacy, support, and sitemap behavior controlled by the registry.

Example future product:

```ts
{
  status: "draft",
  slug: "palette-master",
  name: "Palette Master",
  type: "mobile-game",
  platforms: ["ios", "android"],
  presentation: {
    overview: { mode: "custom", componentKey: "palette-master" },
    support: { mode: "mdx", contentKey: "palette-master-support" },
    privacy: { mode: "generated-with-mdx", contentKey: "palette-master-privacy" }
  }
}
```

`Palette Master` is intentionally shown as `draft` in this plan. It should not become public until its real privacy/support content and store metadata are complete.

## Design Decisions

- MDX files are statically imported at build time.
- No CMS, runtime filesystem reads, or remote content loading.
- Custom overview pages are explicit imports in a registry map, not dynamic arbitrary imports.
- Privacy pages remain generated from structured privacy profile data, with optional MDX sections appended or inserted in documented places.
- Support pages can use the shared shell plus optional MDX body.
- Data deletion pages remain conditional on `privacyProfile.requiresDataDeletionPage`.
- A custom overview component must not bypass publication rules. Public routes still use `findPublishedProduct()`.

## File Structure

Create or modify:

```text
package.json
package-lock.json
vite.config.ts
app/vite-env.d.ts

app/content/products/types.ts
app/content/products/registry.ts
app/content/products/validate.ts
app/content/products/customOverviewPages.tsx
app/content/products/customMdxContent.ts
app/content/products/mdxComponents.tsx

app/content/products/palette-master/Overview.tsx
app/content/products/palette-master/overview.mdx
app/content/products/palette-master/support.mdx
app/content/products/palette-master/privacy-extra.mdx

app/routes/product-overview.tsx
app/routes/product-privacy.tsx
app/routes/product-support.tsx
app/routes/product-data-deletion.tsx

tests/content/product-customization.test.ts
tests/content/product-routes.test.ts
tests/content/validate-products.test.ts
```

## Product Model

Extend product types in `app/content/products/types.ts`.

Recommended additions:

```ts
export type ProductType = "mobile-app" | "mobile-game" | "desktop-app" | "tool" | "software";

export type ProductOverviewPresentation =
  | { mode: "standard" }
  | { mode: "standard-with-mdx"; contentKey: ProductMdxContentKey }
  | { mode: "custom"; componentKey: ProductCustomOverviewKey };

export type ProductSupportPresentation =
  { mode: "standard" } | { mode: "mdx"; contentKey: ProductMdxContentKey };

export type ProductPrivacyPresentation =
  { mode: "generated" } | { mode: "generated-with-mdx"; contentKey: ProductMdxContentKey };

export type ProductPresentation = {
  overview: ProductOverviewPresentation;
  support: ProductSupportPresentation;
  privacy: ProductPrivacyPresentation;
};

export type ProductCustomOverviewKey = "palette-master";

export type ProductMdxContentKey =
  "palette-master-overview" | "palette-master-support" | "palette-master-privacy-extra";
```

Add this field to `Product`:

```ts
presentation: ProductPresentation;
```

For existing fixture products, use:

```ts
presentation: {
  overview: { mode: "standard" },
  support: { mode: "standard" },
  privacy: { mode: "generated" },
}
```

## Custom Overview Registry

Create `app/content/products/customOverviewPages.tsx`.

The purpose is to keep custom product pages explicit and typechecked:

```tsx
import type { ComponentType } from "react";
import type { Product, ProductCustomOverviewKey } from "./types";
import { PaletteMasterOverview } from "./palette-master/Overview";

export type CustomProductOverviewProps = {
  product: Product;
};

export const customProductOverviewPages: Record<
  ProductCustomOverviewKey,
  ComponentType<CustomProductOverviewProps>
> = {
  "palette-master": PaletteMasterOverview,
};

export function getCustomProductOverview(key: ProductCustomOverviewKey) {
  return customProductOverviewPages[key];
}
```

## MDX Content Registry

Install MDX support:

```bash
npm install --save-dev @mdx-js/rollup @types/mdx
```

Update `vite.config.ts` so MDX runs before the React Router plugin:

```ts
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [{ enforce: "pre", ...mdx() }, reactRouter(), tsconfigPaths()],
});
```

Create `app/content/products/customMdxContent.ts`:

```ts
import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import type { ProductMdxContentKey } from "./types";
import PaletteMasterOverview from "./palette-master/overview.mdx";
import PaletteMasterPrivacyExtra from "./palette-master/privacy-extra.mdx";
import PaletteMasterSupport from "./palette-master/support.mdx";

export type ProductMdxComponent = ComponentType<{
  components?: MDXComponents;
}>;

export const productMdxContent: Record<ProductMdxContentKey, ProductMdxComponent> = {
  "palette-master-overview": PaletteMasterOverview,
  "palette-master-support": PaletteMasterSupport,
  "palette-master-privacy-extra": PaletteMasterPrivacyExtra,
};

export function getProductMdxContent(key: ProductMdxContentKey) {
  return productMdxContent[key];
}
```

Create `app/content/products/mdxComponents.tsx` for shared MDX rendering components:

```tsx
import type { MDXComponents } from "mdx/types";

export const productMdxComponents: MDXComponents = {
  h2: (props) => <h2 {...props} />,
  h3: (props) => <h3 {...props} />,
  p: (props) => <p {...props} />,
  ul: (props) => <ul {...props} />,
  ol: (props) => <ol {...props} />,
  li: (props) => <li {...props} />,
  a: (props) => <a {...props} />,
};
```

Update `app/vite-env.d.ts` if TypeScript needs explicit MDX import support:

```ts
/// <reference types="vite/client" />
/// <reference types="mdx" />
```

## Route Rendering Rules

### Product Overview

Modify `app/routes/product-overview.tsx`:

- Keep `findPublishedProduct()` and 404 behavior.
- Read `product.presentation.overview`.
- Render:
  - `standard`: existing standard overview template.
  - `standard-with-mdx`: standard overview plus MDX content.
  - `custom`: custom overview component from `customOverviewPages`.

Suggested structure:

```tsx
function StandardProductOverview({ product }: { product: Product }) {
  return (
    <>
      <PageHeader title={product.name} description={product.shortDescription} />
      <p>Type: {product.type}</p>
      <p>Platforms: {product.platforms.join(", ")}</p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
      <p>
        <Link to={`/products/${product.slug}/support/`}>Support</Link>
      </p>
      {product.privacyProfile.requiresDataDeletionPage ? (
        <p>
          <Link to={`/products/${product.slug}/data-deletion/`}>Data deletion</Link>
        </p>
      ) : null}
    </>
  );
}
```

Render selection:

```tsx
const overview = product.presentation.overview;

if (overview.mode === "custom") {
  const CustomOverview = getCustomProductOverview(overview.componentKey);
  return <CustomOverview product={product} />;
}

if (overview.mode === "standard-with-mdx") {
  const MdxContent = getProductMdxContent(overview.contentKey);
  return (
    <>
      <StandardProductOverview product={product} />
      <MdxContent components={productMdxComponents} />
    </>
  );
}

return <StandardProductOverview product={product} />;
```

### Product Support

Modify `app/routes/product-support.tsx`:

- Keep standard support shell with email and privacy link.
- If `product.presentation.support.mode === "mdx"`, append the matching MDX content.

### Product Privacy

Modify `app/routes/product-privacy.tsx`:

- Keep generated privacy sections from `getPrivacySections(product)`.
- If `product.presentation.privacy.mode === "generated-with-mdx"`, append the matching MDX content after generated sections.
- Do not let MDX replace required generated compliance sections.

### Product Data Deletion

Keep data deletion mostly standard.

Optional later extension:

```ts
dataDeletion?: { mode: "standard" | "mdx"; contentKey?: ProductMdxContentKey }
```

Do not add this until a real product needs it.

## Palette Master Example Files

These files should be added as examples but the product should remain `draft`.

Create `app/content/products/palette-master/Overview.tsx`:

```tsx
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import type { CustomProductOverviewProps } from "../customOverviewPages";

export function PaletteMasterOverview({ product }: CustomProductOverviewProps) {
  return (
    <>
      <PageHeader
        eyebrow="Mobile game"
        title={product.name}
        description={product.shortDescription}
      />
      <p>Palette Master is a color-focused mobile game for iOS and Android.</p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
      <p>
        <Link to={`/products/${product.slug}/support/`}>Support</Link>
      </p>
    </>
  );
}
```

Create `app/content/products/palette-master/overview.mdx`:

```mdx
## Gameplay

Palette Master is a color-focused puzzle game for mobile platforms.
```

Create `app/content/products/palette-master/support.mdx`:

```mdx
## Support Notes

For support, include the platform, app version, device model, and a short description of the issue.
```

Create `app/content/products/palette-master/privacy-extra.mdx`:

```mdx
## Product-Specific Notes

This section is reserved for Palette Master privacy details that are not covered by reusable disclosure blocks.
```

Add a `draft` Palette Master product to `app/content/products/registry.ts`:

```ts
{
  status: "draft",
  slug: "palette-master",
  name: "Palette Master",
  type: "mobile-game",
  shortDescription: "A color-focused mobile puzzle game.",
  platforms: ["ios", "android"],
  supportEmail: "semdm.am@gmail.com",
  lastUpdated: "2026-07-04",
  storeLinks: {},
  presentation: {
    overview: { mode: "custom", componentKey: "palette-master" },
    support: { mode: "mdx", contentKey: "palette-master-support" },
    privacy: { mode: "generated-with-mdx", contentKey: "palette-master-privacy-extra" },
  },
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: false,
    usesCrashReporting: false,
    hasAccounts: false,
    collectsPersonalData: false,
    requiresDataDeletionPage: false,
    thirdPartyServices: [],
  },
}
```

This product should not appear in `/products/`, `sitemap.xml`, or prerender output while it is `draft`.

## Validation Rules

Update `app/content/products/validate.ts`:

- Published products must have a valid `presentation`.
- `presentation.overview.mode === "custom"` requires `componentKey`.
- `presentation.overview.mode === "standard-with-mdx"` requires `contentKey`.
- `presentation.support.mode === "mdx"` requires `contentKey`.
- `presentation.privacy.mode === "generated-with-mdx"` requires `contentKey`.
- Validation must reject unknown component/content keys.
- Validation must continue to skip full published validation for `draft` and `fixture`, but duplicate slugs are still rejected for all products.

Recommended helpers:

```ts
import { customProductOverviewPages } from "./customOverviewPages";
import { productMdxContent } from "./customMdxContent";

function hasOwnKey<T extends object>(object: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(object, key);
}
```

For published products:

```ts
if (
  product.presentation.overview.mode === "custom" &&
  !hasOwnKey(customProductOverviewPages, product.presentation.overview.componentKey)
) {
  errors.push(`Published product ${product.slug} references unknown custom overview`);
}
```

Use similarly explicit messages for MDX content keys.

## Tests

Add `tests/content/product-customization.test.ts`.

Required coverage:

- Standard fixture product uses standard presentation.
- Draft `palette-master` exists but is not returned by `getPublishedProducts()`.
- `getPrerenderPaths()` does not include `/products/palette-master`.
- `findPublishedProduct("palette-master")` returns `undefined` while draft.
- Custom overview registry contains `palette-master`.
- MDX content registry contains:
  - `palette-master-overview`
  - `palette-master-support`
  - `palette-master-privacy-extra`
- Published product validation rejects an unknown custom overview key.
- Published product validation rejects an unknown MDX content key.
- Public route guards still 404 for `palette-master` while it is draft.

Keep existing fixture route tests from `tests/content/product-routes.test.ts`.

## Implementation Tasks

### Task 1: Add MDX Tooling

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `app/vite-env.d.ts`

- [ ] Install MDX dependencies.

```bash
npm install --save-dev @mdx-js/rollup @types/mdx
```

- [ ] Update `vite.config.ts` to include MDX before React Router.

- [ ] Update `app/vite-env.d.ts` with MDX types.

- [ ] Run:

```bash
npm run typecheck
npm run test
```

- [ ] Commit:

```bash
git add package.json package-lock.json vite.config.ts app/vite-env.d.ts
git commit -m "chore: add MDX support"
```

### Task 2: Extend Product Presentation Types

**Files:**

- Modify: `app/content/products/types.ts`
- Modify: `app/content/products/registry.ts`
- Modify: `tests/content/validate-products.test.ts`

- [ ] Add product presentation types.
- [ ] Add `"mobile-game"` to `ProductType`.
- [ ] Add `presentation` to all existing product registry entries.
- [ ] Update tests that construct `Product` objects with standard presentation.
- [ ] Run:

```bash
npm run test -- tests/content/validate-products.test.ts
npm run typecheck
```

- [ ] Commit:

```bash
git add app/content/products/types.ts app/content/products/registry.ts tests/content/validate-products.test.ts
git commit -m "feat: add product presentation model"
```

### Task 3: Add Custom Page And MDX Registries

**Files:**

- Create: `app/content/products/customOverviewPages.tsx`
- Create: `app/content/products/customMdxContent.ts`
- Create: `app/content/products/mdxComponents.tsx`
- Create: `app/content/products/palette-master/Overview.tsx`
- Create: `app/content/products/palette-master/overview.mdx`
- Create: `app/content/products/palette-master/support.mdx`
- Create: `app/content/products/palette-master/privacy-extra.mdx`

- [ ] Add explicit custom overview registry.
- [ ] Add explicit MDX content registry.
- [ ] Add shared MDX components.
- [ ] Add Palette Master example custom overview and MDX files.
- [ ] Run:

```bash
npm run typecheck
npm run test
```

- [ ] Commit:

```bash
git add app/content/products
git commit -m "feat: add custom product content registries"
```

### Task 4: Add Draft Palette Master Product

**Files:**

- Modify: `app/content/products/registry.ts`
- Modify: `tests/content/product-customization.test.ts`

- [ ] Add `Palette Master` as `draft` with custom overview and MDX presentation.
- [ ] Add tests proving it is not public while draft.
- [ ] Run:

```bash
npm run test -- tests/content/product-customization.test.ts
npm run check
```

- [ ] Commit:

```bash
git add app/content/products/registry.ts tests/content/product-customization.test.ts
git commit -m "feat: add Palette Master draft product"
```

### Task 5: Render Custom Overview And MDX Sections

**Files:**

- Modify: `app/routes/product-overview.tsx`
- Modify: `app/routes/product-support.tsx`
- Modify: `app/routes/product-privacy.tsx`
- Modify: `tests/content/product-customization.test.ts`
- Modify: `tests/content/product-routes.test.ts`

- [ ] Update overview route to support `standard`, `standard-with-mdx`, and `custom`.
- [ ] Update support route to append MDX content when configured.
- [ ] Update privacy route to append MDX content after generated privacy sections when configured.
- [ ] Keep route guards published-only.
- [ ] Add tests for route guards and rendering selection helpers.
- [ ] Run:

```bash
npm run test -- tests/content/product-customization.test.ts tests/content/product-routes.test.ts
npm run check
```

- [ ] Commit:

```bash
git add app/routes tests/content
git commit -m "feat: render custom product content"
```

### Task 6: Validate Presentation References

**Files:**

- Modify: `app/content/products/validate.ts`
- Modify: `tests/content/validate-products.test.ts`

- [ ] Validate published product custom overview keys.
- [ ] Validate published product MDX content keys.
- [ ] Add negative tests for unknown custom overview and unknown MDX content keys.
- [ ] Keep existing validation behavior for slugs, dates, HTTPS store links, and required published fields.
- [ ] Run:

```bash
npm run test -- tests/content/validate-products.test.ts
npm run validate:content
npm run check
```

- [ ] Commit:

```bash
git add app/content/products/validate.ts tests/content/validate-products.test.ts
git commit -m "feat: validate product presentation references"
```

### Task 7: Final Verification

**Files:**

- Inspect all changed files.

- [ ] Run:

```bash
npm run check
```

- [ ] Build and preview locally:

```bash
npm run build
npm run preview -- --listen tcp://127.0.0.1:4173
```

- [ ] Verify:
  - `/products/` still renders.
  - `/products/palette-master/` returns 404 while Palette Master is draft.
  - Existing static routes still return 200.
  - `/sitemap.xml` does not contain `palette-master`.
  - `/app-ads.txt` and `/CNAME` still return the preserved production values.

- [ ] Stop preview server.

- [ ] Commit any final fixes with a focused message.

## Acceptance Criteria

- `npm run check` passes.
- MDX imports work in TypeScript and Vite build.
- Existing standard product page behavior remains available.
- A product can opt into a custom overview component.
- A product can opt into MDX overview/support/privacy sections.
- Draft and fixture products cannot render through public product routes.
- `Palette Master` exists as a draft example and is not public.
- `getPrerenderPaths()` and `sitemap.xml` include only published products.
- `public/CNAME` and `public/app-ads.txt` remain unchanged.

## Out Of Scope

- Final visual design for `Palette Master`.
- Real screenshots, trailers, icons, or store badges.
- Legal review of final privacy policy language.
- Publishing `Palette Master`.
- Adding a CMS.
- Adding Playwright visual tests.

## Self-Review Checklist For Implementing Agent

- Confirm all public product routes use `findPublishedProduct()` or an equivalent published-only guard.
- Confirm `palette-master` is draft and absent from prerender output.
- Confirm custom overview and MDX registries are explicit static maps.
- Confirm no runtime filesystem reads or remote content loading were added.
- Confirm all new product type fields are represented in tests.
- Confirm `npm run check` passes after the final task.
