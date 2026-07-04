# Keyflare Studio Visual Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Chromatic Poster visual system, calm document mode, and themed product chassis for the static Keyflare Studio website.

**Architecture:** Keep the existing React Router static architecture and product registry as the source of truth. Add a visual layer made from global design tokens, focused reusable components, optional product theme metadata, and route-level composition updates. Preserve the current product customization modes: standard overview, standard-with-MDX overview, custom overview, MDX support, and generated-with-MDX privacy.

**Tech Stack:** React, TypeScript, React Router framework mode, Vite, CSS Modules, global CSS tokens, MDX, Vitest, Prettier, ESLint.

---

## Source Specification

Implement the approved visual direction from:

```text
docs/superpowers/specs/2026-07-04-keyflare-studio-visual-design.md
```

The design direction is:

- Chromatic Poster identity.
- Angular Art-School display typography.
- Loud homepage/catalog/product overview surfaces.
- Calm document mode for privacy, support, legal, and data deletion pages.
- Themed Product Chassis for product pages.
- Compatibility with the current product customization implementation on `main`.

## Current Product Customization Context

The current code already supports:

- `presentation.overview.mode: "standard"`;
- `presentation.overview.mode: "standard-with-mdx"`;
- `presentation.overview.mode: "custom"`;
- `presentation.support.mode: "standard" | "mdx"`;
- `presentation.privacy.mode: "generated" | "generated-with-mdx"`;
- explicit custom overview registration in `app/content/products/customOverviewPages.tsx`;
- explicit MDX content registration in `app/content/products/customMdxContent.ts`;
- shared MDX rendering components in `app/content/products/mdxComponents.tsx`;
- draft `Palette Master` product using a custom overview and MDX support/privacy additions.

Do not bypass publication rules. Public routes must continue using `findPublishedProduct()` or an equivalent published-only guard.

## File Structure

Create or modify the following files.

```text
package.json
package-lock.json

app/root.tsx
app/styles/tokens.css
app/styles/global.css

app/components/SiteShell.tsx
app/components/SiteShell.module.css
app/components/PageHeader.tsx
app/components/PageHeader.module.css
app/components/ProductCard.tsx
app/components/ProductCard.module.css
app/components/ProductLinks.tsx
app/components/ProductLinks.module.css
app/components/DocumentPage.tsx
app/components/DocumentPage.module.css

app/content/products/types.ts
app/content/products/registry.ts
app/content/products/validate.ts
app/content/products/mdxComponents.tsx
app/content/products/mdxComponents.module.css
app/content/products/palette-master/Overview.tsx
app/content/products/palette-master/Overview.module.css

app/routes/home.tsx
app/routes/products-index.tsx
app/routes/product-overview.tsx
app/routes/product-support.tsx
app/routes/product-privacy.tsx
app/routes/product-data-deletion.tsx
app/routes/about.tsx
app/routes/contact.tsx
app/routes/legal.tsx
app/routes/legal-privacy.tsx

tests/content/product-customization.test.ts
tests/content/validate-products.test.ts
tests/ui/visual-components.test.tsx
```

Responsibilities:

- `tokens.css`: global brand colors, typography variables, spacing, borders, and document/product page tokens.
- `global.css`: base document styling, focus states, link behavior, body background, and utility-safe defaults.
- `SiteShell`: stable studio shell with bold navigation and legal footer.
- `PageHeader`: reusable header with visual variants for poster and document pages.
- `ProductLinks`: reusable product link cluster for overview, privacy, support, data deletion, and store links.
- `DocumentPage`: calm page wrapper for legal, privacy, support, contact, and data deletion content.
- `ProductCard`: catalog launch-board item with product theme support.
- `ProductTheme` additions in `types.ts`: optional product theme tokens for the Themed Product Chassis.
- `mdxComponents`: branded MDX elements for product overview/support/privacy additions.
- `PaletteMasterOverview`: first custom overview page using the new visual system while remaining draft-only.

---

### Task 1: Add Typography And Global Visual Tokens

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/root.tsx`
- Replace: `app/styles/tokens.css`
- Replace: `app/styles/global.css`

- [ ] **Step 1: Install local font packages**

Run:

```bash
npm install @fontsource/syne @fontsource/space-grotesk
```

Expected:

- `package.json` gains `@fontsource/syne` and `@fontsource/space-grotesk`.
- `package-lock.json` updates.
- Command exits `0`.

- [ ] **Step 2: Import the font weights in `app/root.tsx`**

Modify `app/root.tsx` so the imports at the top are:

```tsx
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import { SiteShell } from "~/components/SiteShell";
import globalStyles from "~/styles/global.css?url";
```

Keep the rest of the file unchanged.

- [ ] **Step 3: Replace `app/styles/tokens.css` with Chromatic Poster tokens**

Use this token structure:

```css
:root {
  --color-paper: #fff4d7;
  --color-paper-soft: #fffaf0;
  --color-ink: #15111c;
  --color-ink-soft: #3e3448;
  --color-muted: #665d70;
  --color-surface: #ffffff;
  --color-surface-tint: #f8efe2;
  --color-border: #15111c;
  --color-border-soft: #d9d2c2;
  --color-accent-red: #ff4f64;
  --color-accent-amber: #ffb000;
  --color-accent-green: #19d3a2;
  --color-accent-blue: #2563ff;
  --color-link: #174be8;
  --color-link-hover: #102fa3;
  --color-document-bg: #fffdf8;
  --color-document-rail: #ff4f64;
  --gradient-chromatic: linear-gradient(
    90deg,
    var(--color-accent-red),
    var(--color-accent-amber),
    var(--color-accent-green),
    var(--color-accent-blue)
  );
  --gradient-product: linear-gradient(135deg, #ff4f64 0%, #ffb000 38%, #19d3a2 68%, #2563ff 100%);
  --font-display: "Syne", "Arial Black", system-ui, sans-serif;
  --font-sans:
    "Space Grotesk", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --layout-max: 74rem;
  --layout-wide: 88rem;
  --layout-readable: 46rem;
  --shadow-poster: 0.55rem 0.55rem 0 var(--color-ink);
  --shadow-soft: 0 1.5rem 4rem rgb(21 17 28 / 14%);
}
```

- [ ] **Step 4: Replace `app/styles/global.css` with base styling**

Use this file:

```css
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background:
    linear-gradient(90deg, rgb(21 17 28 / 5%) 1px, transparent 1px),
    linear-gradient(180deg, rgb(21 17 28 / 4%) 1px, transparent 1px), var(--color-paper);
  background-size: 2.25rem 2.25rem;
  color: var(--color-ink);
  font-family: var(--font-sans);
}

body {
  margin: 0;
}

body::selection {
  color: var(--color-ink);
  background: var(--color-accent-amber);
}

a {
  color: var(--color-link);
  font-weight: 700;
  text-decoration-thickness: 0.12em;
  text-underline-offset: 0.18em;
}

a:hover {
  color: var(--color-link-hover);
}

a:focus-visible,
button:focus-visible {
  outline: 3px solid var(--color-accent-blue);
  outline-offset: 3px;
}

main {
  min-height: 60vh;
}

h1,
h2,
h3,
p {
  overflow-wrap: anywhere;
}

img,
svg {
  max-width: 100%;
}
```

- [ ] **Step 5: Run formatting check for changed CSS/TSX**

Run:

```bash
npm run format:check -- app/root.tsx app/styles/tokens.css app/styles/global.css
```

Expected: command exits `0`.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add package.json package-lock.json app/root.tsx app/styles/tokens.css app/styles/global.css
git commit -m "feat: add visual design tokens"
```

Expected: commit succeeds.

---

### Task 2: Build Shared Product And Document Components

**Files:**

- Create: `app/components/ProductLinks.tsx`
- Create: `app/components/ProductLinks.module.css`
- Create: `app/components/DocumentPage.tsx`
- Create: `app/components/DocumentPage.module.css`
- Create: `tests/ui/visual-components.test.tsx`

- [ ] **Step 1: Create `ProductLinks` component**

Create `app/components/ProductLinks.tsx`:

```tsx
import { Link } from "react-router";
import type { Product } from "~/content/products/types";
import styles from "./ProductLinks.module.css";

export function ProductLinks({ product }: { product: Product }) {
  const storeLinks = Object.entries(product.storeLinks);

  return (
    <nav className={styles.links} aria-label={`${product.name} links`}>
      <Link className={styles.primaryLink} to={`/products/${product.slug}/`}>
        Overview
      </Link>
      <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
      <Link to={`/products/${product.slug}/support/`}>Support</Link>
      {product.privacyProfile.requiresDataDeletionPage ? (
        <Link to={`/products/${product.slug}/data-deletion/`}>Data deletion</Link>
      ) : null}
      {storeLinks.map(([platform, href]) => (
        <a key={platform} href={href} rel="noreferrer" target="_blank">
          {platform}
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Create `ProductLinks` styles**

Create `app/components/ProductLinks.module.css`:

```css
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.links a {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.85rem;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-sm);
  color: var(--color-ink);
  background: var(--color-paper-soft);
  box-shadow: 0.22rem 0.22rem 0 var(--color-ink);
  font-size: 0.92rem;
  font-weight: 800;
  text-decoration: none;
  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    background 140ms ease;
}

.links a:hover {
  color: var(--color-ink);
  background: var(--color-accent-amber);
  box-shadow: 0.14rem 0.14rem 0 var(--color-ink);
  transform: translate(0.08rem, 0.08rem);
}

.primaryLink {
  background: var(--gradient-chromatic) !important;
}
```

- [ ] **Step 3: Create `DocumentPage` component**

Create `app/components/DocumentPage.tsx`:

```tsx
import styles from "./DocumentPage.module.css";

export function DocumentPage({ children }: { children: React.ReactNode }) {
  return <article className={styles.document}>{children}</article>;
}
```

- [ ] **Step 4: Create `DocumentPage` styles**

Create `app/components/DocumentPage.module.css`:

```css
.document {
  position: relative;
  max-width: var(--layout-readable);
  padding: var(--space-8);
  border: 1px solid var(--color-border-soft);
  border-left: 0.55rem solid var(--color-document-rail);
  border-radius: var(--radius-md);
  background: var(--color-document-bg);
  box-shadow: var(--shadow-soft);
}

.document h2 {
  margin: var(--space-8) 0 var(--space-3);
  color: var(--color-ink);
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  line-height: 1.15;
}

.document h2:first-child {
  margin-top: 0;
}

.document h3 {
  margin: var(--space-6) 0 var(--space-2);
  font-size: 1.1rem;
}

.document p,
.document li {
  color: var(--color-ink-soft);
  line-height: 1.72;
}

.document ul,
.document ol {
  padding-left: 1.25rem;
}

@media (max-width: 640px) {
  .document {
    padding: var(--space-6);
  }
}
```

- [ ] **Step 5: Add component render tests**

Create `tests/ui/visual-components.test.tsx`:

```tsx
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { DocumentPage } from "../../app/components/DocumentPage";
import { ProductLinks } from "../../app/components/ProductLinks";
import type { Product } from "../../app/content/products/types";

const product: Product = {
  status: "published",
  slug: "visual-test-product",
  name: "Visual Test Product",
  type: "mobile-app",
  shortDescription: "A product used by visual component tests.",
  platforms: ["ios", "android"],
  supportEmail: "support@example.com",
  lastUpdated: "2026-07-04",
  storeLinks: {
    ios: "https://apps.apple.com/example",
  },
  presentation: {
    overview: { mode: "standard" },
    support: { mode: "standard" },
    privacy: { mode: "generated" },
  },
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: false,
    usesCrashReporting: false,
    hasAccounts: true,
    collectsPersonalData: true,
    requiresDataDeletionPage: true,
    thirdPartyServices: [],
  },
};

function renderWithRouter(element: React.ReactElement) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, element));
}

describe("visual components", () => {
  test("ProductLinks renders overview, policy, support, data deletion, and store links", () => {
    const html = renderWithRouter(createElement(ProductLinks, { product }));

    expect(html).toContain("/products/visual-test-product/");
    expect(html).toContain("/products/visual-test-product/privacy/");
    expect(html).toContain("/products/visual-test-product/support/");
    expect(html).toContain("/products/visual-test-product/data-deletion/");
    expect(html).toContain("https://apps.apple.com/example");
  });

  test("DocumentPage renders a calm document wrapper", () => {
    const html = renderToStaticMarkup(
      createElement(DocumentPage, null, createElement("p", null, "Readable policy text")),
    );

    expect(html).toContain("Readable policy text");
  });
});
```

- [ ] **Step 6: Run the new tests**

Run:

```bash
npm run test -- tests/ui/visual-components.test.tsx
```

Expected: the new test file passes.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add app/components/ProductLinks.tsx app/components/ProductLinks.module.css app/components/DocumentPage.tsx app/components/DocumentPage.module.css tests/ui/visual-components.test.tsx
git commit -m "feat: add visual layout components"
```

Expected: commit succeeds.

---

### Task 3: Redesign The Studio Shell, Page Header, Homepage, And Catalog

**Files:**

- Modify: `app/components/SiteShell.tsx`
- Replace: `app/components/SiteShell.module.css`
- Modify: `app/components/PageHeader.tsx`
- Replace: `app/components/PageHeader.module.css`
- Modify: `app/routes/home.tsx`
- Modify: `app/routes/products-index.tsx`
- Modify: `app/components/ProductCard.tsx`
- Replace: `app/components/ProductCard.module.css`
- Modify: `tests/ui/visual-components.test.tsx`

- [ ] **Step 1: Extend `PageHeader` with variants**

Modify `app/components/PageHeader.tsx`:

```tsx
import styles from "./PageHeader.module.css";

export function PageHeader({
  eyebrow,
  title,
  description,
  variant = "poster",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  variant?: "poster" | "document";
}) {
  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
```

- [ ] **Step 2: Replace `PageHeader.module.css`**

Use this structure:

```css
.header {
  position: relative;
  display: grid;
  gap: var(--space-3);
  max-width: 58rem;
}

.poster {
  padding-block: var(--space-4);
}

.poster::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: auto auto 0 -0.25rem;
  width: min(18rem, 60vw);
  height: 0.8rem;
  background: var(--gradient-chromatic);
  transform: rotate(-1deg);
}

.document {
  max-width: var(--layout-readable);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-border-soft);
}

.eyebrow {
  color: var(--color-ink-soft);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 7vw, 6.2rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.86;
  text-transform: uppercase;
}

.document .title {
  font-family: var(--font-sans);
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1;
  text-transform: none;
}

.description {
  max-width: 42rem;
  margin: 0;
  color: var(--color-muted);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.58;
}
```

- [ ] **Step 3: Update `SiteShell.tsx` markup**

Modify `app/components/SiteShell.tsx` to use brand mark and richer footer:

```tsx
import { Link } from "react-router";
import { siteConfig } from "~/content/site";
import styles from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.nav}`}>
          <Link className={styles.brand} to="/" aria-label={`${siteConfig.brandName} home`}>
            <span className={styles.brandMark}>K</span>
            <span>{siteConfig.brandName}</span>
          </Link>
          <nav className={styles.links} aria-label="Main navigation">
            <Link to="/products/">Products</Link>
            <Link to="/about/">About</Link>
            <Link to="/legal/">Legal</Link>
            <Link to="/contact/">Contact</Link>
          </nav>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerContent}`}>
          <div>
            <strong>{siteConfig.brandName}</strong>
            <p>Independent software products for mobile, desktop, and app-store surfaces.</p>
          </div>
          <div className={styles.legal}>Operated by {siteConfig.legalOperator}.</div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 4: Replace `SiteShell.module.css`**

Use this structure:

```css
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  z-index: 10;
  top: 0;
  border-bottom: 2px solid var(--color-ink);
  background: rgb(255 250 240 / 92%);
  backdrop-filter: blur(14px);
}

.inner {
  width: min(100% - 2rem, var(--layout-wide));
  margin: 0 auto;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  min-height: 4.5rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-ink);
  font-weight: 900;
  text-decoration: none;
}

.brandMark {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-sm);
  background: var(--gradient-chromatic);
  box-shadow: 0.18rem 0.18rem 0 var(--color-ink);
  font-family: var(--font-display);
  line-height: 1;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.links a {
  padding: 0.35rem 0.55rem;
  color: var(--color-ink);
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
}

.links a:hover {
  background: var(--color-accent-amber);
}

.content {
  flex: 1;
  width: min(100% - 2rem, var(--layout-wide));
  margin: var(--space-12) auto 0;
}

.footer {
  border-top: 2px solid var(--color-ink);
  margin-top: var(--space-20);
  background: var(--color-ink);
  color: var(--color-paper-soft);
}

.footerContent {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-8);
  padding: var(--space-8) 0;
}

.footer p,
.legal {
  margin: var(--space-2) 0 0;
  color: rgb(255 250 240 / 72%);
  line-height: 1.55;
}

@media (max-width: 720px) {
  .nav,
  .footerContent {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }

  .nav {
    flex-direction: column;
    padding: var(--space-4) 0;
  }
}
```

- [ ] **Step 5: Redesign the homepage**

Modify `app/routes/home.tsx` to include a poster hero and product signal grid:

```tsx
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { getPublishedProducts } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.brandName} - Software Products` },
  {
    name: "description",
    content: "Official product hub for Keyflare Studio apps and software.",
  },
];

export default function HomeRoute() {
  const products = getPublishedProducts();

  return (
    <div className="home-layout">
      <section className="home-hero" aria-labelledby="home-title">
        <PageHeader
          eyebrow="Independent software studio"
          title={siteConfig.brandName}
          description="Tiny apps, loud ideas. Mobile games, tools, and software products with a bright studio pulse."
        />
        <div className="home-actions">
          <Link to="/products/">View products</Link>
          <Link to="/contact/">Contact studio</Link>
        </div>
      </section>
      <section className="home-poster" aria-label="Studio product signals">
        <div className="poster-number">01</div>
        <div className="poster-title">Apps / Games / Tools</div>
        <p>
          Store-facing product pages, support links, and privacy policies wrapped in a visual system
          with teeth.
        </p>
        <div className="poster-strip" />
      </section>
      <section className="home-products" aria-label="Published products">
        <h2>Launch board</h2>
        <p>
          {products.length > 0
            ? "Published products appear here with store-safe links."
            : "Published products will appear here once they are ready for app-store submission."}
        </p>
      </section>
    </div>
  );
}
```

Add the route-specific classes to `app/styles/global.css` at the end. Keep this CSS in global only for route-level composition:

```css
.home-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.7fr);
  gap: var(--space-8);
  align-items: stretch;
}

.home-hero {
  display: grid;
  align-content: center;
  min-height: min(38rem, calc(100vh - 9rem));
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-8);
}

.home-actions a {
  padding: 0.8rem 1rem;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-sm);
  color: var(--color-ink);
  background: var(--color-paper-soft);
  box-shadow: var(--shadow-poster);
  text-decoration: none;
}

.home-actions a:first-child {
  background: var(--gradient-chromatic);
}

.home-poster {
  position: relative;
  display: grid;
  align-content: end;
  min-height: 32rem;
  padding: var(--space-6);
  overflow: hidden;
  border: 2px solid var(--color-ink);
  background: var(--color-paper-soft);
  box-shadow: var(--shadow-poster);
}

.home-poster::before {
  content: "";
  position: absolute;
  inset: 4rem -5rem auto auto;
  width: 22rem;
  height: 7rem;
  background: var(--gradient-chromatic);
  transform: rotate(17deg);
}

.poster-number {
  position: absolute;
  top: var(--space-6);
  left: var(--space-6);
  font-family: var(--font-display);
  font-size: clamp(3rem, 9vw, 8rem);
  font-weight: 800;
  line-height: 0.8;
}

.poster-title {
  position: relative;
  z-index: 1;
  max-width: 16rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 0.9;
  text-transform: uppercase;
}

.home-poster p {
  position: relative;
  z-index: 1;
  color: var(--color-ink-soft);
  line-height: 1.55;
}

.poster-strip {
  position: absolute;
  right: var(--space-6);
  bottom: var(--space-6);
  width: 7rem;
  height: 1rem;
  background: var(--color-accent-green);
}

.home-products {
  grid-column: 1 / -1;
  max-width: var(--layout-readable);
}

.home-products h2 {
  margin-bottom: var(--space-2);
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 0.95;
  text-transform: uppercase;
}

@media (max-width: 860px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .home-hero {
    min-height: auto;
  }
}
```

- [ ] **Step 6: Update `ProductCard.tsx` to use `ProductLinks`**

Modify `app/components/ProductCard.tsx`:

```tsx
import type { Product } from "~/content/products/types";
import { ProductLinks } from "./ProductLinks";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      <div className={styles.marker}>{product.type}</div>
      <h2 className={styles.title}>{product.name}</h2>
      <p className={styles.description}>{product.shortDescription}</p>
      <div className={styles.meta}>{product.platforms.join(" / ")}</div>
      <ProductLinks product={product} />
    </article>
  );
}
```

- [ ] **Step 7: Replace `ProductCard.module.css`**

Use this structure:

```css
.card {
  position: relative;
  display: grid;
  gap: var(--space-4);
  min-height: 17rem;
  padding: var(--space-6);
  overflow: hidden;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-md);
  background: var(--color-paper-soft);
  box-shadow: var(--shadow-poster);
}

.card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 0.85rem;
  background: var(--gradient-chromatic);
}

.marker,
.meta {
  color: var(--color-ink-soft);
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.title {
  margin: var(--space-4) 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  line-height: 0.9;
  text-transform: uppercase;
}

.description {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}
```

- [ ] **Step 8: Update catalog route layout**

Modify `app/routes/products-index.tsx` so the product list is wrapped:

```tsx
import type { MetaFunction } from "react-router";
import { ProductCard } from "~/components/ProductCard";
import { PageHeader } from "~/components/PageHeader";
import { getPublishedProducts } from "~/content/products/registry";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Products - ${siteConfig.brandName}` },
  { name: "description", content: `Products published by ${siteConfig.brandName}.` },
];

export default function ProductsIndexRoute() {
  const products = getPublishedProducts();

  return (
    <div className="catalog-layout">
      <PageHeader
        eyebrow="Launch board"
        title="Products"
        description={`Mobile apps, desktop apps, and software products from ${siteConfig.brandName}.`}
      />
      {products.length === 0 ? (
        <section className="catalog-empty">
          <h2>No public launches yet</h2>
          <p>
            Published products will appear here once their store, support, and policy pages are
            ready.
          </p>
        </section>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

Add the catalog classes to the end of `app/styles/global.css`:

```css
.catalog-layout {
  display: grid;
  gap: var(--space-10);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: var(--space-6);
}

.catalog-empty {
  max-width: var(--layout-readable);
  padding: var(--space-8);
  border: 2px dashed var(--color-ink);
  border-radius: var(--radius-md);
  background: var(--color-paper-soft);
}

.catalog-empty h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 0.95;
  text-transform: uppercase;
}
```

- [ ] **Step 9: Extend visual component tests**

Add this test to `tests/ui/visual-components.test.tsx`:

```tsx
test("ProductCard includes product metadata and shared product links", async () => {
  const { ProductCard } = await import("../../app/components/ProductCard");
  const html = renderWithRouter(createElement(ProductCard, { product }));

  expect(html).toContain("Visual Test Product");
  expect(html).toContain("mobile-app");
  expect(html).toContain("ios / android");
  expect(html).toContain("/products/visual-test-product/privacy/");
});
```

- [ ] **Step 10: Run focused tests and typecheck**

Run:

```bash
npm run test -- tests/ui/visual-components.test.tsx
npm run typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 11: Commit Task 3**

Run:

```bash
git add app/components app/routes/home.tsx app/routes/products-index.tsx app/styles/global.css tests/ui/visual-components.test.tsx
git commit -m "feat: redesign studio shell and catalog"
```

Expected: commit succeeds.

---

### Task 4: Add Optional Product Theme Metadata

**Files:**

- Modify: `app/content/products/types.ts`
- Modify: `app/content/products/registry.ts`
- Modify: `app/content/products/validate.ts`
- Modify: `tests/content/validate-products.test.ts`

- [ ] **Step 1: Extend product types with optional theme metadata**

Add these types to `app/content/products/types.ts` after `ProductPresentation`:

```ts
export type ProductVisualVolume = "calm" | "poster" | "immersive";

export type ProductTheme = {
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  ink: string;
  surface: string;
  gradient: string;
  visualVolume: ProductVisualVolume;
};
```

Then add this optional field to `Product`:

```ts
  theme?: ProductTheme;
```

- [ ] **Step 2: Add a theme to Palette Master in `registry.ts`**

Inside the `palette-master` product object, add:

```ts
    theme: {
      accentPrimary: "#ff4f64",
      accentSecondary: "#ffb000",
      accentTertiary: "#19d3a2",
      ink: "#15111c",
      surface: "#fff4d7",
      gradient: "linear-gradient(90deg, #ff4f64, #ffb000, #19d3a2, #2563ff)",
      visualVolume: "poster",
    },
```

Keep the product status as `"draft"`.

- [ ] **Step 3: Add theme validation helpers**

In `app/content/products/validate.ts`, add:

```ts
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

function validateProductTheme(product: Product, errors: string[]) {
  if (!product.theme) {
    return;
  }

  const colorEntries = [
    ["accentPrimary", product.theme.accentPrimary],
    ["accentSecondary", product.theme.accentSecondary],
    ["accentTertiary", product.theme.accentTertiary],
    ["ink", product.theme.ink],
    ["surface", product.theme.surface],
  ] as const;

  for (const [field, value] of colorEntries) {
    if (!hexColorPattern.test(value)) {
      errors.push(`${product.slug} theme.${field} must be a six-digit hex color.`);
    }
  }

  if (!product.theme.gradient.includes("gradient(")) {
    errors.push(`${product.slug} theme.gradient must be a CSS gradient value.`);
  }
}
```

Call `validateProductTheme(product, errors);` from the existing per-product validation loop.

- [ ] **Step 4: Add validation tests for product theme metadata**

Add these tests to `tests/content/validate-products.test.ts`:

```ts
test("accepts valid product theme metadata", () => {
  const result = validateProducts([
    {
      ...validProduct,
      theme: {
        accentPrimary: "#ff4f64",
        accentSecondary: "#ffb000",
        accentTertiary: "#19d3a2",
        ink: "#15111c",
        surface: "#fff4d7",
        gradient: "linear-gradient(90deg, #ff4f64, #ffb000)",
        visualVolume: "poster",
      },
    },
  ]);

  expect(result.valid).toBe(true);
});

test("rejects invalid product theme color metadata", () => {
  const result = validateProducts([
    {
      ...validProduct,
      theme: {
        accentPrimary: "red",
        accentSecondary: "#ffb000",
        accentTertiary: "#19d3a2",
        ink: "#15111c",
        surface: "#fff4d7",
        gradient: "linear-gradient(90deg, #ff4f64, #ffb000)",
        visualVolume: "poster",
      },
    },
  ]);

  expect(result.valid).toBe(false);
  expect(result.errors).toContain(
    `${validProduct.slug} theme.accentPrimary must be a six-digit hex color.`,
  );
});
```

If `validProduct` is scoped in a way that blocks this code, move the existing valid product fixture to the top-level of the test file and reuse it.

- [ ] **Step 5: Run content validation tests**

Run:

```bash
npm run test -- tests/content/validate-products.test.ts tests/content/product-customization.test.ts
npm run validate:content
```

Expected: both commands exit `0`.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add app/content/products/types.ts app/content/products/registry.ts app/content/products/validate.ts tests/content/validate-products.test.ts
git commit -m "feat: add product theme metadata"
```

Expected: commit succeeds.

---

### Task 5: Implement The Product Overview Chassis And Palette Master Custom Overview

**Files:**

- Modify: `app/routes/product-overview.tsx`
- Create: `app/content/products/palette-master/Overview.module.css`
- Replace: `app/content/products/palette-master/Overview.tsx`
- Modify: `tests/content/product-customization.test.ts`

- [ ] **Step 1: Update standard overview to use the shared product chassis**

Modify `StandardProductOverview` in `app/routes/product-overview.tsx`:

```tsx
export function StandardProductOverview({ product }: { product: Product }) {
  return (
    <article className="product-overview">
      <PageHeader
        eyebrow={product.type}
        title={product.name}
        description={product.shortDescription}
      />
      <section className="product-panel" aria-label={`${product.name} details`}>
        <div>
          <h2>Product signal</h2>
          <p>Platforms: {product.platforms.join(" / ")}</p>
          <p>Type: {product.type}</p>
        </div>
        <ProductLinks product={product} />
      </section>
    </article>
  );
}
```

Add this import:

```tsx
import { ProductLinks } from "~/components/ProductLinks";
```

Remove the now-unused `Link` import from `react-router`.

- [ ] **Step 2: Add product overview route-level CSS**

Append to `app/styles/global.css`:

```css
.product-overview {
  display: grid;
  gap: var(--space-8);
}

.product-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.65fr);
  gap: var(--space-6);
  align-items: end;
  padding: var(--space-6);
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-md);
  background: var(--color-paper-soft);
  box-shadow: var(--shadow-poster);
}

.product-panel h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 0.95;
  text-transform: uppercase;
}

.product-panel p {
  margin: var(--space-2) 0;
  color: var(--color-muted);
}

@media (max-width: 760px) {
  .product-panel {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Create `Palette Master` custom overview CSS**

Create `app/content/products/palette-master/Overview.module.css`:

```css
.overview {
  --palette-primary: var(--product-accent-primary, #ff4f64);
  --palette-secondary: var(--product-accent-secondary, #ffb000);
  --palette-tertiary: var(--product-accent-tertiary, #19d3a2);
  display: grid;
  gap: var(--space-8);
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.75fr);
  gap: var(--space-8);
  align-items: end;
  min-height: 32rem;
  padding: var(--space-8);
  overflow: hidden;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-md);
  background: var(--product-surface, var(--color-paper-soft));
  box-shadow: var(--shadow-poster);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 4rem -4rem auto auto;
  width: 22rem;
  height: 7rem;
  background: var(--product-gradient, var(--gradient-chromatic));
  transform: rotate(16deg);
}

.copy {
  position: relative;
  z-index: 1;
}

.media {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  align-items: end;
}

.tile {
  min-height: 11rem;
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-sm);
  background: var(--palette-primary);
  box-shadow: 0.35rem 0.35rem 0 var(--color-ink);
}

.tile:nth-child(2) {
  min-height: 15rem;
  background: var(--palette-secondary);
}

.tile:nth-child(3) {
  min-height: 9rem;
  background: var(--palette-tertiary);
}

.details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.detail {
  padding: var(--space-5);
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-md);
  background: var(--color-paper-soft);
}

.detail h2 {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  line-height: 0.95;
  text-transform: uppercase;
}

@media (max-width: 860px) {
  .hero,
  .details {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Replace `Palette Master` custom overview**

Replace `app/content/products/palette-master/Overview.tsx`:

```tsx
import { PageHeader } from "~/components/PageHeader";
import { ProductLinks } from "~/components/ProductLinks";
import type { CustomProductOverviewProps } from "../customOverviewPages";
import styles from "./Overview.module.css";

export function PaletteMasterOverview({ product }: CustomProductOverviewProps) {
  const themeStyle = product.theme
    ? ({
        "--product-accent-primary": product.theme.accentPrimary,
        "--product-accent-secondary": product.theme.accentSecondary,
        "--product-accent-tertiary": product.theme.accentTertiary,
        "--product-surface": product.theme.surface,
        "--product-gradient": product.theme.gradient,
      } as React.CSSProperties)
    : undefined;

  return (
    <article className={styles.overview} style={themeStyle}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <PageHeader
            eyebrow="Mobile game"
            title={product.name}
            description="A color-focused mobile puzzle game with poster-bright energy."
          />
          <ProductLinks product={product} />
        </div>
        <div className={styles.media} aria-label="Palette Master color tiles">
          <div className={styles.tile} />
          <div className={styles.tile} />
          <div className={styles.tile} />
        </div>
      </section>
      <section className={styles.details}>
        <div className={styles.detail}>
          <h2>Match</h2>
          <p>Read color relationships quickly and solve compact visual puzzles.</p>
        </div>
        <div className={styles.detail}>
          <h2>Shift</h2>
          <p>Move through palettes, contrast, and rhythm without losing the board.</p>
        </div>
        <div className={styles.detail}>
          <h2>Clear</h2>
          <p>Designed as a bright mobile game surface for iOS and Android.</p>
        </div>
      </section>
    </article>
  );
}
```

- [ ] **Step 5: Update customization tests**

In `tests/content/product-customization.test.ts`, update the custom overview assertion:

```ts
expect(html).toContain("A color-focused mobile puzzle game with poster-bright energy.");
expect(html).toContain("Palette Master color tiles");
expect(html).toContain("/products/palette-master/privacy/");
expect(html).toContain("/products/palette-master/support/");
```

- [ ] **Step 6: Run focused product tests**

Run:

```bash
npm run test -- tests/content/product-customization.test.ts tests/ui/visual-components.test.tsx
npm run typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 7: Commit Task 5**

Run:

```bash
git add app/routes/product-overview.tsx app/styles/global.css app/content/products/palette-master/Overview.tsx app/content/products/palette-master/Overview.module.css tests/content/product-customization.test.ts
git commit -m "feat: add themed product overview surfaces"
```

Expected: commit succeeds.

---

### Task 6: Apply Calm Document Mode To Support, Privacy, Legal, Contact, And MDX

**Files:**

- Modify: `app/content/products/mdxComponents.tsx`
- Create: `app/content/products/mdxComponents.module.css`
- Modify: `app/routes/product-support.tsx`
- Modify: `app/routes/product-privacy.tsx`
- Modify: `app/routes/product-data-deletion.tsx`
- Modify: `app/routes/legal.tsx`
- Modify: `app/routes/legal-privacy.tsx`
- Modify: `app/routes/contact.tsx`
- Modify: `app/routes/about.tsx`
- Modify: `tests/content/product-customization.test.ts`

- [ ] **Step 1: Style shared MDX components**

Replace `app/content/products/mdxComponents.tsx`:

```tsx
import type { MDXComponents } from "mdx/types";
import styles from "./mdxComponents.module.css";

export const productMdxComponents: MDXComponents = {
  h2: (props) => <h2 className={styles.heading2} {...props} />,
  h3: (props) => <h3 className={styles.heading3} {...props} />,
  p: (props) => <p className={styles.paragraph} {...props} />,
  ul: (props) => <ul className={styles.list} {...props} />,
  ol: (props) => <ol className={styles.list} {...props} />,
  li: (props) => <li className={styles.item} {...props} />,
  a: (props) => <a className={styles.link} {...props} />,
};
```

Create `app/content/products/mdxComponents.module.css`:

```css
.heading2 {
  margin: var(--space-8) 0 var(--space-3);
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  line-height: 1.15;
}

.heading3 {
  margin: var(--space-6) 0 var(--space-2);
  font-size: 1.1rem;
}

.paragraph,
.item {
  color: var(--color-ink-soft);
  line-height: 1.72;
}

.list {
  padding-left: 1.25rem;
}

.link {
  color: var(--color-link);
}
```

- [ ] **Step 2: Wrap product privacy content in `DocumentPage`**

In `app/routes/product-privacy.tsx`, add:

```tsx
import { DocumentPage } from "~/components/DocumentPage";
```

Change `ProductPrivacyContent` return body to:

```tsx
return (
  <>
    <PageHeader
      variant="document"
      title={`${product.name} Privacy Policy`}
      description={product.shortDescription}
    />
    <DocumentPage>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      {privacy.mode === "generated-with-mdx"
        ? createElement(getProductMdxContent(privacy.contentKey), {
            components: productMdxComponents,
          })
        : null}
    </DocumentPage>
  </>
);
```

- [ ] **Step 3: Wrap product support content in `DocumentPage`**

In `app/routes/product-support.tsx`, add:

```tsx
import { DocumentPage } from "~/components/DocumentPage";
```

Change `ProductSupportContent` return body to:

```tsx
return (
  <>
    <PageHeader
      variant="document"
      title={`${product.name} Support`}
      description={product.shortDescription}
    />
    <DocumentPage>
      <p>
        Email: <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>
      </p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
      {support.mode === "mdx"
        ? createElement(getProductMdxContent(support.contentKey), {
            components: productMdxComponents,
          })
        : null}
    </DocumentPage>
  </>
);
```

- [ ] **Step 4: Wrap data deletion content in `DocumentPage`**

In `app/routes/product-data-deletion.tsx`, add:

```tsx
import { DocumentPage } from "~/components/DocumentPage";
```

Change the route return body to:

```tsx
return (
  <>
    <PageHeader
      variant="document"
      title={`${product.name} Data Deletion`}
      description="Instructions for requesting deletion of product-related data."
    />
    <DocumentPage>
      <p>
        Send a deletion request to{" "}
        <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>.
      </p>
    </DocumentPage>
  </>
);
```

- [ ] **Step 5: Wrap legal, privacy, contact, and about pages**

For `app/routes/legal.tsx`, import `DocumentPage` and wrap the paragraphs:

```tsx
      <PageHeader variant="document" title="Legal" description={`Operator: ${siteConfig.legalOperator}.`} />
      <DocumentPage>
        <p>
          Business contact:{" "}
          <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
        </p>
        <p>
          <Link to="/legal/privacy/">Website privacy policy</Link>
        </p>
      </DocumentPage>
```

For `app/routes/legal-privacy.tsx`, import `DocumentPage` and wrap the paragraphs:

```tsx
      <PageHeader
        variant="document"
        title="Website Privacy Policy"
        description="Privacy information for visitors of this website."
      />
      <DocumentPage>
        <p>This website is operated by {siteConfig.legalOperator}.</p>
        <p>This page covers the website itself, not individual product privacy policies.</p>
      </DocumentPage>
```

For `app/routes/contact.tsx`, import `DocumentPage` and wrap the email paragraph:

```tsx
      <PageHeader variant="document" title="Contact" description="Business inquiries for Keyflare Studio." />
      <DocumentPage>
        <p>
          Email: <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
        </p>
      </DocumentPage>
```

For `app/routes/about.tsx`, import `DocumentPage` and return:

```tsx
<>
  <PageHeader
    variant="document"
    title={`About ${siteConfig.brandName}`}
    description="Keyflare Studio publishes independent software products for app stores and desktop platforms."
  />
  <DocumentPage>
    <p>
      Keyflare Studio is the public product identity for small software releases, support pages,
      privacy policies, and store-facing links.
    </p>
  </DocumentPage>
</>
```

- [ ] **Step 6: Keep customization tests green**

Run:

```bash
npm run test -- tests/content/product-customization.test.ts tests/ui/visual-components.test.tsx
npm run typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 7: Commit Task 6**

Run:

```bash
git add app/content/products/mdxComponents.tsx app/content/products/mdxComponents.module.css app/routes app/components/DocumentPage.tsx app/components/DocumentPage.module.css tests/content/product-customization.test.ts
git commit -m "feat: add calm document mode"
```

Expected: commit succeeds.

---

### Task 7: Run Full Verification And Browser QA

**Files:**

- Review only by default.
- If verification reveals a defect, modify the specific source file that contains the defect and
  document the file in the commit message.

- [ ] **Step 1: Run the full release gate**

Run:

```bash
npm run check
```

Expected:

- content validation passes;
- typecheck passes;
- lint passes;
- format check passes;
- tests pass;
- build passes;
- route output checks pass.

- [ ] **Step 2: Start production preview**

Run:

```bash
npm run preview -- --listen tcp://127.0.0.1:4173
```

Expected: preview server starts on `http://127.0.0.1:4173`.

- [ ] **Step 3: Inspect desktop routes in browser**

Open these URLs:

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/products/
http://127.0.0.1:4173/about/
http://127.0.0.1:4173/contact/
http://127.0.0.1:4173/legal/
http://127.0.0.1:4173/legal/privacy/
```

Verify:

- homepage has Chromatic Poster visual character;
- first viewport shows the brand and hints at next content;
- catalog empty state is polished;
- document pages are calm and readable;
- header and footer do not overlap page content;
- no text is clipped inside buttons, cards, or navigation.

- [ ] **Step 4: Inspect mobile routes in browser**

Use a mobile viewport around `390x844` and inspect:

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/products/
http://127.0.0.1:4173/legal/privacy/
```

Verify:

- nav wraps cleanly;
- hero text does not overlap poster art;
- product/catalog cards keep stable dimensions;
- document pages remain readable;
- no horizontal scroll appears.

- [ ] **Step 5: Inspect draft custom product through route-level tests only**

Do not make `Palette Master` public. Verify its custom overview remains covered by:

```bash
npm run test -- tests/content/product-customization.test.ts
```

Expected:

- draft product remains absent from public routes;
- custom overview render test passes;
- privacy/support MDX tests pass.

- [ ] **Step 6: Stop preview server**

Stop the preview process with `Ctrl+C`.

- [ ] **Step 7: Commit verification-only fixes only when files changed**

If browser QA required fixes, run the full gate first:

```bash
npm run check
```

Expected:

- `npm run check` exits `0`.

Then stage the exact files shown by `git status --short` and commit them:

```bash
git status --short
git add app/styles/global.css app/components/SiteShell.module.css app/components/PageHeader.module.css app/components/ProductCard.module.css app/content/products/palette-master/Overview.module.css
git commit -m "fix: polish visual design responsiveness"
```

Expected:

- run the `git add` command only for files that actually changed;
- commit succeeds when browser QA produced source changes;
- skip this step when browser QA produced no source changes.

---

### Task 8: Final Integration Review

**Files:**

- Review only by default.
- If review reveals a defect, modify the specific source file that contains the defect and re-run
  Task 7 before completing the plan.

- [ ] **Step 1: Confirm git state**

Run:

```bash
git status --short --branch
```

Expected:

- current branch is the implementation branch;
- no uncommitted source changes remain.

- [ ] **Step 2: Review final diff against `main`**

Run:

```bash
git diff --stat main...HEAD
git diff --name-only main...HEAD
```

Expected changed areas:

- visual tokens/global CSS;
- components;
- product theme metadata and validation;
- route composition;
- visual/UI tests;
- package files for fonts.

- [ ] **Step 3: Run final release gate**

Run:

```bash
npm run check
```

Expected: command exits `0`.

- [ ] **Step 4: Prepare handoff summary**

Include:

- Chromatic Poster system implemented;
- calm document mode implemented;
- themed product chassis added;
- `Palette Master` remains draft-only;
- product publication guards remain intact;
- browser QA viewports checked;
- `npm run check` result.

Do not push to `main` unless explicitly instructed.
