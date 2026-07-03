# Keyflare Studio Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static React foundation for the Keyflare Studio product hub, including routing, content registry, validation, generated metadata, local checks, and GitHub Pages deployment.

**Architecture:** The site is a React Router framework-mode application with static prerendered routes. Product data is stored in typed source files and Markdown/MDX content, then used to generate product pages, policy pages, metadata, sitemap entries, and validation checks. Production deployment happens only from `main` through GitHub Actions to GitHub Pages.

**Tech Stack:** React, TypeScript, React Router framework mode, Vite-based React Router build tooling, CSS Modules, global CSS design tokens, Vitest, ESLint, Prettier, GitHub Actions, GitHub Pages.

---

## Development And Deployment Model

- `main` is the production branch.
- Feature work happens on short-lived branches. This implementation branch is `codex/start-project`.
- Pull requests and feature branches run validation, typecheck, lint, tests, build, and route checks.
- Pushes to `main` run the same checks and then deploy the static build artifact to GitHub Pages.
- GitHub Pages should be configured to use **GitHub Actions** as its publishing source.
- A permanent `develop` branch is not part of this plan. Add it only if the project later needs a real staging environment or multi-person release batching.

## File Structure

Create or modify the following files.

```text
package.json
package-lock.json
.gitignore
.prettierrc
eslint.config.js
tsconfig.json
vite.config.ts
react-router.config.ts
public/CNAME
public/app-ads.txt

app/root.tsx
app/routes.ts
app/styles/tokens.css
app/styles/global.css
app/components/SiteShell.tsx
app/components/SiteShell.module.css
app/components/PageHeader.tsx
app/components/PageHeader.module.css
app/components/ProductCard.tsx
app/components/ProductCard.module.css
app/content/site.ts
app/content/products/types.ts
app/content/products/registry.ts
app/content/products/validate.ts
app/content/products/privacyBlocks.ts
app/content/products/fixture-product/support.md
app/routes/home.tsx
app/routes/about.tsx
app/routes/contact.tsx
app/routes/legal.tsx
app/routes/legal-privacy.tsx
app/routes/products-index.tsx
app/routes/product-overview.tsx
app/routes/product-privacy.tsx
app/routes/product-support.tsx
app/routes/product-data-deletion.tsx

scripts/validate-content.ts
scripts/generate-static-metadata.ts
scripts/check-routes.ts

tests/content/validate-products.test.ts
tests/content/product-routes.test.ts
tests/scripts/static-metadata.test.ts

.github/workflows/checks.yml
.github/workflows/deploy-pages.yml

README.md
docs/superpowers/plans/2026-07-03-keyflare-studio-site-foundation.md
```

Responsibilities:

- `public/CNAME`: current GitHub Pages custom domain file, moved from the repository root and preserved exactly.
- `public/app-ads.txt`: current AdMob app-ads file, moved from the repository root and preserved exactly.
- `app/content/site.ts`: site-wide brand, operator, domain, and contact config.
- `app/content/products/types.ts`: product registry TypeScript types.
- `app/content/products/registry.ts`: product registry, including a non-public fixture product.
- `app/content/products/validate.ts`: reusable validation logic used by tests and scripts.
- `app/content/products/privacyBlocks.ts`: reusable privacy disclosure text blocks.
- `app/routes/*.tsx`: React Router route modules.
- `scripts/validate-content.ts`: CLI entry point for product/content validation.
- `scripts/generate-static-metadata.ts`: writes `public/robots.txt` and `public/sitemap.xml` source files before build.
- `scripts/check-routes.ts`: verifies expected static build output exists after build.
- `.github/workflows/checks.yml`: branch and pull request checks.
- `.github/workflows/deploy-pages.yml`: production deployment from `main`.

---

### Task 1: Create Feature Branch And Tooling Skeleton

**Files:**
- Delete: `index.html`
- Move: `CNAME` to `public/CNAME`
- Move: `app-ads.txt` to `public/app-ads.txt`
- Create: `package.json`
- Create: `.gitignore`
- Create: `.prettierrc`
- Create: `eslint.config.js`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `react-router.config.ts`
- Modify: `README.md`

- [ ] **Step 1: Verify the implementation branch**

Run:

```bash
git status --short --branch
```

Expected: Output begins with `## codex/start-project`.

- [ ] **Step 2: Install runtime and development dependencies**

Run:

```bash
npm install react@latest react-dom@latest react-router@latest @react-router/node@latest
npm install --save-dev @react-router/dev@latest @types/node@latest @types/react@latest @types/react-dom@latest typescript@latest vite@latest vite-tsconfig-paths@latest eslint@latest @eslint/js@latest typescript-eslint@latest eslint-plugin-react-hooks@latest prettier@latest vitest@latest tsx@latest serve@latest
```

Expected: `package.json` and `package-lock.json` are created.

- [ ] **Step 3: Replace `package.json` scripts and package metadata**

Edit `package.json` so the top-level fields and scripts match this shape while preserving the installed dependency versions:

```json
{
  "name": "keyflare-studio-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "react-router dev",
    "build": "npm run validate:content && npm run generate:static && react-router build",
    "preview": "serve build/client",
    "typecheck": "react-router typegen && tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "format": "prettier --write .",
    "test": "vitest run",
    "validate:content": "tsx scripts/validate-content.ts",
    "generate:static": "tsx scripts/generate-static-metadata.ts",
    "check:routes": "tsx scripts/check-routes.ts",
    "check": "npm run validate:content && npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build && npm run check:routes"
  }
}
```

Expected: `npm run` lists the scripts above.

- [ ] **Step 4: Add `.gitignore`**

Create `.gitignore`:

```gitignore
node_modules
build
.react-router
.env
.env.*
!.env.example
.DS_Store
npm-debug.log*
```

- [ ] **Step 5: Add Prettier config**

Create `.prettierrc`:

```json
{
  "singleQuote": false,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 6: Add ESLint config**

Create `eslint.config.js`:

```js
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    ignores: ["build/**", ".react-router/**", "node_modules/**"],
  },
);
```

- [ ] **Step 7: Add TypeScript config**

Create `tsconfig.json`:

```json
{
  "include": ["app/**/*", "scripts/**/*", "tests/**/*", ".react-router/types/**/*"],
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["node", "vitest/globals"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "rootDirs": [".", "./.react-router/types"],
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 8: Add Vite config**

Create `vite.config.ts`:

```ts
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
});
```

- [ ] **Step 9: Add React Router static config**

Create `react-router.config.ts`:

```ts
import type { Config } from "@react-router/dev/config";
import { getPrerenderPaths } from "./app/content/products/registry";

export default {
  ssr: false,
  async prerender() {
    return getPrerenderPaths();
  },
} satisfies Config;
```

- [ ] **Step 10: Update README with local workflow**

Replace `README.md` with:

````md
# Keyflare Studio Site

Static product hub for Keyflare Studio.

## Development

```bash
npm install
npm run dev
```

## Local Production Check

```bash
npm run check
npm run preview
```

`main` is the production branch. Feature work should happen on short-lived branches.
GitHub Pages deployment runs from GitHub Actions after checks pass on `main`.
````

- [ ] **Step 11: Move existing public root files into the static public directory**

Run:

```bash
mkdir -p public
git mv CNAME public/CNAME
git mv app-ads.txt public/app-ads.txt
```

Expected:

```text
public/CNAME contains www.dmitrii-semenov-ie.studio
public/app-ads.txt contains google.com, pub-9754850090036735, DIRECT, f08c47fec0942fa0
```

- [ ] **Step 12: Remove the old static placeholder page**

Run:

```bash
git rm index.html
```

Expected: The old root `index.html` placeholder is removed because React Router will own the generated HTML output.

- [ ] **Step 13: Run formatting**

Run:

```bash
npm run format
```

Expected: Prettier formats the new files.

- [ ] **Step 14: Commit tooling skeleton**

Run:

```bash
git add package.json package-lock.json .gitignore .prettierrc eslint.config.js tsconfig.json vite.config.ts react-router.config.ts README.md public/CNAME public/app-ads.txt index.html
git commit -m "chore: add React Router tooling"
```

Expected: Commit succeeds.

---

### Task 2: Add Site Config, Root Layout, And Static Routes

**Files:**
- Create: `app/content/site.ts`
- Create: `app/root.tsx`
- Create: `app/routes.ts`
- Create: `app/styles/tokens.css`
- Create: `app/styles/global.css`
- Create: `app/components/SiteShell.tsx`
- Create: `app/components/SiteShell.module.css`
- Create: `app/components/PageHeader.tsx`
- Create: `app/components/PageHeader.module.css`
- Create: `app/routes/home.tsx`
- Create: `app/routes/about.tsx`
- Create: `app/routes/contact.tsx`
- Create: `app/routes/legal.tsx`
- Create: `app/routes/legal-privacy.tsx`

- [ ] **Step 1: Create site config**

Create `app/content/site.ts`:

```ts
export const siteConfig = {
  brandName: "Keyflare Studio",
  legalOperator: "Dmitrii Semenov, Individual Entrepreneur, Armenia",
  defaultLocale: "en",
  canonicalOrigin: "https://www.dmitrii-semenov-ie.studio",
  businessEmail: "semdm.am@gmail.com",
  supportEmail: "semdm.am@gmail.com",
} as const;
```

- [ ] **Step 2: Add design tokens**

Create `app/styles/tokens.css`:

```css
:root {
  --color-bg: #fbfaf7;
  --color-surface: #ffffff;
  --color-text: #202124;
  --color-muted: #5f6368;
  --color-border: #d9dce1;
  --color-accent: #146c94;
  --color-accent-strong: #0f4f6f;
  --font-sans:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --layout-max: 72rem;
}
```

- [ ] **Step 3: Add global CSS**

Create `app/styles/global.css`:

```css
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
}

body {
  margin: 0;
}

a {
  color: var(--color-accent);
}

a:hover {
  color: var(--color-accent-strong);
}

main {
  min-height: 60vh;
}
```

- [ ] **Step 4: Add site shell styles**

Create `app/components/SiteShell.module.css`:

```css
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header,
.footer {
  border-color: var(--color-border);
  border-style: solid;
}

.header {
  border-width: 0 0 1px;
  background: var(--color-surface);
}

.footer {
  border-width: 1px 0 0;
  margin-top: var(--space-12);
  color: var(--color-muted);
}

.inner {
  width: min(100% - 2rem, var(--layout-max));
  margin: 0 auto;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  min-height: 4rem;
}

.brand {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.content {
  flex: 1;
  width: min(100% - 2rem, var(--layout-max));
  margin: var(--space-12) auto 0;
}

.footerContent {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-8) 0;
}
```

- [ ] **Step 5: Add site shell component**

Create `app/components/SiteShell.tsx`:

```tsx
import { Link } from "react-router";
import { siteConfig } from "~/content/site";
import styles from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.nav}`}>
          <Link className={styles.brand} to="/">
            {siteConfig.brandName}
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
          <div>{siteConfig.brandName}</div>
          <div>Operated by {siteConfig.legalOperator}.</div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 6: Add page header styles**

Create `app/components/PageHeader.module.css`:

```css
.header {
  display: grid;
  gap: var(--space-3);
  max-width: 48rem;
}

.eyebrow {
  color: var(--color-muted);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.05;
}

.description {
  margin: 0;
  color: var(--color-muted);
  font-size: 1.125rem;
  line-height: 1.6;
}
```

- [ ] **Step 7: Add page header component**

Create `app/components/PageHeader.tsx`:

```tsx
import styles from "./PageHeader.module.css";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className={styles.header}>
      {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
```

- [ ] **Step 8: Add React Router root**

Create `app/root.tsx`:

```tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import { SiteShell } from "~/components/SiteShell";
import globalStyles from "~/styles/global.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: globalStyles }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
```

- [ ] **Step 9: Add route map**

Create `app/routes.ts`:

```ts
import { index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("products", "./routes/products-index.tsx"),
  route("products/:slug", "./routes/product-overview.tsx"),
  route("products/:slug/privacy", "./routes/product-privacy.tsx"),
  route("products/:slug/support", "./routes/product-support.tsx"),
  route("products/:slug/data-deletion", "./routes/product-data-deletion.tsx"),
  route("about", "./routes/about.tsx"),
  route("contact", "./routes/contact.tsx"),
  route("legal", "./routes/legal.tsx"),
  route("legal/privacy", "./routes/legal-privacy.tsx"),
];
```

- [ ] **Step 10: Add static route modules**

Create `app/routes/home.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.brandName} - Software Products` },
  {
    name: "description",
    content: "Official product hub for Keyflare Studio apps and software.",
  },
];

export default function HomeRoute() {
  return (
    <PageHeader
      eyebrow="Product studio"
      title={siteConfig.brandName}
      description="Independent software products for mobile and desktop platforms."
    />
  );
}
```

Create `app/routes/about.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `About - ${siteConfig.brandName}` },
  { name: "description", content: `About ${siteConfig.brandName}.` },
];

export default function AboutRoute() {
  return (
    <PageHeader
      title={`About ${siteConfig.brandName}`}
      description="Keyflare Studio publishes independent software products for app stores and desktop platforms."
    />
  );
}
```

Create `app/routes/contact.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Contact - ${siteConfig.brandName}` },
  { name: "description", content: `Business contact for ${siteConfig.brandName}.` },
];

export default function ContactRoute() {
  return (
    <>
      <PageHeader title="Contact" description="Business inquiries for Keyflare Studio." />
      <p>
        Email: <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
      </p>
    </>
  );
}
```

Create `app/routes/legal.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Legal - ${siteConfig.brandName}` },
  { name: "description", content: `Legal information for ${siteConfig.brandName}.` },
];

export default function LegalRoute() {
  return (
    <>
      <PageHeader title="Legal" description={`Operator: ${siteConfig.legalOperator}.`} />
      <p>
        Business contact:{" "}
        <a href={`mailto:${siteConfig.businessEmail}`}>{siteConfig.businessEmail}</a>
      </p>
      <p>
        <Link to="/legal/privacy/">Website privacy policy</Link>
      </p>
    </>
  );
}
```

Create `app/routes/legal-privacy.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";

export const meta: MetaFunction = () => [
  { title: `Website Privacy Policy - ${siteConfig.brandName}` },
  { name: "description", content: `Website privacy policy for ${siteConfig.brandName}.` },
];

export default function LegalPrivacyRoute() {
  return (
    <>
      <PageHeader
        title="Website Privacy Policy"
        description="Privacy information for visitors of this website."
      />
      <p>This website is operated by {siteConfig.legalOperator}.</p>
      <p>This page covers the website itself, not individual product privacy policies.</p>
    </>
  );
}
```

- [ ] **Step 11: Run type generation and typecheck**

Run:

```bash
npm run typecheck
```

Expected: Type generation completes and TypeScript passes.

- [ ] **Step 12: Commit static shell**

Run:

```bash
git add app
git commit -m "feat: add static site shell"
```

Expected: Commit succeeds.

---

### Task 3: Add Product Registry And Validation

**Files:**
- Create: `app/content/products/types.ts`
- Create: `app/content/products/registry.ts`
- Create: `app/content/products/validate.ts`
- Create: `scripts/validate-content.ts`
- Create: `tests/content/validate-products.test.ts`
- Modify: `react-router.config.ts`

- [ ] **Step 1: Write validation tests**

Create `tests/content/validate-products.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import type { Product } from "~/content/products/types";
import { validateProducts } from "~/content/products/validate";

const baseProduct: Product = {
  status: "published",
  slug: "sample",
  name: "Sample",
  type: "mobile-app",
  shortDescription: "A sample product.",
  platforms: ["ios"],
  supportEmail: "support@example.com",
  lastUpdated: "2026-07-03",
  storeLinks: {},
  privacyProfile: {
    usesAdMob: false,
    usesAnalytics: false,
    usesCrashReporting: false,
    hasAccounts: false,
    collectsPersonalData: false,
    requiresDataDeletionPage: false,
    thirdPartyServices: [],
  },
};

describe("validateProducts", () => {
  test("accepts complete published products", () => {
    expect(validateProducts([baseProduct])).toEqual([]);
  });

  test("rejects duplicate slugs", () => {
    const errors = validateProducts([baseProduct, { ...baseProduct }]);
    expect(errors).toContain("Duplicate product slug: sample");
  });

  test("rejects published products without support email", () => {
    const errors = validateProducts([{ ...baseProduct, supportEmail: "" }]);
    expect(errors).toContain("Published product sample is missing supportEmail");
  });

  test("rejects invalid lastUpdated values", () => {
    const errors = validateProducts([{ ...baseProduct, lastUpdated: "July 3" }]);
    expect(errors).toContain("Published product sample has invalid lastUpdated: July 3");
  });

  test("allows fixture products to stay out of public validation", () => {
    const errors = validateProducts([{ ...baseProduct, status: "fixture", supportEmail: "" }]);
    expect(errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- tests/content/validate-products.test.ts
```

Expected: FAIL because product types and validation functions do not exist.

- [ ] **Step 3: Add product types**

Create `app/content/products/types.ts`:

```ts
export type ProductStatus = "published" | "draft" | "fixture";
export type ProductType = "mobile-app" | "desktop-app" | "tool" | "software";
export type ProductPlatform = "ios" | "android" | "macos" | "windows" | "linux" | "web";

export type PrivacyProfile = {
  usesAdMob: boolean;
  usesAnalytics: boolean;
  usesCrashReporting: boolean;
  hasAccounts: boolean;
  collectsPersonalData: boolean;
  requiresDataDeletionPage: boolean;
  thirdPartyServices: string[];
};

export type Product = {
  status: ProductStatus;
  slug: string;
  name: string;
  type: ProductType;
  shortDescription: string;
  platforms: ProductPlatform[];
  supportEmail: string;
  lastUpdated: string;
  storeLinks: Partial<Record<ProductPlatform, string>>;
  privacyProfile: PrivacyProfile;
};
```

- [ ] **Step 4: Add product validation**

Create `app/content/products/validate.ts`:

```ts
import type { Product } from "./types";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateProducts(products: Product[]) {
  const errors: string[] = [];
  const seenSlugs = new Set<string>();

  for (const product of products) {
    if (seenSlugs.has(product.slug)) {
      errors.push(`Duplicate product slug: ${product.slug}`);
    }
    seenSlugs.add(product.slug);

    if (product.status !== "published") {
      continue;
    }

    if (!slugPattern.test(product.slug)) {
      errors.push(`Published product ${product.slug} has invalid slug`);
    }

    if (!product.name.trim()) {
      errors.push(`Published product ${product.slug} is missing name`);
    }

    if (!product.shortDescription.trim()) {
      errors.push(`Published product ${product.slug} is missing shortDescription`);
    }

    if (product.platforms.length === 0) {
      errors.push(`Published product ${product.slug} must include at least one platform`);
    }

    if (!product.supportEmail.trim()) {
      errors.push(`Published product ${product.slug} is missing supportEmail`);
    }

    if (!datePattern.test(product.lastUpdated)) {
      errors.push(`Published product ${product.slug} has invalid lastUpdated: ${product.lastUpdated}`);
    }

    for (const [platform, url] of Object.entries(product.storeLinks)) {
      if (url && !isValidUrl(url)) {
        errors.push(`Published product ${product.slug} has invalid ${platform} store URL`);
      }
    }
  }

  return errors;
}
```

- [ ] **Step 5: Add product registry**

Create `app/content/products/registry.ts`:

```ts
import type { Product } from "./types";

export const products: Product[] = [
  {
    status: "fixture",
    slug: "fixture-product",
    name: "Fixture Product",
    type: "mobile-app",
    shortDescription: "Development-only product used to validate templates.",
    platforms: ["ios", "android"],
    supportEmail: "support@example.com",
    lastUpdated: "2026-07-03",
    storeLinks: {},
    privacyProfile: {
      usesAdMob: true,
      usesAnalytics: false,
      usesCrashReporting: false,
      hasAccounts: false,
      collectsPersonalData: false,
      requiresDataDeletionPage: false,
      thirdPartyServices: ["Google AdMob"],
    },
  },
];

export function getPublishedProducts() {
  return products.filter((product) => product.status === "published");
}

export function getRoutableProducts() {
  return products.filter((product) => product.status === "published" || product.status === "fixture");
}

export function findRoutableProduct(slug: string) {
  return getRoutableProducts().find((product) => product.slug === slug);
}

export function getPrerenderPaths() {
  const paths = ["/", "/products", "/about", "/contact", "/legal", "/legal/privacy"];

  for (const product of getPublishedProducts()) {
    paths.push(`/products/${product.slug}`);
    paths.push(`/products/${product.slug}/privacy`);
    paths.push(`/products/${product.slug}/support`);

    if (product.privacyProfile.requiresDataDeletionPage) {
      paths.push(`/products/${product.slug}/data-deletion`);
    }
  }

  return paths;
}
```

- [ ] **Step 6: Add validation CLI**

Create `scripts/validate-content.ts`:

```ts
import { products } from "../app/content/products/registry";
import { validateProducts } from "../app/content/products/validate";

const errors = validateProducts(products);

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Content validation passed.");
```

- [ ] **Step 7: Run tests and validation**

Run:

```bash
npm run test -- tests/content/validate-products.test.ts
npm run validate:content
```

Expected: Both commands pass.

- [ ] **Step 8: Commit product validation**

Run:

```bash
git add app/content scripts/validate-content.ts tests/content/validate-products.test.ts react-router.config.ts
git commit -m "feat: add product content validation"
```

Expected: Commit succeeds.

---

### Task 4: Add Product Catalog And Product Routes

**Files:**
- Create: `app/components/ProductCard.tsx`
- Create: `app/components/ProductCard.module.css`
- Create: `app/content/products/privacyBlocks.ts`
- Create: `app/content/products/fixture-product/support.md`
- Create: `tests/content/product-routes.test.ts`
- Create: `app/routes/products-index.tsx`
- Create: `app/routes/product-overview.tsx`
- Create: `app/routes/product-privacy.tsx`
- Create: `app/routes/product-support.tsx`
- Create: `app/routes/product-data-deletion.tsx`

- [ ] **Step 1: Write route path tests**

Create `tests/content/product-routes.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { getPrerenderPaths } from "~/content/products/registry";

describe("product prerender paths", () => {
  test("includes static public routes", () => {
    expect(getPrerenderPaths()).toEqual(
      expect.arrayContaining(["/", "/products", "/about", "/contact", "/legal", "/legal/privacy"]),
    );
  });

  test("does not publish fixture product routes", () => {
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product");
    expect(getPrerenderPaths()).not.toContain("/products/fixture-product/privacy");
  });
});
```

- [ ] **Step 2: Run route tests**

Run:

```bash
npm run test -- tests/content/product-routes.test.ts
```

Expected: PASS with the registry from Task 3.

- [ ] **Step 3: Add product card styles**

Create `app/components/ProductCard.module.css`:

```css
.card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.title {
  margin: 0;
  font-size: 1.25rem;
}

.description {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
```

- [ ] **Step 4: Add product card component**

Create `app/components/ProductCard.tsx`:

```tsx
import { Link } from "react-router";
import type { Product } from "~/content/products/types";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{product.name}</h2>
      <p className={styles.description}>{product.shortDescription}</p>
      <div className={styles.links}>
        <Link to={`/products/${product.slug}/`}>Overview</Link>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy</Link>
        <Link to={`/products/${product.slug}/support/`}>Support</Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Add reusable privacy blocks**

Create `app/content/products/privacyBlocks.ts`:

```ts
import type { Product } from "./types";
import { siteConfig } from "../site";

export function getPrivacySections(product: Product) {
  const sections = [
    {
      title: "Operator",
      body: `${product.name} is published by ${siteConfig.legalOperator}.`,
    },
    {
      title: "Contact",
      body: `For privacy questions, contact ${product.supportEmail}.`,
    },
    {
      title: "Data Collection",
      body: product.privacyProfile.collectsPersonalData
        ? "This product may process product-specific data described on this page."
        : "This product is configured as not collecting personal data directly.",
    },
  ];

  if (product.privacyProfile.usesAdMob) {
    sections.push({
      title: "Advertising",
      body: "This product may use Google AdMob to show ads. AdMob may process data according to Google's advertising technology policies.",
    });
  }

  if (product.privacyProfile.usesAnalytics) {
    sections.push({
      title: "Analytics",
      body: "This product may use analytics services to understand aggregate product usage and reliability.",
    });
  }

  if (product.privacyProfile.usesCrashReporting) {
    sections.push({
      title: "Crash Reporting",
      body: "This product may use crash reporting to diagnose defects and improve stability.",
    });
  }

  sections.push({
    title: "Updates",
    body: `Last updated: ${product.lastUpdated}.`,
  });

  return sections;
}
```

- [ ] **Step 6: Add fixture support content**

Create `app/content/products/fixture-product/support.md`:

```md
# Fixture Product Support

This development-only content verifies product support page rendering.
```

- [ ] **Step 7: Add product index route**

Create `app/routes/products-index.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { ProductCard } from "~/components/ProductCard";
import { PageHeader } from "~/components/PageHeader";
import { siteConfig } from "~/content/site";
import { getPublishedProducts } from "~/content/products/registry";

export const meta: MetaFunction = () => [
  { title: `Products - ${siteConfig.brandName}` },
  { name: "description", content: `Products published by ${siteConfig.brandName}.` },
];

export default function ProductsIndexRoute() {
  const products = getPublishedProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description="Mobile apps, desktop apps, and software products from Keyflare Studio."
      />
      {products.length === 0 ? (
        <p>Published products will appear here.</p>
      ) : (
        products.map((product) => <ProductCard key={product.slug} product={product} />)
      )}
    </>
  );
}
```

- [ ] **Step 8: Add product overview route**

Create `app/routes/product-overview.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { findRoutableProduct } from "~/content/products/registry";

export const meta: MetaFunction = ({ params }) => {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;
  return [
    { title: product ? `${product.name} - Keyflare Studio` : "Product - Keyflare Studio" },
    { name: "description", content: product?.shortDescription ?? "Product page." },
  ];
};

export default function ProductOverviewRoute({ params }: { params: { slug?: string } }) {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

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

- [ ] **Step 9: Add product privacy route**

Create `app/routes/product-privacy.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { findRoutableProduct } from "~/content/products/registry";
import { getPrivacySections } from "~/content/products/privacyBlocks";

export const meta: MetaFunction = ({ params }) => {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;
  return [
    {
      title: product
        ? `${product.name} Privacy Policy - Keyflare Studio`
        : "Privacy Policy - Keyflare Studio",
    },
    { name: "description", content: product ? `Privacy policy for ${product.name}.` : "Privacy policy." },
  ];
};

export default function ProductPrivacyRoute({ params }: { params: { slug?: string } }) {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  const sections = getPrivacySections(product);

  return (
    <>
      <PageHeader title={`${product.name} Privacy Policy`} description={product.shortDescription} />
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </>
  );
}
```

- [ ] **Step 10: Add product support route**

Create `app/routes/product-support.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { findRoutableProduct } from "~/content/products/registry";

export const meta: MetaFunction = ({ params }) => {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;
  return [
    { title: product ? `${product.name} Support - Keyflare Studio` : "Support - Keyflare Studio" },
    { name: "description", content: product ? `Support for ${product.name}.` : "Product support." },
  ];
};

export default function ProductSupportRoute({ params }: { params: { slug?: string } }) {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return (
    <>
      <PageHeader title={`${product.name} Support`} description={product.shortDescription} />
      <p>
        Email: <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>
      </p>
      <p>
        <Link to={`/products/${product.slug}/privacy/`}>Privacy policy</Link>
      </p>
    </>
  );
}
```

- [ ] **Step 11: Add data deletion route**

Create `app/routes/product-data-deletion.tsx`:

```tsx
import type { MetaFunction } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import { findRoutableProduct } from "~/content/products/registry";

export const meta: MetaFunction = ({ params }) => {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;
  return [
    {
      title: product
        ? `${product.name} Data Deletion - Keyflare Studio`
        : "Data Deletion - Keyflare Studio",
    },
    { name: "description", content: product ? `Data deletion for ${product.name}.` : "Data deletion." },
  ];
};

export default function ProductDataDeletionRoute({ params }: { params: { slug?: string } }) {
  const product = params.slug ? findRoutableProduct(params.slug) : undefined;

  if (!product || !product.privacyProfile.requiresDataDeletionPage) {
    throw new Response("Data deletion page not found", { status: 404 });
  }

  return (
    <>
      <PageHeader
        title={`${product.name} Data Deletion`}
        description="Instructions for requesting deletion of product-related data."
      />
      <p>
        Send a deletion request to{" "}
        <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>.
      </p>
    </>
  );
}
```

- [ ] **Step 12: Run checks**

Run:

```bash
npm run typecheck
npm run test
npm run build
```

Expected: All commands pass.

- [ ] **Step 13: Commit product routes**

Run:

```bash
git add app tests/content/product-routes.test.ts
git commit -m "feat: add product route templates"
```

Expected: Commit succeeds.

---

### Task 5: Add Static Metadata Generation And Route Output Checks

**Files:**
- Create: `scripts/generate-static-metadata.ts`
- Create: `scripts/check-routes.ts`
- Create: `tests/scripts/static-metadata.test.ts`
- Modify: `public/app-ads.txt`
- Inspect: `public/CNAME`

- [ ] **Step 1: Write metadata tests**

Create `tests/scripts/static-metadata.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { buildRobotsTxt, buildSitemapXml } from "../../scripts/generate-static-metadata";

describe("static metadata generation", () => {
  test("robots.txt points to sitemap", () => {
    expect(buildRobotsTxt("https://www.dmitrii-semenov-ie.studio")).toContain(
      "Sitemap: https://www.dmitrii-semenov-ie.studio/sitemap.xml",
    );
  });

  test("sitemap includes core public routes", () => {
    const xml = buildSitemapXml("https://www.dmitrii-semenov-ie.studio", [
      "/",
      "/products",
      "/legal/privacy",
    ]);
    expect(xml).toContain("<loc>https://www.dmitrii-semenov-ie.studio/</loc>");
    expect(xml).toContain("<loc>https://www.dmitrii-semenov-ie.studio/products/</loc>");
    expect(xml).toContain(
      "<loc>https://www.dmitrii-semenov-ie.studio/legal/privacy/</loc>",
    );
  });
});
```

- [ ] **Step 2: Run metadata tests to verify failure**

Run:

```bash
npm run test -- tests/scripts/static-metadata.test.ts
```

Expected: FAIL because `scripts/generate-static-metadata.ts` does not exist.

- [ ] **Step 3: Add metadata generator**

Create `scripts/generate-static-metadata.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../app/content/site";
import { getPrerenderPaths } from "../app/content/products/registry";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(rootDir, "public");

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }
  return path.endsWith("/") ? path : `${path}/`;
}

export function buildRobotsTxt(origin: string) {
  return [`User-agent: *`, `Allow: /`, `Sitemap: ${origin}/sitemap.xml`, ""].join("\n");
}

export function buildSitemapXml(origin: string, paths: string[]) {
  const urls = paths
    .map((path) => `${origin}${normalizePath(path)}`)
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join("\n");

  return [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, urls, `</urlset>`, ""].join("\n");
}

export function writeStaticMetadata() {
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, "robots.txt"), buildRobotsTxt(siteConfig.canonicalOrigin));
  writeFileSync(
    join(publicDir, "sitemap.xml"),
    buildSitemapXml(siteConfig.canonicalOrigin, getPrerenderPaths()),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeStaticMetadata();
  console.log("Static metadata generated.");
}
```

- [ ] **Step 4: Verify preserved custom domain and app-ads files**

Run:

```bash
test "$(cat public/CNAME)" = "www.dmitrii-semenov-ie.studio"
test "$(cat public/app-ads.txt)" = "google.com, pub-9754850090036735, DIRECT, f08c47fec0942fa0"
```

Expected: Both commands exit successfully. Preserve the real AdMob seller record in `public/app-ads.txt`.

- [ ] **Step 5: Add route output checker**

Create `scripts/check-routes.ts`:

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getPrerenderPaths } from "../app/content/products/registry";

function outputPathForRoute(routePath: string) {
  if (routePath === "/") {
    return join("build", "client", "index.html");
  }

  const normalized = routePath.replace(/^\/+/, "");
  return join("build", "client", normalized, "index.html");
}

const requiredFiles = [
  ...getPrerenderPaths().map(outputPathForRoute),
  join("build", "client", "robots.txt"),
  join("build", "client", "sitemap.xml"),
  join("build", "client", "CNAME"),
  join("build", "client", "app-ads.txt"),
];

const missing = requiredFiles.filter((file) => !existsSync(file));

if (missing.length > 0) {
  console.error("Route output check failed:");
  for (const file of missing) {
    console.error(`- Missing ${file}`);
  }
  process.exit(1);
}

console.log("Route output check passed.");
```

- [ ] **Step 6: Run metadata tests**

Run:

```bash
npm run test -- tests/scripts/static-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 7: Generate metadata and build**

Run:

```bash
npm run generate:static
npm run build
npm run check:routes
```

Expected: Metadata files are generated, build passes, and route output check passes.

- [ ] **Step 8: Commit metadata tooling**

Run:

```bash
git add public scripts tests/scripts
git commit -m "feat: generate static metadata"
```

Expected: Commit succeeds.

---

### Task 6: Add CI Checks And GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/checks.yml`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`

- [ ] **Step 1: Add checks workflow**

Create `.github/workflows/checks.yml`:

```yaml
name: Checks

on:
  pull_request:
  push:
    branches:
      - "**"
      - "!main"

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run checks
        run: npm run check
```

- [ ] **Step 2: Add deploy workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run checks
        run: npm run check

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build/client

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Update README with deployment model**

Append this section to `README.md`:

```md
## Deployment

Production is deployed from `main` through GitHub Actions.

Repository settings:

1. Open GitHub repository settings.
2. Open Pages.
3. Set Build and deployment source to GitHub Actions.
4. Keep the custom domain configured for the production domain.

Feature branches run checks but do not deploy.
Merging to `main` is the release action.
```

- [ ] **Step 4: Run local full check**

Run:

```bash
npm run check
```

Expected: Validation, typecheck, lint, format check, tests, build, and route checks pass.

- [ ] **Step 5: Commit workflows**

Run:

```bash
git add .github README.md
git commit -m "ci: add checks and Pages deployment"
```

Expected: Commit succeeds.

---

### Task 7: Final Local Verification And Merge Preparation

**Files:**
- Inspect: all files changed by Tasks 1-6.

- [ ] **Step 1: Run the full local release check**

Run:

```bash
npm run check
```

Expected: All checks pass.

- [ ] **Step 2: Preview the production build locally**

Run:

```bash
npm run preview
```

Expected: A local static server starts and serves `build/client`.

Open the preview URL and verify:

- `/` renders Keyflare Studio homepage.
- `/products/` renders the empty product catalog state.
- `/about/` renders the about page.
- `/contact/` renders the contact page.
- `/legal/` renders legal information.
- `/legal/privacy/` renders website privacy information.
- `/app-ads.txt` renders the root AdMob file.
- `/CNAME` is present in the build output and contains `www.dmitrii-semenov-ie.studio`.
- `/sitemap.xml` renders generated sitemap XML.
- `/robots.txt` renders generated robots text.

Stop the preview server after verification.

- [ ] **Step 3: Confirm working tree state**

Run:

```bash
git status --short
```

Expected: No unstaged or uncommitted changes remain.

- [ ] **Step 4: Prepare PR or merge**

If using a PR, push the branch:

```bash
git push -u origin codex/start-project
```

If merging locally after checks pass:

```bash
git switch main
git merge --ff-only codex/start-project
```

Expected: `main` contains the site foundation commits. The deploy workflow publishes after the push to `main`.

---

## Self-Review Against Concept Spec

Spec coverage:

- Product-first structure: Tasks 2 and 4 create the homepage, product catalog, product routes, legal, about, and contact routes.
- React/TypeScript/React Router prerender stack: Task 1 configures React Router framework mode and static prerender.
- No backend/CMS/admin panel: All tasks create repository-owned static source and GitHub Pages deployment.
- Hybrid content model: Tasks 3 and 4 create typed product registry, fixture content, and reusable privacy blocks.
- Product-specific privacy and support pages: Task 4 creates dedicated routes.
- Conditional data deletion page: Task 4 creates the route and guards it by product profile.
- Build-time validation: Task 3 adds validation tests and CLI.
- Automatic metadata: Task 5 generates robots and sitemap from prerender paths.
- GitHub Pages deployment from `main`: Task 6 adds GitHub Actions deployment.
- Local testing and preview: Tasks 1 and 7 add `check` and `preview` workflows.

No known spec requirements are omitted from this plan.
